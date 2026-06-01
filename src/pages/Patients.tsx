import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, Download, ChevronRight, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Patient, PatientStatus, PatientType } from '../types';
import { supabase } from '../lib/supabase';

type FilterKey = 'ALL' | 'ACTIVE' | 'INJURED' | 'DISCHARGED' | 'ARCHIVED';

type PatientWithInjury = Patient & {
  phone?: string;
  bodyZone?: string;
  injuryType?: string;
  injuryDiagnosis?: string;
  injuryDetail?: string;
  sport?: string;
  clubMember?: boolean;
  patientType?: PatientType;
};

function normalizeStatus(status: string): FilterKey {
  if (status === 'TREATMENT') return 'INJURED';
  if (status === 'WARNING') return 'ACTIVE';
  if (status === 'ACTIVE') return 'ACTIVE';
  if (status === 'INJURED') return 'INJURED';
  if (status === 'DISCHARGED') return 'DISCHARGED';
  return 'INJURED';
}

function mapPatient(row: any): PatientWithInjury {
  return {
    id: row.id,
    name: row.name,
    internalId: row.internal_id,
    team: row.team || '',
    injury: row.injury || '',
    status: row.status,
    patientType: row.patient_type || 'Particular',
    painLevel: row.pain_level || 0,
    mobility: row.mobility || 0,
    sessionsCompleted: row.sessions_completed || 0,
    totalSessionsTarget: row.total_sessions_target || 0,
    recoveryProgress: row.recovery_progress || 0,
    assignedProfessionalId: row.assigned_professional_id || '',
    avatar: row.avatar || '',
    nextSession: row.next_session || '',
    lastSessionDate: row.last_session_date || '',
    phone: row.phone || '',
    bodyZone: row.body_zone || '',
    injuryType: row.injury_type || '',
    injuryDiagnosis: row.injury_diagnosis || '',
    injuryDetail: row.injury_detail || '',
    sport: row.sport || '',
    clubMember: row.club_member || false,
  };
}

export default function PatientsPage() {
  const navigate = useNavigate();

  const [localPatients, setLocalPatients] = useState<PatientWithInjury[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({
    name: '',
    internalId: '',
    phone: '',
    status: 'INJURED' as PatientStatus,
    sport: '',
    patientType: 'Particular' as PatientType,
    bodyZone: '',
    injuryType: '',
    injuryDiagnosis: '',
    injuryDetail: '',
    painLevel: 0,
    sessionsCompleted: 0,
    totalSessionsTarget: 10,
  });

  const fetchPatients = async () => {
  const query = supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });

  const { data, error } =
    activeFilter === 'ARCHIVED'
      ? await query.eq('archived', true)
      : await query.eq('archived', false);

  if (error) {
    console.error('Error cargando pacientes:', error);
    return;
  }

  setLocalPatients((data || []).map(mapPatient));
};

  useEffect(() => {
  fetchPatients();
}, [activeFilter]);

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    INJURED: 'bg-red-100 text-red-700',
    DISCHARGED: 'bg-slate-100 text-slate-500',
    TREATMENT: 'bg-red-100 text-red-700',
    WARNING: 'bg-green-100 text-green-700',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Activo',
    INJURED: 'Lesionado',
    DISCHARGED: 'De alta',
    TREATMENT: 'Lesionado',
    WARNING: 'Activo',
  };

  const filters: { label: string; value: FilterKey }[] = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Activos', value: 'ACTIVE' },
    { label: 'Lesionados', value: 'INJURED' },
    { label: 'De Alta', value: 'DISCHARGED' },
    { label: 'Archivados', value: 'ARCHIVED' },
  ];

  const filteredPatients = useMemo(() => {
  return localPatients.filter((patient) => {
    const normalizedStatus = normalizeStatus(patient.status);

    const matchesFilter =
      activeFilter === 'ARCHIVED'
        ? true
        : activeFilter === 'ALL'
          ? true
          : normalizedStatus === activeFilter;

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      search.length === 0 ||
      patient.name.toLowerCase().includes(search) ||
      patient.internalId?.toLowerCase().includes(search) ||
      patient.phone?.toLowerCase().includes(search) ||
      patient.injury?.toLowerCase().includes(search) ||
      patient.bodyZone?.toLowerCase().includes(search) ||
      patient.injuryType?.toLowerCase().includes(search) ||
      patient.injuryDiagnosis?.toLowerCase().includes(search) ||
      patient.injuryDetail?.toLowerCase().includes(search) ||
      patient.sport?.toLowerCase().includes(search) ||
      patient.patientType?.toLowerCase().includes(search);

    return matchesFilter && matchesSearch;
  });
}, [localPatients, activeFilter, searchTerm]);

  const activeCount = localPatients.filter((p) => normalizeStatus(p.status) === 'ACTIVE').length;
  const injuredCount = localPatients.filter((p) => normalizeStatus(p.status) === 'INJURED').length;
  const dischargedCount = localPatients.filter((p) => normalizeStatus(p.status) === 'DISCHARGED').length;

  const handleRestorePatient = async (patientId: string) => {
  const confirmRestore = window.confirm(
    '¿Restaurar este paciente a la lista principal?'
  );

  if (!confirmRestore) return;

  const { error } = await supabase
    .from('patients')
    .update({ archived: false })
    .eq('id', patientId);

  if (error) {
    console.error('Error restaurando paciente:', error);
    alert('Error restaurando paciente');
    return;
  }

  await fetchPatients();
};
  const handleCreatePatient = async () => {
    if (!form.name.trim()) {
      alert('Ingresá el nombre del paciente.');
      return;
    }

    if (!form.injuryDiagnosis.trim()) {
      alert('Ingresá el diagnóstico o lesión.');
      return;
    }

    const injurySummary = [form.injuryDiagnosis, form.bodyZone]
      .filter(Boolean)
      .join(' · ');

    const { error } = await supabase.from('patients').insert({
      name: form.name,
      internal_id: form.internalId,
      phone: form.phone,
      status: form.status,
      sport: form.sport,
      patient_type: form.patientType,
      club_member: form.patientType === 'Socio del Club' || form.patientType === 'Formativas',
      injury: injurySummary,
      body_zone: form.bodyZone,
      injury_type: form.injuryType,
      injury_diagnosis: form.injuryDiagnosis,
      injury_detail: form.injuryDetail,
      pain_level: form.painLevel,
      mobility: 0,
      sessions_completed: form.sessionsCompleted,
      total_sessions_target: form.totalSessionsTarget,
      recovery_progress: 0,
    });

    if (error) {
      console.error('Error creando paciente:', error);
      alert(JSON.stringify(error, null, 2));
      return;
    }

    await fetchPatients();
    setShowModal(false);

    setForm({
      name: '',
      internalId: '',
      phone: '',
      status: 'INJURED',
      sport: '',
      patientType: 'Particular',
      bodyZone: '',
      injuryType: '',
      injuryDiagnosis: '',
      injuryDetail: '',
      painLevel: 0,
      sessionsCompleted: 0,
      totalSessionsTarget: 10,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Directorio de Pacientes
          </h1>
          <p className="text-slate-500 text-sm">
            Visualiza y administra el historial clínico de tus pacientes.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          

          <button
            onClick={() => setShowModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm shadow-primary/20 hover:bg-primary-dark active:scale-95"
          >
            <Plus className="w-4 h-4" /> NUEVO PACIENTE
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setActiveFilter(filter.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all',
              activeFilter === filter.value
                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600'
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Pacientes" value={localPatients.length} detail="registrados" />
        <StatCard title="Activos" value={activeCount} detail="entrenan/juegan" />
        <StatCard title="Lesionados" value={injuredCount} detail="sin entrenar" danger />
        <StatCard title="De Alta" value={dischargedCount} detail="finalizados" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Lista Maestra
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, teléfono, deporte, lesión o zona..."
                className="w-80 bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-600">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Paciente</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Deporte</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Tipo paciente</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Lesión</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Tipo lesión</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">Dolor</th>
              <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                  No hay pacientes para este filtro.
                </td>
              </tr>
            )}

            {filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                className="group hover:bg-slate-50/80 cursor-pointer"
                onClick={() => navigate(`/patients/${patient.id}`)}
              >
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {patient.name.charAt(0)}
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-slate-800">{patient.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        ID: {patient.internalId || 'Sin ID'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Tel: {patient.phone || 'Sin teléfono'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-3.5">
                  <p className="text-xs font-bold text-slate-700">
                    {patient.sport || 'Sin deporte'}
                  </p>
                </td>

                <td className="px-6 py-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-primary">
                    {patient.patientType || 'Particular'}
                  </span>
                </td>

                <td className="px-6 py-3.5">
                  <p className="text-xs font-bold text-slate-700">
                    {patient.injuryDiagnosis || patient.injury || 'Sin diagnóstico'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {patient.bodyZone || 'Sin zona'}
                  </p>
                </td>

                <td className="px-6 py-3.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                    {patient.injuryType || 'Sin tipo'}
                  </span>
                </td>

                <td className="px-6 py-3.5">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold uppercase', statusColors[patient.status])}>
                    {statusLabels[patient.status]}
                  </span>
                </td>

                <td className="px-6 py-3.5">
                  <span className="text-xs font-bold text-slate-700">
                    {patient.painLevel}/10
                  </span>
                </td>

                <td className="px-6 py-3.5 text-right">
  {activeFilter === 'ARCHIVED' ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleRestorePatient(patient.id);
      }}
      className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[10px] font-bold uppercase hover:bg-green-100"
    >
      Restaurar
    </button>
  ) : (
    <button className="p-2 text-slate-300 group-hover:text-primary">
      <ChevronRight className="w-4 h-4" />
    </button>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-3 border-t border-slate-50 bg-slate-50/30">
          <p className="text-[10px] text-slate-400 font-medium">
            Mostrando {filteredPatients.length} de {localPatients.length} pacientes
          </p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-slate-800">Nuevo paciente</h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Nombre" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
                <Input label="ID interno / CI" value={form.internalId} onChange={(v: string) => setForm({ ...form, internalId: v })} />
                <Input label="Teléfono" placeholder="Ej: 099123456" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Deporte"
                  placeholder="Ej: Fútbol, básquetbol, running"
                  value={form.sport}
                  onChange={(v: string) => setForm({ ...form, sport: v })}
                />

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Tipo de paciente
                  </label>
                  <select
                    value={form.patientType}
                    onChange={(e) => setForm({ ...form, patientType: e.target.value as PatientType })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Socio del Club">Socio del Club</option>
                    <option value="Formativas">Formativas</option>
                    <option value="Particular">Particular</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Estado
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as PatientStatus })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INJURED">Lesionado</option>
                    <option value="DISCHARGED">De alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Zona corporal" placeholder="Ej: Rodilla derecha" value={form.bodyZone} onChange={(v: string) => setForm({ ...form, bodyZone: v })} />

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400">
                    Tipo de lesión
                  </label>
                  <select
                    value={form.injuryType}
                    onChange={(e) => setForm({ ...form, injuryType: e.target.value })}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Muscular">Muscular</option>
                    <option value="Tendinosa">Tendinosa</option>
                    <option value="Ligamentaria">Ligamentaria</option>
                    <option value="Ósea">Ósea</option>
                    <option value="Articular">Articular</option>
                    <option value="Neurológica">Neurológica</option>
                    <option value="Otra">Otra</option>
                  </select>
                </div>

                <Input label="Diagnóstico / lesión" placeholder="Ej: LCA, esguince, desgarro" value={form.injuryDiagnosis} onChange={(v: string) => setForm({ ...form, injuryDiagnosis: v })} />
              </div>

              <Textarea
                label="Detalle / observación"
                placeholder="Ej: Rotura parcial de LCA, esguince grado II..."
                value={form.injuryDetail}
                onChange={(v: string) => setForm({ ...form, injuryDetail: v })}
              />

              <NumberInput
                label="Dolor inicial"
                value={form.painLevel}
                onChange={(v: number) => setForm({ ...form, painLevel: v })}
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Cancelar
              </button>

              <button onClick={handleCreatePatient} className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold">
                Guardar paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ title, value, detail, danger = false }: any) {
  return (
    <div className={cn('bg-white p-4 rounded-xl border border-slate-200 shadow-sm', danger && 'border-l-4 border-l-red-500')}>
      <p className={cn('text-[10px] font-bold uppercase tracking-wider', danger ? 'text-red-500' : 'text-slate-400')}>
        {title}
      </p>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold text-slate-900">{value}</span>
        <span className={cn('text-[10px] font-bold', danger ? 'text-red-400' : 'text-green-600')}>
          {detail}
        </span>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder = '' }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-slate-400">{label}</label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, placeholder = '' }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-slate-400">{label}</label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full min-h-[90px] border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}

function NumberInput({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-slate-400">{label}</label>
      <input
        type="number"
        min={0}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}