import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Constancias registradas, con su evento o curso.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('certificates')
    .select('id, certificate_number, issued_at, sent_at, events(title), courses(title)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return json({ error: 'No se pudieron cargar las constancias.' }, 500)
  return json({ data: data ?? [] })
}
