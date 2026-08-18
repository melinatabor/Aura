import { Link } from 'react-router-dom'
import './Funcionalidades.scss'

const GRUPOS = [
  {
    titulo: 'Atención y clientes',
    descripcion: 'Gestión integral del flujo de pacientes y servicios de manera centralizada.',
    items: [
      { icono: '📅', titulo: 'Agenda de turnos', descripcion: 'Consultá tus turnos por día, semana o profesional y evitá cruces de horario con control automático.' },
      { icono: '🗂', titulo: 'Ficha del cliente', descripcion: 'Centralizá datos de contacto, historial de tratamientos y notas internas de cada cliente.' },
      { icono: '📝', titulo: 'Registro de tratamientos', descripcion: 'Dejá constancia de cada atención: profesional responsable, observaciones y fecha.' },
    ],
  },
  {
    titulo: 'Seguimiento inteligente',
    descripcion: 'Automatización y control para la fidelización de pacientes.',
    items: [
      { icono: '🔔', titulo: 'Alertas de seguimiento', descripcion: 'Detectá pacientes que no reservan turnos hace tiempo o insumos que se están agotando.' },
      { icono: '⭐', titulo: 'Priorización de clientes', descripcion: 'Clasificá clientes según criterios operativos: seguimiento, vínculo y frecuencia de turno.' },
      { icono: '💬', titulo: 'Asistente de recomendación', descripcion: 'Sugerencias orientadas para programar contactos y proponer mensajes de seguimiento.' },
    ],
  },
  {
    titulo: 'Operación interna',
    descripcion: 'Control de recursos y desempeño del centro de manera integral.',
    items: [
      { icono: '💆', titulo: 'Catálogo de tratamientos', descripcion: 'Administrá tratamientos ofrecidos: categoría, duración, precio orientativo y estado.' },
      { icono: '🧴', titulo: 'Insumos y stock', descripcion: 'Registrá productos utilizados, controlá stock mínimo y recibí alerta cuando escasea.' },
      { icono: '📊', titulo: 'Reportes operativos', descripcion: 'Consultá turnos, clientes, tratamientos realizados y consumo de insumos en tiempo real.' },
    ],
  },
]

export default function Funcionalidades() {
  return (
    <div className="funcionalidades-page">
      <header className="funcionalidades-hero">
        <h1>Funcionalidades para ordenar la atención estética</h1>
        <p>
          Aura reúne las herramientas necesarias para gestionar turnos, clientes, tratamientos y seguimientos dentro
          de un mismo entorno de trabajo.
        </p>
      </header>

      {GRUPOS.map((grupo) => (
        <section key={grupo.titulo} className="funcionalidades-grupo">
          <h2>{grupo.titulo}</h2>
          <p className="funcionalidades-grupo-desc">{grupo.descripcion}</p>
          <div className="funcionalidades-grid">
            {grupo.items.map((item) => (
              <div key={item.titulo} className="aura-card funcionalidad-card">
                <div className="funcionalidad-icon">{item.icono}</div>
                <h3>{item.titulo}</h3>
                <p>{item.descripcion}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="funcionalidades-cta">
        <h2>¿Listo para transformar tu estética?</h2>
        <p>Empezá a gestionar tu centro con la suscripción que más se ajuste a tu operación.</p>
        <Link to="/activacion-cuenta" className="btn btn-secondary">
          Solicitar demo
        </Link>
      </section>
    </div>
  )
}
