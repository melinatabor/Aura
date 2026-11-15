import { Link } from 'react-router-dom'
import {
  Building2,
  Users,
  User,
  CalendarCheck,
  FolderOpen,
  Bell,
  Sparkles,
  Package,
  BarChart3,
  ArrowRight,
  Check,
  UserPlus,
  Settings2,
  Rocket,
  CircleCheck,
} from 'lucide-react'
import useReveal from '../../hooks/useReveal'
import './Home.scss'

const PROFILES = [
  {
    icon: User,
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

const STEPS = [
  { icon: UserPlus, title: 'Creá tu espacio', text: 'Registrate y cargá a tu equipo, tus tratamientos y tus clientes.' },
  { icon: Settings2, title: 'Configurá tu atención', text: 'Definí horarios, días de atención y reglas de seguimiento.' },
  { icon: Rocket, title: 'Empezá a operar', text: 'Agendá turnos, recibí alertas y dejá que AURA priorice por vos.' },
]

const MARQUEE = ['Agenda de turnos', 'Fichas de clientes', 'Tratamientos', 'Control de insumos', 'Alertas de seguimiento', 'Reportes', 'Priorización con IA', 'Roles y permisos']

export default function Home() {
  const ref = useReveal()
  return (
    <div className="home-page" ref={ref}>
      <div className="home-blob home-blob--a" />
      <div className="home-blob home-blob--b" />

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">
            <span className="home-eyebrow-dot" /> Gestión inteligente para bienestar y estética
          </span>
          <h1>
            Cada cliente, cada turno y cada seguimiento, <em>en un solo lugar</em>
          </h1>
          <p>
            AURA es la plataforma web para centros estéticos y profesionales independientes que organiza turnos,
            clientes, tratamientos e insumos — y te avisa a quién contactar antes de que se pierda la continuidad.
          </p>
          <div className="home-hero-actions">
            <Link to="/activate-account" className="btn btn-primary home-btn-lg">
              Registrate <ArrowRight size={16} />
            </Link>
            <Link to="/features" className="btn btn-secondary home-btn-lg">
              Conocer funcionalidades
            </Link>
          </div>
          <ul className="home-hero-points">
            <li>
              <Check size={14} /> Sin instalar nada
            </li>
            <li>
              <Check size={14} /> Roles y permisos
            </li>
            <li>
              <Check size={14} /> Recomendaciones con IA
            </li>
          </ul>
        </div>

        <div className="home-hero-visual">
          <div className="home-hero-media">
            <img
              src="https://images.pexels.com/photos/36837604/pexels-photo-36837604/free-photo-of-cozy-spa-room-interior-design-with-soft-lighting.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Sala de tratamiento de un centro estético, cálida y minimalista"
            />
          </div>

          <div className="home-float home-float--turn">
            <span className="home-float-icon">
              <CalendarCheck size={16} />
            </span>
            <div>
              <strong>Turno confirmado</strong>
              <span>Limpieza facial · 11:00</span>
            </div>
          </div>

          <div className="home-float home-float--score">
            <div className="home-float-head">
              <Sparkles size={15} /> Prioridad de seguimiento
            </div>
            <div className="home-float-score">
              98<small>/100</small>
            </div>
            <div className="home-float-bars">
              <i style={{ '--w': '100%' }} />
              <i style={{ '--w': '88%' }} />
              <i style={{ '--w': '72%' }} />
            </div>
          </div>

          <div className="home-float home-float--alert">
            <span className="home-float-icon home-float-icon--warn">
              <Bell size={16} />
            </span>
            <div>
              <strong>Stock mínimo</strong>
              <span>Crema hidratante</span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-marquee" aria-hidden="true">
        <div className="home-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i}>
              <CircleCheck size={14} /> {item}
            </span>
          ))}
        </div>
      </div>

      <section className="home-section home-problem reveal">
        <span className="home-kicker">El problema</span>
        <h2>Menos información dispersa. Más continuidad en la atención.</h2>
        <p>
          En la gestión diaria de un centro estético, la información suele quedar repartida entre agendas, mensajes,
          notas internas y registros sueltos. Con AURA, cada turno, cada tratamiento y cada alerta queda conectado
          dentro de un mismo entorno: el equipo sabe qué ocurrió, qué falta registrar y qué acción corresponde tomar.
        </p>
      </section>

      <section className="home-section">
        <div className="reveal">
          <span className="home-kicker">Todo conectado</span>
          <h2>Una plataforma, todo el flujo de atención</h2>
        </div>
        <div className="home-bento">
          <article className="home-bento-card home-bento-card--wide reveal">
            <span className="home-bento-icon">
              <CalendarCheck size={20} />
            </span>
            <h3>Agenda sin cruces</h3>
            <p>Vista semanal por horas, filtro por profesional y control automático de horarios de atención.</p>
            <div className="home-mini-cal" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((d) => (
                <div key={d} className="home-mini-cal-col">
                  <i style={{ '--h': `${30 + ((d * 17) % 40)}%`, '--t': `${(d * 13) % 30}%` }} />
                  <i style={{ '--h': `${20 + ((d * 11) % 25)}%`, '--t': `${55 + ((d * 7) % 20)}%` }} />
                </div>
              ))}
            </div>
          </article>
          <article className="home-bento-card reveal" style={{ transitionDelay: '100ms' }}>
            <span className="home-bento-icon">
              <FolderOpen size={20} />
            </span>
            <h3>Ficha del cliente</h3>
            <p>Historial, notas y recomendaciones de cada persona, siempre a mano.</p>
          </article>
          <article className="home-bento-card reveal" style={{ transitionDelay: '150ms' }}>
            <span className="home-bento-icon">
              <Package size={20} />
            </span>
            <h3>Insumos y stock</h3>
            <p>Alertas cuando un producto llega al mínimo.</p>
          </article>
          <article className="home-bento-card reveal" style={{ transitionDelay: '200ms' }}>
            <span className="home-bento-icon">
              <BarChart3 size={20} />
            </span>
            <h3>Reportes</h3>
            <p>Turnos, clientes y consumo, exportables en un clic.</p>
          </article>
        </div>
      </section>

      <section className="home-ai reveal">
        <div className="home-ai-copy">
          <span className="home-kicker home-kicker--light">AI Patient Scoring</span>
          <h2>Sabé a quién contactar hoy</h2>
          <p>
            AURA puntúa a cada cliente según recencia, frecuencia y confiabilidad con una fórmula transparente, y un
            modelo de lenguaje redacta la acción recomendada: qué decirle y cuándo.
          </p>
          <Link to="/features" className="home-ai-link">
            Ver cómo funciona <ArrowRight size={15} />
          </Link>
        </div>
        <div className="home-ai-card">
          <div className="home-ai-card-head">
            <span className="home-eyebrow-dot" /> Cliente prioritario
          </div>
          <div className="home-ai-name">Valentina Ruiz</div>
          {[
            ['Recencia', '100%', '#8fd0b4'],
            ['Frecuencia', '88%', '#e8a35c'],
            ['Confiabilidad', '72%', '#e6c45a'],
          ].map(([label, w, color]) => (
            <div key={label} className="home-ai-row">
              <span>{label}</span>
              <div>
                <i style={{ '--w': w, background: color }} />
              </div>
            </div>
          ))}
          <div className="home-ai-reco">
            <Sparkles size={15} /> Enviar recordatorio por WhatsApp un día antes de su turno.
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="reveal">
          <span className="home-kicker">Cómo empezar</span>
          <h2>En tres pasos estás operando</h2>
        </div>
        <ol className="home-steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="home-step reveal" style={{ transitionDelay: `${i * 140}ms` }}>
              <span className="home-step-num">{i + 1}</span>
              <span className="home-step-icon">
                <step.icon size={22} strokeWidth={1.75} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section">
        <div className="reveal">
          <span className="home-kicker">Para quién es</span>
          <h2>Pensado para quienes gestionan atención estética</h2>
        </div>
        <div className="home-profiles">
          {PROFILES.map((profile, index) => (
            <div
              key={profile.title}
              className="aura-card home-profile-card reveal"
              style={{ transitionDelay: `${index * 120}ms` }}
            >
              <div className="home-profile-icon">
                <profile.icon size={22} strokeWidth={1.75} />
              </div>
              <h3>{profile.title}</h3>
              <p>{profile.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="home-cta reveal">
        <h2>Ordená el seguimiento de tus clientes desde una misma plataforma</h2>
        <p>
          Creá tu espacio de trabajo, configurá tus horarios y comenzá a gestionar turnos, fichas y seguimientos con
          una estructura clara para uso diario.
        </p>
        <div className="home-hero-actions">
          <Link to="/activate-account" className="btn home-cta-primary home-btn-lg">
            Crear cuenta profesional <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn home-cta-ghost home-btn-lg">
            Enviar consulta
          </Link>
        </div>
      </section>
    </div>
  )
}
