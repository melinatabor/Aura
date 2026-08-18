import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as insumosService from '../../services/insumosService'

const CATEGORIAS = ['Facial', 'Corporal', 'Depilación']

export default function NuevoTratamientoModal({ onSave, onClose }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', duracionMinutos: '', precio: '', categoria: CATEGORIAS[0] })
  const [insumos, setInsumos] = useState([])
  const [seleccion, setSeleccion] = useState({})

  useEffect(() => {
    insumosService.getAll().then(setInsumos)
  }, [])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function toggleInsumo(id) {
    setSeleccion((prev) => {
      const copia = { ...prev }
      if (copia[id] !== undefined) {
        delete copia[id]
      } else {
        copia[id] = 1
      }
      return copia
    })
  }

  function handleCantidad(id, cantidad) {
    setSeleccion((prev) => ({ ...prev, [id]: Number(cantidad) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const relaciones = Object.entries(seleccion).map(([insumoId, cantidad]) => ({ insumoId: Number(insumoId), cantidad }))
    onSave(
      { ...form, precio: Number(form.precio), duracionMinutos: Number(form.duracionMinutos) },
      relaciones,
    )
  }

  return (
    <Modal title="Nuevo tratamiento" onClose={onClose} large>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre del tratamiento</label>
            <input id="nombre" required value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={form.categoria} onChange={(e) => handleChange('categoria', e.target.value)}>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" rows={2} value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="duracionMinutos">Duración (min)</label>
            <input
              id="duracionMinutos"
              type="number"
              min="1"
              required
              value={form.duracionMinutos}
              onChange={(e) => handleChange('duracionMinutos', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="precio">Precio</label>
            <input id="precio" type="number" min="0" required value={form.precio} onChange={(e) => handleChange('precio', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Insumos vinculados</label>
          <div className="tratamiento-insumos-picker">
            {insumos.map((insumo) => (
              <div key={insumo.id} className="tratamiento-insumo-row">
                <label className="tratamiento-insumo-check">
                  <input type="checkbox" checked={seleccion[insumo.id] !== undefined} onChange={() => toggleInsumo(insumo.id)} />
                  {insumo.nombre}
                </label>
                {seleccion[insumo.id] !== undefined && (
                  <input
                    type="number"
                    min="1"
                    className="tratamiento-insumo-cantidad"
                    value={seleccion[insumo.id]}
                    onChange={(e) => handleCantidad(insumo.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
          <span className="field-hint">Indicá qué insumos y en qué cantidad consume este tratamiento.</span>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar tratamiento
          </button>
        </div>
      </form>
    </Modal>
  )
}
