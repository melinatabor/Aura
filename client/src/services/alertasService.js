import alertasAdminMock from '../mocks/alertas.json'
import { resolveAsync, todayISO } from './apiClient'
import * as insumosService from './insumosService'
import * as turnosService from './turnosService'
import * as pacientesService from './pacientesService'
import * as reglasAlertaService from './reglasAlertaService'

const alertasAdmin = [...alertasAdminMock]

// Las alertas de stock bajo y turnos próximos se calculan al vuelo a partir
// de insumos/turnos y de la configuración en Configuración > Reglas de alerta,
// en vez de guardarse como datos fijos — así reflejan siempre el estado real.
export async function getAlertas() {
  const reglas = await reglasAlertaService.getReglas()
  const alertas = []

  if (reglas.alertaStockBajoActiva) {
    const stockBajo = await insumosService.getStockBajo()
    stockBajo.forEach((insumo) => {
      alertas.push({
        id: `stock-${insumo.id}`,
        tipo: 'Stock bajo',
        severidad: insumo.stockActual === 0 ? 'danger' : 'warning',
        titulo: `Stock bajo: ${insumo.nombre}`,
        descripcion: `Quedan ${insumo.stockActual} ${insumo.unidadMedida} (mínimo ${insumo.stockMinimo}).`,
        entidadId: insumo.id,
        fecha: todayISO(),
      })
    })
  }

  if (reglas.alertaTurnosProximosActiva) {
    const proximos = await turnosService.getProximos(reglas.diasAnticipacionTurno)
    const pacientes = await pacientesService.getAll()
    proximos
      .filter((t) => t.estado === 'Pendiente')
      .forEach((turno) => {
        const paciente = pacientes.find((p) => p.id === turno.pacienteId)
        alertas.push({
          id: `turno-${turno.id}`,
          tipo: 'Turno próximo',
          severidad: 'info',
          titulo: `Turno sin confirmar: ${paciente ? `${paciente.nombre} ${paciente.apellido}` : 'Paciente'}`,
          descripcion: `${turno.fecha} ${turno.horaInicio} hs — pendiente de confirmación.`,
          entidadId: turno.id,
          fecha: turno.fecha,
        })
      })
  }

  if (reglas.alertaAdministrativaActiva) {
    alertasAdmin.forEach((alerta) => {
      alertas.push({
        id: `admin-${alerta.id}`,
        tipo: alerta.tipo,
        severidad: alerta.severidad,
        titulo: alerta.titulo,
        descripcion: alerta.descripcion,
        entidadId: alerta.id,
        fecha: todayISO(alerta.diasOffset),
      })
    })
  }

  return alertas
}

export function enviarRecordatorio(alertaId) {
  return resolveAsync({ alertaId, enviado: true })
}
