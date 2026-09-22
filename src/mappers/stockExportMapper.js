export function toStockExport(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    lowStockCount: row.low_stock_count,
    totalSupplies: row.total_supplies,
    totalValue: Number(row.total_value),
    snapshot: row.snapshot ?? [],
  }
}

export function toStockExportRow(data, userId) {
  return {
    generated_by: userId,
    low_stock_count: data.lowStockCount,
    total_supplies: data.totalSupplies,
    total_value: data.totalValue,
    snapshot: data.snapshot,
  }
}
