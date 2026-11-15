import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CalendarCheck, CalendarDays, Wallet, Plus, Bell, Sparkles } from 'lucide-react'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import TrendChart from '../../components/TrendChart/TrendChart.jsx'
import * as patientsService from '../../bll/patientsService'
import * as appointmentsService from '../../bll/appointmentsService'
import * as treatmentsService from '../../bll/treatmentsService'
import * as alertsService from '../../bll/alertsService'
import * as professionalsService from '../../bll/professionalsService'
import * as workspaceService from '../../bll/workspaceService'
import * as reportsService from '../../bll/reportsService'
import * as scoringService from '../../bll/scoringService'
import { todayISO } from '../../bll/dates'
import { useAuth } from '../../context/AuthContext.jsx'
import './Dashboard.scss'

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const STATUS_COLORS = { Realizado: '#3e7d5a', Confirmado: '#4c7eb8', Pendiente: '#c97b2e', Cancelado: '#b84c4c' }

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'
}

function parseLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function relativeDay(iso) {
  const today = todayISO()
  if (iso === today) return 'Hoy'
  if (iso === todayISO(1)) return 'Mañana'
  return parseLocal(iso).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function KpiCard({ icon: Icon, label, value, hint, tone = 'green' }) {
  return (
    <div className="kpi-card">
      <span className={`kpi-icon kpi-icon--${tone}`}>
        <Icon size={20} strokeWidth={1.8} />
      </span>
      <div>
        <div className="kpi-label">{label}</div>
        <div className="kpi-value">{value}</div>
        {hint && <div className="kpi-hint">{hint}</div>}
      </div>
    </div>
  )
}

// Esqueleto con la misma estructura del panel mientras llegan los datos.
function DashboardSkeleton() {
  return (
    <div className="dashboard-page" aria-busy="true" aria-label="Cargando el panel">
      <section className="dashboard-hero dashboard-hero--skeleton">
        <div className="skeleton-stack">
          <span className="skeleton skeleton--light" style={{ width: 150, height: 22, borderRadius: 999 }} />
          <span className="skeleton skeleton--light" style={{ width: 'min(360px, 70vw)', height: 34 }} />
          <span className="skeleton skeleton--light" style={{ width: 'min(480px, 80vw)', height: 14 }} />
        </div>
        <div className="dashboard-hero-actions">
          <span className="skeleton skeleton--light" style={{ width: 130, height: 40, borderRadius: 12 }} />
          <span className="skeleton skeleton--light" style={{ width: 130, height: 40, borderRadius: 12 }} />
        </div>
      </section>

      <div className="kpi-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aura-card skeleton-kpi">
            <span className="skeleton" style={{ width: 44, height: 44, borderRadius: 14 }} />
            <div className="skeleton-stack">
              <span className="skeleton" style={{ width: '60%', height: 12 }} />
              <span className="skeleton" style={{ width: '40%', height: 28 }} />
              <span className="skeleton" style={{ width: '50%', height: 10 }} />
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-columns">
        {[0, 1].map((col) => (
          <section key={col} className="aura-card">
            <span className="skeleton" style={{ width: 160, height: 18, marginBottom: 20 }} />
            <div className="skeleton-stack">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="skeleton-row">
                  <span className="skeleton" style={{ width: 38, height: 38, borderRadius: '50%' }} />
                  <div className="skeleton-stack" style={{ flex: 1 }}>
                    <span className="skeleton" style={{ width: `${70 - row * 6}%`, height: 12 }} />
                    <span className="skeleton" style={{ width: `${45 - row * 3}%`, height: 10 }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, can } = useAuth()
  const [data, setData] = useState(null)
  const canSeeReports = can('reports.view')

  useEffect(() => {
    let active = true
    async function load() {
      const [patients, appointments, treatments, alerts, professionals, workspace, scores, trend] = await Promise.all([
        patientsService.getAll(),
        appointmentsService.getAll(),
        treatmentsService.getAll(),
        alertsService.getOpenAlerts(),
        professionalsService.getAll(),
        workspaceService.get(),
        scoringService.getScores(),
        canSeeReports ? reportsService.getRevenueTrend() : Promise.resolve(null),
      ])
      if (!active) return
      setData({ patients, appointments, treatments, alerts, professionals, workspace, scores, trend })
    }
    load()
    return () => {
      active = false
    }
  }, [canSeeReports])

  if (!data) return <DashboardSkeleton />

  const { patients, appointments, treatments, alerts, professionals, workspace, scores, trend } = data
  const today = todayISO()
  const monthPrefix = today.slice(0, 7)
  const activePatients = patients.filter((p) => p.status === 'Activo')
  const todayAppointments = appointments.filter((a) => a.date === today && a.status !== 'Cancelado')
  const weekEnd = todayISO(6)
  const weekAppointments = appointments.filter((a) => a.date >= today && a.date <= weekEnd && a.status !== 'Cancelado')
  const monthAppointments = appointments.filter((a) => a.date.startsWith(monthPrefix))
  const treatmentPrice = Object.fromEntries(treatments.map((t) => [t.id, t.price]))
  const monthRevenue = monthAppointments
    .filter((a) => a.status === 'Realizado')
    .reduce((sum, a) => sum + (treatmentPrice[a.treatmentId] ?? 0), 0)
  const toConfirm = weekAppointments.filter((a) => a.status === 'Pendiente').length

  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== 'Cancelado')
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 6)

  const statusData = ['Realizado', 'Confirmado', 'Pendiente', 'Cancelado']
    .map((status) => ({
      label: status,
      value: monthAppointments.filter((a) => a.status === status).length,
      color: STATUS_COLORS[status],
    }))
    .filter((s) => s.value > 0)

  const toReactivate = scores.filter((s) => s.priority !== 'Alta').slice(0, 4)
  const topClients = scores.slice(0, 3)

  const patientName = (id) => {
    const p = patients.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }
  const professionalName = (id) => {
    const p = professionals.find((x) => x.id === id)
    return p ? `${p.firstName} ${p.lastName}` : '—'
  }

  const dateLabel = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
  const summary =
    todayAppointments.length > 0
      ? `Hoy tenés ${todayAppointments.length} ${todayAppointments.length === 1 ? 'turno' : 'turnos'} en la agenda`
      : 'Hoy no hay turnos en la agenda'

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-hero-date">{dateLabel}</span>
          <h1>
            {greeting()}, {user.name}
          </h1>
          <p>
            {summary}
            {alerts.length > 0 ? ` y ${alerts.length} ${alerts.length === 1 ? 'alerta abierta' : 'alertas abiertas'}.` : '.'}
          </p>
        </div>
        <div className="dashboard-hero-actions">
          {can('schedule.manage') && (
            <Link to="/app/schedule?new=1" className="dashboard-hero-btn dashboard-hero-btn--solid">
              <Plus size={16} /> Agendar turno
            </Link>
          )}
          {can('patients.manage') && (
            <Link to="/app/patients?new=1" className="dashboard-hero-btn">
              <Plus size={16} /> Nuevo cliente
            </Link>
          )}
          {can('alerts.view') && (
            <Link to="/app/alerts" className="dashboard-hero-btn">
              <Bell size={16} /> Ver alertas
            </Link>
          )}
        </div>
      </section>

      {can('settings.manage') && !workspace.setupCompleted && (
        <div className="dashboard-setup-banner">
          <div>
            <strong>Terminá de configurar tu espacio de trabajo</strong>
            <p>Definí tus horarios de atención y las reglas de seguimiento para empezar a operar.</p>
          </div>
          <Link to="/app/initial-setup" className="btn btn-primary btn-sm">
            Configuración inicial
          </Link>
        </div>
      )}

      <div className="kpi-grid">
        <KpiCard icon={Users} label="Clientes activos" value={activePatients.length} hint={`${patients.length} registrados`} />
        <KpiCard
          icon={CalendarCheck}
          label="Turnos de hoy"
          value={todayAppointments.length}
          hint={`${todayAppointments.filter((a) => a.status === 'Confirmado').length} confirmados`}
          tone="blue"
        />
        <KpiCard
          icon={CalendarDays}
          label="Próximos 7 días"
          value={weekAppointments.length}
          hint={toConfirm > 0 ? `${toConfirm} sin confirmar` : 'Todo confirmado'}
          tone="amber"
        />
        {canSeeReports ? (
          <KpiCard icon={Wallet} label="Ingresos del mes" value={priceFormatter.format(monthRevenue)} hint="Turnos realizados" tone="plum" />
        ) : (
          <KpiCard icon={Wallet} label="Turnos del mes" value={monthAppointments.length} tone="plum" />
        )}
      </div>

      <div className="dashboard-columns">
        <section className="aura-card">
          <div className="page-header-row">
            <h2 className="section-title">Próximos turnos</h2>
            <Link to="/app/schedule" className="btn btn-ghost btn-sm">
              Ver agenda completa
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState title="No hay turnos próximos" description="Los turnos que agendes aparecerán acá." />
          ) : (
            <div className="aura-table-wrap dashboard-table">
              <table className="aura-table">
                <thead>
                  <tr>
                    <th>Cuándo</th>
                    <th>Cliente</th>
                    <th>Profesional</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <strong>{relativeDay(a.date)}</strong>
                        <span className="dashboard-time"> · {a.startTime}</span>
                      </td>
                      <td>{patientName(a.patientId)}</td>
                      <td>{professionalName(a.professionalId)}</td>
                      <td>
                        <Badge>{a.status}</Badge>
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
            <h2 className="section-title">Alertas abiertas</h2>
            <Link to="/app/alerts" className="btn btn-ghost btn-sm">
              Ver todas
            </Link>
          </div>
          {alerts.length === 0 ? (
            <EmptyState title="Todo en orden" description="No hay alertas abiertas." />
          ) : (
            <ul className="dashboard-alert-list">
              {alerts.slice(0, 5).map((alert) => (
                <li key={alert.id}>
                  <Badge>{alert.priority}</Badge>
                  <div>
                    <strong>{alert.title}</strong>
                    <p>{alert.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="dashboard-columns dashboard-columns--even">
        {canSeeReports && trend && (
          <section className="aura-card">
            <h2 className="section-title">Ingresos de los últimos 14 días</h2>
            {trend.some((d) => d.value > 0) ? (
              <TrendChart data={trend} color="#3e6259" formatValue={priceFormatter.format} />
            ) : (
              <EmptyState title="Todavía no hay turnos realizados en este período" />
            )}
          </section>
        )}

        <section className="aura-card">
          <h2 className="section-title">Estado de los turnos del mes</h2>
          {statusData.length === 0 ? (
            <EmptyState title="Todavía no hay turnos este mes" />
          ) : (
            <DonutChart
              data={statusData}
              centerLabel="Turnos del mes"
              centerValue={monthAppointments.length}
              legendLayout="full"
            />
          )}
        </section>
      </div>

      <div className="dashboard-columns dashboard-columns--even">
        {can('scoring.view') && (
          <section className="aura-card">
            <div className="page-header-row">
              <h2 className="section-title">
                <Sparkles size={15} className="dashboard-title-icon" /> Clientes más valiosos
              </h2>
              <Link to="/app/ai-scoring" className="btn btn-ghost btn-sm">
                AI Patient Scoring
              </Link>
            </div>
            <ul className="dashboard-person-list">
              {topClients.map((s) => (
                <li key={s.patientId}>
                  <span className="dashboard-avatar">{patientName(s.patientId).charAt(0)}</span>
                  <div className="dashboard-person-info">
                    <strong>{patientName(s.patientId)}</strong>
                    <p>{s.reason}</p>
                  </div>
                  <span className="dashboard-score">{s.score}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="aura-card">
          <h2 className="section-title">Clientes para reactivar</h2>
          {toReactivate.length === 0 ? (
            <EmptyState title="Todos los clientes activos tienen seguimiento al día" />
          ) : (
            <ul className="dashboard-person-list">
              {toReactivate.map((s) => (
                <li key={s.patientId}>
                  <span className="dashboard-avatar dashboard-avatar--muted">{patientName(s.patientId).charAt(0)}</span>
                  <div className="dashboard-person-info">
                    <strong>{patientName(s.patientId)}</strong>
                    <p>{s.reason}</p>
                  </div>
                  <Link to={`/app/patients/${s.patientId}`} className="btn btn-secondary btn-sm">
                    Ver ficha
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
