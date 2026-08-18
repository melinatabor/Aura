import { useEffect, useMemo, useState } from 'react'
import StatCard from '../../components/StatCard/StatCard.jsx'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import InsumoFormModal from './InsumoFormModal.jsx'
import * as insumosService from '../../services/insumosService'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

export default function ControlInsumos() {
  const [insumos, setInsumos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [modal, setModal] = useState(null)

  async function recargar() {
    setInsumos(await insumosService.getAll())
  }

  useEffect(() => {
    recargar()
  }, [])

  const filtrados = useMemo(
    () => insumos.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase())),
    [insumos, busqueda],
  )

  const stockBajo = insumos.filter((i) => i.estado === 'Activo' && i.stockActual <= i.stockMinimo)
  const valorTotal = insumos.reduce((s, i) => s + i.stockActual * (i.precio ?? 0), 0)

  async function handleGuardar(datos) {
    if (modal.modo === 'crear') {
      await insumosService.create(datos)
    } else {
      await insumosService.update(modal.insumo.id, datos)
    }
    setModal(null)
    recargar()
  }

  return (
    <div>
      <div className="page-header-row">
        <div className="page-header">
          <h1>Insumos</h1>
          <p>Controlá el stock de productos utilizados en los tratamientos del centro.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ modo: 'crear' })}>
          + Nuevo insumo
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Insumos registrados" value={insumos.length} />
        <StatCard label="Con stock bajo" value={stockBajo.length} hint={stockBajo.length > 0 ? 'Requieren reposición' : 'Todo en orden'} />
        <StatCard label="Valor de stock estimado" value={formatoPrecio.format(valorTotal)} />
      </div>

      <div className="list-toolbar">
        <input className="search-input" placeholder="Buscar insumo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>

      {filtrados.length === 0 ? (
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
              {filtrados.map((i) => {
                const bajo = i.stockActual <= i.stockMinimo
                return (
                  <tr key={i.id}>
                    <td>
                      <strong>{i.nombre}</strong>
                    </td>
                    <td>{i.categoria}</td>
                    <td>
                      {i.stockActual} {i.unidadMedida}
                    </td>
                    <td>
                      {i.stockMinimo} {i.unidadMedida}
                    </td>
                    <td>
                      {bajo ? <Badge variant="danger">Stock bajo</Badge> : <Badge>{i.estado}</Badge>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModal({ modo: 'editar', insumo: i })}>
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
        <InsumoFormModal insumo={modal.modo === 'editar' ? modal.insumo : null} onSave={handleGuardar} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
