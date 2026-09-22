import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import DonutChart from '../../components/DonutChart/DonutChart.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import ScoreBreakdown from '../../components/ScoreBreakdown/ScoreBreakdown.jsx'
import * as patientsService from '../../bll/patientsService'
import * as scoringService from '../../bll/scoringService'
import { SCORE_WEIGHTS } from '../../bll/scoringService'
import './AIPatientScoring.scss'

const PRIORITY_VARIANT = { Alta: 'success', Media: 'warning', Baja: 'danger' }
const PRIORITY_COLORS = { Alta: '#3e7d5a', Media: '#c97b2e', Baja: '#b84c4c' }
const BULK_LIMIT = 5

function AiInsightCell({ insight, onGenerate, onView }) {
  const status = insight?.status ?? 'idle'

  if (status === 'idle') {
    return (
      <button type="button" className="scoring-ai-generate-btn scoring-ai-generate-btn--sm" onClick={onGenerate}>
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
  return (
    <button type="button" className="scoring-ai-view-btn" onClick={onView}>
      💬 Ver recomendación
    </button>
  )
}

function AiRecommendation({ summary, actions }) {
  return (
    <>
      <p className="scoring-recommendation-summary">{summary}</p>
      {actions?.length > 0 && (
        <ul className="scoring-recommendation-actions">
          {actions.map((action) => (
            <li key={action}>
              <span className="scoring-recommendation-check">✓</span>
              {action}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function HeroInsight({ insight, onRetry }) {
  const status = insight?.status ?? 'loading'

  if (status === 'loading') {
    return (
      <p className="scoring-hero-insight-text scoring-hero-insight-text--loading">
        Generando la recomendación con IA...
      </p>
    )
  }
  if (status === 'error') {
    return (
      <div className="scoring-hero-insight-error">
        <p className="scoring-hero-insight-text">No se pudo generar la recomendación ({insight.error}).</p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    )
  }
  return <AiRecommendation summary={insight.summary} actions={insight.actions} />
}

export default function AIPatientScoring() {
  const [patients, setPatients] = useState([])
  const [scores, setScores] = useState([])
  const [insights, setInsights] = useState({})
  const [viewingInsightFor, setViewingInsightFor] = useState(null)
  const [heroTriggered, setHeroTriggered] = useState(false)
  const [bulkGenerating, setBulkGenerating] = useState(false)

  useEffect(() => {
    patientsService.getAll().then(setPatients)
    scoringService.getScores().then(setScores)
  }, [])

  const rows = scores.map((s) => ({
    ...s,
    patient: patients.find((p) => p.id === s.patientId),
  })).filter((r) => r.patient)

  const average = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.score, 0) / rows.length) : 0
  const heroRow = rows[0]

  const priorityData = ['Alta', 'Media', 'Baja'].map((priority) => ({
    label: priority,
    value: rows.filter((r) => r.priority === priority).length,
    color: PRIORITY_COLORS[priority],
  }))

  async function handleGenerateInsight(row, { openModal = true } = {}) {
    setInsights((prev) => ({ ...prev, [row.patientId]: { status: 'loading' } }))
    try {
      const { summary, actions } = await scoringService.generateInsight(
        row,
        `${row.patient.firstName} ${row.patient.lastName}`,
      )
      setInsights((prev) => ({ ...prev, [row.patientId]: { status: 'done', summary, actions } }))
      if (openModal) setViewingInsightFor(row.patientId)
    } catch (err) {
      setInsights((prev) => ({ ...prev, [row.patientId]: { status: 'error', error: err.message } }))
    }
  }

  // El cliente de mayor prioridad se muestra como "cara" de la sección: su
  // recomendación se genera sola, una única vez, sin esperar un clic.
  useEffect(() => {
    if (heroRow && !heroTriggered) {
      setHeroTriggered(true)
      handleGenerateInsight(heroRow, { openModal: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroRow?.patientId, heroTriggered])

  function getBulkTargets() {
    return rows
      .filter((r) => r.priority === 'Alta')
      .filter((r) => !insights[r.patientId] || insights[r.patientId].status === 'idle' || insights[r.patientId].status === 'error')
      .slice(0, BULK_LIMIT)
  }

  async function handleBulkGenerate() {
    const targets = getBulkTargets()
    if (targets.length === 0) return
    setBulkGenerating(true)
    await Promise.allSettled(targets.map((r) => handleGenerateInsight(r, { openModal: false })))
    setBulkGenerating(false)
  }

  const viewingRow = viewingInsightFor ? rows.find((r) => r.patientId === viewingInsightFor) : null
  const viewingInsight = viewingInsightFor ? insights[viewingInsightFor] : null
  const pendingBulkCount = getBulkTargets().length

  return (
    <div className="scoring-page">
      <div className="page-header">
        <h1>AI Patient Scoring</h1>
        <p>Priorización de clientes calculada sobre sus turnos reales, con recomendaciones redactadas por IA.</p>
      </div>

      {heroRow && (
        <section className="scoring-hero">
          <span className="scoring-hero-tag">✨ Cliente prioritario de hoy</span>
          <div className="scoring-hero-body">
            <div className="scoring-hero-main">
              <h2>
                {heroRow.patient.firstName} {heroRow.patient.lastName}
              </h2>
              <div className="scoring-hero-meta">
                <Badge variant={PRIORITY_VARIANT[heroRow.priority]}>{heroRow.priority}</Badge>
                <span className="scoring-hero-score">{heroRow.score}/100</span>
              </div>
              <ScoreBreakdown breakdown={heroRow.breakdown} weights={SCORE_WEIGHTS} />
            </div>
            <div className="scoring-hero-insight">
              <HeroInsight
                insight={insights[heroRow.patientId]}
                onRetry={() => handleGenerateInsight(heroRow, { openModal: false })}
              />
            </div>
          </div>
        </section>
      )}

      <div className="scoring-disclaimer">
        El puntaje (0-100) se calcula con una fórmula de reglas ponderadas y explicables (recencia, frecuencia y
        confiabilidad) — es determinístico, no una caja negra. Las recomendaciones sí las escribe un modelo de
        lenguaje real (Google Gemini, vía una Supabase Edge Function) a partir de esos mismos datos.
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

      <div className="scoring-table-toolbar">
        <h2 className="section-title">Todos los clientes evaluados</h2>
        <button
          type="button"
          className="scoring-ai-generate-btn"
          onClick={handleBulkGenerate}
          disabled={bulkGenerating || pendingBulkCount === 0}
        >
          {bulkGenerating ? 'Generando recomendaciones...' : `✨ Generar recomendaciones de los prioritarios`}
        </button>
      </div>

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
                  <div className="scoring-score-cell">
                    <span className="scoring-score-value">{r.score}</span>
                    <ScoreBreakdown breakdown={r.breakdown} weights={SCORE_WEIGHTS} compact />
                  </div>
                </td>
                <td>
                  <Badge variant={PRIORITY_VARIANT[r.priority]}>{r.priority}</Badge>
                </td>
                <td>{r.reason}</td>
                <td className="scoring-ai-cell">
                  <AiInsightCell
                    insight={insights[r.patientId]}
                    onGenerate={() => handleGenerateInsight(r)}
                    onView={() => setViewingInsightFor(r.patientId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingRow && viewingInsight?.status === 'done' && (
        <Modal
          title={`Recomendación con IA — ${viewingRow.patient.firstName} ${viewingRow.patient.lastName}`}
          onClose={() => setViewingInsightFor(null)}
        >
          <div className="scoring-ai-modal">
            <div className="scoring-ai-modal-meta">
              <Badge variant={PRIORITY_VARIANT[viewingRow.priority]}>{viewingRow.priority}</Badge>
              <span className="scoring-ai-modal-score">Puntaje: {viewingRow.score}/100</span>
            </div>
            <AiRecommendation summary={viewingInsight.summary} actions={viewingInsight.actions} />
            <span className="scoring-ai-modal-footnote">✨ Generado por IA (Google Gemini)</span>
          </div>
        </Modal>
      )}
    </div>
  )
}
