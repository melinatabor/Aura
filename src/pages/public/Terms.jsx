import { Link } from 'react-router-dom'
import './Legal.scss'

export default function Terms() {
  return (
    <div className="legal-page">
      <h1>Términos y condiciones</h1>
      <p className="legal-updated">Última actualización: noviembre de 2026</p>

      <h2>1. Qué es AURA</h2>
      <p>
        AURA es una plataforma web de gestión para centros de estética, profesionales independientes y espacios de
        bienestar. Permite administrar clientes, profesionales, tratamientos, turnos e insumos, y consultar alertas y
        reportes operativos.
      </p>

      <h2>2. Uso de la cuenta</h2>
      <ul>
        <li>Cada cuenta es personal y la persona titular es responsable de mantener su contraseña en reserva.</li>
        <li>El acceso a cada módulo depende del rol asignado por un administrador del espacio de trabajo.</li>
        <li>Las cuentas creadas sin invitación quedan pendientes hasta que un administrador las apruebe.</li>
      </ul>

      <h2>3. Información cargada</h2>
      <p>
        Los datos de clientes, turnos y demás información que se cargue en AURA son responsabilidad del centro que los
        registra. El centro debe contar con la autorización de sus clientes para tratar sus datos personales.
      </p>

      <h2>4. Recomendaciones automáticas</h2>
      <p>
        Los puntajes de prioridad y las recomendaciones de seguimiento son orientativos: ayudan a organizar el trabajo
        del equipo, pero no reemplazan el criterio profesional ni constituyen un diagnóstico.
      </p>

      <h2>5. Disponibilidad</h2>
      <p>
        Se procura mantener el servicio disponible, pero pueden existir interrupciones por mantenimiento o por causas
        ajenas. AURA es un proyecto académico en desarrollo.
      </p>

      <h2>6. Contacto</h2>
      <p>
        Ante cualquier duda, escribinos desde la sección <Link to="/contact">Contacto</Link>. Más información sobre el
        tratamiento de datos en la <Link to="/privacy">Política de privacidad</Link>.
      </p>

      <Link to="/activate-account" className="btn btn-secondary legal-back">
        ← Volver al registro
      </Link>
    </div>
  )
}
