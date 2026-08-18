import { Link } from 'react-router-dom'
import './Features.scss'

const GROUPS = [
  {
    title: 'Atención y clientes',
    description: 'Gestión integral del flujo de pacientes y servicios de manera centralizada.',
    items: [
      { icon: '📅', title: 'Agenda de turnos', description: 'Consultá tus turnos por día, semana o profesional y evitá cruces de horario con control automático.' },
      { icon: '🗂', title: 'Ficha del cliente', description: 'Centralizá datos de contacto, historial de tratamientos y notas internas de cada cliente.' },
      { icon: '📝', title: 'Registro de tratamientos', description: 'Dejá constancia de cada atención: profesional responsable, observaciones y fecha.' },
    ],
  },
  {
    title: 'Seguimiento inteligente',
    description: 'Automatización y control para la fidelización de pacientes.',
    items: [
      { icon: '🔔', title: 'Alertas de seguimiento', description: 'Detectá pacientes que no reservan turnos hace tiempo o insumos que se están agotando.' },
      { icon: '⭐', title: 'Priorización de clientes', description: 'Clasificá clientes según criterios operativos: seguimiento, vínculo y frecuencia de turno.' },
      { icon: '💬', title: 'Asistente de recomendación', description: 'Sugerencias orientadas para programar contactos y proponer mensajes de seguimiento.' },
    ],
  },
  {
    title: 'Operación interna',
    description: 'Control de recursos y desempeño del centro de manera integral.',
    items: [
      { icon: '💆', title: 'Catálogo de tratamientos', description: 'Administrá tratamientos ofrecidos: categoría, duración, precio orientativo y estado.' },
      { icon: '🧴', title: 'Insumos y stock', description: 'Registrá productos utilizados, controlá stock mínimo y recibí alerta cuando escasea.' },
      { icon: '📊', title: 'Reportes operativos', description: 'Consultá turnos, clientes, tratamientos realizados y consumo de insumos en tiempo real.' },
    ],
  },
]

export default function Features() {
  return (
    <div className="features-page">
      <header className="features-hero">
        <h1>Funcionalidades para ordenar la atención estética</h1>
        <p>
          Aura reúne las herramientas necesarias para gestionar turnos, clientes, tratamientos y seguimientos dentro
          de un mismo entorno de trabajo.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.title} className="features-group">
          <h2>{group.title}</h2>
          <p className="features-group-desc">{group.description}</p>
          <div className="features-grid">
            {group.items.map((item) => (
              <div key={item.title} className="aura-card feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="features-cta">
        <h2>¿Listo para transformar tu estética?</h2>
        <p>Empezá a gestionar tu centro con la suscripción que más se ajuste a tu operación.</p>
        <Link to="/activate-account" className="btn btn-secondary">
          Solicitar demo
        </Link>
      </section>
    </div>
  )
}
