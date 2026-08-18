import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react'
import './Contact.scss'

const ACTIVITY_TYPES = ['Profesional independiente', 'Centro estético', 'Equipo de trabajo']
const REASONS = ['Información de la solución', 'Soporte técnico', 'Consulta comercial', 'Otro']

export default function Contact() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    activityType: ACTIVITY_TYPES[0],
    reason: REASONS[0],
    message: '',
  })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/contact/confirmation')
  }

  return (
    <div className="contact-page">
      <header className="contact-hero">
        <h1>Contactanos</h1>
        <p>
          Dejanos tus datos y contanos qué necesitás para organizar en tu centro o actividad profesional. El equipo
          de Aura podrá responder tu consulta y coordinar entre nosotros.
        </p>
      </header>

      <div className="contact-grid">
        <form className="aura-card contact-form" onSubmit={handleSubmit}>
          <h2>Envianos tu consulta</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre y apellido</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
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
              <label htmlFor="phone">Teléfono</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+54 9 11 0000-0000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="activityType">Tipo de actividad</label>
              <select id="activityType" value={form.activityType} onChange={(e) => handleChange('activityType', e.target.value)}>
                {ACTIVITY_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reason">Motivo de consulta</label>
            <select id="reason" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)}>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="message">Mensaje</label>
            <textarea
              id="message"
              rows={4}
              required
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
              placeholder="¿En qué podemos ayudarte?"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Enviar consulta
          </button>
        </form>

        <aside className="aura-card contact-info">
          <h2>También podés contactarnos por</h2>
          <ul>
            <li>
              <span className="contact-info-icon">
                <Mail size={18} strokeWidth={1.75} />
              </span>
              <div>
                <strong>Email</strong>
                <p>hola@aurasoft.com</p>
              </div>
            </li>
            <li>
              <span className="contact-info-icon">
                <MessageCircle size={18} strokeWidth={1.75} />
              </span>
              <div>
                <strong>WhatsApp</strong>
                <p>+54 9 11 9876-4437</p>
              </div>
            </li>
            <li>
              <span className="contact-info-icon">
                <Clock size={18} strokeWidth={1.75} />
              </span>
              <div>
                <strong>Horario de atención</strong>
                <p>Lunes a viernes 9:00 - 18:00 hs</p>
              </div>
            </li>
            <li>
              <span className="contact-info-icon">
                <MapPin size={18} strokeWidth={1.75} />
              </span>
              <div>
                <strong>Ubicación</strong>
                <p>Buenos Aires, Argentina</p>
              </div>
            </li>
          </ul>
        </aside>
      </div>

      <p className="contact-disclaimer">
        Al enviar el formulario se compartirán tus datos para el uso interno de nuestro centro de atención estética. El
        equipo de Aura se pondrá en contacto para brindarte información sobre el estado de tu consulta.
      </p>
    </div>
  )
}
