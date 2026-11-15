import { useAuth } from '../../context/AuthContext.jsx'
import EmptyState from '../EmptyState/EmptyState.jsx'

export default function RequirePermission({ code, children }) {
  const { can } = useAuth()

  if (!can(code)) {
    return (
      <EmptyState
        title="No tenés acceso a esta sección"
        description="Tu rol no incluye este módulo. Si lo necesitás, pedile a un administrador que lo habilite."
      />
    )
  }

  return children
}
