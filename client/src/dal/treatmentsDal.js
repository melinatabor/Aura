import { supabase } from './supabaseClient'

const TABLE = 'treatments'
const JUNCTION_TABLE = 'treatment_supplies'

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*').order('id', { ascending: false })
  if (error) throw error
  return data
}

export async function getById(id) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()
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

export async function getSuppliesForTreatment(treatmentId) {
  const { data, error } = await supabase.from(JUNCTION_TABLE).select('*').eq('treatment_id', treatmentId)
  if (error) throw error
  return data
}

export async function replaceSuppliesForTreatment(treatmentId, relations) {
  const { error: deleteError } = await supabase.from(JUNCTION_TABLE).delete().eq('treatment_id', treatmentId)
  if (deleteError) throw deleteError

  if (relations.length === 0) return []

  const { data, error } = await supabase.from(JUNCTION_TABLE).insert(relations).select()
  if (error) throw error
  return data
}
