// "Vencida" no se guarda: se deduce de la fecha, así no hace falta una tarea
// programada que actualice las invitaciones viejas.
export function toInvitation(row) {
  const expired = row.status === 'Pendiente' && new Date(row.expires_at) < new Date()
  return {
    id: row.id,
    email: row.email,
    roleId: row.role_id,
    roleName: row.roles?.name ?? '',
    professionalId: row.professional_id,
    token: row.token,
    status: expired ? 'Vencida' : row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
  }
}

export function toInvitationRow(invitation) {
  return {
    email: invitation.email.trim().toLowerCase(),
    role_id: invitation.roleId,
    professional_id: invitation.professionalId || null,
  }
}
