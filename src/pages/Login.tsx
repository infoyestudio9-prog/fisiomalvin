import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Cross, UserRound } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useClinic } from '../ClinicContext';
import { User } from '../types';

type LoginRole = 'DOCTOR' | 'PHYSIOTHERAPIST';

const LOCAL_USERS: Array<User & { password: string }> = [
  {
    id: 'user-medico-pajaro',
    name: 'Pájaro',
    email: 'pajaro@fisiomalvin.com',
    password: 'Pajaro',
    role: 'DOCTOR',
    avatar: '',
  },
  {
    id: 'user-fisio-ignacio',
    name: 'Ignacio García',
    email: 'ignacio@fisiomalvin.com',
    password: 'Nacho',
    role: 'PHYSIOTHERAPIST',
    avatar: '',
  },
  {
    id: 'user-fisio-josefina',
    name: 'Josefina',
    email: 'josefina@fisiomalvin.com',
    password: 'Jose',
    role: 'PHYSIOTHERAPIST',
    avatar: '',
  },
  {
    id: 'user-fisio-martina',
    name: 'Martina Pereira',
    email: 'martina@fisiomalvin.com',
    password: 'Martina',
    role: 'PHYSIOTHERAPIST',
    avatar: '',
  },
  {
    id: 'user-fisio-valentina',
    name: 'Valentina Silva',
    email: 'valentina@fisiomalvin.com',
    password: 'Valen',
    role: 'PHYSIOTHERAPIST',
    avatar: '',
  },
  {
    id: 'user-fisio-camila',
    name: 'Camila Rodríguez',
    email: 'camila@fisiomalvin.com',
    password: 'Camila',
    role: 'PHYSIOTHERAPIST',
    avatar: '',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser } = useClinic();

  const [role, setRole] = useState<LoginRole>('PHYSIOTHERAPIST');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const foundUser = LOCAL_USERS.find(
      (user) =>
        user.email.toLowerCase() === cleanEmail &&
        user.password === cleanPassword &&
        user.role === role
    );

    if (!foundUser) {
      setErrorMessage('Usuario, contraseña o perfil incorrecto.');
      return;
    }

    const loggedUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      avatar: foundUser.avatar,
    };

    setCurrentUser(loggedUser);
    localStorage.setItem('fisiomalvin_user', JSON.stringify(loggedUser));

    setErrorMessage('');
    navigate('/patients');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row border border-slate-100"
      >
        <div className="relative hidden lg:block w-1/2 min-h-[720px] overflow-hidden bg-primary">
          <img
            src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=2070"
            alt="Fisioterapia"
            className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-multiply"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/20 flex flex-col justify-end p-12">
            <h2 className="font-manrope font-extrabold text-4xl text-white mb-4">
              FisioMalvin
            </h2>
            <p className="text-white/85 font-medium leading-relaxed max-w-sm">
              Accedé al control de expedientes clínicos, seguimiento de evolución y gestión de estudios de tus pacientes.
            </p>
          </div>

          <p className="absolute bottom-3 left-8 text-[10px] text-white/40 uppercase tracking-widest">
            Protocolo de seguridad v2.4.0
          </p>
        </div>

        <div className="w-full lg:w-1/2 p-10 lg:p-16 flex flex-col justify-center">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Cross className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-primary">
                FisioMalvin
              </span>
            </div>

            <h1 className="font-manrope font-extrabold text-3xl text-slate-900 mb-2">
              Bienvenido de nuevo
            </h1>
            <p className="text-slate-500 font-medium">
              Ingresá tus credenciales para acceder a la gestión clínica.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Perfil de usuario
              </label>

              <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setRole('DOCTOR')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all',
                    role === 'DOCTOR'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Cross className="w-4 h-4" />
                  Doctor
                </button>

                <button
                  type="button"
                  onClick={() => setRole('PHYSIOTHERAPIST')}
                  className={cn(
                    'flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all',
                    role === 'PHYSIOTHERAPIST'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <UserRound className="w-4 h-4" />
                  Fisioterapeuta
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                Usuario o Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === 'DOCTOR'
                      ? 'pajaro@fisiomalvin.com'
                      : 'ignacio@fisiomalvin.com'
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                  Contraseña
                </label>
                <button type="button" className="text-xs font-bold text-primary hover:underline">
                  ¿Olvidó su contraseña?
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-20 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-slate-900 placeholder:text-slate-300"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-primary"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center gap-3 px-1">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-slate-500 font-medium">
                Recordar mi sesión en este equipo
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
            >
              Iniciar Sesión
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center space-y-4">
            <p className="text-sm text-slate-500">
              ¿No tenés una cuenta?{' '}
              <span className="text-primary font-bold">Contactar con administración</span>
            </p>

            <div className="flex justify-center gap-6 text-xs text-slate-400">
              <span>Privacidad</span>
              <span>Términos</span>
              <span>Ayuda</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
