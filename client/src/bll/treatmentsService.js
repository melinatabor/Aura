import * as treatmentsDal from '../dal/treatmentsDal'
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
