import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar.jsx'
import Topbar from '../components/Topbar/Topbar.jsx'
import './AppLayout.scss'

const TITLES = [
  { prefix: '/app/dashboard', title: 'Panel principal' },
  { prefix: '/app/agenda', title: 'Agenda' },
  { prefix: '/app/clientes', title: 'Clientes' },
  { prefix: '/app/tratamientos', title: 'Catálogo de tratamientos' },
  { prefix: '/app/insumos', title: 'Insumos' },
  { prefix: '/app/alertas', title: 'Alertas' },
  { prefix: '/app/reportes', title: 'Reportes operativos' },
  { prefix: '/app/ai-scoring', title: 'AI Patient Scoring' },
  { prefix: '/app/empleados', title: 'Empleados y roles' },
  { prefix: '/app/configuracion', title: 'Configuración operativa' },
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
