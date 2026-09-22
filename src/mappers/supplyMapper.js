export function toSupply(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    currentStock: row.current_stock,
    minStock: row.min_stock,
    unit: row.unit,
    category: row.category,
    price: row.price === null ? 0 : Number(row.price),
    status: row.status,
  }
}

export function toSupplyRow(supply) {
  return {
    name: supply.name,
    description: supply.description,
    current_stock: supply.currentStock,
    min_stock: supply.minStock,
    unit: supply.unit,
    category: supply.category,
    price: supply.price,
    ...(supply.status ? { status: supply.status } : {}),
  }
}
