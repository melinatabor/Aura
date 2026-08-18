import empleadosMock from '../mocks/empleados.json'
import { resolveAsync, nextId } from './apiClient'

let empleados = [...empleadosMock]

export function getAll() {
  return resolveAsync([...empleados])
}

export function getById(id) {
  return resolveAsync(empleados.find((e) => e.id === Number(id)) ?? null)
}

export function create(data) {
  const nuevo = { id: nextId('empleados', empleados), estado: 'Activo', rol: 'Operador', ...data }
  empleados = [nuevo, ...empleados]
  return resolveAsync(nuevo)
}

export function update(id, data) {
  empleados = empleados.map((e) => (e.id === Number(id) ? { ...e, ...data } : e))
  return resolveAsync(empleados.find((e) => e.id === Number(id)) ?? null)
}

export function setEstado(id, estado) {
  empleados = empleados.map((e) => (e.id === Number(id) ? { ...e, estado } : e))
  return resolveAsync(true)
}

export function remove(id) {
  empleados = empleados.filter((e) => e.id !== Number(id))
  return resolveAsync(true)
}
