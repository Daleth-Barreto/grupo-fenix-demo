import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Autorización para los endpoints de /api/admin.
 *
 * Flujo:
 *  1. El cliente envía `Authorization: Bearer <access_token>` (ver src/lib/admin-fetch.ts).
 *  2. Validamos el token con Supabase (getUser), no confiamos en el navegador.
 *  3. Leemos el rol desde public.user_profiles (la fuente de verdad),
 *     NO desde user_metadata, que el propio usuario puede modificar.
 *
 * Variables de entorno (SOLO servidor, sin PUBLIC_):
 *  - SUPABASE_SERVICE_ROLE_KEY
 * Las PUBLIC_* se usan igual que en el resto de la app.
 */

export type AppRole = 'student' | 'instructor' | 'admin'

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface ServerEnv {
  url: string
  anonKey: string
  serviceKey: string
}

// En Cloudflare las variables de runtime van en locals.runtime.env;
// en otros entornos caen a import.meta.env.
function readEnv(locals: any): ServerEnv {
  const rt = locals?.runtime?.env ?? {}
  const pick = (key: string): string => rt[key] ?? (import.meta.env as any)[key] ?? ''
  return {
    url: pick('PUBLIC_SUPABASE_URL'),
    anonKey: pick('PUBLIC_SUPABASE_ANON_KEY'),
    serviceKey: pick('SUPABASE_SERVICE_ROLE_KEY'),
  }
}

export type AuthResult =
  | { ok: true; userId: string; role: AppRole; db: SupabaseClient }
  | { ok: false; response: Response }

export async function requireRole(
  request: Request,
  locals: any,
  allowed: AppRole[],
): Promise<AuthResult> {
  const env = readEnv(locals)
  if (!env.url || !env.anonKey || !env.serviceKey) {
    return { ok: false, response: json({ error: 'Servidor mal configurado' }, 500) }
  }

  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : ''
  if (!token) {
    return { ok: false, response: json({ error: 'No autenticado' }, 401) }
  }

  const anon = createClient(env.url, env.anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: userData, error: userError } = await anon.auth.getUser(token)
  if (userError || !userData.user) {
    return { ok: false, response: json({ error: 'Sesión inválida' }, 401) }
  }

  const db = createClient(env.url, env.serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: profile, error: profileError } = await db
    .from('user_profiles')
    .select('role')
    .eq('id', userData.user.id)
    .single()

  if (profileError || !profile) {
    return { ok: false, response: json({ error: 'Perfil no encontrado' }, 403) }
  }

  const role = profile.role as AppRole
  if (!allowed.includes(role)) {
    return { ok: false, response: json({ error: 'Sin permiso' }, 403) }
  }

  return { ok: true, userId: userData.user.id, role, db }
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
