import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Badge from '../../components/Badge/Badge.jsx'
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog.jsx'
import TurnoFormModal from './TurnoFormModal.jsx'
import * as turnosService from '../../services/turnosService'
import * as pacientesService from '../../services/pacientesService'
import * as profesionalesService from '../../services/profesionalesService'
import * as tratamientosService from '../../services/tratamientosService'
import './Agenda.scss'

const DIAS_LABEL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function inicioSemana(offsetSemanas) {
  const hoy = new Date()
  const diaSemana = hoy.getDay()
  const lunes = new Date(hoy)
  lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7) + offsetSemanas * 7)
  return lunes
}

function formatearISO(date) {
  return date.toISOString().slice(0, 10)
}

export default function Agenda() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [offsetSemana, setOffsetSemana] = useState(0)
  const [turnos, setTurnos] = useState([])
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [tratamientos, setTratamientos] = useState([])
  const [profesionalFiltro, setProfesionalFiltro] = useState('Todos')
  const [modal, setModal] = useState(searchParams.get('nuevo') === '1' ? { modo: 'crear' } : null)
  const [aCancelar, setACancelar] = useState(null)

  const dias = useMemo(() => {
    const lunes = inicioSemana(offsetSemana)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(lunes)
      d.setDate(lunes.getDate() + i)
      return d
    })
  }, [offsetSemana])

  async function recargar() {
    const desde = formatearISO(dias[0])
    const hasta = formatearISO(dias[6])
    const [t, p, pr, tr] = await Promise.all([
      turnosService.getByRangoFechas(desde, hasta),
      pacientesService.getAll(),
      profesionalesService.getAll(),
      tratamientosService.getAll(),
    ])
    setTurnos(t)
    setPacientes(p)
    setProfesionales(pr)
    setTratamientos(tr)
  }

  useEffect(() => {
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetSemana])

  useEffect(() => {
    if (searchParams.get('nuevo') === '1') {
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function nombrePaciente(id) {
    const p = pacientes.find((x) => x.id === id)
    return p ? `${p.nombre} ${p.apellido}` : '—'
  }

  function nombreTratamiento(id) {
    return tratamientos.find((t) => t.id === id)?.nombre ?? '—'
  }

  const turnosFiltrados = turnos.filter(
    (t) => profesionalFiltro === 'Todos' || t.profesionalId === Number(profesionalFiltro),
  )

  async function handleGuardar(datos) {
    if (modal.modo === 'crear') {
      await turnosService.create(datos)
    } else {
      await turnosService.update(modal.turno.id, datos)
    }
    setModal(null)
    recargar()
  }

  async function handleCancelar() {
    await turnosService.setEstado(aCancelar.id, 'Cancelado')
    setACancelar(null)
    recargar()
  }

  return (
    <div className="agenda-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Agenda</h1>
          <p>Consultá y gestioná los turnos agendados, organizados por semana.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ modo: 'crear' })}>
          + Nuevo turno
        </button>
      </div>

      <div className="list-toolbar">
        <div className="agenda-week-nav">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOffsetSemana((o) => o - 1)}>
            ← Semana anterior
          </button>
          <strong>
            {dias[0].toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} —{' '}
            {dias[6].toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
          </strong>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setOffsetSemana((o) => o + 1)}>
            Semana siguiente →
          </button>
        </div>
        <select value={profesionalFiltro} onChange={(e) => setProfesionalFiltro(e.target.value)}>
          <option value="Todos">Todos los profesionales</option>
          {profesionales.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} {p.apellido}
            </option>
          ))}
        </select>
      </div>

      <div className="agenda-grid">
        {dias.map((dia) => {
          const iso = formatearISO(dia)
          const turnosDia = turnosFiltrados.filter((t) => t.fecha === iso).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
          const esHoy = iso === formatearISO(new Date())
          return (
            <div key={iso} className={`agenda-day ${esHoy ? 'agenda-day-today' : ''}`}>
              <div className="agenda-day-header">
                <span>{DIAS_LABEL[dia.getDay()]}</span>
                <strong>{dia.getDate()}</strong>
              </div>
              <div className="agenda-day-body">
                {turnosDia.length === 0 && <p className="agenda-empty">Sin turnos</p>}
                {turnosDia.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`agenda-turno-card estado-${t.estado.toLowerCase()}`}
                    onClick={() => setModal({ modo: 'editar', turno: t })}
                  >
                    <span className="agenda-turno-hora">
                      {t.horaInicio} - {t.horaFin}
                    </span>
                    <strong>{nombrePaciente(t.pacienteId)}</strong>
                    <span className="agenda-turno-tratamiento">{nombreTratamiento(t.tratamientoId)}</span>
                    <div className="agenda-turno-footer">
                      <Badge>{t.estado}</Badge>
                      {t.estado !== 'Cancelado' && (
                        <span
                          className="agenda-turno-cancelar"
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation()
                            setACancelar(t)
                          }}
                        >
                          Cancelar
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modal && (
        <TurnoFormModal
          turno={modal.modo === 'editar' ? modal.turno : null}
          fechaSugerida={formatearISO(dias[0])}
          onSave={handleGuardar}
          onClose={() => setModal(null)}
        />
      )}

      {aCancelar && (
        <ConfirmDialog
          title="¿Estás seguro de que deseas eliminar este turno?"
          message="Se cancelará el turno seleccionado y dejará de ocupar la agenda de ese horario."
          confirmLabel="Eliminar turno"
          onConfirm={handleCancelar}
          onCancel={() => setACancelar(null)}
        />
      )}
    </div>
  )
}
