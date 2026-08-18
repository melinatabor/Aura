import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const ROLES = ['Administrador', 'Operador']

const VACIO = { nombre: '', apellido: '', email: '', rol: 'Operador' }

export default function EmpleadoFormModal({ empleado, onSave, onClose }) {
  const [form, setForm] = useState(empleado ? { ...empleado } : { ...VACIO })

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal title={empleado ? 'Editar empleado' : 'Nuevo rol'} onClose={onClose}>
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
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="rol">Rol asignado</label>
          <select id="rol" value={form.rol} onChange={(e) => handleChange('rol', e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <span className="field-hint">
            {form.rol === 'Administrador'
              ? 'Acceso completo: gestión de pacientes, profesionales, tratamientos, insumos, turnos y reglas de alerta.'
              : 'Acceso operativo: gestión de pacientes y turnos, consulta de tratamientos, profesionales y alertas.'}
          </span>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
