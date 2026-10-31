import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnv } from './server-env'

/**
 * Autorización para los endpoints de /api/admin.
 *
 * Flujo:
 *  1. El cliente envía `Authorization: Bearer <access_token>` (ver src/lib/admin-fetch.ts).
 *  2. Validamos el token con Supabase (getUser), no confiamos en el navegador.
 *  3. Leemos el rol desde public.user_profiles (la fuente de verdad),
 *     NO desde user_metadata, que el propio usuario puede modificar.
 *
 * SUPABASE_SERVICE_ROLE_KEY (solo servidor, sin PUBLIC_) es opcional. Sin ella, cada
 * consulta usa el token del usuario, así que las reglas RLS deciden qué puede hacer.
 * Solo la requieren el webhook de Stripe y la baja de cuenta.
 */

export type AppRole = 'student' | 'instructor' | 'admin'

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Cliente con service_role para el servidor. Ignora RLS: nunca debe llegar al navegador. */
export function getServiceClient(): SupabaseClient | null {
  const url = getEnv('PUBLIC_SUPABASE_URL')
  const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
}

export type AuthResult =
  | { ok: true; userId: string; email: string; role: AppRole; db: SupabaseClient; hasServiceRole: boolean }
  | { ok: false; response: Response }

export async function requireRole(
  request: Request,
  _locals: unknown,
  allowed: AppRole[],
): Promise<AuthResult> {
  const url = getEnv('PUBLIC_SUPABASE_URL')
  const anonKey = getEnv('PUBLIC_SUPABASE_ANON_KEY')
  if (!url || !anonKey) {
    return { ok: false, response: json({ error: 'Servidor mal configurado' }, 500) }
  }

  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return { ok: false, response: json({ error: 'No autenticado' }, 401) }
  }

  const anon = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData, error: userError } = await anon.auth.getUser(token)
  if (userError || !userData.user) {
    return { ok: false, response: json({ error: 'Sesión inválida' }, 401) }
  }

  // Sin service_role, las consultas van con el token del usuario y las limita RLS.
  const service = getServiceClient()
  const db = service ?? createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: profile, error: profileError } = await db
    .from('user_profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[auth] No se pudo leer el perfil', profileError.message)
    return { ok: false, response: json({ error: 'No se pudo leer tu perfil.' }, 500) }
  }

  // Sin perfil se trata como alumno, el rol con menos permisos. Nunca se lee de user_metadata.
  if (!profile) {
    const fullName = userData.user.user_metadata?.full_name
    const { error: insertError } = await db
      .from('user_profiles')
      .insert({ id: userData.user.id, full_name: typeof fullName === 'string' ? fullName : null })
    if (insertError) console.error('[auth] No se pudo crear el perfil', insertError.message)
  }

  const role = (profile?.role ?? 'student') as AppRole
  if (!allowed.includes(role)) {
    return { ok: false, response: json({ error: 'Sin permiso' }, 403) }
  }

  return { ok: true, userId: userData.user.id, email: userData.user.email ?? '', role, db, hasServiceRole: Boolean(service) }
}

/** Copia solo las llaves permitidas. Evita mass assignment desde el body. */
export function pickFields(body: unknown, allowed: string[]): Record<string, unknown> {
  const src = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in src) out[key] = src[key]
  }
  return out
}
