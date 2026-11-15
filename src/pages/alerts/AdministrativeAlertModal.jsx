import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

export default function AdministrativeAlertModal({ onSave, onClose }) {
  const [form, setForm] = useState({ title: '', detail: '', priority: 'Media' })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal title="Nueva alerta administrativa" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="alertTitle">Título</label>
          <input
            id="alertTitle"
            required
            placeholder="ej. Renovar habilitación municipal"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="alertDetail">Detalle</label>
          <textarea id="alertDetail" rows={3} value={form.detail} onChange={(e) => handleChange('detail', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="alertPriority">Prioridad</label>
          <select id="alertPriority" value={form.priority} onChange={(e) => handleChange('priority', e.target.value)}>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Crear alerta
          </button>
        </div>
      </form>
    </Modal>
  )
}
