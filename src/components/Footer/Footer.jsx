import { Link } from 'react-router-dom'
import './Footer.scss'

export default function Footer() {
  return (
    <footer className="public-footer">
      <span>AURA © 2026. Todos los derechos reservados.</span>
      <div className="public-footer-links">
        <Link to="/privacy">Privacidad</Link>
        <Link to="/terms">Términos y condiciones</Link>
      </div>
    </footer>
  )
}
