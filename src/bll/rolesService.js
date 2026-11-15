import * as rolesDal from '../dal/rolesDal'
import { toPermission, toRole, toRoleRow } from '../mappers/roleMapper'

// El rol Administrador no se edita desde la pantalla: si alguien le sacara
// "employees.manage", nadie podría volver a administrar roles.
export const LOCKED_ROLE = 'Administrador'

export async function getAll() {
  const rows = await rolesDal.getAll()
  return rows.map(toRole)
}

export async function getPermissions() {
  const rows = await rolesDal.getPermissions()
  return rows.map(toPermission)
}

export async function create(data) {
  const row = await rolesDal.insert(toRoleRow(data))
  return toRole(row)
}

export async function setPermissions(role, permissionIds) {
  if (role.name === LOCKED_ROLE) throw new Error('El rol Administrador no se puede modificar.')
  await rolesDal.replacePermissions(role.id, permissionIds)
}
