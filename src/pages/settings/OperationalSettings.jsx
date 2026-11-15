import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as alertRulesService from '../../bll/alertRulesService'
import * as workspaceService from '../../bll/workspaceService'
import { DAY_NAMES } from '../../bll/workspaceService'
import './Settings.scss'

// Lunes primero, domingo al final (como se lee una semana laboral)
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function OperationalSettings() {
  const [rules, setRules] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [ranges, setRanges] = useState([])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([alertRulesService.getRules(), workspaceService.get(), workspaceService.getScheduleRanges()]).then(
      ([r, w, s]) => {
        setRules(r)
        setWorkspace(w)
        setRanges(s)
      },
    )
  }, [])

  if (!rules || !workspace) return null

  function handleRuleChange(field, value) {
    setRules((prev) => ({ ...prev, [field]: value }))
  }

  function handleWorkspaceChange(field, value) {
    setWorkspace((prev) => ({ ...prev, [field]: value }))
  }

  function handleRangeChange(dayOfWeek, field, value) {
    setRanges((prev) => prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r)))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await workspaceService.saveScheduleRanges(ranges)
      await Promise.all([alertRulesService.updateRules(rules), workspaceService.update(workspace)])
      setSaved(true)
    } catch (err) {
      setError(err.message || 'No se pudo guardar la configuración.')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Configuración</h1>
        <p>Datos del centro, horarios de atención y los parámetros que usa AURA para la agenda y las alertas.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <section className="aura-card">
            <h2 className="section-title">Datos del centro</h2>
            <div className="form-group">
              <label htmlFor="wsName">Nombre</label>
              <input id="wsName" required value={workspace.name} onChange={(e) => handleWorkspaceChange('name', e.target.value)} />
              <span className="field-hint">Se usa en los recordatorios que se envían a los clientes.</span>
            </div>
            <div className="form-group">
              <label htmlFor="wsActivity">Rubro</label>
              <input
                id="wsActivity"
                value={workspace.activityType}
                onChange={(e) => handleWorkspaceChange('activityType', e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="wsEmail">Email</label>
                <input
                  id="wsEmail"
                  type="email"
                  value={workspace.businessEmail}
                  onChange={(e) => handleWorkspaceChange('businessEmail', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="wsPhone">Teléfono</label>
                <input
                  id="wsPhone"
                  value={workspace.businessPhone}
                  onChange={(e) => handleWorkspaceChange('businessPhone', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="wsAddress">Dirección</label>
              <input id="wsAddress" value={workspace.address} onChange={(e) => handleWorkspaceChange('address', e.target.value)} />
            </div>
          </section>

          <section className="aura-card">
            <h2 className="section-title">Horarios de atención</h2>
            <p className="field-hint" style={{ marginBottom: 12 }}>
              La agenda no permite turnos fuera de estos horarios.
            </p>
            <div className="settings-schedule">
              {DISPLAY_ORDER.map((day) => {
                const range = ranges.find((r) => r.dayOfWeek === day)
                if (!range) return null
                return (
                  <div key={day} className={`settings-schedule-row ${range.isActive ? '' : 'is-closed'}`}>
                    <label className="settings-checkbox">
                      <input
                        type="checkbox"
                        checked={range.isActive}
                        onChange={(e) => handleRangeChange(day, 'isActive', e.target.checked)}
                      />
                      {DAY_NAMES[day]}
                    </label>
                    <input
                      type="time"
                      aria-label={`Apertura ${DAY_NAMES[day]}`}
                      value={range.openingTime}
                      disabled={!range.isActive}
                      onChange={(e) => handleRangeChange(day, 'openingTime', e.target.value)}
                    />
                    <span className="field-hint">a</span>
                    <input
                      type="time"
                      aria-label={`Cierre ${DAY_NAMES[day]}`}
                      value={range.closingTime}
                      disabled={!range.isActive}
                      onChange={(e) => handleRangeChange(day, 'closingTime', e.target.value)}
                    />
                  </div>
                )
              })}
            </div>
          </section>

          <section className="aura-card">
            <h2 className="section-title">Agenda</h2>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={workspace.allowAppointmentOverlap}
                onChange={(e) => handleWorkspaceChange('allowAppointmentOverlap', e.target.checked)}
              />
              Permitir turnos superpuestos para un mismo profesional
            </label>
            <p className="field-hint" style={{ marginTop: 8 }}>
              Desactivado (recomendado): la agenda rechaza un turno si el profesional ya tiene otro en ese horario.
            </p>

            <h2 className="section-title" style={{ marginTop: 24 }}>
              Alertas de turnos
            </h2>
            <div className="form-group">
              <label htmlFor="days">Días de anticipación para "turno próximo"</label>
              <input
                id="days"
                type="number"
                min="1"
                max="14"
                value={rules.upcomingAppointmentDays}
                onChange={(e) => handleRuleChange('upcomingAppointmentDays', Number(e.target.value))}
              />
              <span className="field-hint">Un turno pendiente dentro de este rango genera una alerta.</span>
            </div>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={rules.upcomingAppointmentAlertEnabled}
                onChange={(e) => handleRuleChange('upcomingAppointmentAlertEnabled', e.target.checked)}
              />
              Habilitar alertas de turnos próximos
            </label>
          </section>

          <section className="aura-card">
            <h2 className="section-title">Alertas de insumos y administrativas</h2>
            <p className="field-hint" style={{ marginBottom: 12 }}>
              El stock mínimo se define por insumo desde el módulo de Insumos.
            </p>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={rules.lowStockAlertEnabled}
                onChange={(e) => handleRuleChange('lowStockAlertEnabled', e.target.checked)}
              />
              Habilitar alertas de stock bajo
            </label>
            <label className="settings-checkbox" style={{ marginTop: 12 }}>
              <input
                type="checkbox"
                checked={rules.administrativeAlertEnabled}
                onChange={(e) => handleRuleChange('administrativeAlertEnabled', e.target.checked)}
              />
              Mostrar avisos administrativos (matrículas, auditorías, etc.)
            </label>
          </section>
        </div>

        {error && <p className="field-error" style={{ marginTop: 16 }}>{error}</p>}

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
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>Los cambios se aplicaron correctamente.</p>
            <button type="button" className="btn btn-primary" onClick={() => setSaved(false)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
