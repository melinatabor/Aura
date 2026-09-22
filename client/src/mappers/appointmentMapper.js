export function toAppointment(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    professionalId: row.professional_id,
    treatmentId: row.treatment_id,
    date: row.date,
    startTime: row.start_time?.slice(0, 5),
    endTime: row.end_time?.slice(0, 5),
    status: row.status,
    notes: row.notes ?? '',
  }
}

export function toAppointmentRow(appointment) {
  const row = {}
  if (appointment.patientId !== undefined) row.patient_id = appointment.patientId
  if (appointment.professionalId !== undefined) row.professional_id = appointment.professionalId
  if (appointment.treatmentId !== undefined) row.treatment_id = appointment.treatmentId
  if (appointment.date !== undefined) row.date = appointment.date
  if (appointment.startTime !== undefined) row.start_time = appointment.startTime
  if (appointment.endTime !== undefined) row.end_time = appointment.endTime
  if (appointment.status !== undefined) row.status = appointment.status
  if (appointment.notes !== undefined) row.notes = appointment.notes
  return row
}
