import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import Logo from '../components/Logo/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './OnboardingLayout.scss'

const STEPS = ['Crear cuenta', 'Configuración inicial', 'Listo para empezar']

// Marco de la puesta en marcha: sin menú lateral, porque el espacio de trabajo
// todavía no está configurado. Muestra en qué paso va el administrador.
export default function OnboardingLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const current = pathname.startsWith('/app/welcome') ? 2 : 1

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="onboarding">
      <div className="onboarding-blob onboarding-blob--a" />
      <div className="onboarding-blob onboarding-blob--b" />

      <header className="onboarding-header">
        <Logo />
        <div className="onboarding-user">
          <span>Hola, {user?.name}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="onboarding-main">
        <ol className="onboarding-steps" aria-label="Progreso">
          {STEPS.map((label, i) => (
            <li key={label} className={i < current ? 'is-done' : i === current ? 'is-current' : ''}>
              <span className="onboarding-step-dot">{i < current ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
              <span className="onboarding-step-label">{label}</span>
            </li>
          ))}
        </ol>
        <div className="onboarding-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
