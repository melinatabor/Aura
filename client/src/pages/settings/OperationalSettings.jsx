import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as alertRulesService from '../../services/alertRulesService'
import './Settings.scss'

export default function OperationalSettings() {
  const [rules, setRules] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    alertRulesService.getRules().then(setRules)
  }, [])

  if (!rules) return null

  function handleChange(field, value) {
    setRules((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    await alertRulesService.updateRules(rules)
    setSaved(true)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Configuración operativa</h1>
        <p>Definí los parámetros generales que usa AURA para calcular las alertas del sistema.</p>
      </div>

      <form className="settings-grid" onSubmit={handleSubmit}>
        <section className="aura-card">
          <h2 className="section-title">Reglas de alerta de turnos</h2>
          <div className="form-group">
            <label htmlFor="days">Días de anticipación para "turno próximo"</label>
            <input
              id="days"
              type="number"
              min="1"
              max="14"
              value={rules.upcomingAppointmentDays}
              onChange={(e) => handleChange('upcomingAppointmentDays', Number(e.target.value))}
            />
            <span className="field-hint">Un turno pendiente dentro de este rango de días genera una alerta.</span>
          </div>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={rules.upcomingAppointmentAlertEnabled}
              onChange={(e) => handleChange('upcomingAppointmentAlertEnabled', e.target.checked)}
            />
            Habilitar alertas de turnos próximos
          </label>
        </section>

        <section className="aura-card">
          <h2 className="section-title">Reglas de alerta de insumos</h2>
          <p className="field-hint" style={{ marginBottom: 12 }}>
            El stock mínimo se define por insumo individual desde el módulo de Insumos.
          </p>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={rules.lowStockAlertEnabled}
              onChange={(e) => handleChange('lowStockAlertEnabled', e.target.checked)}
            />
            Habilitar alertas de stock bajo
          </label>
        </section>

        <section className="aura-card">
          <h2 className="section-title">Alertas administrativas</h2>
          <label className="settings-checkbox">
            <input
              type="checkbox"
              checked={rules.administrativeAlertEnabled}
              onChange={(e) => handleChange('administrativeAlertEnabled', e.target.checked)}
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

      {saved && (
        <Modal title="Configuración actualizada" onClose={() => setSaved(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>Los cambios se aplicaron correctamente a las reglas de alerta.</p>
            <button type="button" className="btn btn-primary" onClick={() => setSaved(false)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
