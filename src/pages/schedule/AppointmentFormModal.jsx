import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as patientsService from '../../bll/patientsService'
import * as professionalsService from '../../bll/professionalsService'
import * as treatmentsService from '../../bll/treatmentsService'
import * as appointmentsService from '../../bll/appointmentsService'
import * as workspaceService from '../../bll/workspaceService'

const STATUSES = ['Pendiente', 'Confirmado', 'Realizado', 'Cancelado']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addMinutes(time, minutes) {
  const [h, m] = time.split(':').map(Number)
  const total = Math.min(h * 60 + m + minutes, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export default function AppointmentFormModal({ appointment, suggestedDate, onSave, onClose }) {
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [treatments, setTreatments] = useState([])
  const [assignments, setAssignments] = useState({})
  const [ranges, setRanges] = useState([])
  const [allowOverlap, setAllowOverlap] = useState(false)
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
    Promise.all([
      patientsService.getAll(),
      professionalsService.getActive(),
      treatmentsService.getActive(),
      professionalsService.getTreatmentAssignments(),
      workspaceService.getScheduleRanges(),
      workspaceService.get(),
    ]).then(([pa, pr, tr, as, ra, ws]) => {
      setPatients(pa.filter((p) => p.status === 'Activo'))
      setProfessionals(pr)
      setTreatments(tr)
      setAssignments(as)
      setRanges(ra)
      setAllowOverlap(ws.allowAppointmentOverlap)
    })
  }, [])

  const treatmentId = Number(form.treatmentId)
  const treatmentUnchanged = appointment && treatmentId === appointment.treatmentId
  // Solo los profesionales que realizan el tratamiento elegido. Al editar un
  // turno viejo se mantiene su profesional aunque no esté asignado, para no
  // obligar a cambiarlo solo por actualizar el estado.
  const availableProfessionals = professionals.filter(
    (p) =>
      (assignments[p.id] ?? []).includes(treatmentId) ||
      (treatmentUnchanged && p.id === appointment.professionalId),
  )

  function durationOf(id) {
    return treatments.find((t) => t.id === Number(id))?.durationMinutes
  }

  function handleChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'treatmentId' || field === 'startTime') {
        const duration = durationOf(next.treatmentId)
        if (duration) next.endTime = addMinutes(next.startTime, duration)
      }
      if (field === 'treatmentId') {
        const stillValid = (assignments[next.professionalId] ?? []).includes(Number(value))
        if (!stillValid) next.professionalId = ''
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.endTime <= form.startTime) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    // Las reglas de horario aplican al agendar o reprogramar; si solo se
    // cambia el estado de un turno existente, no se vuelven a evaluar.
    const rescheduled =
      !appointment ||
      form.date !== appointment.date ||
      form.startTime !== appointment.startTime ||
      form.endTime !== appointment.endTime ||
      Number(form.professionalId) !== appointment.professionalId

    if (rescheduled && form.status !== 'Cancelado') {
      const hoursProblem = workspaceService.checkOpeningHours(ranges, form)
      if (hoursProblem) {
        setError(hoursProblem)
        return
      }

      if (!allowOverlap) {
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
      }
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
            <label htmlFor="treatmentId">Tratamiento</label>
            <select id="treatmentId" required value={form.treatmentId} onChange={(e) => handleChange('treatmentId', e.target.value)}>
              <option value="">Seleccionar...</option>
              {treatments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.durationMinutes} min)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="professionalId">Profesional</label>
            <select
              id="professionalId"
              required
              disabled={!form.treatmentId}
              value={form.professionalId}
              onChange={(e) => handleChange('professionalId', e.target.value)}
            >
              <option value="">{form.treatmentId ? 'Seleccionar...' : 'Elegí el tratamiento primero'}</option>
              {availableProfessionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
            {form.treatmentId && availableProfessionals.length === 0 && (
              <span className="field-error">Ningún profesional activo realiza este tratamiento.</span>
            )}
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
            <span className="field-hint">Se calcula con la duración del tratamiento.</span>
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
