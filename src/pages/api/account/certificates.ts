import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Constancias emitidas al propio usuario.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('certificates')
    .select('id, certificate_number, issued_at, sent_at, events(title), courses(title)')
    .eq('user_id', auth.userId)
    .order('issued_at', { ascending: false })

  if (error) return json({ error: 'No se pudieron cargar tus constancias.' }, 500)
  return json({ data: data ?? [] })
}
