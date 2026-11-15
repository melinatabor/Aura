import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Flower2,
  Package,
  Bell,
  BarChart3,
  BrainCircuit,
  UserCog,
  Settings,
  Plus,
} from 'lucide-react'
import Logo from '../Logo/Logo.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import './Sidebar.scss'

const ITEMS = [
  { to: '/app/dashboard', label: 'Panel principal', icon: LayoutDashboard, permission: 'dashboard.view' },
  { to: '/app/schedule', label: 'Agenda', icon: Calendar, permission: 'schedule.view' },
  { to: '/app/patients', label: 'Clientes', icon: Users, permission: 'patients.view' },
  { to: '/app/treatments', label: 'Tratamientos', icon: Flower2, permission: 'treatments.view' },
  { to: '/app/supplies', label: 'Insumos', icon: Package, permission: 'supplies.view' },
  { to: '/app/alerts', label: 'Alertas', icon: Bell, permission: 'alerts.view' },
  { to: '/app/reports', label: 'Reportes', icon: BarChart3, permission: 'reports.view' },
  { to: '/app/ai-scoring', label: 'AI Patient Scoring', icon: BrainCircuit, permission: 'scoring.view' },
  { to: '/app/employees', label: 'Empleados y roles', icon: UserCog, permission: 'employees.manage' },
  { to: '/app/settings', label: 'Configuración', icon: Settings, permission: 'settings.manage' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { can } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo tone="dark" size={30} />
      </div>
      <nav className="sidebar-nav">
        <ul>
          {ITEMS.filter((item) => can(item.permission)).map((item) => (
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
        {can('schedule.manage') && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/app/schedule?new=1')}>
            <Plus size={16} strokeWidth={2} />
            Agendar turno
          </button>
        )}
        {can('patients.manage') && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/app/patients?new=1')}>
            <Plus size={16} strokeWidth={2} />
            Nuevo cliente
          </button>
        )}
      </div>
    </aside>
  )
}
