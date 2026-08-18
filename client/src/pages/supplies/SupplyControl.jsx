import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import SupplyFormModal from './SupplyFormModal.jsx'
import * as suppliesService from '../../services/suppliesService'

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function SupplyControl() {
  const [supplies, setSupplies] = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  async function reload() {
    setSupplies(await suppliesService.getAll())
  }

  useEffect(() => {
    reload()
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

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Insumos</h1>
          <p>Controlá el stock de productos utilizados en los tratamientos del centro.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          + Nuevo insumo
        </button>
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

      {modal && (
        <SupplyFormModal supply={modal.mode === 'edit' ? modal.supply : null} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
