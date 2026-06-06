/**
 * =============================================================================
 * useAuth.ts — Hook de autenticación (capa de LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Punto único de acceso a la sesión del usuario en toda la PWA. Encapsula el
 *   SDK de Supabase Auth y sincroniza su estado con el store global de Zustand
 *   (`auth.store.ts`). Las vistas NUNCA tocan Supabase directamente: consumen
 *   este hook. Diseñado para reutilizarse intacto en la futura app React Native.
 *
 * DEPENDENCIAS
 *   - ../../lib/supabase     → cliente Supabase preconfigurado.
 *   - ../../store/auth.store → estado global (user, isAuthenticated, isLoading).
 *   - ../../types            → modelo `User`.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useAuthSession()` monta UN listener `onAuthStateChange` + verifica la
 *     sesión inicial. Debe invocarse UNA sola vez (en App.tsx).
 *   - `useAuth()` es de solo lectura/acciones: expone user + métodos de
 *     login/registro/logout. No monta efectos, por lo que es seguro llamarlo en
 *     cualquier componente sin duplicar listeners.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/auth/useAuth.ts
 *   2. Llama `useAuthSession()` una vez dentro de <App/>.
 *   3. Verifica: `pnpm run build` (o `npx tsc --noEmit`).
 * =============================================================================
 */

import { useEffect } from 'react'
import type { Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import type { User } from '../../types'

/** Resultado normalizado de las operaciones de credenciales. */
export interface AuthResult {
  success: boolean
  error: string | null
}

/** Mapea el usuario de Supabase al modelo de dominio `User`. */
function mapSupabaseUser(session: Session | null): User | null {
  if (!session?.user) return null
  const { user } = session
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: (user.user_metadata?.full_name as string | undefined) ?? 'Usuario',
    avatar_url: user.user_metadata?.avatar_url as string | undefined,
    role: (user.user_metadata?.role as User['role'] | undefined) ?? 'student',
  }
}

/** Traduce errores de Supabase a mensajes claros en español. */
function translateError(error: AuthError | null): string | null {
  if (!error) return null
  const map: Record<string, string> = {
    'Invalid login credentials': 'Correo o contraseña incorrectos.',
    'User already registered': 'Este correo ya está registrado.',
    'Email not confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
    'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
  }
  return map[error.message] ?? error.message
}

/**
 * Monta el listener de sesión. Llamar UNA sola vez (en App.tsx).
 * Mantiene `auth.store` sincronizado con Supabase.
 */
export function useAuthSession(): void {
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(mapSupabaseUser(data.session))
      if (!data.session) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      setUser(mapSupabaseUser(session))
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [setUser, setLoading])
}

/** Estado + acciones de autenticación para consumir en cualquier vista. */
export function useAuth() {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isLoading = useAuthStore((s) => s.isLoading)
  const logoutStore = useAuthStore((s) => s.logout)

  const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { success: !error, error: translateError(error) }
  }

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResult> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'student' } },
    })
    return { success: !error, error: translateError(error) }
  }

  const resetPassword = async (email: string): Promise<AuthResult> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { success: !error, error: translateError(error) }
  }

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut()
    logoutStore()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    signOut,
  }
}
