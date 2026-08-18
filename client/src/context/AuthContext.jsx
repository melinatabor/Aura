import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'aura.sesion'

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(readStoredUser)

  function login({ nombre, email }) {
    const sesion = { nombre: nombre || 'María', email, rol: 'Administrador' }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sesion))
    setUsuario(sesion)
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setUsuario(null)
  }

  return <AuthContext.Provider value={{ usuario, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
