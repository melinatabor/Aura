import patientsMock from '../mocks/patients.json'
import { resolveAsync, nextId, todayISO } from './apiClient'

let patients = [...patientsMock]

export function getAll() {
  return resolveAsync([...patients])
}

export function getById(id) {
  return resolveAsync(patients.find((p) => p.id === Number(id)) ?? null)
}

export function create(data) {
  const created = {
    id: nextId('patients', patients),
    status: 'Activo',
    registeredAt: todayISO(),
    ...data,
  }
  patients = [created, ...patients]
  return resolveAsync(created)
}

export function update(id, data) {
  patients = patients.map((p) => (p.id === Number(id) ? { ...p, ...data } : p))
  return resolveAsync(patients.find((p) => p.id === Number(id)) ?? null)
}

export function setStatus(id, status) {
  patients = patients.map((p) => (p.id === Number(id) ? { ...p, status } : p))
  return resolveAsync(true)
}
