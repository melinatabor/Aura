import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import TreatmentFormModal from './TreatmentFormModal.jsx'
import NewTreatmentModal from './NewTreatmentModal.jsx'
import * as treatmentsService from '../../services/treatmentsService'
import './Treatments.scss'

const priceFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function TreatmentCatalog() {
  const [treatments, setTreatments] = useState([])
  const [search, setSearch] = useState('')
  const [newModal, setNewModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toToggle, setToToggle] = useState(null)

  async function reload() {
    setTreatments(await treatmentsService.getAll())
  }

  useEffect(() => {
    reload()
  }, [])

  const filtered = useMemo(
    () => treatments.filter((t) => t.name.toLowerCase().includes(search.toLowerCase())),
    [treatments, search],
  )

  const active = treatments.filter((t) => t.status === 'Activo')

  async function handleCreate(data, supplyRelations) {
    const created = await treatmentsService.create(data)
    if (supplyRelations.length > 0) {
      await treatmentsService.setSuppliesForTreatment(created.id, supplyRelations)
    }
    setNewModal(false)
    reload()
  }

  async function handleEdit(data) {
    await treatmentsService.update(editing.id, data)
    setEditing(null)
    reload()
  }

  async function handleToggleStatus() {
    await treatmentsService.setStatus(toToggle.id, toToggle.status === 'Activo' ? 'Inactivo' : 'Activo')
    setToToggle(null)
    reload()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Catálogo de tratamientos</h1>
          <p>Administrá los tratamientos que ofrece el centro y su vinculación con insumos.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setNewModal(true)}>
          + Nuevo tratamiento
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Tratamientos totales" value={treatments.length} />
        <StatCard label="Activos" value={active.length} />
        <StatCard
          label="Precio promedio"
          value={active.length ? priceFormatter.format(active.reduce((s, t) => s + t.price, 0) / active.length) : '—'}
        />
      </div>

      <div className="list-toolbar">
        <input className="search-input" placeholder="Buscar tratamiento..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No hay tratamientos que coincidan con la búsqueda" />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Tratamiento</th>
                <th>Categoría</th>
                <th>Duración</th>
                <th>Precio</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.name}</strong>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.durationMinutes} min</td>
                  <td>{priceFormatter.format(t.price)}</td>
                  <td>
                    <Badge>{t.status}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(t)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setToToggle(t)}>
                        {t.status === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {newModal && <NewTreatmentModal onSave={handleCreate} onClose={() => setNewModal(false)} />}
      {editing && <TreatmentFormModal treatment={editing} onSave={handleEdit} onClose={() => setEditing(null)} />}
      {toToggle && (
        <ConfirmDialog
          title={`¿Confirmás ${toToggle.status === 'Activo' ? 'desactivar' : 'activar'} este tratamiento?`}
          message="Los turnos ya registrados con este tratamiento no se ven afectados."
          confirmLabel="Confirmar"
          onConfirm={handleToggleStatus}
          onCancel={() => setToToggle(null)}
        />
      )}
    </div>
  )
}
