import { resolveAsync } from './apiClient'
import * as turnosService from './turnosService'
import * as tratamientosService from './tratamientosService'
import * as profesionalesService from './profesionalesService'
import * as pacientesService from './pacientesService'

// Los reportes se calculan a partir de los datos reales de los otros
// módulos (turnos, tratamientos, profesionales) en vez de guardarse aparte,
// para que reflejen siempre el estado actual de la operación.
export async function getReportes() {
  const [turnos, tratamientos, profesionales, pacientes] = await Promise.all([
    turnosService.getAll(),
    tratamientosService.getAll(),
    profesionalesService.getAll(),
    pacientesService.getAll(),
  ])

  const turnosRealizados = turnos.filter((t) => t.estado === 'Realizado')
  const turnosVigentes = turnos.filter((t) => t.estado !== 'Cancelado')

  const tratamientoPorId = Object.fromEntries(tratamientos.map((t) => [t.id, t]))

  const ingresos = turnosRealizados.reduce((total, t) => total + (tratamientoPorId[t.tratamientoId]?.precio ?? 0), 0)

  const ocupacionPorProfesional = profesionales.map((prof) => ({
    profesional: `${prof.nombre} ${prof.apellido}`,
    turnos: turnosVigentes.filter((t) => t.profesionalId === prof.id).length,
  }))

  const desempenoPorTratamiento = tratamientos.map((trat) => {
    const realizados = turnosRealizados.filter((t) => t.tratamientoId === trat.id)
    return {
      tratamiento: trat.nombre,
      realizados: realizados.length,
      ingresos: realizados.length * trat.precio,
    }
  })

  return resolveAsync({
    ingresosTotales: ingresos,
    turnosRealizados: turnosRealizados.length,
    clientesActivos: pacientes.filter((p) => p.estado === 'Activo').length,
    ocupacionPorProfesional,
    desempenoPorTratamiento,
  })
}
