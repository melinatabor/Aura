import pacientesMock from '../mocks/pacientes.json'
import { resolveAsync, nextId, todayISO } from './apiClient'

let pacientes = [...pacientesMock]

export function getAll() {
  return resolveAsync([...pacientes])
}

export function getById(id) {
  return resolveAsync(pacientes.find((p) => p.id === Number(id)) ?? null)
}

export function create(data) {
  const nuevo = {
    id: nextId('pacientes', pacientes),
    estado: 'Activo',
    fechaAlta: todayISO(),
    ...data,
  }
  pacientes = [nuevo, ...pacientes]
  return resolveAsync(nuevo)
}

export function update(id, data) {
  pacientes = pacientes.map((p) => (p.id === Number(id) ? { ...p, ...data } : p))
  return resolveAsync(pacientes.find((p) => p.id === Number(id)) ?? null)
}

export function setEstado(id, estado) {
  pacientes = pacientes.map((p) => (p.id === Number(id) ? { ...p, estado } : p))
  return resolveAsync(true)
}
