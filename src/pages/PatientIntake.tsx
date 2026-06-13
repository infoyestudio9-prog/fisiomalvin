import React, { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Cross, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { PatientType } from '../types';
import { cn } from '../lib/utils';

type IntakeForm = {
  name: string;
  internalId: string;
  phone: string;
  patientType: PatientType;
  sport: string;
  bodyZone: string;
  reason: string;
  painLevel: number;
};

const initialForm: IntakeForm = {
  name: '',
  internalId: '',
  phone: '',
  patientType: 'Particular',
  sport: '',
  bodyZone: '',
  reason: '',
  painLevel: 0,
};

export default function PatientIntakePage() {
  const [form, setForm] = useState<IntakeForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedName, setSubmittedName] = useState('');

  const isClubPatient =
    form.patientType === 'Socio del Club' || form.patientType === 'Formativas';

  const intakeSummary = useMemo(() => {
    if (form.reason.trim()) return form.reason.trim();
    if (form.bodyZone.trim()) return `Consulta por ${form.bodyZone.trim()}`;
    return 'Ingreso pendiente de valoración';
  }, [form.bodyZone, form.reason]);

  const updateForm = <K extends keyof IntakeForm>(key: K, value: IntakeForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError('');

    if (!form.name.trim()) {
      setSubmitError('Ingresá tu nombre completo.');
      return;
    }

    if (!form.phone.trim()) {
      setSubmitError('Ingresá un teléfono de contacto.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from('patients').insert({
      name: form.name.trim(),
      internal_id: form.internalId.trim(),
      phone: form.phone.trim(),
      status: 'INJURED',
      sport: form.sport.trim(),
      patient_type: form.patientType,
      club_member: isClubPatient,
      injury: intakeSummary,
      body_zone: form.bodyZone.trim(),
      injury_type: '',
      injury_diagnosis: '',
      injury_detail: form.reason.trim(),
      pain_level: form.painLevel,
      mobility: 0,
      sessions_completed: 0,
      total_sessions_target: 10,
      recovery_progress: 0,
      archived: false,
    });

    setIsSubmitting(false);

    if (error) {
      console.error('Error registrando ingreso:', error);
      setSubmitError('No pudimos registrar tus datos. Avisale al equipo de fisioterapia.');
      return;
    }

    setSubmittedName(form.name.trim());
    setForm(initialForm);
  };

  if (submittedName) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center"
        >
          <div className="mx-auto h-14 w-14 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Datos recibidos
          </h1>

          <p className="mt-3 text-sm text-slate-500 leading-relaxed">
            Gracias, {submittedName}. El equipo de fisioterapia ya puede ver tu ingreso.
          </p>

          <button
            onClick={() => setSubmittedName('')}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark"
          >
            Cargar otro paciente
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
            <Cross className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-primary">FisioMalvin</p>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Ingreso de paciente
            </p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="border-b border-slate-100 px-5 py-4 md:px-7">
            <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <ClipboardList className="h-5 w-5 text-primary" />
              Datos para la consulta
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Completá esta información mientras esperás.
            </p>
          </div>

          <div className="space-y-5 p-5 md:p-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Nombre completo"
                value={form.name}
                onChange={(value) => updateForm('name', value)}
                required
              />
              <TextInput
                label="CI / ID"
                value={form.internalId}
                onChange={(value) => updateForm('internalId', value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label="Teléfono"
                value={form.phone}
                onChange={(value) => updateForm('phone', value)}
                required
              />

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Tipo de paciente
                </label>
                <select
                  value={form.patientType}
                  onChange={(event) =>
                    updateForm('patientType', event.target.value as PatientType)
                  }
                  className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="Particular">Particular</option>
                  <option value="Socio del Club">Socio del Club</option>
                  <option value="Formativas">Formativas</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                label={form.patientType === 'Formativas' ? 'Categoría / equipo' : 'Deporte'}
                placeholder={
                  form.patientType === 'Formativas'
                    ? 'Ej: U15 femenino, U17 masculino'
                    : 'Ej: basket, running, fútbol'
                }
                value={form.sport}
                onChange={(value) => updateForm('sport', value)}
              />
              <TextInput
                label="Zona de dolor o molestia"
                placeholder="Ej: rodilla derecha, hombro, lumbar"
                value={form.bodyZone}
                onChange={(value) => updateForm('bodyZone', value)}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400">
                Motivo de consulta
              </label>
              <textarea
                value={form.reason}
                onChange={(event) => updateForm('reason', event.target.value)}
                placeholder="Contanos brevemente qué pasó o qué sentís."
                className="mt-1 w-full min-h-[110px] border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  Dolor actual
                </label>
                <span className="text-2xl font-extrabold text-primary">
                  {form.painLevel}/10
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={form.painLevel}
                onChange={(event) => updateForm('painLevel', Number(event.target.value))}
                className="mt-3 w-full"
              />
              <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Sin dolor</span>
                <span>Máximo</span>
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600">
                {submitError}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 md:px-7">
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'w-full rounded-lg px-4 py-3 text-sm font-bold text-white flex items-center justify-center gap-2',
                isSubmitting ? 'bg-slate-400' : 'bg-primary hover:bg-primary-dark'
              )}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar datos
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase font-bold text-slate-400">
        {label}
      </label>
      <input
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
