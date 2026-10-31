import { supabase } from './supabase'

/**
 * fetch con el token de la sesión para los endpoints de /api/admin.
 * Sin este header el servidor responde 401.
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession()
  const headers = new Headers(init.headers)
  if (session?.access_token) headers.set('Authorization', `Bearer ${session.access_token}`)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  return fetch(input, { ...init, headers })
}
