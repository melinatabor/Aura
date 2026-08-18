import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Auth.scss'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('maria@centroaura.com')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // Login simulado: no valida contra ningún backend todavía.
    login({ nombre: 'María', email })
    const destino = location.state?.from?.pathname ?? '/app/dashboard'
    navigate(destino, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="aura-card auth-card">
        <Link to="/" className="auth-brand">
          Aura
        </Link>
        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">Gestión inteligente para bienestar y estética</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit">
            Iniciar sesión
          </button>
        </form>

        <p className="auth-footer">
          ¿No tenés cuenta? <Link to="/activacion-cuenta">Creá una cuenta profesional</Link>
        </p>
      </div>
    </div>
  )
}
