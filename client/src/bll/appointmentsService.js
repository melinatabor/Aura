import * as appointmentsDal from '../dal/appointmentsDal'
import { toAppointment, toAppointmentRow } from '../mappers/appointmentMapper'
import { todayISO } from './apiClient'

export async function getAll() {
  const rows = await appointmentsDal.getAll()
  return rows.map(toAppointment)
}

export async function getById(id) {
  const row = await appointmentsDal.getById(id)
  return row ? toAppointment(row) : null
}

export async function getByDateRange(from, to) {
  const rows = await appointmentsDal.getByDateRange(from, to)
  return rows.map(toAppointment)
}

export async function getToday() {
  const today = todayISO()
  return getByDateRange(today, today)
}

export async function getUpcoming(days) {
  const today = todayISO()
  const limit = todayISO(days)
  const rows = await getByDateRange(today, limit)
  return rows.filter((a) => a.status !== 'Cancelado')
}

export async function create(data) {
  const row = await appointmentsDal.insert(toAppointmentRow({ status: 'Pendiente', notes: '', ...data }))
  return toAppointment(row)
}

export async function update(id, data) {
  const row = await appointmentsDal.update(id, toAppointmentRow(data))
  return toAppointment(row)
}

export async function setStatus(id, status) {
  await appointmentsDal.update(id, { status })
  return true
}

export async function remove(id) {
  await appointmentsDal.remove(id)
  return true
}

// Business rule: prevents overlapping schedules for the same professional.
export async function hasOverlap({ professionalId, date, startTime, endTime, excludeId }) {
  const rows = await appointmentsDal.getByProfessionalAndDate(professionalId, date)
  return rows.some((row) => {
    const a = toAppointment(row)
    return a.id !== Number(excludeId) && a.status !== 'Cancelado' && startTime < a.endTime && endTime > a.startTime
  })
}
