import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Comprobantes del propio usuario.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('orders')
    .select('id, amount, currency, status, created_at, metadata')
    .eq('user_id', auth.userId)
    .neq('status', 'pendiente')
    .order('created_at', { ascending: false })

  if (error) return json({ error: 'No se pudieron cargar tus comprobantes.' }, 500)
  return json({ data: data ?? [] })
}
