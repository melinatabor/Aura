import * as operationalAlertsDal from '../dal/operationalAlertsDal'
import { toOperationalAlert, toOperationalAlertRow } from '../mappers/operationalAlertMapper'
import * as alertRulesService from './alertRulesService'

export const PRIORITY_ORDER = { Alta: 0, Media: 1, Baja: 2 }

// Antes de leer, la base recalcula las alertas de stock y de turnos con los
// datos actuales (y resuelve solas las que ya no aplican). Las alertas quedan
// guardadas, así se puede marcar cuáles se atendieron y mantener historial.
export async function getOpenAlerts() {
  await operationalAlertsDal.sync()
  const [rows, rules] = await Promise.all([operationalAlertsDal.getOpen(), alertRulesService.getRules()])
  return rows
    .map(toOperationalAlert)
    .filter((a) => rules.administrativeAlertEnabled || a.type !== 'Administrativa')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
}

export async function getResolvedAlerts() {
  const rows = await operationalAlertsDal.getResolved()
  return rows.map(toOperationalAlert)
}

export async function createAdministrative(data) {
  const row = await operationalAlertsDal.insert(toOperationalAlertRow({ ...data, type: 'Administrativa' }))
  return toOperationalAlert(row)
}

export async function markAttended(id, userId) {
  await operationalAlertsDal.update(id, { status: 'Atendida', managed_by: userId, managed_at: new Date().toISOString() })
}

export async function resolve(id, userId) {
  const now = new Date().toISOString()
  await operationalAlertsDal.update(id, { status: 'Resuelta', managed_by: userId, managed_at: now, resolved_at: now })
}
