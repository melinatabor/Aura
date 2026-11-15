export function toReminder(row) {
  return {
    id: row.id,
    alertId: row.operational_alert_id,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    channel: row.channel,
    subject: row.subject,
    message: row.message,
    deliveryStatus: row.delivery_status,
    sentAt: row.sent_at,
  }
}

export function toReminderRow(reminder) {
  return {
    operational_alert_id: reminder.alertId ?? null,
    patient_id: reminder.patientId,
    appointment_id: reminder.appointmentId ?? null,
    channel: reminder.channel,
    subject: reminder.subject ?? '',
    message: reminder.message,
  }
}
