import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'
import { listSessions } from '../../../../lib/catalog'

export const prerender = false

// La agenda es pública. Con sesión agrega favoritos y, si tiene acceso, materiales.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const eventId = params.id as string
  const sessions = await listSessions(eventId)
  if (!request.headers.get('authorization')) return json({ sessions, signed_in: false, enrolled: false, favorites: [], materials: [] })

  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const ids = sessions.map((s) => s.id)
  const [access, favorites, materials] = await Promise.all([
    auth.db.rpc('has_event_access', { p_event: eventId }),
    ids.length ? auth.db.from('session_favorites').select('session_id').eq('user_id', auth.userId).in('session_id', ids) : Promise.resolve({ data: [] }),
    ids.length ? auth.db.from('session_materials').select('id, session_id, title, url, kind').in('session_id', ids) : Promise.resolve({ data: [] }),
  ])

  return json({
    sessions,
    signed_in: true,
    enrolled: access.data === true,
    favorites: ((favorites.data ?? []) as Array<{ session_id: string }>).map((f) => f.session_id),
    materials: materials.data ?? [],
  })
}
