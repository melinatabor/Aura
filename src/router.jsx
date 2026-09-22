import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import RequireAuth from './components/RequireAuth/RequireAuth.jsx'

import Home from './pages/public/Home.jsx'
import Features from './pages/public/Features.jsx'
import Contact from './pages/public/Contact.jsx'
import ContactConfirmation from './pages/public/ContactConfirmation.jsx'

import Login from './pages/auth/Login.jsx'
import ActivateAccount from './pages/auth/ActivateAccount.jsx'

import Dashboard from './pages/dashboard/Dashboard.jsx'
import Schedule from './pages/schedule/Schedule.jsx'
import PatientList from './pages/patients/PatientList.jsx'
import PatientProfile from './pages/patients/PatientProfile.jsx'
import TreatmentCatalog from './pages/treatments/TreatmentCatalog.jsx'
import SupplyControl from './pages/supplies/SupplyControl.jsx'
import Alerts from './pages/alerts/Alerts.jsx'
import OperationalReports from './pages/reports/OperationalReports.jsx'
import AIPatientScoring from './pages/scoring/AIPatientScoring.jsx'
import EmployeesRoles from './pages/employees/EmployeesRoles.jsx'
import OperationalSettings from './pages/settings/OperationalSettings.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/contact/confirmation" element={<ContactConfirmation />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/schedule" element={<Schedule />} />
          <Route path="/app/patients" element={<PatientList />} />
          <Route path="/app/patients/:id" element={<PatientProfile />} />
          <Route path="/app/treatments" element={<TreatmentCatalog />} />
          <Route path="/app/supplies" element={<SupplyControl />} />
          <Route path="/app/alerts" element={<Alerts />} />
          <Route path="/app/reports" element={<OperationalReports />} />
          <Route path="/app/ai-scoring" element={<AIPatientScoring />} />
          <Route path="/app/employees" element={<EmployeesRoles />} />
          <Route path="/app/settings" element={<OperationalSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
