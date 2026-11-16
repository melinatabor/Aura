import { supabase } from './supabaseClient'

const TABLE = 'contact_inquiries'

// El visitante no tiene sesión y solo puede insertar: no se le devuelve la fila
// (pedirla con .select() exigiría permiso de lectura y rompería el envío).
export async function insert(row) {
  const { error } = await supabase.from(TABLE).insert(row)
  if (error) throw error
}

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
