import tratamientosMock from '../mocks/tratamientos.json'
import tratamientoInsumosMock from '../mocks/tratamientoInsumos.json'
import { resolveAsync, nextId } from './apiClient'

let tratamientos = [...tratamientosMock]
let tratamientoInsumos = [...tratamientoInsumosMock]

export function getAll() {
  return resolveAsync([...tratamientos])
}

export function getActivos() {
  return resolveAsync(tratamientos.filter((t) => t.estado === 'Activo'))
}

export function getById(id) {
  return resolveAsync(tratamientos.find((t) => t.id === Number(id)) ?? null)
}

export function create(data) {
  const nuevo = { id: nextId('tratamientos', tratamientos), estado: 'Activo', ...data }
  tratamientos = [nuevo, ...tratamientos]
  return resolveAsync(nuevo)
}

export function update(id, data) {
  tratamientos = tratamientos.map((t) => (t.id === Number(id) ? { ...t, ...data } : t))
  return resolveAsync(tratamientos.find((t) => t.id === Number(id)) ?? null)
}

export function setEstado(id, estado) {
  tratamientos = tratamientos.map((t) => (t.id === Number(id) ? { ...t, estado } : t))
  return resolveAsync(true)
}

export function getInsumosDeTratamiento(tratamientoId) {
  return resolveAsync(tratamientoInsumos.filter((ti) => ti.tratamientoId === Number(tratamientoId)))
}

export function setInsumosDeTratamiento(tratamientoId, relaciones) {
  tratamientoInsumos = [
    ...tratamientoInsumos.filter((ti) => ti.tratamientoId !== Number(tratamientoId)),
    ...relaciones.map((r) => ({ id: nextId('tratamientoInsumos', tratamientoInsumos), tratamientoId: Number(tratamientoId), ...r })),
  ]
  return resolveAsync(true)
}
