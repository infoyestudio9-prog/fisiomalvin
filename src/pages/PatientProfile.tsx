import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  FileUp,
  FileText,
  Printer,
  Phone,
  Image as ImageIcon,
  Activity,
  Filter,
  X,
  ClipboardPlus,
  CheckCircle2,
} from 'lucide-react';
import { useClinic } from '../ClinicContext';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Session } from '../types';

type TabKey = 'RESUMEN' | 'CASO' | 'SESIONES' | 'ARCHIVOS' | 'NOTAS';

export default function PatientProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    getPatientById,
    clinicalCases,
    getSessionsByPatient,
    currentUser,
    addSession,
  } = useClinic();

  const contextPatient = getPatientById(id || '');
  const sessions = getSessionsByPatient(id || '');
  const existingCase = clinicalCases.find((c) => c.patientId === id);

  const [supabasePatient, setSupabasePatient] = useState<any | null>(null);
  const patient = contextPatient || supabasePatient;

  const [activeTab, setActiveTab] = useState<TabKey>('RESUMEN');
  const [localCase, setLocalCase] = useState<any | null>(existingCase || null);
  const patientCase = localCase || existingCase;

  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [localStatus, setLocalStatus] = useState('');
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [isDischarging, setIsDischarging] = useState(false);

  const [caseTitle, setCaseTitle] = useState('');
  const [caseDiagnosis, setCaseDiagnosis] = useState('');
  const [caseStage, setCaseStage] = useState('Tratamiento');

  const [painBefore, setPainBefore] = useState(4);
  const [painAfter, setPainAfter] = useState(2);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Terapia Manual']);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<'IMPROVED' | 'SAME' | 'WORSE'>('IMPROVED');

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [medicalNoteText, setMedicalNoteText] = useState('');
  const [medicalNotes, setMedicalNotes] = useState<any[]>([]);

  useEffect(() => {
    if (!id || contextPatient) return;

    const fetchPatientFromSupabase = async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error cargando paciente desde Supabase:', error);
        return;
      }

      if (data) {
        setSupabasePatient({
          id: data.id,
          name: data.name,
          internalId: data.internal_id || '',
          team: data.team || '',
          injury: data.injury || '',
          status: data.status || 'INJURED',
          patientType: data.patient_type || 'Particular',
          painLevel: data.pain_level || 0,
          nextSession: data.next_session || '',
          assignedProfessionalId: data.assigned_professional_id || '',
          avatar: data.avatar || '',
          mobility: data.mobility || 0,
          recoveryProgress: data.recovery_progress || 0,
          sessionsCompleted: data.sessions_completed || 0,
          totalSessionsTarget: data.total_sessions_target || 0,
          lastSessionDate: data.last_session_date || '',
        });
      }
    };

    fetchPatientFromSupabase();
  }, [id, contextPatient]);

  useEffect(() => {
    if (!patient) return;

    setLocalStatus(patient.status || '');
    setRecoveryProgress(patient.recoveryProgress || 0);
    setCaseTitle(patient.injury || '');
    setCaseDiagnosis(patient.injury || '');
  }, [patient]);

  useEffect(() => {
    if (!id) return;

    const fetchMedicalNotes = async () => {
      const { data, error } = await supabase
        .from('medical_notes')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando notas médicas:', error);
        return;
      }

      setMedicalNotes(data || []);
    };

    fetchMedicalNotes();
  }, [id]);

  if (!patient) return <div className="p-6">Cargando paciente...</div>;

  const currentStatus = localStatus || patient.status;
  const isDischarged = currentStatus === 'DISCHARGED';

  const calculateRecoveryProgress = () => {
  if (isDischarged) return 100;

  const sessionsCompleted = patient.sessionsCompleted || sessions.length || 0;
  const totalSessionsTarget = patient.totalSessionsTarget || 8;
  const painLevel = patient.painLevel ?? 0;

  const sessionProgress = Math.min(
    100,
    Math.round((sessionsCompleted / totalSessionsTarget) * 100)
  );

  const painProgress = Math.max(
    0,
    Math.min(100, Math.round(((10 - painLevel) / 10) * 100))
  );

  const finalProgress = Math.round(
    sessionProgress * 0.7 + painProgress * 0.3
  );

  return Math.max(0, Math.min(100, finalProgress));
};

const recovery = recoveryProgress;

  const statusLabel =
    currentStatus === 'ACTIVE'
      ? 'Activo'
      : currentStatus === 'DISCHARGED'
        ? 'De alta'
        : 'Lesionado';

  const tabs: { label: string; value: TabKey }[] = [
    { label: 'Resumen', value: 'RESUMEN' },
    { label: 'Caso Clínico', value: 'CASO' },
    { label: 'Sesiones', value: 'SESIONES' },
    { label: 'Archivos', value: 'ARCHIVOS' },
    { label: 'Notas', value: 'NOTAS' },
  ];

  const treatmentOptions = [
    'Terapia Manual',
    'Ejercicio',
    'TENS',
    'Movilidad',
    'Fuerza',
    'Estiramientos',
    'Magnetoterapia',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const openSessionModal = () => {
    if (!patientCase || isDischarged) return;
    setShowSessionModal(true);
  };

const goToCase = () => {
  if (!patientCase) return;
  setActiveTab('CASO');
};

  const handleCreateCase = async () => {
    if (!caseTitle.trim()) {
      alert('Ingresá un título para el caso clínico.');
      return;
    }

    const { data, error } = await supabase
      .from('clinical_cases')
      .insert({
        patient_id: patient.id,
        title: caseTitle,
        diagnosis: caseDiagnosis,
        status: 'OPEN',
        stage: caseStage,
        assigned_professional_id: null,
        start_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando caso clínico:', error);
      alert(JSON.stringify(error, null, 2));
      return;
    }

    setLocalCase({
      id: data.id,
      patientId: data.patient_id,
      title: data.title,
      diagnosis: data.diagnosis,
      status: data.status,
      stage: data.stage,
      assignedProfessionalId: data.assigned_professional_id,
      startDate: data.start_date,
      endDate: data.end_date,
    });

    setShowCaseModal(false);
    setActiveTab('CASO');
  };

  const handleSaveSession = async () => {
    if (!patientCase) return;

    const newSession: Session = {
      id: `session-${Date.now()}`,
      patientId: patient.id,
      clinicalCaseId: patientCase.id,
      date: new Date().toISOString(),
      professionalId: currentUser?.id || '',
      painBefore,
      painAfter,
      treatmentTags: selectedTags,
      notes,
      result,
      nextSessionDate: patient.nextSession || '',
      needsMedicalReview: false,
    };

    await addSession(newSession);

    setShowSessionModal(false);
    setNotes('');
    setActiveTab('SESIONES');
  };

  const handleDischargePatient = async () => {
    const confirmDischarge = window.confirm(
      '¿Confirmás dar de alta a este paciente? Se cerrará el caso clínico activo.'
    );

    if (!confirmDischarge) return;

    setIsDischarging(true);

    const { error: patientError } = await supabase
      .from('patients')
      .update({ status: 'DISCHARGED' })
      .eq('id', patient.id);

    if (patientError) {
      console.error('Error dando de alta:', patientError);
      alert('Error dando de alta al paciente');
      setIsDischarging(false);
      return;
    }

    if (patientCase) {
      await supabase
        .from('clinical_cases')
        .update({
          status: 'CLOSED',
          end_date: new Date().toISOString().slice(0, 10),
        })
        .eq('id', patientCase.id);
    }

    setLocalStatus('DISCHARGED');
    setIsDischarging(false);
    alert('Paciente dado de alta correctamente.');
  };
  const handleSaveMedicalNote = async () => {
  if (!medicalNoteText.trim()) {
    alert('Ingresá una nota médica.');
    return;
  }

  const { data, error } = await supabase
    .from('medical_notes')
    .insert({
      patient_id: patient.id,
      content: medicalNoteText,
    })
    .select()
    .single();

  if (error) {
    console.error('Error guardando nota médica:', error);
    alert(JSON.stringify(error, null, 2));
    return;
  }

  setMedicalNotes((prev) => [data, ...prev]);
  setMedicalNoteText('');
  setShowNoteModal(false);
  setActiveTab('NOTAS');
};
const handleSaveRecovery = async (
  value: number
) => {
  setRecoveryProgress(value);

  await supabase
    .from('patients')
    .update({
      recovery_progress: value,
    })
    .eq('id', patient.id);
};
  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-2">
            Pacientes / <span className="text-primary font-bold">Expediente Clínico</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            {patient.name}
          </h1>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50">
          <Printer className="w-4 h-4" />
          Imprimir Expediente
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={openSessionModal}
          disabled={!patientCase || isDischarged}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors',
            patientCase && !isDischarged
              ? 'bg-primary text-white hover:bg-primary-dark'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          )}
        >
          <Plus className="w-4 h-4" />
          Nueva Sesión
        </button>

        {!patientCase && !isDischarged && (
          <button
            onClick={() => setShowCaseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark"
          >
            <ClipboardPlus className="w-4 h-4" />
            Nuevo Caso Clínico
          </button>
        )}

        

        {!isDischarged && (
          <button
            onClick={handleDischargePatient}
            disabled={isDischarging}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isDischarging ? 'Procesando...' : 'Dar de Alta'}
          </button>
        )}

        <button
          onClick={() => setActiveTab('ARCHIVOS')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <FileUp className="w-4 h-4" />
          Subir Archivo
        </button>

        <button
  onClick={() => setShowNoteModal(true)}
  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
>
  <FileText className="w-4 h-4" />
  Nota Médica
</button>
      </div>

      <div className="border-b border-slate-200 flex gap-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'pb-3 text-xs font-bold whitespace-nowrap border-b-2',
              activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'RESUMEN' && (
  <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PatientInfoCard
        patient={patient}
        patientCase={patientCase}
        statusLabel={statusLabel}
      />

      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <Activity className="w-5 h-5 text-primary" />
            Progreso y Evolución
          </h2>

          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold uppercase',
              isDischarged
                ? 'bg-slate-100 text-slate-500'
                : 'bg-green-50 text-green-700'
            )}
          >
            {isDischarged ? 'De alta' : 'Mejorando'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-40 h-40 -rotate-90">
                <circle cx="80" cy="80" r="62" stroke="#dbeafe" strokeWidth="12" fill="none" />
                <circle
                  cx="80"
                  cy="80"
                  r="62"
                  stroke="#2563eb"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={390}
                  strokeDashoffset={390 - (390 * recovery) / 100}
                />
              </svg>

              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-extrabold text-primary">
                  {recovery}%
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mt-1">
                  Recuperación
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <MiniMetric title="Estado de dolor" value={`${patient.painLevel}/10`} detail="Escala VAS" />
              <MiniMetric title="Sesiones" value={`${sessions.length}`} detail="realizadas" />
            </div>

            <div className="mt-4 bg-white border border-blue-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  Recuperación funcional
                </p>

                <span className="text-xs font-extrabold text-primary">
                  {recoveryProgress}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={recoveryProgress}
                onChange={(e) => handleSaveRecovery(Number(e.target.value))}
                className="w-full h-1"
              />

              <div className="flex justify-between text-[9px] text-slate-400 mt-1 uppercase tracking-widest">
                <span>Agudo</span>
                <span>Alta deportiva</span>
              </div>
            </div>

            <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                Evolución clínica
              </p>

              <p className="text-sm text-slate-600 leading-relaxed">
                Valoración funcional global definida por el profesional según dolor,
                movilidad, tolerancia a la carga y evolución clínica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SessionsTable
      sessions={sessions}
      openSessionModal={openSessionModal}
      disabled={!patientCase || isDischarged}
      compact
    />
  </>
)}

      {activeTab === 'CASO' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            Caso Clínico
          </h2>

          {!patientCase ? (
            <div className="text-sm text-slate-500">
              Este paciente todavía no tiene un caso clínico activo.
              <button
                onClick={() => setShowCaseModal(true)}
                className="ml-3 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
              >
                Crear caso clínico
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoBox label="Título" value={patientCase.title} />
              <InfoBox label="Estado del caso" value={patientCase.status === 'CLOSED' ? 'Cerrado' : 'Abierto'} />
              <InfoBox label="Inicio" value={patientCase.startDate || 'Sin fecha'} />
              <div className="md:col-span-3 border border-slate-100 rounded-xl p-4">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">
                  Diagnóstico
                </p>
                <p className="text-sm text-slate-700">
                  {patientCase.diagnosis || 'Sin diagnóstico cargado.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'SESIONES' && (
        <SessionsTable
          sessions={sessions}
          openSessionModal={openSessionModal}
          disabled={!patientCase || isDischarged}
        />
      )}

      {activeTab === 'ARCHIVOS' && (
        <FilesSection patient={patient} />
      )}
      {activeTab === 'NOTAS' && (
  <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
    <div className="flex justify-between items-center mb-5">
      <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
        <FileText className="w-5 h-5 text-primary" />
        Notas Médicas
      </h2>

      <button
        onClick={() => setShowNoteModal(true)}
        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
      >
        Nueva Nota
      </button>
    </div>

    {medicalNotes.length === 0 ? (
      <p className="text-sm text-slate-400 text-center py-8">
        No hay notas médicas cargadas todavía.
      </p>
    ) : (
      <div className="space-y-3">
        {medicalNotes.map((note) => (
          <div key={note.id} className="border border-slate-100 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-2">
              {new Date(note.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {note.content}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {showCaseModal && (
        <CaseModal
          caseTitle={caseTitle}
          caseDiagnosis={caseDiagnosis}
          caseStage={caseStage}
          setCaseTitle={setCaseTitle}
          setCaseDiagnosis={setCaseDiagnosis}
          setCaseStage={setCaseStage}
          onClose={() => setShowCaseModal(false)}
          onSubmit={handleCreateCase}
        />
      )}

      {showSessionModal && patientCase && (
        <SessionModal
          patient={patient}
          patientCase={patientCase}
          painBefore={painBefore}
          painAfter={painAfter}
          selectedTags={selectedTags}
          notes={notes}
          result={result}
          treatmentOptions={treatmentOptions}
          setPainBefore={setPainBefore}
          setPainAfter={setPainAfter}
          toggleTag={toggleTag}
          setNotes={setNotes}
          setResult={setResult}
          onClose={() => setShowSessionModal(false)}
          onSubmit={handleSaveSession}
        />
      )}

{showNoteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
    <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Nueva Nota Médica</h2>

        <button onClick={() => setShowNoteModal(false)}>
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="p-6">
        <textarea
          value={medicalNoteText}
          onChange={(e) => setMedicalNoteText(e.target.value)}
          placeholder="Escribir nota médica..."
          className="w-full min-h-[160px] border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
        <button
          onClick={() => setShowNoteModal(false)}
          className="px-4 py-2 text-xs font-bold text-slate-500"
        >
          Cancelar
        </button>

        <button
          onClick={handleSaveMedicalNote}
          className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          Guardar Nota
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

function PatientInfoCard({ patient, patientCase, statusLabel }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold text-2xl">
          {patient.name.charAt(0)}
        </div>

        <div>
          <span className="text-[10px] bg-blue-50 text-primary font-bold px-2 py-1 rounded">
            ID: {patient.internalId}
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2 leading-none">
            {patient.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Estado: {statusLabel}
          </p>
        </div>
      </div>

      <div className="mt-6 bg-slate-50 rounded-lg p-4 flex items-center gap-3">
        <Phone className="w-4 h-4 text-primary" />
        <div>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Teléfono</p>
          <p className="text-sm font-bold text-slate-700">Sin registrar</p>
        </div>
      </div>

      <div className="mt-4 border border-slate-100 rounded-lg p-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
          Resumen de diagnóstico
        </p>
        <p className="text-sm text-slate-700 italic leading-relaxed">
          {patientCase?.diagnosis || patient.injury || 'Sin diagnóstico cargado.'}
        </p>
      </div>
    </div>
  );
}

function SessionsTable({ sessions, openSessionModal, disabled, compact = false }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900">
          {compact ? 'Últimas Sesiones' : 'Sesiones'}
        </h2>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
            <Filter className="w-4 h-4" />
            Filtros
          </button>

          <button
            onClick={openSessionModal}
            disabled={disabled}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold',
              disabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-primary text-white'
            )}
          >
            <Plus className="w-4 h-4" />
            Nueva Sesión
          </button>
        </div>
      </div>

      <table className="w-full text-left text-sm">
        <thead className="text-[10px] text-slate-400 uppercase border-b border-slate-100">
          <tr>
            <th className="px-6 py-3">Fecha y hora</th>
            <th className="px-6 py-3">Tratamiento aplicado</th>
            <th className="px-6 py-3">Notas clínicas</th>
            <th className="px-6 py-3">Resultado</th>
          </tr>
        </thead>

        <tbody>
          {sessions.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">
                Sin sesiones registradas todavía.
              </td>
            </tr>
          )}

          {sessions.map((s: any) => (
            <tr key={s.id} className="border-b border-slate-50">
              <td className="px-6 py-4 font-medium text-slate-800">
                {new Date(s.date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {s.treatmentTags.map((tag: string) => (
                    <span key={tag} className="bg-blue-50 text-primary px-2 py-1 rounded text-[10px] font-bold">
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-slate-600">
                {s.notes || 'Sin notas'}
              </td>
              <td className="px-6 py-4">
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                  {s.result === 'IMPROVED' ? 'Exitosa' : s.result === 'WORSE' ? 'Empeoró' : 'Igual'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilesSection({ patient }: any) {
  const [activeFileTab, setActiveFileTab] = useState('Todos');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [fileTitle, setFileTitle] = useState('');
  const [fileType, setFileType] = useState('Informe');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando archivos:', error);
        return;
      }

      setFiles(data || []);
    };

    fetchFiles();
  }, [patient.id]);

  const filteredFiles =
    activeFileTab === 'Todos'
      ? files
      : files.filter((file) => file.type === activeFileTab);

  const handleAddFile = async () => {
    if (!fileTitle.trim()) {
      alert('Ingresá un título para el archivo.');
      return;
    }

    if (!selectedFile) {
      alert('Seleccioná un archivo.');
      return;
    }

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${patient.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('patient-files')
      .upload(filePath, selectedFile);

    if (uploadError) {
      console.error('Error subiendo archivo:', uploadError);
      alert(JSON.stringify(uploadError, null, 2));
      return;
    }

    const { data } = supabase.storage
      .from('patient-files')
      .getPublicUrl(filePath);

    const newFile = {
      patient_id: patient.id,
      title: fileTitle,
      type: fileType,
      date: new Date().toLocaleDateString(),
      url: data.publicUrl,
      path: filePath,
    };

    const { data: savedFile, error: dbError } = await supabase
      .from('patient_files')
      .insert(newFile)
      .select()
      .single();

    if (dbError) {
      console.error('Error guardando archivo en base de datos:', dbError);
      alert(JSON.stringify(dbError, null, 2));
      return;
    }

    setFiles((prev) => [savedFile, ...prev]);
    setFileTitle('');
    setFileType('Informe');
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setShowUploadModal(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <ImageIcon className="w-5 h-5 text-primary" />
          Archivos, Imágenes y Estudios
        </h2>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          <FileUp className="w-4 h-4" />
          Subir Nuevo Estudio
        </button>
      </div>

      <div className="flex gap-6 border-b border-slate-100 mb-5">
        {['Todos', 'Radiografía', 'Ecografía', 'Resonancia', 'Informe'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFileTab(tab)}
            className={cn(
              'pb-3 text-xs font-bold',
              activeFileTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab === 'Informe' ? 'Informes' : tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredFiles.length === 0 && (
          <div className="col-span-full text-sm text-slate-400 text-center py-8">
            No hay archivos cargados todavía.
          </div>
        )}

        {filteredFiles.map((file, index) => (
          <StudyCard
            key={`${file.id || file.title}-${index}`}
            title={file.title}
            date={`${file.type} · ${file.date || 'Sin fecha'}`}
            url={file.url}
          />
        ))}
      </div>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Subir Nuevo Estudio</h2>

              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Título del archivo
                </label>

                <input
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Tipo de estudio
                </label>

                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  <option>Informe</option>
                  <option>Radiografía</option>
                  <option>Ecografía</option>
                  <option>Resonancia</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Archivo
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancelar
              </button>

              <button
                onClick={handleAddFile}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold"
              >
                Guardar archivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4">
      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4">
      <p className="text-[10px] text-slate-400 font-bold uppercase">{title}</p>
      <p className="text-xl font-bold text-primary mt-1">{value}</p>
      <p className="text-xs text-slate-400">{detail}</p>
    </div>
  );
}

function StudyCard({
  title,
  date,
  type,
  url,
}: {
  title: string;
  date: string;
  type: string;
  url?: string;
}) {
  return (
    <a
      href={url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
    >
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
        <FileText className="w-5 h-5 text-primary" />
      </div>

      <div>
        <p className="text-sm font-bold text-slate-800 truncate">
          {title}
        </p>

        <p className="text-[10px] text-slate-400">
          {type} · {date}
        </p>
      </div>
    </a>
  );
}

function CaseModal(props: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Nuevo Caso Clínico</h2>
          <button onClick={props.onClose}>
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input label="Título del caso" value={props.caseTitle} onChange={props.setCaseTitle} />
          <Textarea label="Diagnóstico" value={props.caseDiagnosis} onChange={props.setCaseDiagnosis} />
          <Input label="Etapa actual" value={props.caseStage} onChange={props.setCaseStage} />
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={props.onClose} className="px-4 py-2 text-xs font-bold text-slate-500">
            Cancelar
          </button>
          <button onClick={props.onSubmit} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold">
            Crear caso clínico
          </button>
        </div>
      </div>
    </div>
  );
}

function SessionModal(props: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
            Registrar Evolución
          </h2>
          <button onClick={props.onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-100 text-primary flex items-center justify-center font-bold">
              {props.patient.name.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-800">{props.patient.name}</p>
              <p className="text-xs uppercase font-bold text-slate-500">
                {props.patientCase.title}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <SliderInput label="Dolor Inicial" value={props.painBefore} onChange={props.setPainBefore} />
            <SliderInput label="Dolor Final" value={props.painAfter} onChange={props.setPainAfter} />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Tratamiento Aplicado
            </p>
            <div className="flex flex-wrap gap-2">
              {props.treatmentOptions.map((tag: string) => (
                <button
                  key={tag}
                  onClick={() => props.toggleTag(tag)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-all',
                    props.selectedTags.includes(tag)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-primary'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Observaciones"
            value={props.notes}
            onChange={props.setNotes}
            placeholder="Detalles de la sesión..."
          />

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Resultado General
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'IMPROVED', label: 'Mejoró' },
                { value: 'SAME', label: 'Igual' },
                { value: 'WORSE', label: 'Empeoró' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => props.setResult(item.value)}
                  className={cn(
                    'py-4 rounded-xl border text-xs font-bold uppercase transition-all',
                    props.result === item.value
                      ? 'bg-blue-50 border-primary text-primary'
                      : 'bg-white border-slate-200 text-slate-400'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={props.onClose} className="px-6 py-3 text-xs font-bold uppercase text-slate-500">
            Cancelar
          </button>
          <button onClick={props.onSubmit} className="px-8 py-3 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-primary-dark">
            Finalizar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-slate-400">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full min-h-[100px] border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

function SliderInput({ label, value, onChange }: any) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      <div className="flex items-center gap-4 rounded-xl border border-slate-200 px-4 py-3">
        <input
          type="range"
          min={0}
          max={10}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full"
        />
        <span className="text-2xl font-bold text-slate-900 w-8 text-right">
          {value}
        </span>
      </div>
    </div>
  );
}