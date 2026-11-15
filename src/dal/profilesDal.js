import { supabase } from './supabaseClient'

const TABLE = 'profiles'

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*, roles(name)').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Perfil del usuario logueado con los códigos de permiso de su rol.
export async function getWithPermissions(id) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*, roles(name, role_permissions(permissions(code)))')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function update(id, row) {
  const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select('*, roles(name)').single()
  if (error) throw error
  return data
}
