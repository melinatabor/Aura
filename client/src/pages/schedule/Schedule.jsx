import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Badge from '../../components/Badge/Badge.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import AppointmentFormModal from './AppointmentFormModal.jsx'
import * as appointmentsService from '../../services/appointmentsService'
import * as patientsService from '../../services/patientsService'
import * as professionalsService from '../../services/professionalsService'
import * as treatmentsService from '../../services/treatmentsService'
import './Schedule.scss'

const DAY_LABELS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function startOfWeek(weekOffset) {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + weekOffset * 7)
  return monday
}

function toISO(date) {
  return date.toISOString().slice(0, 10)
}

export default function Schedule() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [weekOffset, setWeekOffset] = useState(0)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [treatments, setTreatments] = useState([])
  const [professionalFilter, setProfessionalFilter] = useState('Todos')
  const [modal, setModal] = useState(searchParams.get('new') === '1' ? { mode: 'create' } : null)
  const [toCancel, setToCancel] = useState(null)

  const days = useMemo(() => {
    const monday = startOfWeek(weekOffset)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }, [weekOffset])

  async function reload() {
    const from = toISO(days[0])
    const to = toISO(days[6])
    const [a, p, pr, t] = await Promise.all([
      appointmentsService.getByDateRange(from, to),
      patientsService.getAll(),
      professionalsService.getAll(),
      treatmentsService.getAll(),
    ])
    setAppointments(a)
    setPatients(p)
    setProfessionals(pr)
    setTreatments(t)
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffset])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function patientName(id) {
    const p = patients.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  function treatmentName(id) {
    return treatments.find((t) => t.id === id)?.name ?? '—'
  }

  const filteredAppointments = appointments.filter(
    (a) => professionalFilter === 'Todos' || a.professionalId === Number(professionalFilter),
  )

  async function handleSave(data) {
    if (modal.mode === 'create') {
      await appointmentsService.create(data)
    } else {
      await appointmentsService.update(modal.appointment.id, data)
    }
    setModal(null)
    reload()
  }

  async function handleCancel() {
    await appointmentsService.setStatus(toCancel.id, 'Cancelado')
    setToCancel(null)
    reload()
  }

  return (
    <div className="schedule-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Agenda</h1>
          <p>Consultá y gestioná los turnos agendados, organizados por semana.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          + Nuevo turno
        </button>
      </div>

      <div className="list-toolbar">
        <div className="schedule-week-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((o) => o - 1)}>
            ← Semana anterior
          </button>
          <strong>
            {days[0].toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} —{' '}
            {days[6].toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
          </strong>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWeekOffset((o) => o + 1)}>
            Semana siguiente →
          </button>
        </div>
        <select value={professionalFilter} onChange={(e) => setProfessionalFilter(e.target.value)}>
          <option value="Todos">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="schedule-grid">
        {days.map((day) => {
          const iso = toISO(day)
          const dayAppointments = filteredAppointments.filter((a) => a.date === iso).sort((a, b) => a.startTime.localeCompare(b.startTime))
          const isToday = iso === toISO(new Date())
          return (
            <div key={iso} className={`schedule-day ${isToday ? 'schedule-day-today' : ''}`}>
              <div className="schedule-day-header">
                <span>{DAY_LABELS[day.getDay()]}</span>
                <strong>{day.getDate()}</strong>
              </div>
              <div className="schedule-day-body">
                {dayAppointments.length === 0 && <p className="schedule-empty">Sin turnos</p>}
                {dayAppointments.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`schedule-appointment-card status-${a.status.toLowerCase()}`}
                    onClick={() => setModal({ mode: 'edit', appointment: a })}
                  >
                    <span className="schedule-appointment-time">
                      {a.startTime} - {a.endTime}
                    </span>
                    <strong>{patientName(a.patientId)}</strong>
                    <span className="schedule-appointment-treatment">{treatmentName(a.treatmentId)}</span>
                    <div className="schedule-appointment-footer">
                      <Badge>{a.status}</Badge>
                      {a.status !== 'Cancelado' && (
                        <span
                          className="schedule-appointment-cancel"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            setToCancel(a)
                          }}
                        >
                          Cancelar
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <AppointmentFormModal
          appointment={modal.mode === 'edit' ? modal.appointment : null}
          suggestedDate={toISO(days[0])}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {toCancel && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas eliminar este turno?"
          message="Se cancelará el turno seleccionado y dejará de ocupar la agenda de ese horario."
          confirmLabel="Eliminar turno"
          onConfirm={handleCancel}
          onCancel={() => setToCancel(null)}
        />
      )}
    </div>
  )
}
