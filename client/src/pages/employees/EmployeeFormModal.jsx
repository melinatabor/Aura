import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const ROLES = ['Administrador', 'Operador']

const EMPTY = { firstName: '', lastName: '', email: '', role: 'Operador' }

export default function EmployeeFormModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState(employee ? { ...employee } : { ...EMPTY })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal title={employee ? 'Editar empleado' : 'Nuevo rol'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">Nombre</label>
            <input id="firstName" required value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Apellido</label>
            <input id="lastName" required value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="role">Rol asignado</label>
          <select id="role" value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <span className="field-hint">
            {form.role === 'Administrador'
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
