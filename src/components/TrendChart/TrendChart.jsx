import { useState } from 'react'
import './TrendChart.scss'

const WIDTH = 600
const HEIGHT = 220
const PAD_LEFT = 46
const PAD_RIGHT = 12
const PAD_TOP = 16
const PAD_BOTTOM = 28

const shortDate = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' })

// data: [{ date: 'YYYY-MM-DD', value }] — un solo hilo, sin necesidad de leyenda.
export default function TrendChart({ data, color, formatValue = (v) => v }) {
  const [hoverIndex, setHoverIndex] = useState(null)

  const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT
  const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM
  const maxValue = Math.max(1, ...data.map((d) => d.value))

  const xAt = (i) => PAD_LEFT + (data.length > 1 ? (i / (data.length - 1)) * plotWidth : plotWidth / 2)
  const yAt = (v) => PAD_TOP + (1 - v / maxValue) * plotHeight

  const points = data.map((d, i) => [xAt(i), yAt(d.value)])
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
  const areaPath = `${linePath} L ${points.at(-1)[0]} ${PAD_TOP + plotHeight} L ${points[0][0]} ${PAD_TOP + plotHeight} Z`

  const ticks = [0, 0.5, 1].map((f) => ({ y: PAD_TOP + (1 - f) * plotHeight, value: maxValue * f }))
  const labelEvery = Math.ceil(data.length / 6)

  function handleMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let best = Infinity
    points.forEach(([x], i) => {
      const dist = Math.abs(x - relX)
      if (dist < best) {
        best = dist
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null
  const last = data.at(-1)

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {ticks.map((t) => (
          <g key={t.y}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={t.y} y2={t.y} className="trend-chart-gridline" />
            <text x={PAD_LEFT - 8} y={t.y} className="trend-chart-tick" textAnchor="end" dominantBaseline="middle">
              {formatValue(Math.round(t.value))}
            </text>
          </g>
        ))}

        <path d={areaPath} fill={color} opacity="0.1" stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={d.date} x={xAt(i)} y={HEIGHT - 8} className="trend-chart-tick" textAnchor="middle">
              {shortDate.format(new Date(d.date))}
            </text>
          ) : null,
        )}

        <circle cx={points.at(-1)[0]} cy={points.at(-1)[1]} r="4" fill={color} className="trend-chart-end-dot" />
        <text x={points.at(-1)[0]} y={points.at(-1)[1] - 10} textAnchor="end" className="trend-chart-end-label">
          {formatValue(last.value)}
        </text>

        {hovered && (
          <g>
            <line
              x1={xAt(hoverIndex)}
              x2={xAt(hoverIndex)}
              y1={PAD_TOP}
              y2={PAD_TOP + plotHeight}
              className="trend-chart-crosshair"
            />
            <circle cx={xAt(hoverIndex)} cy={yAt(hovered.value)} r="4" fill={color} stroke="#fff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {hovered && (
        <div
          className="trend-chart-tooltip"
          style={{ left: `${(xAt(hoverIndex) / WIDTH) * 100}%` }}
        >
          <strong>{formatValue(hovered.value)}</strong>
          <span>{shortDate.format(new Date(hovered.date))}</span>
        </div>
      )}
    </div>
  )
}
