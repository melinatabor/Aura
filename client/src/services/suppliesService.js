import suppliesMock from '../mocks/supplies.json'
import { resolveAsync, nextId } from './apiClient'

let supplies = [...suppliesMock]

export function getAll() {
  return resolveAsync([...supplies])
}

export function getById(id) {
  return resolveAsync(supplies.find((s) => s.id === Number(id)) ?? null)
}

export function getLowStock() {
  return resolveAsync(supplies.filter((s) => s.status === 'Activo' && s.currentStock <= s.minStock))
}

export function create(data) {
  const created = { id: nextId('supplies', supplies), status: 'Activo', ...data }
  supplies = [created, ...supplies]
  return resolveAsync(created)
}

export function update(id, data) {
  supplies = supplies.map((s) => (s.id === Number(id) ? { ...s, ...data } : s))
  return resolveAsync(supplies.find((s) => s.id === Number(id)) ?? null)
}

export function adjustStock(id, newStock) {
  supplies = supplies.map((s) => (s.id === Number(id) ? { ...s, currentStock: Math.max(0, newStock) } : s))
  return resolveAsync(supplies.find((s) => s.id === Number(id)) ?? null)
}

export function setStatus(id, status) {
  supplies = supplies.map((s) => (s.id === Number(id) ? { ...s, status } : s))
  return resolveAsync(true)
}
