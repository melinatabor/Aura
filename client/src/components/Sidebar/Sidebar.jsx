import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Flower2,
  Package,
  Bell,
  BarChart3,
  Sparkles,
  UserCog,
  Settings,
  Plus,
} from 'lucide-react'
import Logo from '../Logo/Logo.jsx'
import './Sidebar.scss'

const ITEMS = [
  { to: '/app/dashboard', label: 'Panel principal', icon: LayoutDashboard },
  { to: '/app/schedule', label: 'Agenda', icon: Calendar },
  { to: '/app/patients', label: 'Clientes', icon: Users },
  { to: '/app/treatments', label: 'Tratamientos', icon: Flower2 },
  { to: '/app/supplies', label: 'Insumos', icon: Package },
  { to: '/app/alerts', label: 'Alertas', icon: Bell },
  { to: '/app/reports', label: 'Reportes', icon: BarChart3 },
  { to: '/app/ai-scoring', label: 'AI Patient Scoring', icon: Sparkles },
  { to: '/app/employees', label: 'Empleados y roles', icon: UserCog },
  { to: '/app/settings', label: 'Configuración', icon: Settings },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo tone="dark" size={30} />
      </div>
      <nav className="sidebar-nav">
        <ul>
          {ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                <item.icon className="sidebar-icon" size={18} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-quick-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/app/schedule?new=1')}>
          <Plus size={16} strokeWidth={2} />
          Agendar turno
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/app/patients?new=1')}>
          <Plus size={16} strokeWidth={2} />
          Nuevo cliente
        </button>
      </div>
    </aside>
  )
}
