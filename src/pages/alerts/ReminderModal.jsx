import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as remindersService from '../../bll/remindersService'

export default function ReminderModal({ alert, patient, appointment, treatmentName, centerName, userId, onSent, onClose }) {
  const [channel, setChannel] = useState(patient.phone ? 'WhatsApp' : 'Email')
  const [subject, setSubject] = useState(`Recordatorio de turno — ${centerName}`)
  const [message, setMessage] = useState(() =>
    remindersService.buildDefaultMessage({ patient, appointment, treatmentName, centerName }),
  )
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const missingContact = channel === 'WhatsApp' ? !patient.phone : !patient.email

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    // window.open tiene que ir antes de cualquier await: si no, el navegador
    // lo toma como popup no solicitado y lo bloquea.
    window.open(remindersService.buildChannelLink({ channel, patient, subject, message }), '_blank', 'noopener')
    setSending(true)
    try {
      await remindersService.send({ alert, patient, appointment, channel, subject, message, userId })
      onSent()
    } catch {
      setError('Se abrió el mensaje, pero no se pudo registrar el envío.')
      setSending(false)
    }
  }

  return (
    <Modal title={`Recordatorio para ${patient.firstName} ${patient.lastName}`} onClose={onClose} large>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reminderChannel">Canal</label>
            <select id="reminderChannel" value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Email">Email</option>
            </select>
          </div>
          <div className="form-group">
            <label>Destinatario</label>
            <input value={(channel === 'WhatsApp' ? patient.phone : patient.email) || 'Sin dato cargado'} disabled />
          </div>
        </div>
        {channel === 'Email' && (
          <div className="form-group">
            <label htmlFor="reminderSubject">Asunto</label>
            <input id="reminderSubject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="reminderMessage">Mensaje</label>
          <textarea id="reminderMessage" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} />
          <span className="field-hint">
            Se abre {channel === 'WhatsApp' ? 'WhatsApp' : 'tu correo'} con el mensaje ya escrito, y AURA guarda el registro del envío.
          </span>
        </div>

        {missingContact && (
          <p className="field-error">
            El cliente no tiene {channel === 'WhatsApp' ? 'teléfono' : 'email'} cargado. Elegí otro canal o completá su ficha.
          </p>
        )}
        {error && <p className="field-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={missingContact || sending}>
            Abrir {channel} y registrar
          </button>
        </div>
      </form>
    </Modal>
  )
}
