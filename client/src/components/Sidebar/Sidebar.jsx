import { NavLink, useNavigate } from 'react-router-dom'
import './Sidebar.scss'

const ITEMS = [
  { to: '/app/dashboard', label: 'Panel principal', icon: '🏠' },
  { to: '/app/schedule', label: 'Agenda', icon: '📅' },
  { to: '/app/patients', label: 'Clientes', icon: '👥' },
  { to: '/app/treatments', label: 'Tratamientos', icon: '💆' },
  { to: '/app/supplies', label: 'Insumos', icon: '🧴' },
  { to: '/app/alerts', label: 'Alertas', icon: '🔔' },
  { to: '/app/reports', label: 'Reportes', icon: '📊' },
  { to: '/app/ai-scoring', label: 'AI Patient Scoring', icon: '✨' },
  { to: '/app/employees', label: 'Empleados y roles', icon: '🧑‍💼' },
  { to: '/app/settings', label: 'Configuración', icon: '⚙️' },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">A</span>
        <span className="sidebar-brand-name">Aura</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                <span className="sidebar-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-quick-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/app/schedule?new=1')}>
          + Agendar turno
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/app/patients?new=1')}>
          + Nuevo cliente
        </button>
      </div>
    </aside>
  )
}
