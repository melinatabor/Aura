import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ProfessionalFormModal from './ProfessionalFormModal.jsx'
import * as professionalsService from '../../bll/professionalsService'
import * as treatmentsService from '../../bll/treatmentsService'

export default function ProfessionalsTab() {
  const [professionals, setProfessionals] = useState([])
  const [treatments, setTreatments] = useState([])
  const [assignments, setAssignments] = useState({})
  const [modal, setModal] = useState(null)
  const [toToggle, setToToggle] = useState(null)

  async function reload() {
    const [p, t, a] = await Promise.all([
      professionalsService.getAll(),
      treatmentsService.getAll(),
      professionalsService.getTreatmentAssignments(),
    ])
    setProfessionals(p)
    setTreatments(t)
    setAssignments(a)
  }

  useEffect(() => {
    reload()
  }, [])

  function treatmentNames(professionalId) {
    const ids = assignments[professionalId] ?? []
    return treatments.filter((t) => ids.includes(t.id)).map((t) => t.name)
  }

  async function handleSave(data, treatmentIds) {
    const saved =
      modal.mode === 'create'
        ? await professionalsService.create(data)
        : await professionalsService.update(modal.professional.id, data)
    await professionalsService.setTreatments(saved.id, treatmentIds)
    setModal(null)
    reload()
  }

  async function handleToggleStatus() {
    await professionalsService.setStatus(toToggle.id, toToggle.status === 'Activo' ? 'Inactivo' : 'Activo')
    setToToggle(null)
    reload()
  }

  return (
    <>
      <div className="list-toolbar" style={{ marginTop: 0 }}>
        <p className="field-hint">
          Los tratamientos asignados definen qué profesionales se ofrecen al agendar cada tratamiento.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
          + Nuevo profesional
        </button>
      </div>

      {professionals.length === 0 ? (
        <EmptyState title="Todavía no hay profesionales cargados" />
      ) : (
        <div className="aura-table-wrap">
          <table className="aura-table">
            <thead>
              <tr>
                <th>Profesional</th>
                <th>Especialidad</th>
                <th>Matrícula</th>
                <th>Tratamientos que realiza</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {professionals.map((p) => {
                const names = treatmentNames(p.id)
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>
                        {p.firstName} {p.lastName}
                      </strong>
                    </td>
                    <td>{p.specialty || '—'}</td>
                    <td>{p.licenseNumber || '—'}</td>
                    <td className="employees-treatments-cell">
                      {names.length === 0 ? <span className="field-hint">Sin tratamientos asignados</span> : names.join(', ')}
                    </td>
                    <td>
                      <Badge>{p.status}</Badge>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setModal({ mode: 'edit', professional: p })}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${p.status === 'Activo' ? 'btn-danger' : 'btn-primary'}`}
                          onClick={() => setToToggle(p)}
                        >
                          {p.status === 'Activo' ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <ProfessionalFormModal
          professional={modal.mode === 'edit' ? modal.professional : null}
          treatments={treatments}
          assignedTreatmentIds={modal.mode === 'edit' ? assignments[modal.professional.id] ?? [] : []}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {toToggle && (
        <ConfirmDialog
          title={`¿Confirmás ${toToggle.status === 'Activo' ? 'desactivar' : 'activar'} a ${toToggle.firstName} ${toToggle.lastName}?`}
          message={
            toToggle.status === 'Activo'
              ? 'Deja de aparecer al agendar turnos nuevos. Sus turnos ya registrados no se modifican.'
              : 'Vuelve a estar disponible para agendar turnos.'
          }
          confirmLabel="Confirmar"
          onConfirm={handleToggleStatus}
          onCancel={() => setToToggle(null)}
        />
      )}
    </>
  )
}
