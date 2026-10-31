import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Números reales del usuario para el resumen de Inicio.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const [events, courses, certificates] = await Promise.all([
    auth.db.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', auth.userId).not('event_id', 'is', null).in('status', ['activo', 'completado']),
    auth.db.from('enrollments').select('id', { count: 'exact', head: true }).eq('user_id', auth.userId).not('course_id', 'is', null).in('status', ['activo', 'completado']),
    auth.db.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', auth.userId),
  ])

  if (events.error || courses.error || certificates.error) {
    return json({ error: 'No se pudo cargar tu resumen.' }, 500)
  }

  return json({ enrolled: events.count ?? 0, courses: courses.count ?? 0, certificates: certificates.count ?? 0 })
}
