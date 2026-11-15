import { supabase } from './supabaseClient'

const TABLE = 'professional_treatments'

export async function getAll() {
  const { data, error } = await supabase.from(TABLE).select('*')
  if (error) throw error
  return data
}

export async function replaceForProfessional(professionalId, treatmentIds) {
  const { error: deleteError } = await supabase.from(TABLE).delete().eq('professional_id', professionalId)
  if (deleteError) throw deleteError
  if (treatmentIds.length === 0) return
  const rows = treatmentIds.map((treatmentId) => ({ professional_id: professionalId, treatment_id: treatmentId }))
  const { error } = await supabase.from(TABLE).insert(rows)
  if (error) throw error
}
