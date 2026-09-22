import * as suppliesDal from '../dal/suppliesDal'
import { toSupply, toSupplyRow } from '../mappers/supplyMapper'

export async function getAll() {
  const rows = await suppliesDal.getAll()
  return rows.map(toSupply)
}

export async function getById(id) {
  const row = await suppliesDal.getById(id)
  return row ? toSupply(row) : null
}

export async function getLowStock() {
  const all = await getAll()
  return all.filter((s) => s.status === 'Activo' && s.currentStock <= s.minStock)
}

export async function create(data) {
  const row = await suppliesDal.insert(toSupplyRow({ ...data, status: 'Activo' }))
  return toSupply(row)
}

export async function update(id, data) {
  const row = await suppliesDal.update(id, toSupplyRow(data))
  return toSupply(row)
}

export async function adjustStock(id, newStock) {
  const row = await suppliesDal.update(id, { current_stock: Math.max(0, newStock) })
  return toSupply(row)
}

export async function setStatus(id, status) {
  await suppliesDal.update(id, { status })
  return true
}
