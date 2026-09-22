import { supabase } from './supabaseClient'

const TABLE = 'profiles'

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function update(id, row) {
  const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single()
  if (error) throw error
  return data
}
