import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as invitationsService from '../../bll/invitationsService'
import AuthAside from '../../components/AuthAside/AuthAside.jsx'
import PasswordInput from '../../components/PasswordInput/PasswordInput.jsx'
import './Auth.scss'

export default function ActivateAccount() {
  const { signup } = useAuth()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [invitation, setInvitation] = useState(null)
  const [invitationError, setInvitationError] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  useEffect(() => {
    if (!token) return
    invitationsService
      .getByToken(token)
      .then((found) => {
        if (!found) {
          setInvitationError('El enlace de invitación ya se usó, venció o fue cancelado. Pedile uno nuevo al administrador.')
          return
        }
        setInvitation(found)
        setForm((prev) => ({ ...prev, email: found.email }))
      })
      .catch(() => setInvitationError('No pudimos validar el enlace de invitación.'))
  }, [token])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup({ ...form, invitationToken: invitation ? token : null })
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
      <AuthAside />
        <div className="aura-card auth-card" style={{ textAlign: 'center' }}>
          <div className="modal-confirm-icon icon-success">✓</div>
          <h1>{invitation ? '¡Cuenta creada!' : 'Cuenta registrada'}</h1>
          <p className="auth-subtitle">
            {invitation
              ? `Ya podés iniciar sesión con tu usuario o tu email. Vas a entrar con el rol ${invitation.roleName}.`
              : 'Tu cuenta quedó pendiente de aprobación. Cuando un administrador la active, vas a poder iniciar sesión.'}
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
      <AuthAside />
      <div className="aura-card auth-card">
        <h1>Crear cuenta</h1>
        <p className="auth-subtitle">
          {invitation ? `Te invitaron a sumarte a Aura con el rol ${invitation.roleName}.` : 'Activá tu espacio de trabajo en Aura'}
        </p>

        {invitationError && <p className="field-error">{invitationError}</p>}
        {!token && (
          <p className="field-hint" style={{ marginBottom: 16 }}>
            Sin un enlace de invitación, la cuenta queda pendiente hasta que un administrador la apruebe.
          </p>
        )}

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
              disabled={Boolean(invitation)}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            {invitation && <span className="field-hint">Es el email al que se envió la invitación.</span>}
          </div>
          <div className="form-group">
            <label htmlFor="activationPassword">Contraseña</label>
            <PasswordInput
              id="activationPassword"
              required
              minLength={6}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </div>
          <label className="auth-terms">
            <input type="checkbox" required checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <span>
              Acepto los <Link to="/terms" target="_blank">términos y condiciones</Link> y la{' '}
              <Link to="/privacy" target="_blank">política de privacidad</Link>.
            </span>
          </label>
          {error && <p className="field-error">{error}</p>}
          <button type="submit" className="btn btn-primary auth-submit" disabled={submitting || !accepted}>
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
