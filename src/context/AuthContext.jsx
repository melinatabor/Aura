import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../dal/supabaseClient'
import * as profilesDal from '../dal/profilesDal'

const AuthContext = createContext(null)

async function buildUser(authUser) {
  if (!authUser) return null
  const profile = await profilesDal.getById(authUser.id)
  return {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username ?? '',
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    name: profile?.first_name || authUser.email,
    role: profile?.role ?? 'Operador',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      const built = await buildUser(data.session?.user ?? null)
      if (active) {
        setUser(built)
        setLoading(false)
      }
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const built = await buildUser(session?.user ?? null)
      if (active) setUser(built)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  // Acepta email o nombre de usuario: si lo que se tipeó no tiene "@",
  // primero resolvemos el email real llamando a la función de Postgres
  // get_email_by_username (el usuario todavía no está logueado en este
  // punto, por eso no puede consultar la tabla profiles directamente).
  async function login({ identifier, password }) {
    let email = identifier
    if (!identifier.includes('@')) {
      const { data, error: lookupError } = await supabase.rpc('get_email_by_username', {
        lookup_username: identifier,
      })
      if (lookupError) throw lookupError
      if (!data) throw new Error('Usuario no encontrado')
      email = data
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signup({ email, password, firstName, lastName, username }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName, username } },
    })
    if (error) throw error
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within <AuthProvider>')
  return context
}
