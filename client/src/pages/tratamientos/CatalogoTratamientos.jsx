import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import TratamientoFormModal from './TratamientoFormModal.jsx'
import NuevoTratamientoModal from './NuevoTratamientoModal.jsx'
import * as tratamientosService from '../../services/tratamientosService'
import './Tratamientos.scss'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function CatalogoTratamientos() {
  const [tratamientos, setTratamientos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [editar, setEditar] = useState(null)
  const [aDesactivar, setADesactivar] = useState(null)

  async function recargar() {
    setTratamientos(await tratamientosService.getAll())
  }

  useEffect(() => {
    recargar()
  }, [])

  const filtrados = useMemo(
    () => tratamientos.filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [tratamientos, busqueda],
  )

  const activos = tratamientos.filter((t) => t.estado === 'Activo')

  async function handleCrear(datos, relacionesInsumo) {
    const nuevo = await tratamientosService.create(datos)
    if (relacionesInsumo.length > 0) {
      await tratamientosService.setInsumosDeTratamiento(nuevo.id, relacionesInsumo)
    }
    setModalNuevo(false)
    recargar()
  }

  async function handleEditar(datos) {
    await tratamientosService.update(editar.id, datos)
    setEditar(null)
    recargar()
  }

  async function handleDesactivar() {
    await tratamientosService.setEstado(aDesactivar.id, aDesactivar.estado === 'Activo' ? 'Inactivo' : 'Activo')
    setADesactivar(null)
    recargar()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Catálogo de tratamientos</h1>
          <p>Administrá los tratamientos que ofrece el centro y su vinculación con insumos.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalNuevo(true)}>
          + Nuevo tratamiento
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Tratamientos totales" value={tratamientos.length} />
        <StatCard label="Activos" value={activos.length} />
        <StatCard label="Precio promedio" value={activos.length ? formatoPrecio.format(activos.reduce((s, t) => s + t.precio, 0) / activos.length) : '—'} />
      </div>

      <div className="list-toolbar">
        <input className="search-input" placeholder="Buscar tratamiento..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {filtrados.length === 0 ? (
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
              {filtrados.map((t) => (
                <tr key={t.id}>
                  <td>
                    <strong>{t.nombre}</strong>
                  </td>
                  <td>{t.categoria}</td>
                  <td>{t.duracionMinutos} min</td>
                  <td>{formatoPrecio.format(t.precio)}</td>
                  <td>
                    <Badge>{t.estado}</Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditar(t)}>
                        Editar
                      </button>
                      <button type="button" className="btn btn-danger btn-sm" onClick={() => setADesactivar(t)}>
                        {t.estado === 'Activo' ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalNuevo && <NuevoTratamientoModal onSave={handleCrear} onClose={() => setModalNuevo(false)} />}
      {editar && <TratamientoFormModal tratamiento={editar} onSave={handleEditar} onClose={() => setEditar(null)} />}
      {aDesactivar && (
        <ConfirmDialog
          title={`¿Confirmás ${aDesactivar.estado === 'Activo' ? 'desactivar' : 'activar'} este tratamiento?`}
          message="Los turnos ya registrados con este tratamiento no se ven afectados."
          confirmLabel="Confirmar"
          onConfirm={handleDesactivar}
          onCancel={() => setADesactivar(null)}
        />
      )}
    </div>
  )
}
