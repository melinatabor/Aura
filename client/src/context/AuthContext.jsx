import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'aura.session'

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  function login({ name, email }) {
    const session = { name: name || 'María', email, role: 'Administrador' }
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
  }

  function logout() {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within <AuthProvider>')
  return context
}
