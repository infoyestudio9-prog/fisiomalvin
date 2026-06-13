import React, { useMemo, useState } from 'react';
import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../ClinicContext';
import { PatientRecord } from '../lib/clinicData';

export function TopBar() {
  const navigate = useNavigate();
  const { currentUser, patients } = useClinic();
  const [searchTerm, setSearchTerm] = useState('');
  const displayName = currentUser?.name || 'Usuario clínico';
  const roleLabel =
    currentUser?.role === 'DOCTOR'
      ? 'MEDICO'
      : currentUser?.role === 'ADMIN'
        ? 'ADMINISTRACION'
        : 'FISIOTERAPEUTA';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
  const searchResults = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (search.length < 2) return [];

    return (patients as PatientRecord[])
      .filter((patient) =>
        patient.name.toLowerCase().includes(search) ||
        patient.internalId?.toLowerCase().includes(search) ||
        patient.phone?.toLowerCase().includes(search) ||
        patient.team?.toLowerCase().includes(search) ||
        patient.sport?.toLowerCase().includes(search)
      )
      .slice(0, 6);
  }, [patients, searchTerm]);

  const goToPatient = (patientId: string) => {
    setSearchTerm('');
    navigate(`/patients/${patientId}`);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
      
      {/* BUSCADOR */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por paciente, ID o equipo..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
          />

          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-11 z-30 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => goToPatient(patient.id)}
                  className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0"
                >
                  <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                  <p className="text-xs text-slate-500">
                    CI/ID: {patient.internalId || 'Sin registrar'} · {patient.phone || 'Sin teléfono'}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-2">
        
        {/* NOTIFICACIONES */}
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors relative group">
          <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* SETTINGS */}
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
          <SettingsIcon className="w-5 h-5" />
        </button>
        
        <div className="h-6 w-[1px] bg-slate-200 mx-2" />
        
        {/* USER INFO (FIJO) */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">
              {displayName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              {roleLabel}
            </p>
          </div>

          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
            {initials || 'FM'}
          </div>
        </div>

      </div>
    </header>
  );
}
