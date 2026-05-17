import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Patient, Session, ClinicalCase, ClinicalAlert, User } from './types';
import { MOCK_ALERTS } from './constants';
import { supabase } from './lib/supabase';

interface ClinicContextType {
  patients: Patient[];
  sessions: Session[];
  clinicalCases: ClinicalCase[];
  alerts: ClinicalAlert[];
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  addSession: (session: Session) => Promise<void>;
  getPatientById: (id: string) => Patient | undefined;
  getClinicalCaseById: (id: string) => ClinicalCase | undefined;
  getSessionsByPatient: (id: string) => Session[];
  getAlertsByPatient: (id: string) => ClinicalAlert[];
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const isValidUuid = (value?: string) => {
  if (!value) return false;

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
};

const mapPatientFromSupabase = (row: any): Patient => ({
  id: row.id,
  name: row.name,
  internalId: row.internal_id,
  team: row.team || '',
  injury: row.injury || '',
  status: row.status,
  patientType: row.patient_type || 'Particular',
  painLevel: row.pain_level || 0,
  nextSession: row.next_session || '',
  assignedProfessionalId: row.assigned_professional_id || '',
  avatar: row.avatar || '',
  mobility: row.mobility || 0,
  recoveryProgress: row.recovery_progress || 0,
  sessionsCompleted: row.sessions_completed || 0,
  totalSessionsTarget: row.total_sessions_target || 0,
  lastSessionDate: row.last_session_date || '',
});

const mapClinicalCaseFromSupabase = (row: any): ClinicalCase => ({
  id: row.id,
  patientId: row.patient_id,
  title: row.title,
  diagnosis: row.diagnosis || '',
  status: row.status,
  stage: row.stage || '',
  assignedProfessionalId: row.assigned_professional_id || '',
  startDate: row.start_date,
  endDate: row.end_date || '',
});

const mapSessionFromSupabase = (row: any): Session => ({
  id: row.id,
  patientId: row.patient_id,
  clinicalCaseId: row.clinical_case_id,
  date: row.date,
  professionalId: row.professional_id || '',
  painBefore: row.pain_before,
  painAfter: row.pain_after,
  treatmentTags: row.treatment_tags || [],
  notes: row.notes || '',
  result: row.result,
  nextSessionDate: row.next_session_date || '',
  needsMedicalReview: row.needs_medical_review || false,
});

const mapUserFromSupabase = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  avatar: row.avatar || '',
});

const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('fisiomalvin_user');

    if (!storedUser) return null;

    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

export const ClinicProvider = ({ children }: { children: ReactNode }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clinicalCases, setClinicalCases] = useState<ClinicalCase[]>([]);
  const [alerts, setAlerts] = useState<ClinicalAlert[]>(MOCK_ALERTS);
  const [currentUser, setCurrentUserState] = useState<User | null>(getStoredUser());

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);

    if (user) {
      localStorage.setItem('fisiomalvin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fisiomalvin_user');
    }
  };

  useEffect(() => {
    const fetchCurrentUserFallback = async () => {
      const storedUser = getStoredUser();

      if (storedUser) {
        setCurrentUserState(storedUser);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single();

      if (!error && data) {
        setCurrentUserState(mapUserFromSupabase(data));
      }
    };

    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPatients(data.map(mapPatientFromSupabase));
      }
    };

    const fetchClinicalCases = async () => {
      const { data, error } = await supabase
        .from('clinical_cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClinicalCases(data.map(mapClinicalCaseFromSupabase));
      }
    };

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });

      if (!error && data) {
        setSessions(data.map(mapSessionFromSupabase));
      }
    };

    fetchCurrentUserFallback();
    fetchPatients();
    fetchClinicalCases();
    fetchSessions();
  }, []);

  const addSession = async (session: Session) => {
    const professionalId = isValidUuid(session.professionalId)
      ? session.professionalId
      : null;

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        patient_id: session.patientId,
        clinical_case_id: session.clinicalCaseId,
        date: session.date,
        professional_id: professionalId,
        pain_before: session.painBefore,
        pain_after: session.painAfter,
        treatment_tags: session.treatmentTags,
        notes: session.notes,
        result: session.result,
        next_session_date: session.nextSessionDate || null,
        needs_medical_review: session.needsMedicalReview || false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error guardando sesión:', error);
      alert('Error guardando sesión');
      return;
    }

    const savedSession = mapSessionFromSupabase(data);

    setSessions((prev) => [savedSession, ...prev]);

    const patient = patients.find((p) => p.id === session.patientId);
    const newSessionsCompleted = (patient?.sessionsCompleted || 0) + 1;

const totalSessionsTarget = patient?.totalSessionsTarget || 8;
const sessionProgress = Math.min(
  100,
  Math.round((newSessionsCompleted / totalSessionsTarget) * 100)
);

const painProgress = Math.max(
  0,
  Math.min(100, Math.round(((10 - session.painAfter) / 10) * 100))
);

const newRecoveryProgress = Math.round(
  sessionProgress * 0.7 + painProgress * 0.3
);

    await supabase
      .from('patients')
      .update({
        recovery_progress: newRecoveryProgress,
        pain_level: session.painAfter,
        sessions_completed: newSessionsCompleted,
        last_session_date: session.date,
        next_session: session.nextSessionDate || null,
      })
      .eq('id', session.patientId);

    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === session.patientId) {
          return {
            ...p,
            recoveryProgress: newRecoveryProgress,
            painLevel: session.painAfter,
            sessionsCompleted: newSessionsCompleted,
            lastSessionDate: session.date,
            nextSession: session.nextSessionDate,
          };
        }

        return p;
      })
    );
  };

  const getPatientById = (id: string) => patients.find((p) => p.id === id);
  const getClinicalCaseById = (id: string) => clinicalCases.find((c) => c.id === id);
  const getSessionsByPatient = (id: string) => sessions.filter((s) => s.patientId === id);
  const getAlertsByPatient = (id: string) => alerts.filter((a) => a.patientId === id);

  return (
    <ClinicContext.Provider
      value={{
        patients,
        sessions,
        clinicalCases,
        alerts,
        currentUser,
        setCurrentUser,
        addSession,
        getPatientById,
        getClinicalCaseById,
        getSessionsByPatient,
        getAlertsByPatient,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const context = useContext(ClinicContext);

  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }

  return context;
};