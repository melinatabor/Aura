import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import AppointmentFormModal from './AppointmentFormModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import * as appointmentsService from '../../bll/appointmentsService'
import * as patientsService from '../../bll/patientsService'
import * as professionalsService from '../../bll/professionalsService'
import * as treatmentsService from '../../bll/treatmentsService'
import * as workspaceService from '../../bll/workspaceService'
import './Schedule.scss'

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const HOUR_PX = 64
const STATUSES = ['Confirmado', 'Pendiente', 'Realizado', 'Cancelado']

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

// Reparte en carriles los turnos que se superponen (de distintos profesionales)
// para que se vean lado a lado en vez de tapados.
function layoutLanes(list) {
  const sorted = [...list].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  const placed = []
  let cluster = []
  let clusterEnd = -1
  function flush() {
    const lanes = Math.max(1, ...cluster.map((c) => c.lane + 1))
    cluster.forEach((c) => placed.push({ ...c, lanes }))
    cluster = []
  }
  sorted.forEach((a) => {
    const start = toMinutes(a.startTime)
    const end = toMinutes(a.endTime)
    if (cluster.length && start >= clusterEnd) {
      flush()
      clusterEnd = -1
    }
    const used = cluster.filter((c) => toMinutes(c.item.endTime) > start).map((c) => c.lane)
    let lane = 0
    while (used.includes(lane)) lane += 1
    cluster.push({ item: a, lane })
    clusterEnd = Math.max(clusterEnd, end)
  })
  if (cluster.length) flush()
  return placed
}

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
  const { user, can } = useAuth()
  const canManage = can('schedule.manage')
  const [searchParams, setSearchParams] = useSearchParams()
  const [weekOffset, setWeekOffset] = useState(0)
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [treatments, setTreatments] = useState([])
  const [ranges, setRanges] = useState([])
  const [now, setNow] = useState(() => new Date())
  const [professionalFilter, setProfessionalFilter] = useState(user.professionalId ? String(user.professionalId) : 'Todos')
  const [modal, setModal] = useState(searchParams.get('new') === '1' && canManage ? { mode: 'create' } : null)
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
    const [a, p, pr, t, rg] = await Promise.all([
      appointmentsService.getByDateRange(from, to),
      patientsService.getAll(),
      professionalsService.getAll(),
      treatmentsService.getAll(),
      workspaceService.getScheduleRanges(),
    ])
    setRanges(rg)
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

  function professionalName(id) {
    const p = professionals.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const activeRanges = ranges.filter((r) => r.isActive)
  const startHour = activeRanges.length ? Math.floor(Math.min(...activeRanges.map((r) => toMinutes(r.openingTime))) / 60) : 8
  const endHour = activeRanges.length ? Math.ceil(Math.max(...activeRanges.map((r) => toMinutes(r.closingTime))) / 60) : 20
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const gridHeight = hours.length * HOUR_PX

  const weekActive = filteredAppointments.filter((a) => a.status !== 'Cancelado')
  const counts = Object.fromEntries(STATUSES.map((st) => [st, filteredAppointments.filter((a) => a.status === st).length]))
  const todayIso = toISO(new Date())
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const nowTop = ((nowMinutes - startHour * 60) / 60) * HOUR_PX
  const monthLabel = days[0].toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="schedule-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Agenda</h1>
          <p>Consultá y gestioná los turnos de la semana, ordenados por horario.</p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
            + Nuevo turno
          </button>
        )}
      </div>

      <div className="schedule-summary">
        <div className="schedule-chip">
          <strong>{weekActive.length}</strong>
          <span>turnos en la semana</span>
        </div>
        {STATUSES.map((st) => (
          <div key={st} className={`schedule-chip schedule-chip--${st.toLowerCase()}`}>
            <span className="schedule-dot" />
            <strong>{counts[st]}</strong>
            <span>{st === 'Realizado' ? 'realizados' : st === 'Confirmado' ? 'confirmados' : st === 'Pendiente' ? 'pendientes' : 'cancelados'}</span>
          </div>
        ))}
      </div>

      <div className="schedule-toolbar">
        <div className="schedule-week-nav">
          <button type="button" className="schedule-icon-btn" aria-label="Semana anterior" onClick={() => setWeekOffset((o) => o - 1)}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" className="schedule-icon-btn" aria-label="Semana siguiente" onClick={() => setWeekOffset((o) => o + 1)}>
            <ChevronRight size={18} />
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>
            Hoy
          </button>
          <div className="schedule-range">
            <strong>
              {days[0].getDate()} — {days[6].getDate()} de {monthLabel}
            </strong>
          </div>
        </div>
        <select value={professionalFilter} onChange={(e) => setProfessionalFilter(e.target.value)}>
          <option value="Todos">Todos los profesionales</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id === user.professionalId ? 'Mis turnos' : `${p.firstName} ${p.lastName}`}
            </option>
          ))}
        </select>
      </div>

      <div className="schedule-calendar">
        <div className="schedule-calendar-scroll">
          <div className="schedule-head">
            <div className="schedule-head-corner" />
            {days.map((day) => {
              const iso = toISO(day)
              const closed = ranges.length > 0 && !ranges.find((r) => r.dayOfWeek === day.getDay())?.isActive
              return (
                <div key={iso} className={`schedule-head-day ${iso === todayIso ? 'is-today' : ''} ${closed ? 'is-closed' : ''}`}>
                  <span>{DAY_LABELS[day.getDay()]}</span>
                  <strong>{day.getDate()}</strong>
                </div>
              )
            })}
          </div>

          <div className="schedule-body" style={{ height: gridHeight }}>
            <div className="schedule-hours">
              {hours.map((h) => (
                <div key={h} className="schedule-hour" style={{ height: HOUR_PX }}>
                  <span>{String(h).padStart(2, '0')}:00</span>
                </div>
              ))}
            </div>

            {days.map((day) => {
              const iso = toISO(day)
              const closed = ranges.length > 0 && !ranges.find((r) => r.dayOfWeek === day.getDay())?.isActive
              const dayItems = layoutLanes(filteredAppointments.filter((a) => a.date === iso))
              return (
                <div key={iso} className={`schedule-col ${iso === todayIso ? 'is-today' : ''} ${closed ? 'is-closed' : ''}`}>
                  {hours.map((h) => (
                    <div key={h} className="schedule-slot" style={{ height: HOUR_PX }} />
                  ))}

                  {iso === todayIso && nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60 && (
                    <div className="schedule-now" style={{ top: nowTop }} />
                  )}

                  {dayItems.map(({ item: a, lane, lanes }) => {
                    const top = ((toMinutes(a.startTime) - startHour * 60) / 60) * HOUR_PX
                    const height = Math.max(((toMinutes(a.endTime) - toMinutes(a.startTime)) / 60) * HOUR_PX - 3, 26)
                    return (
                      <div
                        key={a.id}
                        className={`schedule-event status-${a.status.toLowerCase()}`}
                        style={{ top, height, left: `${(lane / lanes) * 100}%`, width: `calc(${100 / lanes}% - 4px)` }}
                      >
                        <button
                          type="button"
                          className="schedule-event-main"
                          disabled={!canManage}
                          title={`${patientName(a.patientId)} · ${treatmentName(a.treatmentId)} · ${professionalName(a.professionalId)} · ${a.status}`}
                          onClick={() => setModal({ mode: 'edit', appointment: a })}
                        >
                          <span className="schedule-event-time">
                            {a.startTime} – {a.endTime}
                          </span>
                          <strong>{patientName(a.patientId)}</strong>
                          {height >= 52 && <span className="schedule-event-sub">{treatmentName(a.treatmentId)}</span>}
                          {height >= 74 && <span className="schedule-event-sub">{professionalName(a.professionalId)}</span>}
                        </button>
                        {canManage && a.status !== 'Cancelado' && (
                          <button
                            type="button"
                            className="schedule-event-cancel"
                            aria-label="Cancelar turno"
                            title="Cancelar turno"
                            onClick={() => setToCancel(a)}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
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
          title="¿Estás seguro de que deseas cancelar este turno?"
          message="El turno quedará como cancelado y dejará de ocupar la agenda de ese horario."
          confirmLabel="Cancelar turno"
          onConfirm={handleCancel}
          onCancel={() => setToCancel(null)}
        />
      )}
    </div>
  )
}
