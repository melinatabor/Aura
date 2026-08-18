import { Link } from 'react-router-dom'
import './ConfirmacionConsulta.scss'

export default function ConfirmacionConsulta() {
  return (
    <div className="confirmacion-page">
      <div className="aura-card confirmacion-card">
        <div className="modal-confirm-icon icon-success">✓</div>
        <h1>Consulta enviada correctamente</h1>
        <p>
          Gracias por contactarnos. Nuestro equipo revisará tu mensaje y se pondrá en contacto con vos a la brevedad.
        </p>
        <Link to="/" className="btn btn-primary">
          Entendido
        </Link>
      </div>
    </div>
  )
}
