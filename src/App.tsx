import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ClinicProvider } from './ClinicContext';

import LoginPage from './pages/Login';
import PatientsPage from './pages/Patients';
import PatientProfilePage from './pages/PatientProfile';
import ClinicalCasePage from './pages/ClinicalCase';
import InjuriesPage from './pages/Injuries';

import { Layout } from './components/Layout';

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Esta sección está lista para construir.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<Layout />}>
            <Route path="patients" element={<PatientsPage />} />
            <Route path="patients/:id" element={<PatientProfilePage />} />
            <Route path="patients/:id/case/:caseId" element={<ClinicalCasePage />} />

            <Route path="injuries" element={<InjuriesPage />} />
            <Route path="calendar" element={<PlaceholderPage title="Calendario" />} />
            <Route path="treatments" element={<PlaceholderPage title="Tratamientos" />} />
            <Route path="reports" element={<PlaceholderPage title="Reportes" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ClinicProvider>
  );
}