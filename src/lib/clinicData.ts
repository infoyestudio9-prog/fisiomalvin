import { ClinicalCase, Patient, PatientType, Session, User } from '../types';

export type ClinicalStatusKey =
  | 'PENDING'
  | 'ACTIVE'
  | 'INJURED'
  | 'DISCHARGED'
  | 'ARCHIVED';

export type PatientRecord = Patient & {
  phone?: string;
  bodyZone?: string;
  injuryType?: string;
  injuryDiagnosis?: string;
  injuryDetail?: string;
  sport?: string;
  clubMember?: boolean;
  archived?: boolean;
  createdAt?: string;
};

export const mapPatientFromSupabase = (row: any): PatientRecord => ({
  id: row.id,
  name: row.name,
  internalId: row.internal_id || '',
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
  phone: row.phone || '',
  bodyZone: row.body_zone || '',
  injuryType: row.injury_type || '',
  injuryDiagnosis: row.injury_diagnosis || '',
  injuryDetail: row.injury_detail || '',
  sport: row.sport || '',
  clubMember: row.club_member || false,
  archived: row.archived || false,
  createdAt: row.created_at || '',
});

export const mapClinicalCaseFromSupabase = (row: any): ClinicalCase => ({
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

export const mapSessionFromSupabase = (row: any): Session => ({
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

export const mapUserFromSupabase = (row: any): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  avatar: row.avatar || '',
});

export const isPendingClinicalIntake = (patient: Partial<PatientRecord>) => {
  if (patient.archived || patient.status === 'DISCHARGED') return false;

  return !String(patient.injuryDiagnosis || '').trim() || !String(patient.injuryType || '').trim();
};

export const getClinicalStatus = (patient: Partial<PatientRecord>): ClinicalStatusKey => {
  if (patient.archived) return 'ARCHIVED';
  if (isPendingClinicalIntake(patient)) return 'PENDING';
  if (patient.status === 'DISCHARGED') return 'DISCHARGED';
  if (patient.status === 'ACTIVE' || patient.status === 'WARNING') return 'ACTIVE';

  return 'INJURED';
};

export const clinicalStatusLabels: Record<ClinicalStatusKey, string> = {
  PENDING: 'Pendiente de ingreso clínico',
  ACTIVE: 'Activo',
  INJURED: 'En tratamiento',
  DISCHARGED: 'De alta',
  ARCHIVED: 'Archivado',
};

export const clinicalStatusColors: Record<ClinicalStatusKey, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border border-amber-200',
  ACTIVE: 'bg-green-100 text-green-700',
  INJURED: 'bg-red-100 text-red-700',
  DISCHARGED: 'bg-slate-100 text-slate-500',
  ARCHIVED: 'bg-slate-100 text-slate-500',
};

export const isClubPatientType = (patientType?: PatientType) =>
  patientType === 'Socio del Club' || patientType === 'Formativas';
