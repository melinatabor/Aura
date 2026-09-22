import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import * as patientsService from '../../bll/patientsService'
import * as scoringService from '../../bll/scoringService'
import './AIPatientScoring.scss'

const PRIORITY_VARIANT = { Alta: 'success', Media: 'warning', Baja: 'danger' }
const PRIORITY_COLORS = { Alta: '#3e7d5a', Media: '#c97b2e', Baja: '#b84c4c' }

export default function AIPatientScoring() {
  const [patients, setPatients] = useState([])
  const [scores, setScores] = useState([])

  useEffect(() => {
    patientsService.getAll().then(setPatients)
    scoringService.getScores().then(setScores)
  }, [])

  const rows = scores.map((s) => ({
    ...s,
    patient: patients.find((p) => p.id === s.patientId),
  })).filter((r) => r.patient)

  const average = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0

  const priorityData = ['Alta', 'Media', 'Baja'].map((priority) => ({
    label: priority,
    value: rows.filter((r) => r.priority === priority).length,
    color: PRIORITY_COLORS[priority],
  }))

  return (
    <div className="scoring-page">
      <div className="page-header">
        <h1>AI Patient Scoring</h1>
        <p>Priorización de clientes calculada sobre sus turnos reales: recencia, frecuencia y confiabilidad.</p>
      </div>

      <div className="scoring-disclaimer">
        El puntaje se calcula con una fórmula de reglas ponderadas (no es un modelo de machine learning): qué tan
        reciente fue su último turno, cuántos turnos realizó y qué proporción canceló. Cada puntaje se puede explicar
        a mano a partir de esos tres factores.
      </div>

      <div className="stat-grid">
        <StatCard label="Clientes evaluados" value={rows.length} />
        <StatCard label="Puntaje promedio" value={average} />
        <StatCard label="Prioridad alta" value={rows.filter((r) => r.priority === 'Alta').length} />
      </div>

      <section className="aura-card scoring-chart-card">
        <h2 className="section-title">Distribución por prioridad</h2>
        <DonutChart data={priorityData} centerLabel="Clientes evaluados" centerValue={rows.length} />
      </section>

      <div className="aura-table-wrap">
        <table className="aura-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Puntaje</th>
              <th>Prioridad</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.patientId}>
                <td>
                  <strong>
                    {r.patient.firstName} {r.patient.lastName}
                  </strong>
                </td>
                <td>
                  <div className="scoring-bar-track">
                    <div className="scoring-bar-fill" style={{ width: `${r.score}%` }} />
                  </div>
                  <span className="scoring-bar-value">{r.score}</span>
                </td>
                <td>
                  <Badge variant={PRIORITY_VARIANT[r.priority]}>{r.priority}</Badge>
                </td>
                <td>{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
