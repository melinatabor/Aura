import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import './Topbar.scss'

export default function Topbar({ title }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
      </div>
      <div className="topbar-user">
        <span>Hola, {usuario?.nombre ?? 'María'}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
