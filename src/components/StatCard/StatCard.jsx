import useCountUp from '../../hooks/useCountUp'

function AnimatedValue({ value }) {
  const animated = useCountUp(value)
  return animated
}

// value numérico → cuenta hasta el valor; texto (ej. importes) → se muestra tal cual.
export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="stat-card">
      {Icon && (
        <span className="stat-icon">
          <Icon size={18} strokeWidth={1.85} />
        </span>
      )}
      <div className="stat-label">{label}</div>
      <div className="stat-value">{typeof value === 'number' ? <AnimatedValue value={value} /> : value}</div>
      {hint && <div className="stat-hint">{hint}</div>}
    </div>
  )
}
