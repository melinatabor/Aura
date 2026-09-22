import { supabase } from './supabaseClient'

const TABLE = 'appointments'

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*').order('date', { ascending: true }).order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function getById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function getByDateRange(from, to) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .gte('date', from)
    .lte('date', to)
    .order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function getByProfessionalAndDate(professionalId, date) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('professional_id', professionalId).eq('date', date)
  if (error) throw error
  return data
}

export async function insert(row) {
  const { data, error } = await supabase.from(TABLE).insert(row).select().single()
  if (error) throw error
  return data
}

export async function update(id, row) {
  const { data, error } = await supabase.from(TABLE).update(row).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function remove(id) {
  const { error } = await supabase.from(TABLE).delete().eq('id', id)
  if (error) throw error
}
