import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as patientsService from '../../services/patientsService'
import * as professionalsService from '../../services/professionalsService'
import * as treatmentsService from '../../services/treatmentsService'
import * as appointmentsService from '../../services/appointmentsService'

const STATUSES = ['Pendiente', 'Confirmado', 'Realizado', 'Cancelado']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function AppointmentFormModal({ appointment, suggestedDate, onSave, onClose }) {
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [treatments, setTreatments] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(
    appointment ?? {
      patientId: '',
      professionalId: '',
      treatmentId: '',
      date: suggestedDate || todayISO(),
      startTime: '09:00',
      endTime: '10:00',
      status: 'Pendiente',
      notes: '',
    },
  )

  useEffect(() => {
    patientsService.getAll().then((list) => setPatients(list.filter((p) => p.status === 'Activo')))
    professionalsService.getActive().then(setProfessionals)
    treatmentsService.getActive().then(setTreatments)
  }, [])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.endTime <= form.startTime) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    const overlaps = await appointmentsService.hasOverlap({
      professionalId: form.professionalId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      excludeId: appointment?.id,
    })

    if (overlaps) {
      setError('El profesional ya tiene un turno asignado en ese horario.')
      return
    }

    onSave({
      ...form,
      patientId: Number(form.patientId),
      professionalId: Number(form.professionalId),
      treatmentId: Number(form.treatmentId),
    })
  }

  return (
    <Modal title={appointment ? 'Editar turno' : 'Nuevo turno'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="patientId">Paciente</label>
          <select id="patientId" required value={form.patientId} onChange={(e) => handleChange('patientId', e.target.value)}>
            <option value="">Seleccionar paciente...</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="professionalId">Profesional</label>
            <select id="professionalId" required value={form.professionalId} onChange={(e) => handleChange('professionalId', e.target.value)}>
              <option value="">Seleccionar...</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="treatmentId">Tratamiento</label>
            <select id="treatmentId" required value={form.treatmentId} onChange={(e) => handleChange('treatmentId', e.target.value)}>
              <option value="">Seleccionar...</option>
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input id="date" type="date" required value={form.date} onChange={(e) => handleChange('date', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="status">Estado</label>
            <select id="status" value={form.status} onChange={(e) => handleChange('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startTime">Hora inicio</label>
            <input id="startTime" type="time" required value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="endTime">Hora fin</label>
            <input id="endTime" type="time" required value={form.endTime} onChange={(e) => handleChange('endTime', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="notes">Observaciones</label>
          <textarea id="notes" rows={2} value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} />
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar turno
          </button>
        </div>
      </form>
    </Modal>
  )
}
