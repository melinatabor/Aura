import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const EMPTY = {
  firstName: '',
  lastName: '',
  documentId: '',
  birthDate: '',
  phone: '',
  email: '',
  address: '',
}

export default function PatientFormModal({ patient, onSave, onClose }) {
  const [form, setForm] = useState(patient ? { ...patient } : { ...EMPTY })

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <Modal title={patient ? 'Editar datos del cliente' : 'Nuevo cliente'} onClose={onClose}>
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
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="documentId">DNI</label>
            <input id="documentId" required value={form.documentId} onChange={(e) => handleChange('documentId', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="birthDate">Fecha de nacimiento</label>
            <input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="address">Dirección</label>
          <input id="address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
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
