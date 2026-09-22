export function toTreatment(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    price: Number(row.price),
    category: row.category,
    status: row.status,
  }
}

export function toTreatmentRow(treatment) {
  return {
    name: treatment.name,
    description: treatment.description,
    duration_minutes: treatment.durationMinutes,
    price: treatment.price,
    category: treatment.category,
    ...(treatment.status ? { status: treatment.status } : {}),
  }
}

export function toTreatmentSupply(row) {
  return {
    id: row.id,
    treatmentId: row.treatment_id,
    supplyId: row.supply_id,
    quantity: row.quantity,
  }
}

export function toTreatmentSupplyRow(relation, treatmentId) {
  return {
    treatment_id: treatmentId,
    supply_id: relation.supplyId,
    quantity: relation.quantity,
  }
}
