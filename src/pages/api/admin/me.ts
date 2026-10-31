import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json } from '../../../lib/admin-auth'

// Devuelve el rol real del usuario autenticado (desde user_profiles).
// El AdminGuard del navegador lo usa para decidir si mostrar el panel.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response
  return json({ id: auth.userId, role: auth.role })
}
