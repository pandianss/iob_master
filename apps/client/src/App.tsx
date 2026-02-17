import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './router/RoleGuard';

// Lazy load pages
const Shell = lazy(() => import('./components/layout/Shell').then(m => ({ default: m.Shell })));
const Login = lazy(() => import('./pages/Login'));
const Inbox = lazy(() => import('./pages/Inbox').then(m => ({ default: m.Inbox })));
const CreateDecision = lazy(() => import('./pages/CreateDecision').then(m => ({ default: m.CreateDecision })));
const Regions = lazy(() => import('./pages/Regions'));
const StaffRegistry = lazy(() => import('./pages/StaffRegistry').then(m => ({ default: m.StaffRegistry })));
const Departments = lazy(() => import('./pages/Departments').then(m => ({ default: m.Departments })));
const Offices = lazy(() => import('./pages/Offices').then(m => ({ default: m.Offices })));
const IngestionPage = lazy(() => import('./pages/IngestionPage').then(m => ({ default: m.IngestionPage })));
const CalendarDashboard = lazy(() => import('./pages/CalendarDashboard').then(m => ({ default: m.CalendarDashboard })));
const IntelligenceHub = lazy(() => import('./pages/IntelligenceHub'));
const GovernanceWorkspace = lazy(() => import('./pages/GovernanceWorkspace'));

export function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-iob-blue animate-pulse font-bold tracking-tight">
        <span className="opacity-50 mr-2">LOADING</span> MODULE
      </div>}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RoleGuard roles={['ADMIN', 'RO', 'BRANCH']}><Shell /></RoleGuard>}>
            <Route path="/" element={<Navigate to="/decisions" replace />} />
            <Route path="/decisions" element={<Inbox />} />
            <Route path="/decisions/create" element={<CreateDecision />} />

            {/* Governance & Admin Only */}
            <Route element={<RoleGuard roles={['ADMIN', 'RO']} />}>
              <Route path="/governance/parameters" element={<GovernanceWorkspace />} />
              <Route path="/doa" element={<GovernanceWorkspace />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/staff" element={<StaffRegistry />} />
              <Route path="/offices" element={<Offices />} />
              <Route path="/regions" element={<Regions />} />
            </Route>

            {/* Intelligence Hub */}
            <Route path="/mis" element={<IntelligenceHub />} />
            <Route path="/snapshot" element={<IntelligenceHub />} />

            <Route path="/calendar" element={<CalendarDashboard />} />
            <Route path="/data-ingestion" element={<IngestionPage />} />
            <Route path="*" element={<div className="p-12 text-center text-gray-400">Section Under Active Development</div>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
