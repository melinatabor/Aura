import profesionalesMock from '../mocks/profesionales.json'
import { resolveAsync, nextId } from './apiClient'

let profesionales = [...profesionalesMock]

export function getAll() {
  return resolveAsync([...profesionales])
}

export function getActivos() {
  return resolveAsync(profesionales.filter((p) => p.estado === 'Activo'))
}

export function getById(id) {
  return resolveAsync(profesionales.find((p) => p.id === Number(id)) ?? null)
}

export function create(data) {
  const nuevo = { id: nextId('profesionales', profesionales), estado: 'Activo', ...data }
  profesionales = [nuevo, ...profesionales]
  return resolveAsync(nuevo)
}

export function update(id, data) {
  profesionales = profesionales.map((p) => (p.id === Number(id) ? { ...p, ...data } : p))
  return resolveAsync(profesionales.find((p) => p.id === Number(id)) ?? null)
}

export function setEstado(id, estado) {
  profesionales = profesionales.map((p) => (p.id === Number(id) ? { ...p, estado } : p))
  return resolveAsync(true)
}
