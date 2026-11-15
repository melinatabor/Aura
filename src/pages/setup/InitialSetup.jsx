import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as alertRulesService from '../../bll/alertRulesService'
import * as workspaceService from '../../bll/workspaceService'
import { DAY_NAMES } from '../../bll/workspaceService'
import '../settings/Settings.scss'

const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

export default function InitialSetup() {
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(null)
  const [ranges, setRanges] = useState([])
  const [rules, setRules] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([workspaceService.get(), workspaceService.getScheduleRanges(), alertRulesService.getRules()]).then(
      ([w, s, r]) => {
        setWorkspace(w)
        setRanges(s)
        setRules(r)
      },
    )
  }, [])

  if (!workspace || !rules) return null

  function handleRangeChange(dayOfWeek, field, value) {
    setRanges((prev) => prev.map((r) => (r.dayOfWeek === dayOfWeek ? { ...r, [field]: value } : r)))
  }

  function handleRuleChange(field, value) {
    setRules((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!ranges.some((r) => r.isActive)) {
      setError('Elegí al menos un día de atención.')
      return
    }
    setSaving(true)
    try {
      await workspaceService.saveScheduleRanges(ranges)
      await alertRulesService.updateRules(rules)
      await workspaceService.update({ ...workspace, setupCompleted: true })
      navigate('/app/welcome')
    } catch (err) {
      setError(err.message || 'No se pudo guardar la configuración inicial.')
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Configuración inicial</h1>
        <p>Definí cómo atiende {workspace.name} y cómo querés que AURA te avise del seguimiento.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="settings-grid">
          <section className="aura-card">
            <h2 className="section-title">Organización de la atención</h2>
            <p className="field-hint" style={{ marginBottom: 12 }}>
              Marcá los días que atendés y el horario de cada uno. La agenda no permite turnos fuera de estos horarios.
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
            <h2 className="section-title">Seguimiento</h2>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={rules.upcomingAppointmentAlertEnabled}
                onChange={(e) => handleRuleChange('upcomingAppointmentAlertEnabled', e.target.checked)}
              />
              Avisarme de turnos sin confirmar
            </label>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label htmlFor="setupDays">Días de anticipación</label>
              <input
                id="setupDays"
                type="number"
                min="1"
                max="14"
                disabled={!rules.upcomingAppointmentAlertEnabled}
                value={rules.upcomingAppointmentDays}
                onChange={(e) => handleRuleChange('upcomingAppointmentDays', Number(e.target.value))}
              />
              <span className="field-hint">Un turno pendiente dentro de este rango genera una alerta.</span>
            </div>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={rules.lowStockAlertEnabled}
                onChange={(e) => handleRuleChange('lowStockAlertEnabled', e.target.checked)}
              />
              Avisarme cuando un insumo llegue al stock mínimo
            </label>
          </section>
        </div>

        {error && (
          <p className="field-error" style={{ marginTop: 16 }}>
            {error}
          </p>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar configuración inicial'}
          </button>
        </div>
      </form>
    </div>
  )
}
