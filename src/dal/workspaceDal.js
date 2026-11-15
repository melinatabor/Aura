import { supabase } from './supabaseClient'

const SINGLETON_ID = 1

export async function get() {
  const { data, error } = await supabase.from('workspace').select('*').eq('id', SINGLETON_ID).single()
  if (error) throw error
  return data
}

export async function update(row) {
  const { data, error } = await supabase
    .from('workspace')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', SINGLETON_ID)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getScheduleRanges() {
  const { data, error } = await supabase.from('workspace_schedule_ranges').select('*').order('day_of_week')
  if (error) throw error
  return data
}

export async function updateScheduleRange(id, row) {
  const { error } = await supabase.from('workspace_schedule_ranges').update(row).eq('id', id)
  if (error) throw error
}
