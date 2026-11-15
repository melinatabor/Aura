const STATUS_VARIANT = {
  Activo: 'success',
  Confirmado: 'success',
  Realizado: 'success',
  Inactivo: 'neutral',
  Pendiente: 'warning',
  Cancelado: 'danger',
  Usada: 'success',
  Cancelada: 'neutral',
  Vencida: 'danger',
  Activa: 'warning',
  Atendida: 'info',
  Resuelta: 'success',
  Alta: 'danger',
  Media: 'warning',
  Baja: 'neutral',
}

export default function Badge({ children, variant }) {
  const resolved = variant || STATUS_VARIANT[children] || 'neutral'
  return <span className={`badge badge-${resolved}`}>{children}</span>
}
