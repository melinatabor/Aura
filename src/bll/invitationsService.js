import * as invitationsDal from '../dal/invitationsDal'
import { toInvitation, toInvitationRow } from '../mappers/invitationMapper'

export async function getAll() {
  const rows = await invitationsDal.getAll()
  return rows.map(toInvitation)
}

export async function create(data) {
  const row = await invitationsDal.insert(toInvitationRow(data))
  return toInvitation(row)
}

export async function cancel(id) {
  await invitationsDal.update(id, { status: 'Cancelada' })
}

export async function getByToken(token) {
  const invitation = await invitationsDal.getByToken(token)
  return invitation ? { email: invitation.email, roleName: invitation.role_name } : null
}

// No hay servidor de correo configurado: el administrador copia el enlace y
// se lo manda a la persona por el medio que prefiera.
export function buildLink(token) {
  return `${window.location.origin}/activate-account?token=${token}`
}
