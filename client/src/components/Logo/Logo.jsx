import './Logo.scss'

export default function Logo({ tone = 'light', size = 32, iconOnly = false }) {
  return (
    <span className={`logo logo-${tone}`}>
      <img src="/images/aura-logo-icon.png" alt="Aura" width={size} height={size} className="logo-icon" />
      {!iconOnly && <span className="logo-word">Aura</span>}
    </span>
  )
}
