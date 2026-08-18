import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import * as alertasService from '../../services/alertasService'

const SEVERIDAD_BADGE = { danger: 'danger', warning: 'warning', info: 'info' }
const TIPOS = ['Todos', 'Stock bajo', 'Turno próximo', 'Administrativa']

export default function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [tipoFiltro, setTipoFiltro] = useState('Todos')
  const [confirmado, setConfirmado] = useState(false)

  async function recargar() {
    setAlertas(await alertasService.getAlertas())
  }

  useEffect(() => {
    recargar()
  }, [])

  const filtradas = useMemo(
    () => alertas.filter((a) => tipoFiltro === 'Todos' || a.tipo === tipoFiltro),
    [alertas, tipoFiltro],
  )

  const criticas = alertas.filter((a) => a.severidad === 'danger').length
  const advertencias = alertas.filter((a) => a.severidad === 'warning').length

  async function handleEnviarRecordatorio(alerta) {
    await alertasService.enviarRecordatorio(alerta.id)
    setConfirmado(true)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Alertas</h1>
        <p>Revisá las situaciones que requieren atención: stock bajo, turnos próximos y avisos administrativos.</p>
      </div>

      <div className="stat-grid">
        <StatCard label="Alertas activas" value={alertas.length} />
        <StatCard label="Críticas" value={criticas} />
        <StatCard label="Advertencias" value={advertencias} />
      </div>

      <div className="list-toolbar">
        <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          {TIPOS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {filtradas.length === 0 ? (
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
              {filtradas.map((alerta) => (
                <tr key={alerta.id}>
                  <td>
                    <Badge variant={SEVERIDAD_BADGE[alerta.severidad]}>{alerta.tipo}</Badge>
                  </td>
                  <td>
                    <strong>{alerta.titulo}</strong>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6f6b60' }}>{alerta.descripcion}</p>
                  </td>
                  <td>{alerta.fecha}</td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleEnviarRecordatorio(alerta)}>
                      Enviar recordatorio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmado && (
        <Modal title="Recordatorio enviado" onClose={() => setConfirmado(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>
              Se envió el recordatorio correspondiente. Podés hacer seguimiento desde el listado de alertas.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => setConfirmado(false)}>
              Entendido
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
