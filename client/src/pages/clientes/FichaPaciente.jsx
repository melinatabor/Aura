import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Badge from '../../components/Badge/Badge.jsx'
import EmptyState from '../../components/EmptyState/EmptyState.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import ClienteFormModal from './ClienteFormModal.jsx'
import * as pacientesService from '../../services/pacientesService'
import * as turnosService from '../../services/turnosService'
import * as tratamientosService from '../../services/tratamientosService'
import * as profesionalesService from '../../services/profesionalesService'
import './FichaPaciente.scss'

const RECOMENDACIONES = [
  'Seguir tratamiento',
  'Priorizar contacto',
  'Recomendación de seguimiento',
]

export default function FichaPaciente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paciente, setPaciente] = useState(null)
  const [turnos, setTurnos] = useState([])
  const [tratamientos, setTratamientos] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [notas, setNotas] = useState('')
  const [editando, setEditando] = useState(false)
  const [eliminando, setEliminando] = useState(false)

  async function cargar() {
    const [p, t, tr, pr] = await Promise.all([
      pacientesService.getById(id),
      turnosService.getAll(),
      tratamientosService.getAll(),
      profesionalesService.getAll(),
    ])
    setPaciente(p)
    setTurnos(t.filter((turno) => turno.pacienteId === Number(id)))
    setTratamientos(tr)
    setProfesionales(pr)
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!paciente) return null

  const hoy = new Date().toISOString().slice(0, 10)
  const proximosTurnos = turnos.filter((t) => t.fecha >= hoy && t.estado !== 'Cancelado')
  const historial = turnos.filter((t) => t.fecha < hoy || t.estado === 'Realizado')

  function nombreTratamiento(tid) {
    return tratamientos.find((t) => t.id === tid)?.nombre ?? '—'
  }

  function nombreProfesional(pid) {
    const pr = profesionales.find((p) => p.id === pid)
    return pr ? `${pr.nombre} ${pr.apellido}` : '—'
  }

  async function handleGuardar(datos) {
    await pacientesService.update(paciente.id, datos)
    setEditando(false)
    cargar()
  }

  async function handleEliminar() {
    await pacientesService.setEstado(paciente.id, 'Inactivo')
    setEliminando(false)
    navigate('/app/clientes')
  }

  return (
    <div className="ficha-paciente">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Ficha del cliente</h1>
          <p>
            {paciente.nombre} {paciente.apellido} · <Badge>{paciente.estado}</Badge>
          </p>
        </div>
        <div className="table-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setEditando(true)}>
            Editar cliente
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setEliminando(true)}>
            Desactivar cliente
          </button>
        </div>
      </div>

      <div className="ficha-grid">
        <div className="ficha-columna-principal">
          <section className="aura-card">
            <h2 className="section-title">Datos del cliente</h2>
            <dl className="ficha-datos">
              <div>
                <dt>DNI</dt>
                <dd>{paciente.dni}</dd>
              </div>
              <div>
                <dt>Fecha de nacimiento</dt>
                <dd>{paciente.fechaNacimiento || '—'}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{paciente.telefono || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{paciente.email}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{paciente.direccion || '—'}</dd>
              </div>
              <div>
                <dt>Fecha de alta</dt>
                <dd>{paciente.fechaAlta}</dd>
              </div>
            </dl>
          </section>

          <section className="aura-card">
            <h2 className="section-title">Próximos turnos</h2>
            {proximosTurnos.length === 0 ? (
              <EmptyState title="Sin turnos agendados" />
            ) : (
              <ul className="ficha-turnos-list">
                {proximosTurnos.map((t) => (
                  <li key={t.id}>
                    <div>
                      <strong>{nombreTratamiento(t.tratamientoId)}</strong>
                      <p>
                        {t.fecha} · {t.horaInicio} hs · {nombreProfesional(t.profesionalId)}
                      </p>
                    </div>
                    <Badge>{t.estado}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="aura-card">
            <h2 className="section-title">Historial de tratamientos</h2>
            {historial.length === 0 ? (
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
                    {historial.map((t) => (
                      <tr key={t.id}>
                        <td>{t.fecha}</td>
                        <td>{nombreTratamiento(t.tratamientoId)}</td>
                        <td>{nombreProfesional(t.profesionalId)}</td>
                        <td>
                          <Badge>{t.estado}</Badge>
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
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </section>
        </div>

        <aside className="aura-card ficha-recomendaciones">
          <h2 className="section-title">Recomendaciones AURA</h2>
          <ul>
            {RECOMENDACIONES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </aside>
      </div>

      {editando && <ClienteFormModal cliente={paciente} onSave={handleGuardar} onClose={() => setEditando(false)} />}

      {eliminando && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas desactivar este cliente?"
          message="Se conserva su historial y podrá reactivarse más adelante desde el listado."
          confirmLabel="Sí, desactivar"
          onConfirm={handleEliminar}
          onCancel={() => setEliminando(false)}
        />
      )}

      <Link to="/app/clientes" className="btn btn-ghost btn-sm">
        ← Volver al listado
      </Link>
    </div>
  )
}
