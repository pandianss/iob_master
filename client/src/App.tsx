import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Departments } from './pages/Departments';
import { DoARules } from './pages/DoARules';
import { MISDashboard } from './pages/MISDashboard';
import { BusinessSnapshot } from './pages/BusinessSnapshot';
import { NegativeParameterMIS } from './pages/NegativeParameterMIS';
import { ParameterMapping } from './pages/ParameterMapping';
import { CalendarDashboard } from './pages/CalendarDashboard';
import { AgendaManagement } from './pages/AgendaManagement';
import { CreateDecision } from './pages/CreateDecision';
import { GovernanceParameters } from './pages/GovernanceParameters';
import { ObligationRegister } from './pages/ObligationRegister';
import { Offices } from './pages/Offices';
import { UnitProfile } from './pages/UnitProfile';
import { StaffRegistry } from './pages/StaffRegistry';

import Login from './pages/Login';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Shell />}>
            <Route path="/" element={<ObligationRegister />} />
            <Route path="/decisions" element={<ObligationRegister />} />
            <Route path="/decisions/new" element={<CreateDecision />} />
            <Route path="/decisions/:id" element={<CreateDecision />} />
            <Route path="/staff" element={<StaffRegistry />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/departments/:id" element={<UnitProfile />} />
            <Route path="/offices" element={<Offices />} />
            <Route path="/doa" element={<DoARules />} />
            <Route path="/mis" element={<MISDashboard />} />
            <Route path="/snapshot" element={<BusinessSnapshot />} />
            <Route path="/negative-parameters" element={<NegativeParameterMIS />} />
            <Route path="/parameter-mapping" element={<ParameterMapping />} />
            <Route path="/governance/parameters" element={<GovernanceParameters />} />
            <Route path="/calendar" element={<CalendarDashboard />} />
            <Route path="/calendar/meeting/:id" element={<AgendaManagement />} />
            <Route path="*" element={<div className="p-4">Page under construction</div>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
