import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const VACIO = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  direccion: '',
}

export default function ClienteFormModal({ cliente, onSave, onClose }) {
  const [form, setForm] = useState(cliente ? { ...cliente } : { ...VACIO })

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal title={cliente ? 'Editar datos del cliente' : 'Nuevo cliente'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombre">Nombre</label>
            <input id="nombre" required value={form.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="apellido">Apellido</label>
            <input id="apellido" required value={form.apellido} onChange={(e) => handleChange('apellido', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dni">DNI</label>
            <input id="dni" required value={form.dni} onChange={(e) => handleChange('dni', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
            <input
              id="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="telefono">Teléfono</label>
            <input id="telefono" value={form.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Dirección</label>
          <input id="direccion" value={form.direccion} onChange={(e) => handleChange('direccion', e.target.value)} />
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
