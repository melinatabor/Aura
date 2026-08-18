import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import * as patientsService from '../../services/patientsService'
import './AIPatientScoring.scss'

// Fixed example data: this screen is only a visual mock of the Figma,
// there is no real calculation or model running behind it.
const SCORES_MOCK = [
  { patientId: 1, score: 92, priority: 'Alta', reason: 'Turnos frecuentes, sin cancelaciones recientes.' },
  { patientId: 3, score: 78, priority: 'Alta', reason: 'Buen historial de asistencia.' },
  { patientId: 5, score: 61, priority: 'Media', reason: 'Frecuencia irregular en los últimos meses.' },
  { patientId: 6, score: 55, priority: 'Media', reason: 'Sin turnos en las últimas 3 semanas.' },
  { patientId: 9, score: 28, priority: 'Baja', reason: 'Cliente inactivo, sin turnos recientes.' },
]

const PRIORITY_VARIANT = { Alta: 'success', Media: 'warning', Baja: 'danger' }

export default function AIPatientScoring() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    patientsService.getAll().then(setPatients)
  }, [])

  const rows = SCORES_MOCK.map((s) => ({
    ...s,
    patient: patients.find((p) => p.id === s.patientId),
  })).filter((r) => r.patient)

  const average = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0

  return (
    <div className="scoring-page">
      <div className="page-header">
        <h1>AI Patient Scoring</h1>
        <p>Vista conceptual de priorización de clientes. Los valores son de ejemplo, no provienen de un cálculo real.</p>
      </div>

      <div className="scoring-disclaimer">
        Esta pantalla es una maqueta visual. No hay ningún modelo de IA ni cálculo automático detrás de los puntajes
        mostrados — quedará fuera de esta fase del proyecto.
      </div>

      <div className="stat-grid">
        <StatCard label="Clientes evaluados" value={rows.length} />
        <StatCard label="Puntaje promedio" value={average} />
        <StatCard label="Prioridad alta" value={rows.filter((r) => r.priority === 'Alta').length} />
      </div>

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
