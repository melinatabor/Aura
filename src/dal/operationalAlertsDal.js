import { supabase } from './supabaseClient'

const TABLE = 'operational_alerts'

// Genera/actualiza en la base las alertas de stock bajo y turnos próximos, y
// resuelve solas las que ya no corresponden (función sync_operational_alerts).
export async function sync() {
  const { error } = await supabase.rpc('sync_operational_alerts')
  if (error) throw error
}

export async function getOpen() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .neq('status', 'Resuelta')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getResolved(limit = 50) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('status', 'Resuelta')
    .order('resolved_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function insert(row) {
  const { data, error } = await supabase.from(TABLE).insert(row).select().single()
  if (error) throw error
  return data
}

export async function update(id, row) {
  const { error } = await supabase.from(TABLE).update(row).eq('id', id)
  if (error) throw error
}
