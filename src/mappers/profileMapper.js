export function toEmployee(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    email: row.email,
    roleId: row.role_id,
    roleName: row.roles?.name ?? '',
    professionalId: row.professional_id,
    status: row.status,
  }
}

export function toProfileRow(employee) {
  const row = {}
  if (employee.firstName !== undefined) row.first_name = employee.firstName
  if (employee.lastName !== undefined) row.last_name = employee.lastName
  if (employee.roleId !== undefined) row.role_id = employee.roleId
  if (employee.professionalId !== undefined) row.professional_id = employee.professionalId || null
  if (employee.status !== undefined) row.status = employee.status
  return row
}
