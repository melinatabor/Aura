import { useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'

const EMPTY = { firstName: '', lastName: '', documentId: '', licenseNumber: '', phone: '', email: '', specialty: '' }

export default function ProfessionalFormModal({ professional, treatments, assignedTreatmentIds, onSave, onClose }) {
  const [form, setForm] = useState(professional ?? EMPTY)
  const [selectedIds, setSelectedIds] = useState(assignedTreatmentIds)
  const [error, setError] = useState('')

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleTreatment(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await onSave(form, selectedIds)
    } catch (err) {
      setError(err.code === '23505' ? 'Ya existe un profesional con ese documento.' : 'No se pudo guardar el profesional.')
    }
  }

  return (
    <Modal title={professional ? 'Editar profesional' : 'Nuevo profesional'} onClose={onClose} large>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="proFirstName">Nombre</label>
            <input id="proFirstName" required value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="proLastName">Apellido</label>
            <input id="proLastName" required value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="proDocument">Documento</label>
            <input id="proDocument" required value={form.documentId} onChange={(e) => handleChange('documentId', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="proLicense">Matrícula</label>
            <input id="proLicense" value={form.licenseNumber ?? ''} onChange={(e) => handleChange('licenseNumber', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="proEmail">Email</label>
            <input id="proEmail" type="email" required value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="proPhone">Teléfono</label>
            <input id="proPhone" value={form.phone ?? ''} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="proSpecialty">Especialidad</label>
          <input id="proSpecialty" value={form.specialty ?? ''} onChange={(e) => handleChange('specialty', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tratamientos que realiza</label>
          <div className="checkbox-picker">
            {treatments.map((t) => (
              <label key={t.id} className="checkbox-option">
                <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => toggleTreatment(t.id)} />
                {t.name}
                {t.status !== 'Activo' && <span className="field-hint">(inactivo)</span>}
              </label>
            ))}
          </div>
        </div>

        {error && <p className="field-error">{error}</p>}

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
