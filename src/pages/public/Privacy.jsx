import { Link } from 'react-router-dom'
import './Legal.scss'

export default function Privacy() {
  return (
    <div className="legal-page">
      <h1>Política de privacidad</h1>
      <p className="legal-updated">Última actualización: noviembre de 2026</p>

      <h2>1. Qué datos tratamos</h2>
      <ul>
        <li>De las personas usuarias: nombre, correo electrónico, nombre de usuario y rol dentro del espacio de trabajo.</li>
        <li>De los clientes del centro: datos de contacto, fecha de nacimiento, historial de turnos y notas internas.</li>
        <li>De quienes escriben desde el formulario de contacto: nombre, correo, teléfono y mensaje.</li>
      </ul>

      <h2>2. Para qué los usamos</h2>
      <p>
        Los datos se usan únicamente para operar el sistema: autenticar usuarios, organizar la agenda, generar alertas
        y recordatorios, y armar reportes. No se venden ni se comparten con terceros con fines comerciales.
      </p>

      <h2>3. Servicios de terceros</h2>
      <p>
        AURA guarda la información en Supabase (base de datos y autenticación). Para redactar recomendaciones de
        seguimiento, se envían a un modelo de lenguaje (Google Gemini) únicamente datos de uso del cliente, como la
        cantidad de turnos y días desde la última visita, junto con su nombre.
      </p>

      <h2>4. Seguridad</h2>
      <p>
        El acceso a los datos requiere iniciar sesión y está limitado por rol. Las contraseñas no se almacenan en texto
        plano y las claves de servicios externos no se exponen en el navegador.
      </p>

      <h2>5. Tus derechos</h2>
      <p>
        Podés solicitar acceso, corrección o eliminación de tus datos escribiendo desde la sección{' '}
        <Link to="/contact">Contacto</Link>.
      </p>

      <Link to="/activate-account" className="btn btn-secondary legal-back">
        ← Volver al registro
      </Link>
    </div>
  )
}
