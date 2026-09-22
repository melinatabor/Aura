import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import Modal from '../../components/Modal/Modal.jsx'
import SupplyFormModal from './SupplyFormModal.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import * as suppliesService from '../../bll/suppliesService'

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
const dateFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export default function SupplyControl() {
  const { user } = useAuth()
  const [supplies, setSupplies] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [history, setHistory] = useState([])
  const [exported, setExported] = useState(false)
  const [exporting, setExporting] = useState(false)

  async function reload() {
    setSupplies(await suppliesService.getAll())
  }

  async function loadHistory() {
    setHistory(await suppliesService.getExportHistory())
  }

  useEffect(() => {
    reload()
    loadHistory()
  }, [])

  const filtered = useMemo(
    () => supplies.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [supplies, search],
  )

  const lowStock = supplies.filter((s) => s.status === 'Activo' && s.currentStock <= s.minStock)
  const totalValue = supplies.reduce((s, item) => s + item.currentStock * (item.price ?? 0), 0)

  async function handleSave(data) {
    if (modal.mode === 'create') {
      await suppliesService.create(data)
    } else {
      await suppliesService.update(modal.supply.id, data)
    }
    setModal(null)
    reload()
  }

  async function handleExport() {
    setExporting(true)
    try {
      await suppliesService.exportStock(user.id)
      setExported(true)
      loadHistory()
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Insumos</h1>
          <p>Controlá el stock de productos utilizados en los tratamientos del centro.</p>
        </div>
        <div className="table-actions">
          <button type="button" className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exportando...' : 'Exportar stock'}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
            + Nuevo insumo
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Insumos registrados" value={supplies.length} />
        <StatCard label="Con stock bajo" value={lowStock.length} hint={lowStock.length > 0 ? 'Requieren reposición' : 'Todo en orden'} />
        <StatCard label="Valor de stock estimado" value={priceFormatter.format(totalValue)} />
      </div>

      <div className="list-toolbar">
        <input className="search-input" placeholder="Buscar insumo..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No hay insumos que coincidan con la búsqueda" />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Categoría</th>
                <th>Stock actual</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const low = s.currentStock <= s.minStock
                return (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.name}</strong>
                    </td>
                    <td>{s.category}</td>
                    <td>
                      {s.currentStock} {s.unit}
                    </td>
                    <td>
                      {s.minStock} {s.unit}
                    </td>
                    <td>{low ? <Badge variant="danger">Stock bajo</Badge> : <Badge>{s.status}</Badge>}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ mode: 'edit', supply: s })}>
                          Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <section className="aura-card" style={{ marginTop: 24 }}>
        <h2 className="section-title">Historial de exportaciones de stock</h2>
        {history.length === 0 ? (
          <EmptyState title="Todavía no se exportó el stock" />
        ) : (
          <div className="aura-table-wrap">
            <table className="aura-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Insumos</th>
                  <th>Con stock bajo</th>
                  <th>Valor total</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{dateFormatter.format(new Date(h.createdAt))}</td>
                    <td>{h.totalSupplies}</td>
                    <td>{h.lowStockCount}</td>
                    <td>{priceFormatter.format(h.totalValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <SupplyFormModal supply={modal.mode === 'edit' ? modal.supply : null} onSave={handleSave} onClose={() => setModal(null)} />
      )}

      {exported && (
        <Modal title="Stock exportado" onClose={() => setExported(false)}>
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div className="modal-confirm-icon icon-success">✓</div>
            <p style={{ color: '#6f6b60', marginBottom: 24 }}>El estado del inventario se guardó correctamente en el historial.</p>
            <button type="button" className="btn btn-primary" onClick={() => setExported(false)}>
              Cerrar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
