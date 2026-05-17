import { Patient, User, ClinicalCase, Session, ClinicalAlert, MedicalFile } from "./types";

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Dr. Ricardo S.',
    email: 'ricardo@fisiocare.com',
    role: 'DOCTOR',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6ldSPv6k9x2tnvY06XMUtQV9bxgk5cn77NQY6wZYXiXCel0uHLG5_uF9BZ78yZ8l2RyG4JBJW3U-o8_-KfTQIU6Z0Na9Yy5wLwIcH9KPIVFhU41MUq3cJ3vsl6G11ExFX9CivZJSvhb1FOPT84g8QAtS0wP5BBVEn8E9kK-Y_Jg144rEn_7C_TmFrQAON9zb5h7AGuJqZpG8gDTDia4DgU2lkzq4kLwpcjCHrWOkGLO2r3YugXet2RQetZ2J4RACM7DA1ut8UJuI'
  },
  {
    id: 'u2',
    name: 'Dra. Elena Gómez',
    email: 'elena@fisiocare.com',
    role: 'PHYSIOTHERAPIST',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcVYbyFkSlTi3h-iomeboskonYLVomb45w065MruXBmkNT_5DZFMpUDbBvK0siJZtxG72ZpmzsIs1zreeVkO9TD79IpNGYonUnIb3q_fPLmGr3M-U8gi54z02HFMJjKQRYEWnMI5KjUMMwpm5Lq1ZR3QTeOaBneRV4F0WN-DmvOdozeu0ntN0qjIxDjJHTGpsKkf5-OqzT0WSWS4_bgjKTvea3NZBLopccJgAGzzIjiSmlZ4RhQgJnGINI2pgt_Va11Jndias6D-k'
  }
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Carlos Alberto Méndez',
    internalId: 'FC-99203',
    injury: 'Hernia discal lumbar L4-L5',
    status: 'TREATMENT',
    painLevel: 2,
    nextSession: '2024-05-25T10:00:00Z',
    assignedProfessionalId: 'u1',
    team: 'Senior Football',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlCXkBywbZi4_J9zA0_0v9WmGEVDZTdcGv8GZWPL8f6-MmUECjftP0ewfHdRtzfPSsSuF8mJSWsqS15n1reaCmTZsWJIhj_PBBRPPeobhHmACQxKKkc1pxDLXVxNAUrouGl6a5zI4_nGARc8S2zaGDeedG_Qm_pKEmf-caJpjpkmLLSjHICdHDIPhe51nUAA2KgJPSoywCU3gundaExpJv5OaKXEZ-XZW8hXSMlYR1a2cMhCS1apu_EcDYhnjy2e2sT9pJQpq4BjU',
    mobility: 85,
    recoveryProgress: 75,
    sessionsCompleted: 12,
    totalSessionsTarget: 15,
    lastSessionDate: '2024-05-21T11:30:00Z'
  },
  {
    id: 'p2',
    name: 'Elena Valero',
    internalId: 'FC-10293',
    injury: 'Manguito rotador derecho',
    status: 'WARNING',
    painLevel: 8,
    assignedProfessionalId: 'u2',
    team: 'Volleyball A',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClSRJd0oA3xY4rXVaeyLMRTBOEYxrszwGptEoGAShOlWN0XwuPaFZ_ja74lFnU22fV2c2W6ZSmE5xn7QEG9VX50PxHdq20ZehaQn90d4WFR2ZkaWR-oR8XSjFpYM8acIQ9R6asr-52LzCUsGyLotYRJTtXXcbe-5W7WjwXy5n9Ug30EGoKsRb1I1x2nm8YuYAz7FUdICF6Vzn58tPHDEWJ2Scv7v2bd8owtHKMBWAB9MRzBmTCxu144omiCRibzA7jGWUYKD8hlGQ',
    mobility: 40,
    recoveryProgress: 20,
    sessionsCompleted: 4,
    totalSessionsTarget: 20,
    lastSessionDate: '2024-05-15T09:00:00Z'
  },
  {
    id: 'p3',
    name: 'Miguel Ángel Torres',
    internalId: 'FC-15221',
    injury: 'Esguince Tobillo Izq.',
    status: 'ACTIVE',
    painLevel: 4,
    nextSession: '2024-05-26T09:30:00Z',
    assignedProfessionalId: 'u1',
    team: 'Athletics',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDYIH7xD20ghCRxbCHdYVaOES43Q23fk9VoslvMQcoJ7ANsn0lRj7r-w3fWIRtJi7Oo3PooY6IGQIqpu_vnWGs3jc2VW9yiLg0tO9I_eVQxFOhi5n26XFZMgiTE3AyxF3BE3nrG-IZquR-IrP2Zy-u2SCp-jRGUavndEFgEAylggolncUc82k5biaN02WerO9C8ydmYSNi72Ldy-Jeer8ngQWnIo4wYJy61Ci0NI6kJJO8dpBKGgSDiHpPVNuSkjojlmC2BGjBm74'
  }
];

export const MOCK_CASES: ClinicalCase[] = [
  {
    id: 'c1',
    patientId: 'p1',
    title: 'Hernia discal lumbar L4-L5',
    diagnosis: 'Radiculopatía L5 por compresión discal',
    status: 'OPEN',
    stage: 'Restauración de Movilidad',
    assignedProfessionalId: 'u1',
    startDate: '2024-04-12T00:00:00Z'
  }
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    patientId: 'p1',
    clinicalCaseId: 'c1',
    date: '2024-05-24T09:00:00Z',
    professionalId: 'u1',
    painBefore: 4,
    painAfter: 2,
    treatmentTags: ['Terapia Manual', 'TENS'],
    notes: 'Mejoría en el rango de movimiento. Menos dolor irradiado.',
    result: 'IMPROVED',
    nextSessionDate: '2024-05-27T10:00:00Z',
    needsMedicalReview: false
  }
];

export const MOCK_ALERTS: ClinicalAlert[] = [
  {
    id: 'a1',
    patientId: 'p2',
    type: 'NO_SESSION',
    message: 'No ha registrado actividad en los últimos 4 días.',
    severity: 'HIGH',
    date: '2024-05-19T10:00:00Z'
  }
];
