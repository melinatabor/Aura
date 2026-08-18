import insumosMock from '../mocks/insumos.json'
import { resolveAsync, nextId } from './apiClient'

let insumos = [...insumosMock]

export function getAll() {
  return resolveAsync([...insumos])
}

export function getById(id) {
  return resolveAsync(insumos.find((i) => i.id === Number(id)) ?? null)
}

export function getStockBajo() {
  return resolveAsync(insumos.filter((i) => i.estado === 'Activo' && i.stockActual <= i.stockMinimo))
}

export function create(data) {
  const nuevo = { id: nextId('insumos', insumos), estado: 'Activo', ...data }
  insumos = [nuevo, ...insumos]
  return resolveAsync(nuevo)
}

export function update(id, data) {
  insumos = insumos.map((i) => (i.id === Number(id) ? { ...i, ...data } : i))
  return resolveAsync(insumos.find((i) => i.id === Number(id)) ?? null)
}

export function ajustarStock(id, nuevoStock) {
  insumos = insumos.map((i) => (i.id === Number(id) ? { ...i, stockActual: Math.max(0, nuevoStock) } : i))
  return resolveAsync(insumos.find((i) => i.id === Number(id)) ?? null)
}

export function setEstado(id, estado) {
  insumos = insumos.map((i) => (i.id === Number(id) ? { ...i, estado } : i))
  return resolveAsync(true)
}
