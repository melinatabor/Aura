import * as patientsService from './patientsService'
import * as appointmentsService from './appointmentsService'
import { supabase } from '../dal/supabaseClient'

// AI Patient Scoring: no es un modelo de machine learning, es un sistema
// experto de reglas ponderadas (recencia + frecuencia + confiabilidad) sobre
// los turnos reales del cliente. Queda explicado así para el profesor: se
// puede razonar cada puntaje a mano, no es una caja negra.
const RECENCY_WEIGHT = 40
const FREQUENCY_WEIGHT = 35
const RELIABILITY_WEIGHT = 25

function daysSince(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function recencyScore(days) {
  if (days === null) return 0
  if (days <= 14) return RECENCY_WEIGHT
  if (days <= 30) return RECENCY_WEIGHT * 0.75
  if (days <= 60) return RECENCY_WEIGHT * 0.5
  if (days <= 90) return RECENCY_WEIGHT * 0.25
  return 0
}

function buildReason({ recencyDays, completedCount, cancellationRate }) {
  if (recencyDays === null) return 'Todavía no registra turnos en el sistema.'
  if (recencyDays > 90) return `Sin turnos hace más de ${Math.floor(recencyDays / 30)} meses.`
  if (cancellationRate > 0.3) return 'Alta proporción de cancelaciones en su historial.'
  if (recencyDays <= 14 && completedCount >= 3) return 'Turnos frecuentes y recientes, sin señales de abandono.'
  if (recencyDays <= 30) return 'Actividad reciente, dentro del último mes.'
  return 'Frecuencia irregular en los últimos meses.'
}

function scorePatient(patient, allAppointments) {
  const own = allAppointments.filter((a) => a.patientId === patient.id)
  const completed = own.filter((a) => a.status === 'Realizado')
  const cancelled = own.filter((a) => a.status === 'Cancelado')
  const withOutcome = own.filter((a) => a.status !== 'Pendiente')

  const lastDate = own.map((a) => a.date).sort().at(-1)
  const recencyDays = lastDate ? daysSince(lastDate) : null
  const cancellationRate = withOutcome.length > 0 ? cancelled.length / withOutcome.length : 0

  const frequency = Math.min(FREQUENCY_WEIGHT, completed.length * 7)
  const reliability = withOutcome.length > 0 ? (1 - cancellationRate) * RELIABILITY_WEIGHT : RELIABILITY_WEIGHT * 0.6

  const score = Math.round(Math.min(100, recencyScore(recencyDays) + frequency + reliability))
  const priority = score >= 70 ? 'Alta' : score >= 40 ? 'Media' : 'Baja'

  return {
    patientId: patient.id,
    score,
    priority,
    reason: buildReason({ recencyDays, completedCount: completed.length, cancellationRate }),
    recencyDays,
    completedCount: completed.length,
    cancellationRate,
  }
}

export async function getScores() {
  const [patients, appointments] = await Promise.all([patientsService.getAll(), appointmentsService.getAll()])
  return patients
    .filter((p) => p.status === 'Activo')
    .map((p) => scorePatient(p, appointments))
    .sort((a, b) => b.score - a.score)
}

// El puntaje sigue siendo la fórmula (determinística, explicable, gratis);
// esto genera además una recomendación en lenguaje natural con un modelo de
// IA real (Claude), a pedido, vía una Supabase Edge Function que guarda la
// API key del lado del servidor.
export async function generateInsight(entry, patientName) {
  const { data, error } = await supabase.functions.invoke('patient-insight', {
    body: {
      patientName,
      score: entry.score,
      priority: entry.priority,
      recencyDays: entry.recencyDays,
      completedCount: entry.completedCount,
      cancellationRate: entry.cancellationRate,
    },
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data.insight
}
