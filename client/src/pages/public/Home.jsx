import { Link } from 'react-router-dom'
import { Sparkles, Building2, Users } from 'lucide-react'
import './Home.scss'

const PROFILES = [
  {
    icon: Sparkles,
    title: 'Profesional independiente',
    description: 'Organizá tus turnos, tratamientos y clientes, trabajando desde un mismo lugar.',
  },
  {
    icon: Building2,
    title: 'Centro estético',
    description: 'Centralizá la agenda, las fichas de tus clientes y la atención de tu equipo.',
  },
  {
    icon: Users,
    title: 'Equipo de trabajo',
    description: 'Compartí agenda, turnos y seguimientos con visibilidad clara para todo el equipo.',
  },
]

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <h1>Centralizá la atención y el seguimiento de tus clientes</h1>
          <p>
            Aura es una plataforma web para centros estéticos, profesionales independientes y espacios de bienestar
            que permite organizar turnos, clientes, tratamientos y acciones de seguimiento en un mismo sistema.
          </p>
          <div className="home-hero-actions">
            <Link to="/activate-account" className="btn btn-primary">
              Registrate
            </Link>
            <Link to="/features" className="btn btn-secondary">
              Conocer funcionalidades
            </Link>
          </div>
        </div>
        <div className="home-hero-media">
          <img
            src="https://images.pexels.com/photos/36837604/pexels-photo-36837604/free-photo-of-cozy-spa-room-interior-design-with-soft-lighting.jpeg?auto=compress&cs=tinysrgb&w=900"
            alt="Sala de tratamiento de un centro estético, cálida y minimalista"
            loading="lazy"
          />
        </div>
      </section>

      <section className="home-section home-problem">
        <h2>El problema que resuelve Aura</h2>
        <p className="home-problem-lead">Menos información dispersa. Más continuidad en la atención.</p>
        <p>
          En la gestión diaria de un centro estético, la información suele quedar repartida entre agendas, mensajes,
          notas internas y registros sueltos. Esto puede hacer que un seguimiento se pierda, que una observación
          importante no esté disponible o que el control operativo pierda claridad. Con Aura, cada turno, cada
          tratamiento y alerta queda conectado dentro de un mismo entorno, permitiendo que el equipo sepa qué ocurrió,
          qué falta registrar y qué acción corresponde tomar.
        </p>
      </section>

      <section className="home-section">
        <h2>Pensado para quienes gestionan atención estética</h2>
        <div className="home-profiles">
          {PROFILES.map((profile) => (
            <div key={profile.title} className="aura-card home-profile-card">
              <div className="home-profile-icon">
                <profile.icon size={22} strokeWidth={1.75} />
              </div>
              <h3>{profile.title}</h3>
              <p>{profile.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section home-cta">
        <h2>Ordená el seguimiento de tus clientes desde una misma plataforma</h2>
        <p>
          Creá tu espacio de trabajo, configurá tus horarios y comenzá a gestionar turnos, fichas y seguimientos con
          una estructura clara para uso diario.
        </p>
        <div className="home-hero-actions">
          <Link to="/activate-account" className="btn btn-primary">
            Crear cuenta profesional
          </Link>
          <Link to="/contact" className="btn btn-secondary">
            Enviar consulta
          </Link>
        </div>
      </section>
    </div>
  )
}
