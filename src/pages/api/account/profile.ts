import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json, pickFields } from '../../../lib/admin-auth'

const ROLES = ['student', 'instructor', 'admin'] as const
const PROFILE_FIELDS = ['full_name', 'phone']

// Datos del propio usuario. Nunca toca el rol: eso solo lo cambia un admin.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('user_profiles')
    .select('full_name, phone')
    .eq('id', auth.userId)
    .maybeSingle()

  if (error) return json({ error: error.message }, 500)
  return json({ data: data ?? { full_name: null, phone: null } })
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

    const { data, error } = await auth.db
      .from('user_profiles')
      .upsert({ id: auth.userId, ...update }, { onConflict: 'id' })
      .select('full_name, phone')
      .single()

    if (error) return json({ error: error.message }, 500)
    return json({ data })
  } catch (e: any) {
    return json({ error: e.message }, 400)
  }
}
