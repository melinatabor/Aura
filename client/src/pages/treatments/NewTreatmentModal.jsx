import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as suppliesService from '../../services/suppliesService'

const CATEGORIES = ['Facial', 'Corporal', 'Depilación']

export default function NewTreatmentModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', description: '', durationMinutes: '', price: '', category: CATEGORIES[0] })
  const [supplies, setSupplies] = useState([])
  const [selection, setSelection] = useState({})

  useEffect(() => {
    suppliesService.getAll().then(setSupplies)
  }, [])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleSupply(id) {
    setSelection((prev) => {
      const copy = { ...prev }
      if (copy[id] !== undefined) {
        delete copy[id]
      } else {
        copy[id] = 1
      }
      return copy
    })
  }

  function handleQuantity(id, quantity) {
    setSelection((prev) => ({ ...prev, [id]: Number(quantity) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const relations = Object.entries(selection).map(([supplyId, quantity]) => ({ supplyId: Number(supplyId), quantity }))
    onSave(
      { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) },
      relations,
    )
  }

  return (
    <Modal title="Nuevo tratamiento" onClose={onClose} large>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Nombre del tratamiento</label>
            <input id="name" required value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select id="category" value={form.category} onChange={(e) => handleChange('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea id="description" rows={2} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
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
            <input id="price" type="number" min="0" required value={form.price} onChange={(e) => handleChange('price', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Insumos vinculados</label>
          <div className="treatment-supplies-picker">
            {supplies.map((supply) => (
              <div key={supply.id} className="treatment-supply-row">
                <label className="treatment-supply-check">
                  <input type="checkbox" checked={selection[supply.id] !== undefined} onChange={() => toggleSupply(supply.id)} />
                  {supply.name}
                </label>
                {selection[supply.id] !== undefined && (
                  <input
                    type="number"
                    min="1"
                    className="treatment-supply-quantity"
                    value={selection[supply.id]}
                    onChange={(e) => handleQuantity(supply.id, e.target.value)}
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
