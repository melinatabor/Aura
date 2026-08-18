import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ClienteFormModal from './ClienteFormModal.jsx'
import * as pacientesService from '../../services/pacientesService'

export default function ListadoClientes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pacientes, setPacientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('Todos')
  const [modal, setModal] = useState(searchParams.get('nuevo') === '1' ? { modo: 'crear' } : null)
  const [aEliminar, setAEliminar] = useState(null)

  async function recargar() {
    setPacientes(await pacientesService.getAll())
  }

  useEffect(() => {
    recargar()
  }, [])

  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtrados = useMemo(() => {
    return pacientes.filter((p) => {
      const coincideTexto =
        `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(busqueda.toLowerCase()) || busqueda === ''
      const coincideEstado = filtroEstado === 'Todos' || p.estado === filtroEstado
      return coincideTexto && coincideEstado
    })
  }, [pacientes, busqueda, filtroEstado])

  const activos = pacientes.filter((p) => p.estado === 'Activo').length
  const inactivos = pacientes.length - activos

  async function handleGuardar(datos) {
    if (modal.modo === 'crear') {
      await pacientesService.create(datos)
    } else {
      await pacientesService.update(modal.cliente.id, datos)
    }
    setModal(null)
    recargar()
  }

  async function handleConfirmarBaja() {
    await pacientesService.setEstado(aEliminar.id, 'Inactivo')
    setAEliminar(null)
    recargar()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Clientes</h1>
          <p>Gestioná el listado de pacientes y consultá su información de contacto.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ modo: 'crear' })}>
          + Nuevo cliente
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Clientes totales" value={pacientes.length} />
        <StatCard label="Clientes activos" value={activos} />
        <StatCard label="Clientes inactivos" value={inactivos} />
      </div>

      <div className="list-toolbar">
        <input
          className="search-input"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="Todos">Todos los estados</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      {filtrados.length === 0 ? (
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
              {filtrados.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>
                      {p.nombre} {p.apellido}
                    </strong>
                  </td>
                  <td>{p.dni}</td>
                  <td>{p.email}</td>
                  <td>{p.fechaAlta}</td>
                  <td>
                    <Badge>{p.estado}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/app/clientes/${p.id}`} className="btn btn-secondary btn-sm">
                        Ver
                      </Link>
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ modo: 'editar', cliente: p })}>
                        Editar
                      </button>
                      {p.estado === 'Activo' ? (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => setAEliminar(p)}>
                          Desactivar
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={async () => {
                            await pacientesService.setEstado(p.id, 'Activo')
                            recargar()
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
        <ClienteFormModal
          cliente={modal.modo === 'editar' ? modal.cliente : null}
          onSave={handleGuardar}
          onClose={() => setModal(null)}
        />
      )}

      {aEliminar && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas desactivar este cliente?"
          message="El cliente dejará de aparecer como activo, pero se conserva su historial para mantener la trazabilidad."
          confirmLabel="Sí, desactivar"
          onConfirm={handleConfirmarBaja}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  )
}
