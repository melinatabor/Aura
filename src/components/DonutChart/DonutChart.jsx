import { useState } from 'react'
import './DonutChart.scss'

const SIZE = 200
const STROKE = 32
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SEGMENT_GAP = 3

// data: [{ label, value, color }]
export default function DonutChart({ data, centerLabel, centerValue, formatValue = (v) => v, legendLayout = 'side' }) {
  const [hovered, setHovered] = useState(null)
  const total = data.reduce((sum, d) => sum + d.value, 0)

  let offset = 0
  const segments = data.map((d) => {
    const fraction = total > 0 ? d.value / total : 0
    const rawLength = fraction * CIRCUMFERENCE
    const length = Math.max(0, rawLength - SEGMENT_GAP)
    const segment = { ...d, fraction, dasharray: `${length} ${CIRCUMFERENCE - length}`, dashoffset: -offset }
    offset += rawLength
    return segment
  })

  const active = hovered !== null ? segments[hovered] : null

  return (
    <div className={`donut-chart${legendLayout === 'full' ? ' donut-chart--stacked' : ''}`}>
      <div className="donut-chart-plot">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label={centerLabel}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--donut-track)" strokeWidth={STROKE} />
          {segments.map((seg, i) => (
            <circle
              key={seg.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={seg.color}
              strokeWidth={hovered === i ? STROKE + 4 : STROKE}
              strokeDasharray={seg.dasharray}
              strokeDashoffset={seg.dashoffset}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              className="donut-chart-segment"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
            >
              <title>{`${seg.label}: ${formatValue(seg.value)} (${Math.round(seg.fraction * 100)}%)`}</title>
            </circle>
          ))}
        </svg>
        <div className="donut-chart-center">
          <strong>{active ? formatValue(active.value) : centerValue}</strong>
          <span>{active ? active.label : centerLabel}</span>
        </div>
      </div>

      <ul className="donut-chart-legend">
        {segments.map((seg, i) => (
          <li
            key={seg.label}
            className={hovered === i ? 'is-active' : ''}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="donut-chart-legend-name">
              <span className="donut-chart-swatch" style={{ background: seg.color }} />
              <span className="donut-chart-legend-label">{seg.label}</span>
            </span>
            <span className="donut-chart-legend-value">
              {formatValue(seg.value)} ({Math.round(seg.fraction * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
