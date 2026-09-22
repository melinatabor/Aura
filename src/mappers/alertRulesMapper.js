export function toAlertRules(row) {
  return {
    upcomingAppointmentDays: row.upcoming_appointment_days,
    lowStockAlertEnabled: row.low_stock_alert_enabled,
    upcomingAppointmentAlertEnabled: row.upcoming_appointment_alert_enabled,
    administrativeAlertEnabled: row.administrative_alert_enabled,
  }
}

export function toAlertRulesRow(rules) {
  const row = {}
  if (rules.upcomingAppointmentDays !== undefined) row.upcoming_appointment_days = rules.upcomingAppointmentDays
  if (rules.lowStockAlertEnabled !== undefined) row.low_stock_alert_enabled = rules.lowStockAlertEnabled
  if (rules.upcomingAppointmentAlertEnabled !== undefined) row.upcoming_appointment_alert_enabled = rules.upcomingAppointmentAlertEnabled
  if (rules.administrativeAlertEnabled !== undefined) row.administrative_alert_enabled = rules.administrativeAlertEnabled
  return row
}
