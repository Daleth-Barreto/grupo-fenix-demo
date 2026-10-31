import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json } from '../../../../lib/admin-auth'

// Listar usuarios es solo para administradores.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return json({ error: error.message }, 500)
  return json({ data })
}
