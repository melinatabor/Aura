import * as patientsDal from '../dal/patientsDal'
import { toPatient, toPatientRow } from '../mappers/patientMapper'

export async function getAll() {
  const rows = await patientsDal.getAll()
  return rows.map(toPatient)
}

export async function getById(id) {
  const row = await patientsDal.getById(id)
  return row ? toPatient(row) : null
}

export async function create(data) {
  const row = await patientsDal.insert(toPatientRow({ ...data, status: 'Activo' }))
  return toPatient(row)
}

export async function update(id, data) {
  const row = await patientsDal.update(id, toPatientRow(data))
  return toPatient(row)
}

export async function setStatus(id, status) {
  await patientsDal.update(id, { status })
  return true
}
