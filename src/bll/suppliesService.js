import * as suppliesDal from '../dal/suppliesDal'
import * as stockExportsDal from '../dal/stockExportsDal'
import { toSupply, toSupplyRow } from '../mappers/supplyMapper'
import { toStockExport, toStockExportRow } from '../mappers/stockExportMapper'

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

// Guarda una foto del inventario actual como registro consultable (stock_export).
export async function exportStock(userId) {
  const all = await getAll()
  const lowStock = all.filter((s) => s.status === 'Activo' && s.currentStock <= s.minStock)
  const totalValue = all.reduce((sum, s) => sum + s.currentStock * (s.price ?? 0), 0)
  const snapshot = all.map((s) => ({ name: s.name, currentStock: s.currentStock, minStock: s.minStock, unit: s.unit }))

  const row = await stockExportsDal.insert(
    toStockExportRow({ lowStockCount: lowStock.length, totalSupplies: all.length, totalValue, snapshot }, userId),
  )
  return toStockExport(row)
}

export async function getExportHistory() {
  const rows = await stockExportsDal.getAll()
  return rows.map(toStockExport)
}
