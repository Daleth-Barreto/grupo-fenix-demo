import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Totales reales para el dashboard.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const count = (table: string) => auth.db.from(table).select('id', { count: 'exact', head: true })
  const [users, events, courses, lives] = await Promise.all([
    count('user_profiles'),
    count('events'),
    count('courses'),
    count('lives').eq('status', 'en_vivo'),
  ])

  if (users.error || events.error || courses.error || lives.error) {
    return json({ error: 'No se pudieron cargar los totales.' }, 500)
  }
  return json({ users: users.count ?? 0, events: events.count ?? 0, courses: courses.count ?? 0, lives: lives.count ?? 0 })
}
