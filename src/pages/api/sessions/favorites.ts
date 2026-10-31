import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Mi agenda: marca o quita una sesión. Siempre con el id del propio usuario.
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { session_id?: unknown; favorite?: unknown } | null
  if (typeof body?.session_id !== 'string') return json({ error: 'Falta la sesión.' }, 400)

  const query = body.favorite === true
    ? auth.db.from('session_favorites').upsert({ user_id: auth.userId, session_id: body.session_id }, { onConflict: 'user_id,session_id' })
    : auth.db.from('session_favorites').delete().eq('user_id', auth.userId).eq('session_id', body.session_id)
  const { error } = await query
  if (error) return json({ error: 'No se pudo actualizar tu agenda.' }, 500)
  return json({ ok: true })
}
