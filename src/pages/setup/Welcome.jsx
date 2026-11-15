import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import * as workspaceService from '../../bll/workspaceService'
import * as professionalsService from '../../bll/professionalsService'
import * as treatmentsService from '../../bll/treatmentsService'
import * as patientsService from '../../bll/patientsService'
import * as appointmentsService from '../../bll/appointmentsService'
import './Welcome.scss'

export default function Welcome() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([
      workspaceService.get(),
      professionalsService.getActive(),
      treatmentsService.getActive(),
      patientsService.getAll(),
      appointmentsService.getAll(),
    ]).then(([workspace, professionals, treatments, patients, appointments]) =>
      setData({ workspace, professionals, treatments, patients, appointments }),
    )
  }, [])

  if (!data) return null

  const steps = [
    {
      title: 'Cargá a tu equipo',
      text: 'Sumá a los profesionales y asignales los tratamientos que realizan.',
      to: '/app/employees',
      done: data.professionals.length > 0,
      detail: `${data.professionals.length} profesionales activos`,
    },
    {
      title: 'Armá tu catálogo de tratamientos',
      text: 'Definí duración, precio e insumos de cada servicio que ofrecés.',
      to: '/app/treatments',
      done: data.treatments.length > 0,
      detail: `${data.treatments.length} tratamientos activos`,
    },
    {
      title: 'Registrá a tus clientes',
      text: 'Cargá sus datos de contacto para poder agendarles turnos.',
      to: '/app/patients',
      done: data.patients.length > 0,
      detail: `${data.patients.length} clientes registrados`,
    },
    {
      title: 'Agendá el primer turno',
      text: 'Vinculá un cliente, un tratamiento y un profesional en la agenda.',
      to: '/app/schedule?new=1',
      done: data.appointments.length > 0,
      detail: `${data.appointments.length} turnos en la agenda`,
    },
  ]
  const completed = steps.filter((s) => s.done).length

  return (
    <div className="welcome-page">
      <div className="welcome-hero aura-card">
        <div className="modal-confirm-icon icon-success">✓</div>
        <h1>¡Tu espacio de trabajo está listo!</h1>
        <p>
          {data.workspace.name} ya tiene su horario de atención y sus reglas de seguimiento. Estos son los pasos
          recomendados para empezar a operar ({completed} de {steps.length} completos).
        </p>
      </div>

      <ol className="welcome-steps">
        {steps.map((step, index) => (
          <li key={step.title} className={`aura-card welcome-step ${step.done ? 'is-done' : ''}`}>
            <span className="welcome-step-number">{step.done ? <Check size={16} /> : index + 1}</span>
            <div className="welcome-step-body">
              <strong>{step.title}</strong>
              <p>{step.text}</p>
              <span className="field-hint">{step.detail}</span>
            </div>
            <Link to={step.to} className={`btn btn-sm ${step.done ? 'btn-secondary' : 'btn-primary'}`}>
              {step.done ? 'Revisar' : 'Empezar'}
            </Link>
          </li>
        ))}
      </ol>

      <Link to="/app/dashboard" className="btn btn-ghost">
        Ir al panel principal →
      </Link>
    </div>
  )
}
