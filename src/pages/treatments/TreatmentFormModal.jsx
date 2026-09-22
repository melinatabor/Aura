import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as treatmentsService from '../../bll/treatmentsService'

export default function TreatmentFormModal({ treatment, onSave, onClose }) {
  const [form, setForm] = useState({ ...treatment })
  const [otherTreatments, setOtherTreatments] = useState([])
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    treatmentsService.getAll().then((all) => setOtherTreatments(all.filter((t) => t.id !== treatment.id)))
    treatmentsService.getRecommendationsForTreatment(treatment.id).then((recs) => setSelectedIds(recs.map((r) => r.id)))
  }, [treatment.id])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleRecommended(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) }, selectedIds)
  }

  return (
    <Modal title="Modificar tratamiento" onClose={onClose} large>
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

        <div className="form-group">
          <label>Tratamientos recomendados junto con este</label>
          <div className="tratamiento-insumos-picker">
            {otherTreatments.map((t) => (
              <label key={t.id} className="tratamiento-insumo-check">
                <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleRecommended(t.id)} />
                {t.name}
              </label>
            ))}
          </div>
          <span className="field-hint">Ej. quienes hacen este tratamiento también suelen pedir estos otros.</span>
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
