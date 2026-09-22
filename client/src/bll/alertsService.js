import adminAlertsMock from '../mocks/alerts.json'
import { resolveAsync, todayISO } from './apiClient'
import * as suppliesService from './suppliesService'
import * as appointmentsService from './appointmentsService'
import * as patientsService from './patientsService'
import * as alertRulesService from './alertRulesService'

const adminAlerts = [...adminAlertsMock]

// Low-stock and upcoming-appointment alerts are computed on the fly from
// supplies/appointments and the settings in Settings > Alert Rules,
// instead of being stored as fixed data — so they always reflect the real state.
export async function getAlerts() {
  const rules = await alertRulesService.getRules()
  const alerts = []

  if (rules.lowStockAlertEnabled) {
    const lowStock = await suppliesService.getLowStock()
    lowStock.forEach((supply) => {
      alerts.push({
        id: `stock-${supply.id}`,
        type: 'Stock bajo',
        severity: supply.currentStock === 0 ? 'danger' : 'warning',
        title: `Stock bajo: ${supply.name}`,
        description: `Quedan ${supply.currentStock} ${supply.unit} (mínimo ${supply.minStock}).`,
        entityId: supply.id,
        date: todayISO(),
      })
    })
  }

  if (rules.upcomingAppointmentAlertEnabled) {
    const upcoming = await appointmentsService.getUpcoming(rules.upcomingAppointmentDays)
    const patients = await patientsService.getAll()
    upcoming
      .filter((a) => a.status === 'Pendiente')
      .forEach((appointment) => {
        const patient = patients.find((p) => p.id === appointment.patientId)
        alerts.push({
          id: `appointment-${appointment.id}`,
          type: 'Turno próximo',
          severity: 'info',
          title: `Turno sin confirmar: ${patient ? `${patient.firstName} ${patient.lastName}` : 'Paciente'}`,
          description: `${appointment.date} ${appointment.startTime} hs — pendiente de confirmación.`,
          entityId: appointment.id,
          date: appointment.date,
        })
      })
  }

  if (rules.administrativeAlertEnabled) {
    adminAlerts.forEach((alert) => {
      alerts.push({
        id: `admin-${alert.id}`,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        entityId: alert.id,
        date: todayISO(alert.dayOffset),
      })
    })
  }

  return alerts
}

export function sendReminder(alertId) {
  return resolveAsync({ alertId, sent: true })
}
