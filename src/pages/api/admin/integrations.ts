import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'
import { getEnv } from '../../../lib/server-env'

export const prerender = false

// Indica si cada integración tiene sus variables. Nunca devuelve los valores.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  return json({
    stripe: Boolean(getEnv('STRIPE_SECRET_KEY') && getEnv('STRIPE_WEBHOOK_SECRET')),
    supabase: true, // requireRole ya usó Supabase para validar esta petición
    owncast: Boolean(getEnv('PUBLIC_OWNCAST_BASE_URL')),
  })
}
