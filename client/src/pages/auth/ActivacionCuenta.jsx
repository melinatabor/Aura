import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.scss'

export default function ActivacionCuenta() {
  const navigate = useNavigate()
  const [enviado, setEnviado] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setEnviado(true)
  }

  if (enviado) {
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
        <Link to="/" className="auth-brand">
          Aura
        </Link>
        <h1>Crear cuenta profesional</h1>
        <p className="auth-subtitle">Activá tu espacio de trabajo en Aura</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombreCentro">Nombre del centro o profesional</label>
            <input id="nombreCentro" required placeholder="Ej. Centro Estético Bienestar" />
          </div>
          <div className="form-group">
            <label htmlFor="emailActivacion">Correo electrónico</label>
            <input id="emailActivacion" type="email" required placeholder="nombre@ejemplo.com" />
          </div>
          <div className="form-group">
            <label htmlFor="passwordActivacion">Contraseña</label>
            <input id="passwordActivacion" type="password" required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary auth-submit">
            Crear cuenta
          </button>
        </form>

        <p className="auth-footer">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  )
}
