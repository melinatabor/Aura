import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

export default function TreatmentFormModal({ treatment, onSave, onClose }) {
  const [form, setForm] = useState({ ...treatment })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) })
  }

  return (
    <Modal title="Modificar tratamiento" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre</label>
          <input id="name" required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" rows={3} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="durationMinutes">Duración (min)</label>
            <input
              id="durationMinutes"
              type="number"
              min="1"
              required
              value={form.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Precio</label>
            <input
              id="price"
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => handleChange('price', e.target.value)}
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </Modal>
  )
}
