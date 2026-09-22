import { supabase } from './supabaseClient'

const TABLE = 'stock_exports'

export async function insert(row) {
  const { data, error } = await supabase.from(TABLE).insert(row).select().single()
  if (error) throw error
  return data
}

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
