import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import * as pacientesService from '../../services/pacientesService'
import * as turnosService from '../../services/turnosService'
import * as tratamientosService from '../../services/tratamientosService'
import * as alertasService from '../../services/alertasService'
import * as profesionalesService from '../../services/profesionalesService'
import './Dashboard.scss'

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let activo = true
    async function cargar() {
      const [pacientes, turnosHoy, tratamientos, alertas, profesionales] = await Promise.all([
        pacientesService.getAll(),
        turnosService.getDeHoy(),
        tratamientosService.getActivos(),
        alertasService.getAlertas(),
        profesionalesService.getAll(),
      ])
      if (!activo) return
      setData({ pacientes, turnosHoy, tratamientos, alertas, profesionales })
    }
    cargar()
    return () => {
      activo = false
    }
  }, [])

  if (!data) return null

  const { pacientes, turnosHoy, tratamientos, alertas, profesionales } = data
  const pacientesActivos = pacientes.filter((p) => p.estado === 'Activo')
  const seguimientoPendiente = pacientes
    .filter((p) => p.estado === 'Activo' && !turnosHoy.some((t) => t.pacienteId === p.id))
    .slice(0, 4)

  function nombrePaciente(id) {
    const p = pacientes.find((pac) => pac.id === id)
    return p ? `${p.nombre} ${p.apellido}` : '—'
  }

  function nombreProfesional(id) {
    const prof = profesionales.find((pr) => pr.id === id)
    return prof ? `${prof.nombre} ${prof.apellido}` : '—'
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Panel principal</h1>
        <p>Resumen general de la actividad de tu centro para hoy.</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Pacientes activos" value={pacientesActivos.length} />
        <StatCard label="Turnos de hoy" value={turnosHoy.length} />
        <StatCard label="Tratamientos activos" value={tratamientos.length} />
        <StatCard label="Alertas activas" value={alertas.length} hint={alertas.length > 0 ? 'Requieren revisión' : 'Todo en orden'} />
      </div>

      <div className="dashboard-columns">
        <section className="aura-card">
          <div className="page-header-row">
            <h2 className="section-title">Turnos de hoy</h2>
            <Link to="/app/agenda" className="btn btn-ghost btn-sm">
              Ver agenda completa
            </Link>
          </div>
          {turnosHoy.length === 0 ? (
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
                  {turnosHoy
                    .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
                    .map((turno) => (
                      <tr key={turno.id}>
                        <td>{turno.horaInicio}</td>
                        <td>{nombrePaciente(turno.pacienteId)}</td>
                        <td>{nombreProfesional(turno.profesionalId)}</td>
                        <td>
                          <Badge>{turno.estado}</Badge>
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
            <Link to="/app/alertas" className="btn btn-ghost btn-sm">
              Ver todas
            </Link>
          </div>
          {alertas.length === 0 ? (
            <EmptyState title="No hay alertas activas" />
          ) : (
            <ul className="dashboard-alert-list">
              {alertas.slice(0, 5).map((alerta) => (
                <li key={alerta.id}>
                  <Badge variant={alerta.severidad === 'danger' ? 'danger' : alerta.severidad === 'warning' ? 'warning' : 'info'}>
                    {alerta.tipo}
                  </Badge>
                  <div>
                    <strong>{alerta.titulo}</strong>
                    <p>{alerta.descripcion}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="aura-card">
        <h2 className="section-title">Clientes con seguimiento pendiente</h2>
        {seguimientoPendiente.length === 0 ? (
          <EmptyState title="Todos los clientes activos tienen seguimiento al día" />
        ) : (
          <ul className="dashboard-followup-list">
            {seguimientoPendiente.map((p) => (
              <li key={p.id}>
                <div>
                  <strong>
                    {p.nombre} {p.apellido}
                  </strong>
                  <p>Sin turno agendado para hoy</p>
                </div>
                <Link to={`/app/clientes/${p.id}`} className="btn btn-secondary btn-sm">
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
