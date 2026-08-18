import professionalsMock from '../mocks/professionals.json'
import { resolveAsync, nextId } from './apiClient'

let professionals = [...professionalsMock]

export function getAll() {
  return resolveAsync([...professionals])
}

export function getActive() {
  return resolveAsync(professionals.filter((p) => p.status === 'Activo'))
}

export function getById(id) {
  return resolveAsync(professionals.find((p) => p.id === Number(id)) ?? null)
}

export function create(data) {
  const created = { id: nextId('professionals', professionals), status: 'Activo', ...data }
  professionals = [created, ...professionals]
  return resolveAsync(created)
}

export function update(id, data) {
  professionals = professionals.map((p) => (p.id === Number(id) ? { ...p, ...data } : p))
  return resolveAsync(professionals.find((p) => p.id === Number(id)) ?? null)
}

export function setStatus(id, status) {
  professionals = professionals.map((p) => (p.id === Number(id) ? { ...p, status } : p))
  return resolveAsync(true)
}
