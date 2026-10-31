import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json, pickFields } from '../../../lib/admin-auth'
import { getEnv } from '../../../lib/server-env'

const ROLES = ['student', 'instructor', 'admin'] as const
const PROFILE_FIELDS = ['full_name', 'phone', 'avatar_url']

// Solo se acepta una foto subida por el propio usuario a su carpeta del bucket avatars.
function isOwnAvatar(value: unknown, userId: string): boolean {
  if (value === null) return true
  if (typeof value !== 'string') return false
  const base = getEnv('PUBLIC_SUPABASE_URL').replace(/\/$/, '')
  const prefix = `${base}/storage/v1/object/public/avatars/${userId}/`
  return value.startsWith(prefix) && !value.slice(prefix.length).includes('..')
}

// Datos del propio usuario. Nunca toca el rol: eso solo lo cambia un admin.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('user_profiles')
    .select('full_name, phone, avatar_url')
    .eq('id', auth.userId)
    .maybeSingle()

  if (error) return json({ error: error.message }, 500)
  return json({ data: data ?? { full_name: null, phone: null, avatar_url: null } })
}

export const PUT: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const update = pickFields(body, PROFILE_FIELDS)

    if (typeof update.full_name === 'string' && update.full_name.trim().length < 3) {
      return json({ error: 'El nombre debe tener al menos 3 caracteres' }, 400)
    }
    if (typeof update.full_name === 'string') update.full_name = update.full_name.trim()
    if (typeof update.phone === 'string') update.phone = update.phone.trim() || null
    if (update.avatar_url !== undefined && !isOwnAvatar(update.avatar_url, auth.userId)) {
      return json({ error: 'La foto no es válida.' }, 400)
    }

    // Primero intenta actualizar, y crea la fila solo si no existe. Nunca envía el rol.
    const columns = 'full_name, phone, avatar_url'
    const updated = await auth.db.from('user_profiles').update(update).eq('id', auth.userId).select(columns).maybeSingle()
    if (updated.error) {
      console.error('[perfil] No se pudo actualizar', updated.error.message)
      return json({ error: 'No se pudieron guardar tus datos.' }, 500)
    }
    if (updated.data) return json({ data: updated.data })

    const created = await auth.db.from('user_profiles').insert({ id: auth.userId, ...update }).select(columns).maybeSingle()
    if (created.error || !created.data) {
      console.error('[perfil] No se pudo crear', created.error?.message)
      return json({ error: 'No encontramos tu perfil y no se pudo crear. Avísanos para ayudarte.' }, 500)
    }
    return json({ data: created.data })
  } catch (e: any) {
    return json({ error: e.message }, 400)
  }
}
