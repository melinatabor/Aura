import { CalendarCheck, Check, Sparkles } from 'lucide-react'
import './AuthAside.scss'

const POINTS = ['Agenda semanal sin cruces de horario', 'Seguimiento de clientes con IA', 'Roles y permisos para todo el equipo']

// Panel de marca que acompaña a los formularios de acceso.
export default function AuthAside() {
  return (
    <aside className="auth-aside" aria-hidden="false">
      <div className="auth-aside-blob auth-aside-blob--a" />
      <div className="auth-aside-blob auth-aside-blob--b" />

      <div className="auth-aside-body">
        <span className="auth-aside-kicker">
          <span className="auth-aside-dot" /> Gestión inteligente para bienestar y estética
        </span>
        <h2>
          Todo tu centro, <em>en un solo lugar</em>
        </h2>
        <ul>
          {POINTS.map((point, i) => (
            <li key={point} style={{ animationDelay: `${0.25 + i * 0.12}s` }}>
              <span>
                <Check size={13} strokeWidth={3} />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <div className="auth-aside-float auth-aside-float--turn">
        <span className="auth-aside-float-icon">
          <CalendarCheck size={16} />
        </span>
        <div>
          <strong>Turno confirmado</strong>
          <small>Limpieza facial · 11:00</small>
        </div>
      </div>
      <div className="auth-aside-float auth-aside-float--score">
        <div className="auth-aside-float-head">
          <Sparkles size={14} /> Prioridad de seguimiento
        </div>
        <div className="auth-aside-score">
          98<small>/100</small>
        </div>
        <div className="auth-aside-bars">
          <i style={{ '--w': '100%' }} />
          <i style={{ '--w': '86%' }} />
          <i style={{ '--w': '70%' }} />
        </div>
      </div>
    </aside>
  )
}
