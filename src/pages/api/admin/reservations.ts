import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Solicitudes de cotización que llegan desde /app/reservaciones.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('reservation_requests')
    .select('id, interest, name, email, phone, organization, message, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) return json({ error: 'No se pudieron cargar las solicitudes.' }, 500)
  return json({ data: data ?? [] })
}
