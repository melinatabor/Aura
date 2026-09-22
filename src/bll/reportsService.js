import { resolveAsync, todayISO } from './apiClient'
import * as appointmentsService from './appointmentsService'
import * as treatmentsService from './treatmentsService'
import * as professionalsService from './professionalsService'
import * as patientsService from './patientsService'
import * as operationalReportsDal from '../dal/operationalReportsDal'
import { toOperationalReport, toOperationalReportRow } from '../mappers/operationalReportMapper'

// Reports are calculated from the other modules' real data (appointments,
// treatments, professionals) instead of being stored separately, so they
// always reflect the current state of the operation.
export async function getReports() {
  const [appointments, treatments, professionals, patients] = await Promise.all([
    appointmentsService.getAll(),
    treatmentsService.getAll(),
    professionalsService.getAll(),
    patientsService.getAll(),
  ])

  const completedAppointments = appointments.filter((a) => a.status === 'Realizado')
  const activeAppointments = appointments.filter((a) => a.status !== 'Cancelado')

  const treatmentById = Object.fromEntries(treatments.map((t) => [t.id, t]))

  const revenue = completedAppointments.reduce((total, a) => total + (treatmentById[a.treatmentId]?.price ?? 0), 0)

  const occupancyByProfessional = professionals.map((prof) => ({
    professional: `${prof.firstName} ${prof.lastName}`,
    appointments: activeAppointments.filter((a) => a.professionalId === prof.id).length,
  }))

  const performanceByTreatment = treatments.map((treatment) => {
    const completed = completedAppointments.filter((a) => a.treatmentId === treatment.id)
    return {
      treatment: treatment.name,
      completed: completed.length,
      revenue: completed.length * treatment.price,
    }
  })

  return resolveAsync({
    totalRevenue: revenue,
    completedAppointments: completedAppointments.length,
    activePatients: patients.filter((p) => p.status === 'Activo').length,
    occupancyByProfessional,
    performanceByTreatment,
  })
}

// Guarda una foto del reporte actual como registro consultable (unifica
// operational_report + report_export: acá ambas acciones ocurren juntas,
// al tocar "Exportar reporte").
export async function exportReport(userId) {
  const current = await getReports()
  const today = todayISO()
  const row = await operationalReportsDal.insert(
    toOperationalReportRow({ ...current, periodFrom: today, periodTo: today }, userId),
  )
  return toOperationalReport(row)
}

export async function getExportHistory() {
  const rows = await operationalReportsDal.getAll()
  return rows.map(toOperationalReport)
}

// Ingresos reales por día, para ver la tendencia en vez de solo el total acumulado.
export async function getRevenueTrend(days = 14) {
  const [appointments, treatments] = await Promise.all([appointmentsService.getAll(), treatmentsService.getAll()])
  const treatmentById = Object.fromEntries(treatments.map((t) => [t.id, t]))
  const completed = appointments.filter((a) => a.status === 'Realizado')

  const series = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    const value = completed
      .filter((a) => a.date === iso)
      .reduce((sum, a) => sum + (treatmentById[a.treatmentId]?.price ?? 0), 0)
    series.push({ date: iso, value })
  }
  return resolveAsync(series)
}
