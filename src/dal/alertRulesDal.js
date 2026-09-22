import { supabase } from './supabaseClient'

const TABLE = 'alert_rules'
const SINGLETON_ID = 1

export async function get() {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', SINGLETON_ID).single()
  if (error) throw error
  return data
}

export async function update(row) {
  const { data, error } = await supabase.from(TABLE).update(row).eq('id', SINGLETON_ID).select().single()
  if (error) throw error
  return data
}
