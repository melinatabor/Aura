import * as profilesDal from '../dal/profilesDal'
import { toEmployee, toProfileRow } from '../mappers/profileMapper'

// No hay create(): las cuentas nuevas se registran desde "Crear cuenta",
// idealmente con un enlace de invitación (ver invitationsService).

export async function getAll() {
  const rows = await profilesDal.getAll()
  return rows.map(toEmployee)
}

export async function update(id, data) {
  const row = await profilesDal.update(id, toProfileRow(data))
  return toEmployee(row)
}

export async function setStatus(id, status) {
  await profilesDal.update(id, { status })
  return true
}
