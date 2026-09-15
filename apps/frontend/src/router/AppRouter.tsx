import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@shared/layouts/AppLayout';
import { useAuthStore, type UserRole } from '@features/auth/store/auth.store';
import type { ReactNode } from 'react';

import { LoginPage } from '@features/auth/components/pages/LoginPage';
import { DashboardPage } from '@features/processes/components/pages/DashboardPage';

interface ProtectedRouteProps {
  readonly children:      ReactNode;
  readonly allowedRoles?: readonly UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = useAuthStore(state => state.token);
  const role = useAuthStore(state => state.user?.role);

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

// Placeholders — se reemplazan en fases posteriores
function ProcessesPage()  { return <p className="p-base text-text-primary">Procesos</p>; }
function CandidatesPage() { return <p className="p-base text-text-primary">Candidatos</p>; }
function InterviewsPage() { return <p className="p-base text-text-primary">Entrevistas</p>; }
function FeedbackPage()   { return <p className="p-base text-text-primary">Feedback</p>; }
function ReportsPage()    { return <p className="p-base text-text-primary">Reportes</p>; }
function NotFoundPage()   { return <p className="p-base text-text-primary">404 — Página no encontrada</p>; }

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protegidas */}
        <Route path="/dashboard"  element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/processes"  element={<ProtectedRoute><ProcessesPage /></ProtectedRoute>} />
        <Route path="/candidates" element={<ProtectedRoute><CandidatesPage /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><InterviewsPage /></ProtectedRoute>} />
        <Route path="/feedback"   element={<ProtectedRoute allowedRoles={['recruiter', 'pm']}><FeedbackPage /></ProtectedRoute>} />
        <Route path="/reports"    element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

        {/* Raíz → dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
