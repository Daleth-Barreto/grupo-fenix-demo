import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// "Mis eventos": los eventos con inscripción vigente del propio usuario.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('enrollments')
    .select('id, status, events(id, title, start_date, end_date, location, modality, cover_image)')
    .eq('user_id', auth.userId)
    .not('event_id', 'is', null)
    .in('status', ['activo', 'completado'])

  if (error) return json({ error: 'No se pudieron cargar tus eventos.' }, 500)
  const events = ((data ?? []) as any[]).map((row) => row.events).filter(Boolean)
  events.sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))
  return json({ data: events })
}
