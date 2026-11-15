import * as treatmentsDal from '../dal/treatmentsDal'
import * as treatmentRecommendationsDal from '../dal/treatmentRecommendationsDal'
import { toTreatment, toTreatmentRow, toTreatmentSupply, toTreatmentSupplyRow } from '../mappers/treatmentMapper'

export async function getAll() {
  const rows = await treatmentsDal.getAll()
  return rows.map(toTreatment)
}

export async function getActive() {
  const all = await getAll()
  return all.filter((t) => t.status === 'Activo')
}

export async function getById(id) {
  const row = await treatmentsDal.getById(id)
  return row ? toTreatment(row) : null
}

export async function create(data) {
  const row = await treatmentsDal.insert(toTreatmentRow({ ...data, status: 'Activo' }))
  return toTreatment(row)
}

export async function update(id, data) {
  const row = await treatmentsDal.update(id, toTreatmentRow(data))
  return toTreatment(row)
}

export async function setStatus(id, status) {
  await treatmentsDal.update(id, { status })
  return true
}

export async function getSuppliesForTreatment(treatmentId) {
  const rows = await treatmentsDal.getSuppliesForTreatment(treatmentId)
  return rows.map(toTreatmentSupply)
}

export async function setSuppliesForTreatment(treatmentId, relations) {
  const rows = relations.map((r) => toTreatmentSupplyRow(r, treatmentId))
  await treatmentsDal.replaceSuppliesForTreatment(treatmentId, rows)
  return true
}

// Tratamientos que suelen recomendarse junto con otro (ej. "quienes hacen
// Limpieza facial también suelen pedir Peeling"), como registros reales
// en la tabla treatment_recommendations en vez de una regla fija en código.
export async function getRecommendationsForTreatment(treatmentId) {
  const [relations, allTreatments] = await Promise.all([
    treatmentRecommendationsDal.getForTreatment(treatmentId),
    getAll(),
  ])
  return relations
    .map((r) => allTreatments.find((t) => t.id === r.treatment_recommended_id))
    .filter(Boolean)
}

// Para la ficha de un cliente: tratamientos que suelen combinarse con los que
// ya se hizo y que todavía no probó.
export async function getSuggestionsFor(doneTreatmentIds) {
  const [relations, allTreatments] = await Promise.all([treatmentRecommendationsDal.getAll(), getActive()])
  const suggestions = new Map()
  relations
    .filter((r) => doneTreatmentIds.includes(r.treatment_origin_id) && !doneTreatmentIds.includes(r.treatment_recommended_id))
    .forEach((r) => {
      const treatment = allTreatments.find((t) => t.id === r.treatment_recommended_id)
      const because = allTreatments.find((t) => t.id === r.treatment_origin_id)
      if (treatment && !suggestions.has(treatment.id)) suggestions.set(treatment.id, { treatment, because })
    })
  return [...suggestions.values()]
}

export async function setRecommendationsForTreatment(treatmentId, recommendedIds) {
  await treatmentRecommendationsDal.replaceForTreatment(treatmentId, recommendedIds)
  return true
}
