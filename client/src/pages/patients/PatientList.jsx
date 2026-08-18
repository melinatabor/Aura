import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import PatientFormModal from './PatientFormModal.jsx'
import * as patientsService from '../../services/patientsService'

export default function PatientList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [modal, setModal] = useState(searchParams.get('new') === '1' ? { mode: 'create' } : null)
  const [toDeactivate, setToDeactivate] = useState(null)

  async function reload() {
    setPatients(await patientsService.getAll())
  }

  useEffect(() => {
    reload()
  }, [])

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const matchesText =
        `${p.firstName} ${p.lastName} ${p.documentId}`.toLowerCase().includes(search.toLowerCase()) || search === ''
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter
      return matchesText && matchesStatus
    })
  }, [patients, search, statusFilter])

  const active = patients.filter((p) => p.status === 'Activo').length
  const inactive = patients.length - active

  async function handleSave(data) {
    if (modal.mode === 'create') {
      await patientsService.create(data)
    } else {
      await patientsService.update(modal.patient.id, data)
    }
    setModal(null)
    reload()
  }

  async function handleConfirmDeactivate() {
    await patientsService.setStatus(toDeactivate.id, 'Inactivo')
    setToDeactivate(null)
    reload()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Clientes</h1>
          <p>Gestioná el listado de pacientes y consultá su información de contacto.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          + Nuevo cliente
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Clientes totales" value={patients.length} />
        <StatCard label="Clientes activos" value={active} />
        <StatCard label="Clientes inactivos" value={inactive} />
      </div>

      <div className="list-toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="Todos">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No hay clientes que coincidan con la búsqueda" />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Contacto</th>
                <th>Alta</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>
                      {p.firstName} {p.lastName}
                    </strong>
                  </td>
                  <td>{p.documentId}</td>
                  <td>{p.email}</td>
                  <td>{p.registeredAt}</td>
                  <td>
                    <Badge>{p.status}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/app/patients/${p.id}`} className="btn btn-secondary btn-sm">
                        Ver
                      </Link>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ mode: 'edit', patient: p })}>
                        Editar
                      </button>
                      {p.status === 'Activo' ? (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setToDeactivate(p)}>
                          Desactivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={async () => {
                            await patientsService.setStatus(p.id, 'Activo')
                            reload()
                          }}
                        >
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <PatientFormModal
          patient={modal.mode === 'edit' ? modal.patient : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {toDeactivate && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas desactivar este cliente?"
          message="El cliente dejará de aparecer como activo, pero se conserva su historial para mantener la trazabilidad."
          confirmLabel="Sí, desactivar"
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setToDeactivate(null)}
        />
      )}
    </div>
  )
}
