import { supabase } from './supabaseClient'

export async function getAll() {
  const { data, error } = await supabase.from('roles').select('*, role_permissions(permission_id)').order('id')
  if (error) throw error
  return data
}

export async function getPermissions() {
  const { data, error } = await supabase.from('permissions').select('*').order('id')
  if (error) throw error
  return data
}

export async function insert(row) {
  const { data, error } = await supabase.from('roles').insert(row).select().single()
  if (error) throw error
  return data
}

export async function replacePermissions(roleId, permissionIds) {
  const { error: deleteError } = await supabase.from('role_permissions').delete().eq('role_id', roleId)
  if (deleteError) throw deleteError
  if (permissionIds.length === 0) return
  const rows = permissionIds.map((permissionId) => ({ role_id: roleId, permission_id: permissionId }))
  const { error } = await supabase.from('role_permissions').insert(rows)
  if (error) throw error
}
