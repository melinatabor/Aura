import appointmentsMock from '../mocks/appointments.json'
import { resolveAsync, nextId, todayISO } from './apiClient'

// Mocked appointments use "dayOffset" relative to today instead of fixed
// dates, so the sample schedule always shows current appointments no matter when the app runs.
let appointments = appointmentsMock.map(({ dayOffset, ...appointment }) => ({
  ...appointment,
  date: todayISO(dayOffset),
}))

export function getAll() {
  return resolveAsync([...appointments])
}

export function getById(id) {
  return resolveAsync(appointments.find((a) => a.id === Number(id)) ?? null)
}

export function getByDateRange(from, to) {
  return resolveAsync(appointments.filter((a) => a.date >= from && a.date <= to))
}

export function getToday() {
  const today = todayISO()
  return resolveAsync(appointments.filter((a) => a.date === today))
}

export function getUpcoming(days) {
  const today = todayISO()
  const limit = todayISO(days)
  return resolveAsync(appointments.filter((a) => a.date >= today && a.date <= limit && a.status !== 'Cancelado'))
}

export function create(data) {
  const created = { id: nextId('appointments', appointments), status: 'Pendiente', notes: '', ...data }
  appointments = [created, ...appointments]
  return resolveAsync(created)
}

export function update(id, data) {
  appointments = appointments.map((a) => (a.id === Number(id) ? { ...a, ...data } : a))
  return resolveAsync(appointments.find((a) => a.id === Number(id)) ?? null)
}

export function setStatus(id, status) {
  appointments = appointments.map((a) => (a.id === Number(id) ? { ...a, status } : a))
  return resolveAsync(true)
}

export function remove(id) {
  appointments = appointments.filter((a) => a.id !== Number(id))
  return resolveAsync(true)
}

// Minimal business rule for this phase (full real validation comes with the backend phase):
// prevents overlapping schedules for the same professional.
export function hasOverlap({ professionalId, date, startTime, endTime, excludeId }) {
  const conflict = appointments.some(
    (a) =>
      a.id !== Number(excludeId) &&
      a.professionalId === Number(professionalId) &&
      a.date === date &&
      a.status !== 'Cancelado' &&
      startTime < a.endTime &&
      endTime > a.startTime,
  )
  return resolveAsync(conflict)
}
