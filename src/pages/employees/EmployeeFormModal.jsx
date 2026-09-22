import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const ROLES = ['Administrador', 'Operador']

export default function EmployeeFormModal({ employee, onSave, onClose }) {
  const [form, setForm] = useState({ ...employee })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({ firstName: form.firstName, lastName: form.lastName, role: form.role })
  }

  return (
    <Modal title="Editar empleado" onClose={onClose}>
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
          <label htmlFor="username">Usuario</label>
          <input id="username" value={form.username || ''} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} disabled />
          <span className="field-hint">El email de acceso se define al crear la cuenta y no se puede editar acá.</span>
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
