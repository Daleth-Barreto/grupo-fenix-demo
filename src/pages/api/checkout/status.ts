import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'
import { getStripe } from '../../../lib/stripe-server'

export const prerender = false

// Confirma con Stripe el resultado de una sesión. Solo responde a quien la creó.
export const GET: APIRoute = async ({ request, locals, url }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const stripe = getStripe()
  if (!stripe) return json({ error: 'El pago en línea todavía no está disponible.' }, 503)

  const sessionId = url.searchParams.get('session_id')
  if (!sessionId) return json({ error: 'Falta session_id' }, 400)

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    if (session.client_reference_id !== auth.userId) return json({ error: 'Pago no encontrado.' }, 404)
    return json({ paid: session.payment_status === 'paid', title: session.metadata?.event_title ?? '' })
  } catch {
    return json({ error: 'Pago no encontrado.' }, 404)
  }
}
