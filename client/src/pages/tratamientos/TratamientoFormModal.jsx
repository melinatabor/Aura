import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

export default function TratamientoFormModal({ tratamiento, onSave, onClose }) {
  const [form, setForm] = useState({ ...tratamiento })

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ ...form, precio: Number(form.precio), duracionMinutos: Number(form.duracionMinutos) })
  }

  return (
    <Modal title="Modificar tratamiento" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre</label>
          <input id="nombre" required value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea id="descripcion" rows={3} value={form.descripcion} onChange={(e) => handleChange('descripcion', e.target.value)} />
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
            <input
              id="precio"
              type="number"
              min="0"
              required
              value={form.precio}
              onChange={(e) => handleChange('precio', e.target.value)}
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
