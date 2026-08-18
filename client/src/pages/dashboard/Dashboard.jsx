import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import * as patientsService from '../../services/patientsService'
import * as appointmentsService from '../../services/appointmentsService'
import * as treatmentsService from '../../services/treatmentsService'
import * as alertsService from '../../services/alertsService'
import * as professionalsService from '../../services/professionalsService'
import './Dashboard.scss'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let active = true
    async function load() {
      const [patients, todayAppointments, treatments, alerts, professionals] = await Promise.all([
        patientsService.getAll(),
        appointmentsService.getToday(),
        treatmentsService.getActive(),
        alertsService.getAlerts(),
        professionalsService.getAll(),
      ])
      if (!active) return
      setData({ patients, todayAppointments, treatments, alerts, professionals })
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!data) return null

  const { patients, todayAppointments, treatments, alerts, professionals } = data
  const activePatients = patients.filter((p) => p.status === 'Activo')
  const pendingFollowUp = patients
    .filter((p) => p.status === 'Activo' && !todayAppointments.some((a) => a.patientId === p.id))
    .slice(0, 4)

  function patientName(id) {
    const p = patients.find((pat) => pat.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  function professionalName(id) {
    const prof = professionals.find((pr) => pr.id === id)
    return prof ? `${prof.firstName} ${prof.lastName}` : '—'
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Panel principal</h1>
        <p>Resumen general de la actividad de tu centro para hoy.</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Pacientes activos" value={activePatients.length} />
        <StatCard label="Turnos de hoy" value={todayAppointments.length} />
        <StatCard label="Tratamientos activos" value={treatments.length} />
        <StatCard label="Alertas activas" value={alerts.length} hint={alerts.length > 0 ? 'Requieren revisión' : 'Todo en orden'} />
      </div>

      <div className="dashboard-columns">
        <section className="aura-card">
          <div className="page-header-row">
            <h2 className="section-title">Turnos de hoy</h2>
            <Link to="/app/schedule" className="btn btn-ghost btn-sm">
              Ver agenda completa
            </Link>
          </div>
          {todayAppointments.length === 0 ? (
            <EmptyState title="No hay turnos agendados para hoy" />
          ) : (
            <div className="aura-table-wrap">
              <table className="aura-table">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Paciente</th>
                    <th>Profesional</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAppointments
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((appointment) => (
                      <tr key={appointment.id}>
                        <td>{appointment.startTime}</td>
                        <td>{patientName(appointment.patientId)}</td>
                        <td>{professionalName(appointment.professionalId)}</td>
                        <td>
                          <Badge>{appointment.status}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="aura-card">
          <div className="page-header-row">
            <h2 className="section-title">Alertas activas</h2>
            <Link to="/app/alerts" className="btn btn-ghost btn-sm">
              Ver todas
            </Link>
          </div>
          {alerts.length === 0 ? (
            <EmptyState title="No hay alertas activas" />
          ) : (
            <ul className="dashboard-alert-list">
              {alerts.slice(0, 5).map((alert) => (
                <li key={alert.id}>
                  <Badge variant={alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}>
                    {alert.type}
                  </Badge>
                  <div>
                    <strong>{alert.title}</strong>
                    <p>{alert.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="aura-card">
        <h2 className="section-title">Clientes con seguimiento pendiente</h2>
        {pendingFollowUp.length === 0 ? (
          <EmptyState title="Todos los clientes activos tienen seguimiento al día" />
        ) : (
          <ul className="dashboard-followup-list">
            {pendingFollowUp.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>
                    {p.firstName} {p.lastName}
                  </strong>
                  <p>Sin turno agendado para hoy</p>
                </div>
                <Link to={`/app/patients/${p.id}`} className="btn btn-secondary btn-sm">
                  Ver ficha
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
