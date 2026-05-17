import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Search,
  Layers,
  MapPin,
  ClipboardList,
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

type InjuryRow = {
  id: string;
  name: string;
  injury: string;
  injury_type: string;
  injury_diagnosis: string;
  body_zone: string;
  status: string;
};

export default function InjuriesPage() {
  const [patients, setPatients] = useState<InjuryRow[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInjuries();
  }, []);

  const fetchInjuries = async () => {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id,
        name,
        injury,
        injury_type,
        injury_diagnosis,
        body_zone,
        status
      `);

    if (error) {
      console.error(error);
      return;
    }

    setPatients(data || []);
  };

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();

    if (!s.length) return patients;

    return patients.filter((p) => {
      const diagnosis =
        p.injury_diagnosis || p.injury || '';

      return (
        diagnosis.toLowerCase().includes(s) ||
        (p.injury_type || '').toLowerCase().includes(s) ||
        (p.body_zone || '').toLowerCase().includes(s) ||
        (p.name || '').toLowerCase().includes(s) ||
        (p.status || '').toLowerCase().includes(s)
      );
    });
  }, [patients, search]);

  const byDiagnosis = countBy(
    patients,
    'injury_diagnosis',
    'Sin diagnóstico'
  );

  const byType = countBy(
    patients,
    'injury_type',
    'Sin tipo'
  );

  const byZone = countBy(
    patients,
    'body_zone',
    'Sin zona'
  );

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Panel de Lesiones
        </h1>

        <p className="text-slate-500 mt-1">
          Visualización global por diagnóstico, tipo, zona corporal y paciente.
        </p>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <RankingCard
          title="Lesiones por diagnóstico"
          icon={ClipboardList}
          items={byDiagnosis}
        />

        <RankingCard
          title="Lesiones por tipo"
          icon={Layers}
          items={byType}
        />

        <RankingCard
          title="Lesiones por zona corporal"
          icon={MapPin}
          items={byZone}
        />

      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">

        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">

          <h2 className="text-xs uppercase tracking-wider font-bold text-slate-500">
            Listado de lesiones
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar diagnóstico, tipo, zona, paciente..."
              className="w-80 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

        </div>

        <table className="w-full text-left">

          <thead className="border-b border-slate-100 bg-slate-50/50">
            <tr>
              <TableHeader>Diagnóstico</TableHeader>
              <TableHeader>Tipo</TableHeader>
              <TableHeader>Zona</TableHeader>
              <TableHeader>Paciente</TableHeader>
              <TableHeader>Estado</TableHeader>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">

            {filtered.map((patient) => {

              const diagnosis =
                patient.injury_diagnosis ||
                patient.injury ||
                'Sin diagnóstico';

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50"
                >

                  <td className="px-6 py-4 font-bold text-slate-800">
                    {diagnosis}
                  </td>

                  <td className="px-6 py-4">
                    <Badge label={patient.injury_type || 'Sin tipo'} />
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {patient.body_zone || 'Sin zona'}
                  </td>

                  <td className="px-6 py-4 text-slate-800 font-medium">
                    {patient.name}
                  </td>

                  <td className="px-6 py-4">

                    <span
                      className={cn(
                        'px-2 py-1 rounded text-[10px] font-bold uppercase',

                        patient.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'

                          : patient.status === 'DISCHARGED'
                            ? 'bg-slate-100 text-slate-500'

                            : 'bg-red-100 text-red-700'
                      )}
                    >
                      {patient.status === 'ACTIVE'
                        ? 'Activo'
                        : patient.status === 'DISCHARGED'
                          ? 'De alta'
                          : 'Lesionado'}
                    </span>

                  </td>

                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-slate-400"
                >
                  No hay lesiones para mostrar.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}

function countBy(
  patients: InjuryRow[],
  field: keyof InjuryRow,
  fallback: string
) {
  const result: Record<string, number> = {};

  patients.forEach((patient) => {

    let value = patient[field];

    if (field === 'injury_diagnosis' && !value) {
      value = patient.injury;
    }

    const key = value || fallback;

    result[key] = (result[key] || 0) + 1;
  });

  return Object.entries(result)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

function RankingCard({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: { label: string; count: number }[];
  icon: any;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">

      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />

        <h3 className="text-xs uppercase tracking-wider font-bold text-slate-500">
          {title}
        </h3>
      </div>

      <div className="space-y-3">

        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between"
          >

            <span className="text-sm font-medium text-slate-700">
              {item.label}
            </span>

            <span className="bg-blue-50 text-primary px-2 py-1 rounded text-xs font-bold">
              {item.count}
            </span>

          </div>
        ))}

      </div>

    </div>
  );
}

function Badge({
  label,
}: {
  label: string;
}) {
  return (
    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
      {label}
    </span>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-6 py-3 text-[10px] uppercase text-slate-400 font-bold">
      {children}
    </th>
  );
}