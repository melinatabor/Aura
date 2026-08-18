import { Routes, Route } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import RequireAuth from './components/RequireAuth/RequireAuth.jsx'

import Home from './pages/publico/Home.jsx'
import Funcionalidades from './pages/publico/Funcionalidades.jsx'
import Contacto from './pages/publico/Contacto.jsx'
import ConfirmacionConsulta from './pages/publico/ConfirmacionConsulta.jsx'

import Login from './pages/auth/Login.jsx'
import ActivacionCuenta from './pages/auth/ActivacionCuenta.jsx'

import Dashboard from './pages/dashboard/Dashboard.jsx'
import Agenda from './pages/agenda/Agenda.jsx'
import ListadoClientes from './pages/clientes/ListadoClientes.jsx'
import FichaPaciente from './pages/clientes/FichaPaciente.jsx'
import CatalogoTratamientos from './pages/tratamientos/CatalogoTratamientos.jsx'
import ControlInsumos from './pages/insumos/ControlInsumos.jsx'
import Alertas from './pages/alertas/Alertas.jsx'
import ReportesOperativos from './pages/reportes/ReportesOperativos.jsx'
import AIPatientScoring from './pages/scoring/AIPatientScoring.jsx'
import EmpleadosRoles from './pages/empleados/EmpleadosRoles.jsx'
import ConfiguracionOperativa from './pages/configuracion/ConfiguracionOperativa.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/funcionalidades" element={<Funcionalidades />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/contacto/confirmacion" element={<ConfirmacionConsulta />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/activacion-cuenta" element={<ActivacionCuenta />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/agenda" element={<Agenda />} />
          <Route path="/app/clientes" element={<ListadoClientes />} />
          <Route path="/app/clientes/:id" element={<FichaPaciente />} />
          <Route path="/app/tratamientos" element={<CatalogoTratamientos />} />
          <Route path="/app/insumos" element={<ControlInsumos />} />
          <Route path="/app/alertas" element={<Alertas />} />
          <Route path="/app/reportes" element={<ReportesOperativos />} />
          <Route path="/app/ai-scoring" element={<AIPatientScoring />} />
          <Route path="/app/empleados" element={<EmpleadosRoles />} />
          <Route path="/app/configuracion" element={<ConfiguracionOperativa />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
