import * as professionalsDal from '../dal/professionalsDal'
import * as professionalTreatmentsDal from '../dal/professionalTreatmentsDal'
import { toProfessional, toProfessionalRow } from '../mappers/professionalMapper'

export async function getAll() {
  const rows = await professionalsDal.getAll()
  return rows.map(toProfessional)
}

export async function getActive() {
  const all = await getAll()
  return all.filter((p) => p.status === 'Activo')
}

export async function create(data) {
  const row = await professionalsDal.insert(toProfessionalRow({ ...data, status: 'Activo' }))
  return toProfessional(row)
}

export async function update(id, data) {
  const row = await professionalsDal.update(id, toProfessionalRow(data))
  return toProfessional(row)
}

export async function setStatus(id, status) {
  await professionalsDal.update(id, { status })
  return true
}

// { [professionalId]: [treatmentId, ...] }
export async function getTreatmentAssignments() {
  const rows = await professionalTreatmentsDal.getAll()
  return rows.reduce((map, row) => {
    map[row.professional_id] = [...(map[row.professional_id] ?? []), row.treatment_id]
    return map
  }, {})
}

export async function setTreatments(professionalId, treatmentIds) {
  await professionalTreatmentsDal.replaceForProfessional(professionalId, treatmentIds)
}
