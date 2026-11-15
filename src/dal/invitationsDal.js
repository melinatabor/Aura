import { supabase } from './supabaseClient'

const TABLE = 'account_invitations'

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*, roles(name)').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insert(row) {
  const { data, error } = await supabase.from(TABLE).insert(row).select('*, roles(name)').single()
  if (error) throw error
  return data
}

export async function update(id, row) {
  const { error } = await supabase.from(TABLE).update(row).eq('id', id)
  if (error) throw error
}

// La pantalla de registro no tiene sesión todavía: la invitación se lee a
// través de la función get_invitation, que solo devuelve email y rol.
export async function getByToken(token) {
  const { data, error } = await supabase.rpc('get_invitation', { invite_token: token })
  if (error) throw error
  return data?.[0] ?? null
}
