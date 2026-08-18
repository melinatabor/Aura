import { useEffect, useState } from 'react'
import Badge from '../../components/Badge/Badge.jsx'
import StatCard from '../../components/StatCard/StatCard.jsx'
import * as pacientesService from '../../services/pacientesService'
import './AIPatientScoring.scss'

// Datos de ejemplo fijos: esta pantalla es solo una maqueta visual del
// Figma, no ejecuta ningún cálculo ni modelo real detrás.
const SCORES_MOCK = [
  { pacienteId: 1, score: 92, prioridad: 'Alta', motivo: 'Turnos frecuentes, sin cancelaciones recientes.' },
  { pacienteId: 3, score: 78, prioridad: 'Alta', motivo: 'Buen historial de asistencia.' },
  { pacienteId: 5, score: 61, prioridad: 'Media', motivo: 'Frecuencia irregular en los últimos meses.' },
  { pacienteId: 6, score: 55, prioridad: 'Media', motivo: 'Sin turnos en las últimas 3 semanas.' },
  { pacienteId: 9, score: 28, prioridad: 'Baja', motivo: 'Cliente inactivo, sin turnos recientes.' },
]

const PRIORIDAD_VARIANT = { Alta: 'success', Media: 'warning', Baja: 'danger' }

export default function AIPatientScoring() {
  const [pacientes, setPacientes] = useState([])

  useEffect(() => {
    pacientesService.getAll().then(setPacientes)
  }, [])

  const filas = SCORES_MOCK.map((s) => ({
    ...s,
    paciente: pacientes.find((p) => p.id === s.pacienteId),
  })).filter((f) => f.paciente)

  const promedio = filas.length ? Math.round(filas.reduce((sum, f) => sum + f.score, 0) / filas.length) : 0

  return (
    <div className="scoring-page">
      <div className="page-header">
        <h1>AI Patient Scoring</h1>
        <p>Vista conceptual de priorización de clientes. Los valores son de ejemplo, no provienen de un cálculo real.</p>
      </div>

      <div className="scoring-disclaimer">
        Esta pantalla es una maqueta visual. No hay ningún modelo de IA ni cálculo automático detrás de los puntajes
        mostrados — quedará fuera de esta fase del proyecto.
      </div>

      <div className="stat-grid">
        <StatCard label="Clientes evaluados" value={filas.length} />
        <StatCard label="Puntaje promedio" value={promedio} />
        <StatCard label="Prioridad alta" value={filas.filter((f) => f.prioridad === 'Alta').length} />
      </div>

      <div className="aura-table-wrap">
        <table className="aura-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Puntaje</th>
              <th>Prioridad</th>
              <th>Motivo</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.pacienteId}>
                <td>
                  <strong>
                    {f.paciente.nombre} {f.paciente.apellido}
                  </strong>
                </td>
                <td>
                  <div className="scoring-bar-track">
                    <div className="scoring-bar-fill" style={{ width: `${f.score}%` }} />
                  </div>
                  <span className="scoring-bar-value">{f.score}</span>
                </td>
                <td>
                  <Badge variant={PRIORIDAD_VARIANT[f.prioridad]}>{f.prioridad}</Badge>
                </td>
                <td>{f.motivo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
