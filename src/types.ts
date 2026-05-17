export type UserRole =
  | 'DOCTOR'
  | 'PHYSIOTHERAPIST'
  | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export type PatientStatus =
  | 'ACTIVE'
  | 'INJURED'
  | 'TREATMENT'
  | 'DISCHARGED'
  | 'WARNING';

export type PatientType =
  | 'Socio del Club'
  | 'Formativas'
  | 'Particular';

export interface Patient {
  id: string;
  name: string;
  internalId: string;

  team?: string;

  injury: string;

  status: PatientStatus;

  patientType?: PatientType;

  painLevel: number; // 0-10

  nextSession?: string;

  assignedProfessionalId: string;

  avatar?: string;

  mobility?: number; // percentage

  recoveryProgress?: number; // percentage

  sessionsCompleted?: number;

  totalSessionsTarget?: number;

  lastSessionDate?: string;
}

export type SessionResult =
  | 'IMPROVED'
  | 'SAME'
  | 'WORSE';

export interface Session {
  id: string;

  patientId: string;

  clinicalCaseId: string;

  date: string;

  professionalId: string;

  painBefore: number;

  painAfter: number;

  treatmentTags: string[];

  notes: string;

  result: SessionResult;

  nextSessionDate?: string;

  needsMedicalReview: boolean;
}

export interface TreatmentPhase {
  id: string;

  title: string;

  status:
    | 'COMPLETED'
    | 'IN_PROGRESS'
    | 'PENDING';

  description: string;

  techniques: string[];

  exercises: string[];
}

export interface ClinicalCase {
  id: string;

  patientId: string;

  title: string;

  diagnosis: string;

  status: 'OPEN' | 'CLOSED';

  stage: string;

  assignedProfessionalId: string;

  startDate: string;

  endDate?: string;
}

export interface ClinicalAlert {
  id: string;

  patientId: string;

  type:
    | 'PAIN_INCREASE'
    | 'NO_PROGRESS'
    | 'NO_SESSION'
    | 'READY_FOR_DISCHARGE';

  message: string;

  severity:
    | 'HIGH'
    | 'MEDIUM'
    | 'LOW';

  date: string;
}

export interface MedicalFile {
  id: string;

  patientId: string;

  caseId: string;

  name: string;

  type: string;

  url: string;

  date: string;

  uploadedBy: string;
}