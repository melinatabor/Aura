import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as reglasAlertaService from '../../services/reglasAlertaService'
import './Configuracion.scss'

export default function ConfiguracionOperativa() {
  const [reglas, setReglas] = useState(null)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    reglasAlertaService.getReglas().then(setReglas)
  }, [])

  if (!reglas) return null

  function handleChange(campo, valor) {
    setReglas((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await reglasAlertaService.updateReglas(reglas)
    setGuardado(true)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Configuración operativa</h1>
        <p>Definí los parámetros generales que usa AURA para calcular las alertas del sistema.</p>
      </div>

      <form className="configuracion-grid" onSubmit={handleSubmit}>
        <section className="aura-card">
          <h2 className="section-title">Reglas de alerta de turnos</h2>
          <div className="form-group">
            <label htmlFor="dias">Días de anticipación para "turno próximo"</label>
            <input
              id="dias"
              type="number"
              min="1"
              max="14"
              value={reglas.diasAnticipacionTurno}
              onChange={(e) => handleChange('diasAnticipacionTurno', Number(e.target.value))}
            />
            <span className="field-hint">Un turno pendiente dentro de este rango de días genera una alerta.</span>
          </div>
          <label className="configuracion-checkbox">
            <input
              type="checkbox"
              checked={reglas.alertaTurnosProximosActiva}
              onChange={(e) => handleChange('alertaTurnosProximosActiva', e.target.checked)}
            />
            Habilitar alertas de turnos próximos
          </label>
        </section>

        <section className="aura-card">
          <h2 className="section-title">Reglas de alerta de insumos</h2>
          <p className="field-hint" style={{ marginBottom: 12 }}>
            El stock mínimo se define por insumo individual desde el módulo de Insumos.
          </p>
          <label className="configuracion-checkbox">
            <input
              type="checkbox"
              checked={reglas.alertaStockBajoActiva}
              onChange={(e) => handleChange('alertaStockBajoActiva', e.target.checked)}
            />
            Habilitar alertas de stock bajo
          </label>
        </section>

        <section className="aura-card">
          <h2 className="section-title">Alertas administrativas</h2>
          <label className="configuracion-checkbox">
            <input
              type="checkbox"
              checked={reglas.alertaAdministrativaActiva}
              onChange={(e) => handleChange('alertaAdministrativaActiva', e.target.checked)}
            />
            Habilitar avisos administrativos (matrículas, auditorías, etc.)
          </label>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Guardar configuración
          </button>
        </div>
      </form>

      {guardado && (
        <Modal title="Configuración actualizada" onClose={() => setGuardado(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>Los cambios se aplicaron correctamente a las reglas de alerta.</p>
            <button type="button" className="btn btn-primary" onClick={() => setGuardado(false)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
