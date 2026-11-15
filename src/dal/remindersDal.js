import { supabase } from './supabaseClient'

const TABLE = 'reminders'

export async function getAll(limit = 50) {
  const { data, error } = await supabase.from(TABLE).select('*').order('sent_at', { ascending: false }).limit(limit)
  if (error) throw error
  return data
}

export async function insert(row) {
  const { data, error } = await supabase.from(TABLE).insert(row).select().single()
  if (error) throw error
  return data
}
