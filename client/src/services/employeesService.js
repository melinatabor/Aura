import employeesMock from '../mocks/employees.json'
import { resolveAsync, nextId } from './apiClient'

let employees = [...employeesMock]

export function getAll() {
  return resolveAsync([...employees])
}

export function getById(id) {
  return resolveAsync(employees.find((e) => e.id === Number(id)) ?? null)
}

export function create(data) {
  const created = { id: nextId('employees', employees), status: 'Activo', role: 'Operador', ...data }
  employees = [created, ...employees]
  return resolveAsync(created)
}

export function update(id, data) {
  employees = employees.map((e) => (e.id === Number(id) ? { ...e, ...data } : e))
  return resolveAsync(employees.find((e) => e.id === Number(id)) ?? null)
}

export function setStatus(id, status) {
  employees = employees.map((e) => (e.id === Number(id) ? { ...e, status } : e))
  return resolveAsync(true)
}

export function remove(id) {
  employees = employees.filter((e) => e.id !== Number(id))
  return resolveAsync(true)
}
