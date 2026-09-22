import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import * as patientsService from '../../bll/patientsService'
import * as scoringService from '../../bll/scoringService'
import './AIPatientScoring.scss'

const PRIORITY_VARIANT = { Alta: 'success', Media: 'warning', Baja: 'danger' }
const PRIORITY_COLORS = { Alta: '#3e7d5a', Media: '#c97b2e', Baja: '#b84c4c' }

function AiInsightCell({ insight, onGenerate }) {
  const status = insight?.status ?? 'idle'

  if (status === 'idle') {
    return (
      <button type="button" className="btn btn-secondary btn-sm" onClick={onGenerate}>
        ✨ Generar con IA
      </button>
    )
  }
  if (status === 'loading') {
    return <span className="scoring-ai-loading">Generando...</span>
  }
  if (status === 'error') {
    return (
      <div className="scoring-ai-error">
        <span>No se pudo generar: {insight.error}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onGenerate}>
          Reintentar
        </button>
      </div>
    )
  }
  return <span className="scoring-ai-text">{insight.text}</span>
}

export default function AIPatientScoring() {
  const [patients, setPatients] = useState([])
  const [scores, setScores] = useState([])
  const [insights, setInsights] = useState({})

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

  async function handleGenerateInsight(row) {
    setInsights((prev) => ({ ...prev, [row.patientId]: { status: 'loading' } }))
    try {
      const text = await scoringService.generateInsight(row, `${row.patient.firstName} ${row.patient.lastName}`)
      setInsights((prev) => ({ ...prev, [row.patientId]: { status: 'done', text } }))
    } catch (err) {
      setInsights((prev) => ({ ...prev, [row.patientId]: { status: 'error', error: err.message } }))
    }
  }

  return (
    <div className="scoring-page">
      <div className="page-header">
        <h1>AI Patient Scoring</h1>
        <p>Priorización de clientes calculada sobre sus turnos reales, con recomendaciones redactadas por IA.</p>
      </div>

      <div className="scoring-disclaimer">
        El puntaje (0-100) se calcula con una fórmula de reglas ponderadas y explicables (recencia, frecuencia y
        confiabilidad) — es determinístico, no una caja negra. La columna "Recomendación con IA" sí llama a un
        modelo de lenguaje real (Claude, vía una Supabase Edge Function) para redactar una sugerencia en lenguaje
        natural a partir de esos mismos datos; se genera a pedido para no hacer una llamada a la IA por cada carga
        de la pantalla.
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
              <th>Recomendación con IA</th>
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
                <td className="scoring-ai-cell">
                  <AiInsightCell insight={insights[r.patientId]} onGenerate={() => handleGenerateInsight(r)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
