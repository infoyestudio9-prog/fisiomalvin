import React, { useState } from 'react';
import { X, Save, CheckCircle2, ThumbsUp, ThumbsDown, Meh } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useClinic } from '../ClinicContext';
import { Session, SessionResult } from '../types';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  clinicalCaseId: string;
}

export function SessionModal({ isOpen, onClose, patientId, clinicalCaseId }: SessionModalProps) {
  const { getPatientById, getClinicalCaseById, addSession, currentUser } = useClinic();
  const patient = getPatientById(patientId);
  const clinicalCase = getClinicalCaseById(clinicalCaseId);

  const [painBefore, setPainBefore] = useState(4);
  const [painAfter, setPainAfter] = useState(2);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Terapia manual']);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<SessionResult>('IMPROVED');

  const treatmentOptions = [
    'Terapia manual', 'Ejercicio', 'TENS', 'Movilidad', 'Fuerza', 'Estiramientos', 'Magnetoterapia'
  ];

  if (!patient || !clinicalCase) return null;

  const handleSave = () => {
    const newSession: Session = {
      id: Math.random().toString(36).substr(2, 9),
      patientId,
      clinicalCaseId,
      date: new Date().toISOString(),
      professionalId: currentUser?.id || '',
      painBefore,
      painAfter,
      treatmentTags: selectedTags,
      notes,
      result,
      needsMedicalReview: false
    };

    addSession(newSession);
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest leading-none">Registrar Evolución</h2>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">
               <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-lg mb-2">
                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {patient.name[0]}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{clinicalCase.title}</p>
                 </div>
               </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dolor Inicial</label>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                    <input 
                      type="range" min="0" max="10" 
                      value={painBefore}
                      onChange={(e) => setPainBefore(parseInt(e.target.value))}
                      className="flex-1 accent-primary h-1.5" 
                    />
                    <span className="text-lg font-bold text-slate-900 w-6">{painBefore}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dolor Final</label>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-3">
                    <input 
                      type="range" min="0" max="10" 
                      value={painAfter}
                      onChange={(e) => setPainAfter(parseInt(e.target.value))}
                      className="flex-1 accent-primary h-1.5" 
                    />
                    <span className="text-lg font-bold text-slate-900 w-6">{painAfter}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tratamiento Aplicado</label>
                <div className="flex flex-wrap gap-2">
                  {treatmentOptions.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all",
                        selectedTags.includes(tag)
                          ? "bg-primary border-primary text-white shadow-sm shadow-primary/20"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Observaciones</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles de la sesión..."
                  className="w-full h-24 p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary outline-none transition-all resize-none text-sm placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Resultado General</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'IMPROVED', label: 'Mejoró', icon: ThumbsUp },
                    { val: 'SAME', label: 'Igual', icon: Meh },
                    { val: 'WORSE', label: 'Empeoró', icon: ThumbsDown },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setResult(item.val as SessionResult)}
                      className={cn(
                        "py-3 flex flex-col items-center gap-1 rounded-lg border transition-all",
                        result === item.val
                          ? "bg-blue-50 border-primary text-primary"
                          : "bg-white border-slate-100 hover:bg-slate-50 text-slate-400"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <footer className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-slate-800 transition-colors"
              >
                CANCELAR
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                FINALIZAR SESIÓN
              </button>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
