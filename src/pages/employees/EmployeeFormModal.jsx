import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

export default function EmployeeFormModal({ employee, roles, professionals, linkedProfessionalIds, isSelf, onSave, onClose }) {
  const [form, setForm] = useState({ ...employee })
  const selectedRole = roles.find((r) => r.id === Number(form.roleId))
  const availableProfessionals = professionals.filter(
    (p) => p.id === employee.professionalId || !linkedProfessionalIds.includes(p.id),
  )

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave({
      firstName: form.firstName,
      lastName: form.lastName,
      roleId: Number(form.roleId),
      professionalId: form.professionalId ? Number(form.professionalId) : null,
    })
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
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={form.email} disabled />
          <span className="field-hint">El email y el usuario se definen al crear la cuenta.</span>
        </div>
        <div className="form-group">
          <label htmlFor="roleId">Rol asignado</label>
          <select id="roleId" value={form.roleId} disabled={isSelf} onChange={(e) => handleChange('roleId', e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <span className="field-hint">
            {isSelf ? 'No podés cambiar tu propio rol (evita quedarte sin acceso por error).' : selectedRole?.description}
          </span>
        </div>
        <div className="form-group">
          <label htmlFor="professionalId">Profesional vinculado</label>
          <select id="professionalId" value={form.professionalId ?? ''} onChange={(e) => handleChange('professionalId', e.target.value)}>
            <option value="">Ninguno</option>
            {availableProfessionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
          <span className="field-hint">Si la cuenta es de un profesional, la agenda le muestra sus turnos por defecto.</span>
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
