import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../dal/supabaseClient'
import * as profilesDal from '../dal/profilesDal'

const AuthContext = createContext(null)

export class InactiveAccountError extends Error {}

async function buildUser(authUser) {
  if (!authUser) return null
  const profile = await profilesDal.getWithPermissions(authUser.id)
  return {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username ?? '',
    firstName: profile?.first_name ?? '',
    lastName: profile?.last_name ?? '',
    name: profile?.first_name || authUser.email,
    roleName: profile?.roles?.name ?? '',
    professionalId: profile?.professional_id ?? null,
    status: profile?.status ?? 'Inactivo',
    permissions: (profile?.roles?.role_permissions ?? []).map((rp) => rp.permissions.code),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Una cuenta inactiva (desactivada, o registrada sin invitación y todavía
    // no aprobada) no entra a la app aunque Supabase Auth le haya dado sesión.
    async function applySession(session) {
      const built = await buildUser(session?.user ?? null)
      if (!active) return
      setUser(built?.status === 'Activo' ? built : null)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session)
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
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error

    const built = await buildUser(data.user)
    if (built.status !== 'Activo') {
      await supabase.auth.signOut()
      throw new InactiveAccountError()
    }
  }

  async function signup({ email, password, firstName, lastName, username, invitationToken }) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, username, invitation_token: invitationToken ?? null },
      },
    })
    if (error) throw error
    // El registro deja una sesión abierta; la cerramos para que entre por el
    // login, que es donde se valida si la cuenta ya está activa.
    await supabase.auth.signOut()
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  const can = useCallback((code) => Boolean(user?.permissions.includes(code)), [user])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, can }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within <AuthProvider>')
  return context
}
