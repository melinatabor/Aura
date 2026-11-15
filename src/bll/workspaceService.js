import * as workspaceDal from '../dal/workspaceDal'
import { toScheduleRange, toScheduleRangeRow, toWorkspace, toWorkspaceRow } from '../mappers/workspaceMapper'

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export async function get() {
  const row = await workspaceDal.get()
  return toWorkspace(row)
}

export async function update(data) {
  const row = await workspaceDal.update(toWorkspaceRow(data))
  return toWorkspace(row)
}

export async function getScheduleRanges() {
  const rows = await workspaceDal.getScheduleRanges()
  return rows.map(toScheduleRange)
}

export async function saveScheduleRanges(ranges) {
  const invalid = ranges.find((r) => r.isActive && r.closingTime <= r.openingTime)
  if (invalid) throw new Error(`El horario del ${DAY_NAMES[invalid.dayOfWeek]} cierra antes de abrir.`)
  await Promise.all(ranges.map((r) => workspaceDal.updateScheduleRange(r.id, toScheduleRangeRow(r))))
}

// Regla de negocio de la agenda: el turno tiene que caer dentro del horario
// de atención del día. Devuelve el motivo si no se puede, o null si está bien.
export function checkOpeningHours(ranges, { date, startTime, endTime }) {
  const [year, month, day] = date.split('-').map(Number)
  const dayOfWeek = new Date(year, month - 1, day).getDay()
  const range = ranges.find((r) => r.dayOfWeek === dayOfWeek)
  if (!range || !range.isActive) return `El centro no atiende los ${DAY_NAMES[dayOfWeek].toLowerCase()}.`
  if (startTime < range.openingTime || endTime > range.closingTime) {
    return `Ese día el centro atiende de ${range.openingTime} a ${range.closingTime} hs.`
  }
  return null
}
