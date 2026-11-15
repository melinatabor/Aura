import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ReminderModal from './ReminderModal.jsx'
import AdministrativeAlertModal from './AdministrativeAlertModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import * as alertsService from '../../bll/alertsService'
import * as remindersService from '../../bll/remindersService'
import * as patientsService from '../../bll/patientsService'
import * as appointmentsService from '../../bll/appointmentsService'
import * as treatmentsService from '../../bll/treatmentsService'
import * as workspaceService from '../../bll/workspaceService'
import './Alerts.scss'

const TABS = [
  { key: 'open', label: 'Abiertas' },
  { key: 'resolved', label: 'Resueltas' },
  { key: 'reminders', label: 'Recordatorios enviados' },
]
const TYPES = ['Todos', 'Stock bajo', 'Turno próximo', 'Administrativa']
const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export default function Alerts() {
  const { user, can } = useAuth()
  const canManage = can('alerts.manage')
  const [tab, setTab] = useState('open')
  const [openAlerts, setOpenAlerts] = useState([])
  const [resolvedAlerts, setResolvedAlerts] = useState([])
  const [reminders, setReminders] = useState([])
  const [patients, setPatients] = useState([])
  const [treatments, setTreatments] = useState([])
  const [centerName, setCenterName] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [reminderFor, setReminderFor] = useState(null)
  const [creating, setCreating] = useState(false)

  async function reload() {
    const [open, resolved, sent, p, t, workspace] = await Promise.all([
      alertsService.getOpenAlerts(),
      alertsService.getResolvedAlerts(),
      remindersService.getAll(),
      patientsService.getAll(),
      treatmentsService.getAll(),
      workspaceService.get(),
    ])
    setOpenAlerts(open)
    setResolvedAlerts(resolved)
    setReminders(sent)
    setPatients(p)
    setTreatments(t)
    setCenterName(workspace.name)
  }

  useEffect(() => {
    reload()
  }, [])

  const visibleAlerts = useMemo(() => {
    const source = tab === 'open' ? openAlerts : resolvedAlerts
    return source.filter((a) => typeFilter === 'Todos' || a.type === typeFilter)
  }, [tab, openAlerts, resolvedAlerts, typeFilter])

  function patientName(id) {
    const p = patients.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  async function openReminder(alert) {
    const appointment = await appointmentsService.getById(alert.appointmentId)
    setReminderFor({
      alert,
      appointment,
      patient: patients.find((p) => p.id === alert.patientId),
      treatmentName: treatments.find((t) => t.id === appointment.treatmentId)?.name ?? 'tu tratamiento',
    })
  }

  async function handleAttend(alert) {
    await alertsService.markAttended(alert.id, user.id)
    reload()
  }

  async function handleResolve(alert) {
    await alertsService.resolve(alert.id, user.id)
    reload()
  }

  async function handleCreate(data) {
    await alertsService.createAdministrative(data)
    setCreating(false)
    reload()
  }

  const highPriority = openAlerts.filter((a) => a.priority === 'Alta').length
  const inProgress = openAlerts.filter((a) => a.status === 'Atendida').length

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Alertas</h1>
          <p>Stock bajo, turnos sin confirmar y avisos administrativos, con su seguimiento hasta que se resuelven.</p>
        </div>
        {canManage && (
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            + Alerta administrativa
          </button>
        )}
      </div>

      <div className="stat-grid">
        <StatCard label="Alertas abiertas" value={openAlerts.length} />
        <StatCard label="Prioridad alta" value={highPriority} hint={highPriority > 0 ? 'Atender primero' : 'Nada urgente'} />
        <StatCard label="En seguimiento" value={inProgress} hint="Atendidas, esperando resolución" />
      </div>

      <div className="page-tabs" role="tablist" style={{ marginTop: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tab}
            className={t.key === tab ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'reminders' ? (
        reminders.length === 0 ? (
          <EmptyState title="Todavía no se enviaron recordatorios" />
        ) : (
          <div className="aura-table-wrap">
            <table className="aura-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Canal</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map((r) => (
                  <tr key={r.id}>
                    <td>{dateTimeFormatter.format(new Date(r.sentAt))}</td>
                    <td>{patientName(r.patientId)}</td>
                    <td>
                      <Badge variant="info">{r.channel}</Badge>
                    </td>
                    <td className="alerts-message-cell">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <>
          <div className="list-toolbar" style={{ marginTop: 0 }}>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {tab === 'open' && (
              <span className="field-hint">
                Las de stock y turnos se cierran solas cuando se repone el insumo o se confirma el turno.
              </span>
            )}
          </div>

          {visibleAlerts.length === 0 ? (
            <EmptyState
              title={tab === 'open' ? 'No hay alertas abiertas' : 'Todavía no hay alertas resueltas'}
              description={tab === 'open' ? 'Cuando se detecte una situación relevante, aparecerá acá.' : undefined}
            />
          ) : (
            <div className="aura-table-wrap">
              <table className="aura-table">
                <thead>
                  <tr>
                    <th>Prioridad</th>
                    <th>Tipo</th>
                    <th>Detalle</th>
                    <th>{tab === 'open' ? 'Creada' : 'Resuelta'}</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAlerts.map((alert) => (
                    <tr key={alert.id}>
                      <td>
                        <Badge>{alert.priority}</Badge>
                      </td>
                      <td>{alert.type}</td>
                      <td className="alerts-detail-cell">
                        <strong>{alert.title}</strong>
                        <p className="alerts-detail">{alert.detail}</p>
                      </td>
                      <td>{dateTimeFormatter.format(new Date(tab === 'open' ? alert.createdAt : alert.resolvedAt))}</td>
                      <td>
                        <Badge>{alert.status}</Badge>
                      </td>
                      <td>
                        {tab === 'open' && canManage && (
                          <div className="table-actions">
                            {alert.type === 'Turno próximo' && (
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => openReminder(alert)}>
                                Enviar recordatorio
                              </button>
                            )}
                            {alert.type === 'Stock bajo' && (
                              <Link to="/app/supplies" className="btn btn-secondary btn-sm">
                                Ver insumos
                              </Link>
                            )}
                            {alert.status === 'Activa' && (
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleAttend(alert)}>
                                Marcar atendida
                              </button>
                            )}
                            {alert.type === 'Administrativa' && (
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleResolve(alert)}>
                                Resolver
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {reminderFor && (
        <ReminderModal
          {...reminderFor}
          centerName={centerName}
          userId={user.id}
          onSent={() => {
            setReminderFor(null)
            reload()
          }}
          onClose={() => setReminderFor(null)}
        />
      )}

      {creating && <AdministrativeAlertModal onSave={handleCreate} onClose={() => setCreating(false)} />}
    </div>
  )
}
