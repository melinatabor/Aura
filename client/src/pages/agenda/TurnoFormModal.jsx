import { useEffect, useState } from 'react'
import Modal from '../../components/Modal/Modal.jsx'
import * as pacientesService from '../../services/pacientesService'
import * as profesionalesService from '../../services/profesionalesService'
import * as tratamientosService from '../../services/tratamientosService'
import * as turnosService from '../../services/turnosService'

const ESTADOS = ['Pendiente', 'Confirmado', 'Realizado', 'Cancelado']

function hoyISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function TurnoFormModal({ turno, fechaSugerida, onSave, onClose }) {
  const [pacientes, setPacientes] = useState([])
  const [profesionales, setProfesionales] = useState([])
  const [tratamientos, setTratamientos] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState(
    turno ?? {
      pacienteId: '',
      profesionalId: '',
      tratamientoId: '',
      fecha: fechaSugerida || hoyISO(),
      horaInicio: '09:00',
      horaFin: '10:00',
      estado: 'Pendiente',
      observaciones: '',
    },
  )

  useEffect(() => {
    pacientesService.getAll().then((lista) => setPacientes(lista.filter((p) => p.estado === 'Activo')))
    profesionalesService.getActivos().then(setProfesionales)
    tratamientosService.getActivos().then(setTratamientos)
  }, [])

  function handleChange(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.horaFin <= form.horaInicio) {
      setError('La hora de fin debe ser posterior a la hora de inicio.')
      return
    }

    const superpuesto = await turnosService.haySuperposicion({
      profesionalId: form.profesionalId,
      fecha: form.fecha,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      idExcluir: turno?.id,
    })

    if (superpuesto) {
      setError('El profesional ya tiene un turno asignado en ese horario.')
      return
    }

    onSave({
      ...form,
      pacienteId: Number(form.pacienteId),
      profesionalId: Number(form.profesionalId),
      tratamientoId: Number(form.tratamientoId),
    })
  }

  return (
    <Modal title={turno ? 'Editar turno' : 'Nuevo turno'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pacienteId">Paciente</label>
          <select id="pacienteId" required value={form.pacienteId} onChange={(e) => handleChange('pacienteId', e.target.value)}>
            <option value="">Seleccionar paciente...</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="profesionalId">Profesional</label>
            <select id="profesionalId" required value={form.profesionalId} onChange={(e) => handleChange('profesionalId', e.target.value)}>
              <option value="">Seleccionar...</option>
              {profesionales.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="tratamientoId">Tratamiento</label>
            <select id="tratamientoId" required value={form.tratamientoId} onChange={(e) => handleChange('tratamientoId', e.target.value)}>
              <option value="">Seleccionar...</option>
              {tratamientos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <input id="fecha" type="date" required value={form.fecha} onChange={(e) => handleChange('fecha', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <select id="estado" value={form.estado} onChange={(e) => handleChange('estado', e.target.value)}>
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="horaInicio">Hora inicio</label>
            <input id="horaInicio" type="time" required value={form.horaInicio} onChange={(e) => handleChange('horaInicio', e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="horaFin">Hora fin</label>
            <input id="horaFin" type="time" required value={form.horaFin} onChange={(e) => handleChange('horaFin', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea id="observaciones" rows={2} value={form.observaciones} onChange={(e) => handleChange('observaciones', e.target.value)} />
        </div>

        {error && <p className="field-error">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar turno
          </button>
        </div>
      </form>
    </Modal>
  )
}
