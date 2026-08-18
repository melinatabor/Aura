import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const UNIDADES = ['unidades', 'cajas', 'paquetes', 'frascos', 'kg', 'litros']

const VACIO = { nombre: '', descripcion: '', categoria: '', stockActual: 0, stockMinimo: 0, unidadMedida: UNIDADES[0], precio: 0 }

export default function InsumoFormModal({ insumo, onSave, onClose }) {
  const [form, setForm] = useState(insumo ? { ...insumo } : { ...VACIO })

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      stockActual: Number(form.stockActual),
      stockMinimo: Number(form.stockMinimo),
      precio: Number(form.precio),
    })
  }

  return (
    <Modal title={insumo ? 'Editar insumo' : 'Nuevo insumo'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre del insumo</label>
          <input id="nombre" required value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" rows={2} value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="stockActual">Stock actual</label>
            <input
              id="stockActual"
              type="number"
              min="0"
              required
              value={form.stockActual}
              onChange={(e) => handleChange('stockActual', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="stockMinimo">Stock mínimo</label>
            <input
              id="stockMinimo"
              type="number"
              min="0"
              required
              value={form.stockMinimo}
              onChange={(e) => handleChange('stockMinimo', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unidadMedida">Unidad de medida</label>
            <select id="unidadMedida" value={form.unidadMedida} onChange={(e) => handleChange('unidadMedida', e.target.value)}>
              {UNIDADES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="precio">Precio unitario</label>
            <input id="precio" type="number" min="0" value={form.precio} onChange={(e) => handleChange('precio', e.target.value)} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar insumo
          </button>
        </div>
      </form>
    </Modal>
  )
}
