import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const UNITS = ['unidades', 'cajas', 'paquetes', 'frascos', 'kg', 'litros']

const EMPTY = { name: '', description: '', category: '', currentStock: 0, minStock: 0, unit: UNITS[0], price: 0 }

export default function SupplyFormModal({ supply, onSave, onClose }) {
  const [form, setForm] = useState(supply ? { ...supply } : { ...EMPTY })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      ...form,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock),
      price: Number(form.price),
    })
  }

  return (
    <Modal title={supply ? 'Editar insumo' : 'Nuevo insumo'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre del insumo</label>
          <input id="name" required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" rows={2} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="currentStock">Stock actual</label>
            <input
              id="currentStock"
              type="number"
              min="0"
              required
              value={form.currentStock}
              onChange={(e) => handleChange('currentStock', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="minStock">Stock mínimo</label>
            <input
              id="minStock"
              type="number"
              min="0"
              required
              value={form.minStock}
              onChange={(e) => handleChange('minStock', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unit">Unidad de medida</label>
            <select id="unit" value={form.unit} onChange={(e) => handleChange('unit', e.target.value)}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="price">Precio unitario</label>
            <input id="price" type="number" min="0" value={form.price} onChange={(e) => handleChange('price', e.target.value)} />
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
