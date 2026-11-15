import * as remindersDal from '../dal/remindersDal'
import { toReminder, toReminderRow } from '../mappers/reminderMapper'
import * as alertsService from './alertsService'

export async function getAll() {
  const rows = await remindersDal.getAll()
  return rows.map(toReminder)
}

export function buildDefaultMessage({ patient, appointment, treatmentName, centerName }) {
  const date = appointment.date.split('-').reverse().slice(0, 2).join('/')
  return (
    `Hola ${patient.firstName}! Te recordamos tu turno de ${treatmentName} el ${date} a las ` +
    `${appointment.startTime} hs en ${centerName}. ¿Nos confirmás tu asistencia? ¡Gracias!`
  )
}

// No hay proveedor de SMS ni de correo: el recordatorio se abre ya escrito en
// WhatsApp o en el cliente de correo, y la app guarda el registro del envío.
export function buildChannelLink({ channel, patient, subject, message }) {
  if (channel === 'WhatsApp') {
    const phone = (patient.phone ?? '').replace(/\D/g, '')
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }
  return `mailto:${patient.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
}

export async function send({ alert, patient, appointment, channel, subject, message, userId }) {
  const row = await remindersDal.insert(
    toReminderRow({
      alertId: alert?.id,
      patientId: patient.id,
      appointmentId: appointment?.id,
      channel,
      subject,
      message,
    }),
  )
  if (alert) await alertsService.markAttended(alert.id, userId)
  return toReminder(row)
}
