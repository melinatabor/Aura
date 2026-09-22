import { supabase } from './supabaseClient'

const TABLE = 'treatment_recommendations'

export async function getForTreatment(treatmentOriginId) {
  const { data, error } = await supabase.from(TABLE).select('*').eq('treatment_origin_id', treatmentOriginId)
  if (error) throw error
  return data
}

export async function replaceForTreatment(treatmentOriginId, recommendedIds) {
  const { error: deleteError } = await supabase.from(TABLE).delete().eq('treatment_origin_id', treatmentOriginId)
  if (deleteError) throw deleteError

  if (recommendedIds.length === 0) return []

  const rows = recommendedIds.map((treatmentRecommendedId, index) => ({
    treatment_origin_id: treatmentOriginId,
    treatment_recommended_id: treatmentRecommendedId,
    relation_sequence: index + 1,
  }))

  const { data, error } = await supabase.from(TABLE).insert(rows).select()
  if (error) throw error
  return data
}
