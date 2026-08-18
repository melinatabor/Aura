import { resolveAsync } from './apiClient'
import * as appointmentsService from './appointmentsService'
import * as treatmentsService from './treatmentsService'
import * as professionalsService from './professionalsService'
import * as patientsService from './patientsService'

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
