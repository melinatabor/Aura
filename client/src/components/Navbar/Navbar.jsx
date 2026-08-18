import { Link, NavLink } from 'react-router-dom'
import './Navbar.scss'

export default function Navbar() {
  return (
    <header className="public-navbar">
      <Link to="/" className="public-navbar-brand">
        Aura
      </Link>
      <nav className="public-navbar-links">
        <NavLink to="/" end>
          Inicio
        </NavLink>
        <NavLink to="/features">Funcionalidades</NavLink>
        <NavLink to="/contact">Contacto</NavLink>
      </nav>
      <div className="public-navbar-actions">
        <Link to="/login" className="btn btn-ghost btn-sm">
          Iniciar sesión
        </Link>
        <Link to="/activate-account" className="btn btn-primary btn-sm">
          Crear cuenta
        </Link>
      </div>
    </header>
  )
}
