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
        <NavLink to="/funcionalidades">Funcionalidades</NavLink>
        <NavLink to="/contacto">Contacto</NavLink>
      </nav>
      <div className="public-navbar-actions">
        <Link to="/login" className="btn btn-ghost btn-sm">
          Iniciar sesión
        </Link>
        <Link to="/activacion-cuenta" className="btn btn-primary btn-sm">
          Crear cuenta
        </Link>
      </div>
    </header>
  )
}
