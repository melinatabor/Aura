import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Contacto.scss'

const ACTIVIDADES = ['Profesional independiente', 'Centro estético', 'Equipo de trabajo']
const MOTIVOS = ['Información de la solución', 'Soporte técnico', 'Consulta comercial', 'Otro']

export default function Contacto() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    actividad: ACTIVIDADES[0],
    motivo: MOTIVOS[0],
    mensaje: '',
  })

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/contacto/confirmacion')
  }

  return (
    <div className="contacto-page">
      <header className="contacto-hero">
        <h1>Contactanos</h1>
        <p>
          Dejanos tus datos y contanos qué necesitás para organizar en tu centro o actividad profesional. El equipo
          de Aura podrá responder tu consulta y coordinar entre nosotros.
        </p>
      </header>

      <div className="contacto-grid">
        <form className="aura-card contacto-form" onSubmit={handleSubmit}>
          <h2>Envianos tu consulta</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombre">Nombre y apellido</label>
              <input
                id="nombre"
                required
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Ej. María García"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="nombre@ejemplo.com"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="+54 9 11 0000-0000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="actividad">Tipo de actividad</label>
              <select id="actividad" value={form.actividad} onChange={(e) => handleChange('actividad', e.target.value)}>
                {ACTIVIDADES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="motivo">Motivo de consulta</label>
            <select id="motivo" value={form.motivo} onChange={(e) => handleChange('motivo', e.target.value)}>
              {MOTIVOS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="mensaje">Mensaje</label>
            <textarea
              id="mensaje"
              rows={4}
              required
              value={form.mensaje}
              onChange={(e) => handleChange('mensaje', e.target.value)}
              placeholder="¿En qué podemos ayudarte?"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Enviar consulta
          </button>
        </form>

        <aside className="aura-card contacto-info">
          <h2>También podés contactarnos por</h2>
          <ul>
            <li>
              <span className="contacto-info-icon">✉</span>
              <div>
                <strong>Email</strong>
                <p>hola@aurasoft.com</p>
              </div>
            </li>
            <li>
              <span className="contacto-info-icon">💬</span>
              <div>
                <strong>WhatsApp</strong>
                <p>+54 9 11 9876-4437</p>
              </div>
            </li>
            <li>
              <span className="contacto-info-icon">🕒</span>
              <div>
                <strong>Horario de atención</strong>
                <p>Lunes a viernes 9:00 - 18:00 hs</p>
              </div>
            </li>
            <li>
              <span className="contacto-info-icon">📍</span>
              <div>
                <strong>Ubicación</strong>
                <p>Buenos Aires, Argentina</p>
              </div>
            </li>
          </ul>
        </aside>
      </div>

      <p className="contacto-disclaimer">
        Al enviar el formulario se compartirán tus datos para el uso interno de nuestro centro de atención estética. El
        equipo de Aura se pondrá en contacto para brindarte información sobre el estado de tu consulta.
      </p>
    </div>
  )
}
