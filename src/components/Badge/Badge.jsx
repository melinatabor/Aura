const STATUS_VARIANT = {
  Activo: 'success',
  Confirmado: 'success',
  Realizado: 'success',
  Inactivo: 'neutral',
  Pendiente: 'warning',
  Cancelado: 'danger',
}

export default function Badge({ children, variant }) {
  const resolved = variant || STATUS_VARIANT[children] || 'neutral'
  return <span className={`badge badge-${resolved}`}>{children}</span>
}
