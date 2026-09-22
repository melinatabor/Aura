export function toOperationalReport(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    periodFrom: row.period_from,
    periodTo: row.period_to,
    totalRevenue: Number(row.total_revenue),
    completedAppointments: row.completed_appointments,
    activePatients: row.active_patients,
    occupancyByProfessional: row.occupancy_by_professional ?? [],
    performanceByTreatment: row.performance_by_treatment ?? [],
  }
}

export function toOperationalReportRow(report, userId) {
  return {
    generated_by: userId,
    period_from: report.periodFrom,
    period_to: report.periodTo,
    total_revenue: report.totalRevenue,
    completed_appointments: report.completedAppointments,
    active_patients: report.activePatients,
    occupancy_by_professional: report.occupancyByProfessional,
    performance_by_treatment: report.performanceByTreatment,
  }
}
