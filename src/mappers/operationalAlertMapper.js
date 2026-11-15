export function toOperationalAlert(row) {
  return {
    id: row.id,
    type: row.type,
    priority: row.priority,
    title: row.title,
    detail: row.detail,
    status: row.status,
    supplyId: row.supply_id,
    appointmentId: row.appointment_id,
    patientId: row.patient_id,
    createdAt: row.created_at,
    managedAt: row.managed_at,
    resolvedAt: row.resolved_at,
  }
}

export function toOperationalAlertRow(alert) {
  return {
    type: alert.type,
    priority: alert.priority,
    title: alert.title,
    detail: alert.detail ?? '',
  }
}
