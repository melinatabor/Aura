import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import PatientFormModal from './PatientFormModal.jsx'
import * as patientsService from '../../services/patientsService'
import * as appointmentsService from '../../services/appointmentsService'
import * as treatmentsService from '../../services/treatmentsService'
import * as professionalsService from '../../services/professionalsService'
import './PatientProfile.scss'

const RECOMMENDATIONS = [
  'Seguir tratamiento',
  'Priorizar contacto',
  'Recomendación de seguimiento',
]

export default function PatientProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [treatments, setTreatments] = useState([])
  const [professionals, setProfessionals] = useState([])
  const [notes, setNotes] = useState('')
  const [editing, setEditing] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  async function load() {
    const [p, a, t, pr] = await Promise.all([
      patientsService.getById(id),
      appointmentsService.getAll(),
      treatmentsService.getAll(),
      professionalsService.getAll(),
    ])
    setPatient(p)
    setAppointments(a.filter((appointment) => appointment.patientId === Number(id)))
    setTreatments(t)
    setProfessionals(pr)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!patient) return null

  const today = new Date().toISOString().slice(0, 10)
  const upcomingAppointments = appointments.filter((a) => a.date >= today && a.status !== 'Cancelado')
  const history = appointments.filter((a) => a.date < today || a.status === 'Realizado')

  function treatmentName(tid) {
    return treatments.find((t) => t.id === tid)?.name ?? '—'
  }

  function professionalName(pid) {
    const pr = professionals.find((p) => p.id === pid)
    return pr ? `${pr.firstName} ${pr.lastName}` : '—'
  }

  async function handleSave(data) {
    await patientsService.update(patient.id, data)
    setEditing(false)
    load()
  }

  async function handleDeactivate() {
    await patientsService.setStatus(patient.id, 'Inactivo')
    setDeactivating(false)
    navigate('/app/patients')
  }

  return (
    <div className="patient-profile">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Ficha del cliente</h1>
          <p>
            {patient.firstName} {patient.lastName} · <Badge>{patient.status}</Badge>
          </p>
        </div>
        <div className="table-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
            Editar cliente
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setDeactivating(true)}>
            Desactivar cliente
          </button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-main-column">
          <section className="aura-card">
            <h2 className="section-title">Datos del cliente</h2>
            <dl className="profile-data">
              <div>
                <dt>DNI</dt>
                <dd>{patient.documentId}</dd>
              </div>
              <div>
                <dt>Fecha de nacimiento</dt>
                <dd>{patient.birthDate || '—'}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{patient.phone || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{patient.email}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{patient.address || '—'}</dd>
              </div>
              <div>
                <dt>Fecha de alta</dt>
                <dd>{patient.registeredAt}</dd>
              </div>
            </dl>
          </section>

          <section className="aura-card">
            <h2 className="section-title">Próximos turnos</h2>
            {upcomingAppointments.length === 0 ? (
              <EmptyState title="Sin turnos agendados" />
            ) : (
              <ul className="profile-appointments-list">
                {upcomingAppointments.map((a) => (
                  <li key={a.id}>
                    <div>
                      <strong>{treatmentName(a.treatmentId)}</strong>
                      <p>
                        {a.date} · {a.startTime} hs · {professionalName(a.professionalId)}
                      </p>
                    </div>
                    <Badge>{a.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="aura-card">
            <h2 className="section-title">Historial de tratamientos</h2>
            {history.length === 0 ? (
              <EmptyState title="Todavía no hay historial registrado" />
            ) : (
              <div className="aura-table-wrap">
                <table className="aura-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tratamiento</th>
                      <th>Profesional</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((a) => (
                      <tr key={a.id}>
                        <td>{a.date}</td>
                        <td>{treatmentName(a.treatmentId)}</td>
                        <td>{professionalName(a.professionalId)}</td>
                        <td>
                          <Badge>{a.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="aura-card">
            <h2 className="section-title">Notas internas</h2>
            <textarea
              rows={4}
              placeholder="Escribí una nota interna sobre este cliente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </section>
        </div>

        <aside className="aura-card profile-recommendations">
          <h2 className="section-title">Recomendaciones AURA</h2>
          <ul>
            {RECOMMENDATIONS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </aside>
      </div>

      {editing && <PatientFormModal patient={patient} onSave={handleSave} onClose={() => setEditing(false)} />}

      {deactivating && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas desactivar este cliente?"
          message="Se conserva su historial y podrá reactivarse más adelante desde el listado."
          confirmLabel="Sí, desactivar"
          onConfirm={handleDeactivate}
          onCancel={() => setDeactivating(false)}
        />
      )}

      <Link to="/app/patients" className="btn btn-ghost btn-sm">
        ← Volver al listado
      </Link>
    </div>
  )
}
