import * as professionalsDal from '../dal/professionalsDal'
import { toProfessional, toProfessionalRow } from '../mappers/professionalMapper'

export async function getAll() {
  const rows = await professionalsDal.getAll()
  return rows.map(toProfessional)
}

export async function getActive() {
  const all = await getAll()
  return all.filter((p) => p.status === 'Activo')
}

export async function getById(id) {
  const row = await professionalsDal.getById(id)
  return row ? toProfessional(row) : null
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
