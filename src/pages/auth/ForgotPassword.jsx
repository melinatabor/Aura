import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../dal/supabaseClient'
import { useAuth } from '../../context/AuthContext.jsx'
import './Auth.scss'

const STEPS = ['Correo', 'Código', 'Contraseña']
const PASSWORD_RULE = /^(?=.*[A-Z])(?=.*\d).{8,64}$/

export default function ForgotPassword() {
  const { requestPasswordReset, verifyRecoveryCode, updatePassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  // Si el mail trajo un enlace en vez de un código, Supabase abre una sesión
  // de recuperación: vamos directo al paso de la contraseña nueva.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStep(2)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function run(action) {
    setError('')
    setInfo('')
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function handleSendCode(e) {
    e.preventDefault()
    run(async () => {
      try {
        await requestPasswordReset(email)
      } catch {
        throw new Error('No pudimos enviar el código. Revisá el correo ingresado e intentá de nuevo en unos minutos.')
      }
      setStep(1)
    })
  }

  function handleResend() {
    run(async () => {
      await requestPasswordReset(email)
      setInfo('Te enviamos un código nuevo. El anterior dejó de ser válido.')
    })
  }

  function handleVerify(e) {
    e.preventDefault()
    run(async () => {
      try {
        await verifyRecoveryCode(email, code.trim())
      } catch {
        throw new Error('El código es incorrecto o ya no está vigente.')
      }
      setStep(2)
    })
  }

  function handleUpdate(e) {
    e.preventDefault()
    if (!PASSWORD_RULE.test(password)) {
      setError('La contraseña debe tener entre 8 y 64 caracteres, con al menos una mayúscula y un número.')
      return
    }
    if (password !== confirmation) {
      setError('La confirmación no coincide con la contraseña.')
      return
    }
    run(async () => {
      await updatePassword(password)
      setDone(true)
    })
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="aura-card auth-card" style={{ textAlign: 'center' }}>
          <div className="modal-confirm-icon icon-success">✓</div>
          <h1>Contraseña actualizada</h1>
          <p className="auth-subtitle">Ya podés iniciar sesión con tu nueva contraseña.</p>
          <button type="button" className="btn btn-primary auth-submit" onClick={() => navigate('/login')}>
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="aura-card auth-card">
        <h1>Recuperar contraseña</h1>
        <p className="auth-subtitle">
          Paso {step + 1} de 3 · {STEPS[step]}
        </p>

        {step === 0 && (
          <form onSubmit={handleSendCode}>
            <div className="form-group">
              <label htmlFor="recoveryEmail">Correo electrónico de tu cuenta</label>
              <input
                id="recoveryEmail"
                type="email"
                required
                maxLength={150}
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
              {busy ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleVerify}>
            <p className="field-hint" style={{ marginBottom: 16 }}>
              Te enviamos un código de verificación a <strong>{email}</strong>. Si en cambio te llegó un enlace, abrilo
              desde ese mismo navegador.
            </p>
            <div className="form-group">
              <label htmlFor="recoveryCode">Código de verificación</label>
              <input
                id="recoveryCode"
                required
                inputMode="numeric"
                maxLength={8}
                placeholder="123456"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            {info && <p className="field-hint">{info}</p>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={busy || code.length < 6}>
              {busy ? 'Verificando...' : 'Verificar código'}
            </button>
            <div className="auth-links">
              <button type="button" className="auth-link-button" onClick={handleResend} disabled={busy}>
                Reenviar código
              </button>
              <button type="button" className="auth-link-button" onClick={() => setStep(0)}>
                Cambiar correo
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={8}
                maxLength={64}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="field-hint">De 8 a 64 caracteres, con una mayúscula y un número.</span>
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                required
                maxLength={64}
                placeholder="••••••••"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </div>
            {error && <p className="field-error">{error}</p>}
            <button type="submit" className="btn btn-primary auth-submit" disabled={busy}>
              {busy ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Volver a iniciar sesión</Link>
        </p>
      </div>
    </div>
  )
}
