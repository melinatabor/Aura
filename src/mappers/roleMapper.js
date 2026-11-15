export function toRole(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isCustom: row.is_custom,
    permissionIds: (row.role_permissions ?? []).map((rp) => rp.permission_id),
  }
}

export function toRoleRow(role) {
  return { name: role.name, description: role.description ?? '', is_custom: true }
}

export function toPermission(row) {
  return { id: row.id, code: row.code, module: row.module, description: row.description }
}
