import turnosMock from '../mocks/turnos.json'
import { resolveAsync, nextId, todayISO } from './apiClient'

// Los turnos mockeados usan "diasOffset" relativo a hoy en vez de fechas fijas,
// así la agenda de ejemplo siempre muestra turnos vigentes sin importar cuándo se corra la app.
let turnos = turnosMock.map(({ diasOffset, ...turno }) => ({
  ...turno,
  fecha: todayISO(diasOffset),
}))

export function getAll() {
  return resolveAsync([...turnos])
}

export function getById(id) {
  return resolveAsync(turnos.find((t) => t.id === Number(id)) ?? null)
}

export function getByRangoFechas(desde, hasta) {
  return resolveAsync(turnos.filter((t) => t.fecha >= desde && t.fecha <= hasta))
}

export function getDeHoy() {
  const hoy = todayISO()
  return resolveAsync(turnos.filter((t) => t.fecha === hoy))
}

export function getProximos(dias) {
  const hoy = todayISO()
  const limite = todayISO(dias)
  return resolveAsync(turnos.filter((t) => t.fecha >= hoy && t.fecha <= limite && t.estado !== 'Cancelado'))
}

export function create(data) {
  const nuevo = { id: nextId('turnos', turnos), estado: 'Pendiente', observaciones: '', ...data }
  turnos = [nuevo, ...turnos]
  return resolveAsync(nuevo)
}

export function update(id, data) {
  turnos = turnos.map((t) => (t.id === Number(id) ? { ...t, ...data } : t))
  return resolveAsync(turnos.find((t) => t.id === Number(id)) ?? null)
}

export function setEstado(id, estado) {
  turnos = turnos.map((t) => (t.id === Number(id) ? { ...t, estado } : t))
  return resolveAsync(true)
}

export function remove(id) {
  turnos = turnos.filter((t) => t.id !== Number(id))
  return resolveAsync(true)
}

// Reglas de negocio mínimas para esta fase (validación real completa queda para la fase de backend):
// evita superponer horarios del mismo profesional en la misma fecha.
export function haySuperposicion({ profesionalId, fecha, horaInicio, horaFin, idExcluir }) {
  const conflicto = turnos.some(
    (t) =>
      t.id !== Number(idExcluir) &&
      t.profesionalId === Number(profesionalId) &&
      t.fecha === fecha &&
      t.estado !== 'Cancelado' &&
      horaInicio < t.horaFin &&
      horaFin > t.horaInicio,
  )
  return resolveAsync(conflicto)
}
