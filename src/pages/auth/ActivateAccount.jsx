import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Auth.scss'

export default function ActivateAccount() {
  const { signup } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup(form)
      setSubmitted(true)
    } catch (err) {
      setError('No pudimos crear la cuenta. El usuario o el email ya existen, o la contraseña tiene menos de 6 caracteres.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="aura-card auth-card" style={{ textAlign: 'center' }}>
          <div className="modal-confirm-icon icon-success">✓</div>
          <h1>Activación de cuenta</h1>
          <p className="auth-subtitle">
            Te enviamos un correo con el enlace de activación. Confirmá tu cuenta para poder iniciar sesión.
          </p>
          <Link to="/login" className="btn btn-primary auth-submit">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="aura-card auth-card">
        <h1>Crear cuenta profesional</h1>
        <p className="auth-subtitle">Activá tu espacio de trabajo en Aura</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <input id="firstName" required value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <input id="lastName" required value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              id="username"
              required
              placeholder="ej. maria.lopez"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
            <span className="field-hint">Vas a poder usarlo para iniciar sesión en vez del email.</span>
          </div>
          <div className="form-group">
            <label htmlFor="activationEmail">Correo electrónico</label>
            <input
              id="activationEmail"
              type="email"
              required
              placeholder="nombre@ejemplo.com"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="activationPassword">Contraseña</label>
            <input
              id="activationPassword"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting}>
            {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
