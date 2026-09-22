import './ScoreBreakdown.scss'

const FACTORS = [
  { key: 'recency', label: 'Recencia', color: '#3e6259' },
  { key: 'frequency', label: 'Frecuencia', color: '#c1652c' },
  { key: 'reliability', label: 'Confiabilidad', color: '#c99a1e' },
]

// breakdown: { recency, frequency, reliability } (puntos ya obtenidos)
// weights: { recency, frequency, reliability } (puntos máximos posibles de cada factor)
export default function ScoreBreakdown({ breakdown, weights, compact = false }) {
  return (
    <div className={`score-breakdown${compact ? ' score-breakdown--compact' : ''}`}>
      {FACTORS.map((f) => {
        const value = breakdown[f.key]
        const max = weights[f.key]
        const pct = Math.round((value / max) * 100)
        return (
          <div key={f.key} className="score-breakdown-row" title={`${f.label}: ${value}/${max} puntos`}>
            {!compact && <span className="score-breakdown-label">{f.label}</span>}
            <div className="score-breakdown-track">
              <div className="score-breakdown-fill" style={{ width: `${pct}%`, background: f.color }} />
            </div>
            {!compact && <span className="score-breakdown-value">{value}</span>}
          </div>
        )
      })}
    </div>
  )
}
