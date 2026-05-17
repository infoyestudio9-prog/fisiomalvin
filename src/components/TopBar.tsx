import React from 'react';
import { Search, Bell, Settings as SettingsIcon } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
      
      {/* BUSCADOR */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar por paciente, ID o equipo..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
          />
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
              Fisioterapeuta Ignacio García
            </p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              FISIOTERAPEUTA
            </p>
          </div>

          <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200 shadow-sm">
            IG
          </div>
        </div>

      </div>
    </header>
  );
}