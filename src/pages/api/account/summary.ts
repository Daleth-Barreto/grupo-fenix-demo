import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Números reales del usuario para el resumen de Inicio.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const [orders, progress, certificates] = await Promise.all([
    auth.db.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', auth.userId).eq('status', 'pagado'),
    auth.db.from('user_progress').select('course_id').eq('user_id', auth.userId),
    auth.db.from('certificates').select('id', { count: 'exact', head: true }).eq('user_id', auth.userId),
  ])

  if (orders.error || progress.error || certificates.error) {
    return json({ error: 'No se pudo cargar tu resumen.' }, 500)
  }

  const courses = new Set((progress.data ?? []).map((row: { course_id: string }) => row.course_id))
  return json({ enrolled: orders.count ?? 0, courses: courses.size, certificates: certificates.count ?? 0 })
}
