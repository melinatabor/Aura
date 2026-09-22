export function toEmployee(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    status: row.status,
  }
}

export function toProfileRow(employee) {
  const row = {}
  if (employee.firstName !== undefined) row.first_name = employee.firstName
  if (employee.lastName !== undefined) row.last_name = employee.lastName
  if (employee.role !== undefined) row.role = employee.role
  if (employee.status !== undefined) row.status = employee.status
  return row
}
