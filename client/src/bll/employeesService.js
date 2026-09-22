import * as profilesDal from '../dal/profilesDal'
import { toEmployee, toProfileRow } from '../mappers/profileMapper'

// No hay create(): las cuentas nuevas se registran desde "Crear cuenta"
// (Supabase Auth crea el login y el trigger de la base arma el perfil).
// Acá solo se administra el rol y el estado de cuentas ya existentes.

export async function getAll() {
  const rows = await profilesDal.getAll()
  return rows.map(toEmployee)
}

export async function getById(id) {
  const row = await profilesDal.getById(id)
  return row ? toEmployee(row) : null
}

export async function update(id, data) {
  const row = await profilesDal.update(id, toProfileRow(data))
  return toEmployee(row)
}

export async function setStatus(id, status) {
  await profilesDal.update(id, { status })
  return true
}
