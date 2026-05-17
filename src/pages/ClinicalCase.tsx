import React, { useState } from 'react';
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
  ArrowRight,
  X,
  ClipboardPlus,
} from 'lucide-react';
import { useClinic } from '../ClinicContext';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Session } from '../types';

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

  const patient = getPatientById(id || '');
  const sessions = getSessionsByPatient(id || '');
  const patientCase = clinicalCases.find((c) => c.patientId === id);

  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const [caseTitle, setCaseTitle] = useState(patient?.injury || '');
  const [caseDiagnosis, setCaseDiagnosis] = useState(patient?.injury || '');
  const [caseStage, setCaseStage] = useState('Tratamiento');

  const [painBefore, setPainBefore] = useState(4);
  const [painAfter, setPainAfter] = useState(2);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Terapia Manual']);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<'IMPROVED' | 'SAME' | 'WORSE'>('IMPROVED');

  if (!patient) return <div className="p-6">Paciente no encontrado</div>;

  const recovery = patient.recoveryProgress || 0;

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
    if (!patientCase) {
      setShowCaseModal(true);
      return;
    }

    setShowSessionModal(true);
  };

  const goToCase = () => {
    if (!patientCase) return;
    navigate(`/patients/${patient.id}/case/${patientCase.id}`);
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
        assigned_professional_id: currentUser?.id || null,
        start_date: new Date().toISOString().slice(0, 10),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creando caso clínico:', error);
      alert('Error creando caso clínico');
      return;
    }

    setShowCaseModal(false);
    navigate(`/patients/${patient.id}/case/${data.id}`);
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
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold shadow-sm hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Nueva Sesión
        </button>

        {!patientCase && (
          <button
            onClick={() => setShowCaseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ClipboardPlus className="w-4 h-4" />
            Nuevo Caso Clínico
          </button>
        )}

        {patientCase && (
          <button
            onClick={goToCase}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <ClipboardPlus className="w-4 h-4" />
            Gestionar Caso
          </button>
        )}

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
          <FileUp className="w-4 h-4" />
          Subir Archivo
        </button>

        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
          <FileText className="w-4 h-4" />
          Nota Médica
        </button>
      </div>

      <div className="border-b border-slate-200 flex gap-8 overflow-x-auto">
        {['Resumen', 'Caso Clínico', 'Evaluaciones', 'Plan de Tratamiento', 'Sesiones', 'Evolución', 'Archivos'].map((tab, i) => (
          <button
            key={tab}
            className={cn(
              'pb-3 text-xs font-bold whitespace-nowrap border-b-2',
              i === 0
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                Estado: {patient.status}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 rounded-lg p-4 flex items-center gap-3">
            <Phone className="w-4 h-4 text-primary" />
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">
                Teléfono
              </p>
              <p className="text-sm font-bold text-slate-700">
                Sin registrar
              </p>
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

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <Activity className="w-5 h-5 text-primary" />
              Progreso y Evolución
            </h2>

            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
              Mejorando
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-40 h-40 -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="62"
                    stroke="#dbeafe"
                    strokeWidth="12"
                    fill="none"
                  />

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

              <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-5">
                <p className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-2">
                  Evolución clínica
                </p>

                <p className="text-sm text-slate-600 leading-relaxed">
                  Seguimiento general del progreso funcional del paciente en base a dolor,
                  tolerancia al tratamiento y evolución clínica registrada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <ImageIcon className="w-5 h-5 text-primary" />
            Imágenes y Estudios
          </h2>

          <button className="flex items-center gap-2 px-4 py-2 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50">
            <FileUp className="w-4 h-4" />
            Subir Nuevo Estudio
          </button>
        </div>

        <div className="flex gap-6 border-b border-slate-100 mb-5">
          {['Todas', 'Radiografía', 'Ecografía', 'Resonancia', 'Tomografía'].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                'pb-3 text-xs font-bold',
                i === 0 ? 'text-primary border-b-2 border-primary' : 'text-slate-500'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StudyCard title={patient.injury || 'Estudio clínico'} date="Pendiente" />
          <StudyCard title="Evaluación funcional" date="Pendiente" />
          <StudyCard title="Informe complementario" date="Pendiente" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">
            Historial de Consultas
          </h2>

          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            <button
              onClick={openSessionModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
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

            {sessions.map((s) => (
              <tr key={s.id} className="border-b border-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {new Date(s.date).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {s.treatmentTags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-50 text-primary px-2 py-1 rounded text-[10px] font-bold"
                      >
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

        {patientCase && (
          <div className="py-5 flex justify-center">
            <button
              onClick={goToCase}
              className="flex items-center gap-2 text-primary text-sm font-bold hover:underline"
            >
              Ver caso clínico completo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {showCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">
                Nuevo Caso Clínico
              </h2>

              <button onClick={() => setShowCaseModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Título del caso
                </label>
                <input
                  value={caseTitle}
                  onChange={(e) => setCaseTitle(e.target.value)}
                  placeholder="Ej: Esguince de Tobillo"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Diagnóstico
                </label>
                <textarea
                  value={caseDiagnosis}
                  onChange={(e) => setCaseDiagnosis(e.target.value)}
                  placeholder="Detalle diagnóstico..."
                  className="mt-1 w-full min-h-[100px] border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Etapa actual
                </label>
                <input
                  value={caseStage}
                  onChange={(e) => setCaseStage(e.target.value)}
                  placeholder="Tratamiento"
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowCaseModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateCase}
                className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold"
              >
                Crear caso clínico
              </button>
            </div>
          </div>
        </div>
      )}

      {showSessionModal && patientCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
                Registrar Evolución
              </h2>

              <button
                onClick={() => setShowSessionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-blue-100 text-primary flex items-center justify-center font-bold">
                  {patient.name.charAt(0)}
                </div>

                <div>
                  <p className="font-bold text-slate-800">{patient.name}</p>
                  <p className="text-xs uppercase font-bold text-slate-500">
                    {patientCase.title}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <SliderInput
                  label="Dolor Inicial"
                  value={painBefore}
                  onChange={setPainBefore}
                />

                <SliderInput
                  label="Dolor Final"
                  value={painAfter}
                  onChange={setPainAfter}
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Tratamiento Aplicado
                </p>

                <div className="flex flex-wrap gap-2">
                  {treatmentOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-xs font-bold uppercase transition-all',
                        selectedTags.includes(tag)
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-slate-500 border-slate-200 hover:border-primary'
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Observaciones
                </p>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles de la sesión..."
                  className="w-full min-h-[100px] rounded-xl border border-slate-200 p-4 text-sm outline-none focus:border-primary"
                />
              </div>

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
                      onClick={() => setResult(item.value as 'IMPROVED' | 'SAME' | 'WORSE')}
                      className={cn(
                        'py-4 rounded-xl border text-xs font-bold uppercase transition-all',
                        result === item.value
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
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-6 py-3 text-xs font-bold uppercase text-slate-500"
              >
                Cancelar
              </button>

              <button
                onClick={handleSaveSession}
                className="px-8 py-3 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-primary-dark transition-colors"
              >
                Finalizar Sesión
              </button>
            </div>
          </div>
        </div>
      )}
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

function StudyCard({ title, date }: { title: string; date: string }) {
  return (
    <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors">
      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
        <FileText className="w-5 h-5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
        <p className="text-[10px] text-slate-400">{date}</p>
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
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