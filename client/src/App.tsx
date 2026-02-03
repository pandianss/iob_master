import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Shell } from './components/layout/Shell';
import { Inbox } from './pages/Inbox';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Inbox />} />
          <Route path="/decisions/new" element={<CreateDecision />} />
          <Route path="/decisions/:id" element={<CreateDecision />} />
          <Route path="/departments" element={<Departments />} />
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
