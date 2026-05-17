import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Calendar,
  LayoutDashboard,
  History,
  LogOut,
  Cross,
  Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';

const APP_NAME = 'FisioMalvin';

export function Sidebar() {
  const navItems = [
    { title: 'Inicio', icon: LayoutDashboard, path: '/login' },
    { title: 'Pacientes', icon: Users, path: '/patients' },
    { title: 'Lesiones', icon: Activity, path: '/injuries' },
    { title: 'Calendario', icon: Calendar, path: '/calendar' },
    { title: 'Tratamientos', icon: Cross, path: '/treatments' },
    { title: 'Reportes', icon: History, path: '/reports' },
  ];

  return (
    <aside className="w-60 bg-sidebar flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
          <Cross className="w-5 h-5" />
        </div>

        <h1 className="text-xl font-bold text-white tracking-tight font-manrope">
          {APP_NAME}
        </h1>
      </div>

      <nav className="flex-1 px-4 mt-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.path}
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-sm shadow-primary/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <NavLink
          to="/login"
          className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition-all group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          Cerrar Sesión
        </NavLink>
      </div>
    </aside>
  );
}