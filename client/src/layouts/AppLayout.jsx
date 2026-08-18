import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import Topbar from '../components/Topbar/Topbar.jsx'
import './AppLayout.scss'

const TITLES = [
  { prefix: '/app/dashboard', title: 'Panel principal' },
  { prefix: '/app/schedule', title: 'Agenda' },
  { prefix: '/app/patients', title: 'Clientes' },
  { prefix: '/app/treatments', title: 'Catálogo de tratamientos' },
  { prefix: '/app/supplies', title: 'Insumos' },
  { prefix: '/app/alerts', title: 'Alertas' },
  { prefix: '/app/reports', title: 'Reportes operativos' },
  { prefix: '/app/ai-scoring', title: 'AI Patient Scoring' },
  { prefix: '/app/employees', title: 'Empleados y roles' },
  { prefix: '/app/settings', title: 'Configuración operativa' },
]

function resolveTitle(pathname) {
  const match = TITLES.find((t) => pathname.startsWith(t.prefix))
  return match?.title ?? 'AURA'
}

export default function AppLayout() {
  const location = useLocation()

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-main">
        <Topbar title={resolveTitle(location.pathname)} />
        <div className="app-layout-content">
          <Outlet />
        </div>
        <p className="app-layout-footnote">
          Los datos de esta demo se guardan en memoria del navegador y se pierden al recargar la página.
        </p>
      </div>
    </div>
  )
}
