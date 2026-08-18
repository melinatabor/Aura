import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import * as alertsService from '../../services/alertsService'

const SEVERITY_BADGE = { danger: 'danger', warning: 'warning', info: 'info' }
const TYPES = ['Todos', 'Stock bajo', 'Turno próximo', 'Administrativa']

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [typeFilter, setTypeFilter] = useState('Todos')
  const [confirmed, setConfirmed] = useState(false)

  async function reload() {
    setAlerts(await alertsService.getAlerts())
  }

  useEffect(() => {
    reload()
  }, [])

  const filtered = useMemo(
    () => alerts.filter((a) => typeFilter === 'Todos' || a.type === typeFilter),
    [alerts, typeFilter],
  )

  const critical = alerts.filter((a) => a.severity === 'danger').length
  const warnings = alerts.filter((a) => a.severity === 'warning').length

  async function handleSendReminder(alert) {
    await alertsService.sendReminder(alert.id)
    setConfirmed(true)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Alertas</h1>
        <p>Revisá las situaciones que requieren atención: stock bajo, turnos próximos y avisos administrativos.</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Alertas activas" value={alerts.length} />
        <StatCard label="Críticas" value={critical} />
        <StatCard label="Advertencias" value={warnings} />
      </div>

      <div className="list-toolbar">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No hay alertas para mostrar" description="Cuando se detecte una situación relevante, aparecerá acá." />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Detalle</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <Badge variant={SEVERITY_BADGE[alert.severity]}>{alert.type}</Badge>
                  </td>
                  <td>
                    <strong>{alert.title}</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6f6b60' }}>{alert.description}</p>
                  </td>
                  <td>{alert.date}</td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleSendReminder(alert)}>
                      Enviar recordatorio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmed && (
        <Modal title="Recordatorio enviado" onClose={() => setConfirmed(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>
              Se envió el recordatorio correspondiente. Podés hacer seguimiento desde el listado de alertas.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setConfirmed(false)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
