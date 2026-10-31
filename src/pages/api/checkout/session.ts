import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'
import { getStripe } from '../../../lib/stripe-server'
import { getEventById } from '../../../data/mock'
import { isEventPast } from '../../../utils/format'

export const prerender = false

// Crea la sesión de Stripe Checkout. El precio siempre sale del servidor, nunca del navegador.
export const POST: APIRoute = async ({ request, locals, url }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const stripe = getStripe()
  if (!stripe) return json({ error: 'El pago en línea todavía no está disponible.' }, 503)

  const body = (await request.json().catch(() => null)) as { event_id?: unknown } | null
  const event = typeof body?.event_id === 'string' ? getEventById(body.event_id) : undefined
  if (!event) return json({ error: 'Evento no encontrado.' }, 404)
  if (isEventPast(event.date_end)) return json({ error: 'Este evento ya finalizó.' }, 409)
  if (!(event.price > 0)) return json({ error: 'Este evento no tiene precio válido.' }, 409)

  const { data: paid, error: paidError } = await auth.db
    .from('orders')
    .select('id')
    .eq('user_id', auth.userId)
    .eq('status', 'pagado')
    .eq('metadata->>event_id', event.id)
    .limit(1)
  if (paidError) return json({ error: 'No se pudo verificar tu inscripción.' }, 500)
  if (paid && paid.length > 0) return json({ error: 'Ya estás inscrito en este evento.' }, 409)

  const metadata = { event_id: event.id, event_title: event.title, user_id: auth.userId }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: auth.userId,
      customer_email: auth.email || undefined,
      metadata,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(event.price * 100),
          product_data: { name: event.title },
        },
      }],
      success_url: `${url.origin}/app/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/app/checkout/error?event=${encodeURIComponent(event.id)}`,
    })

    const { error } = await auth.db.from('orders').insert({
      user_id: auth.userId,
      amount: event.price,
      currency: 'mxn',
      status: 'pendiente',
      stripe_session_id: session.id,
      metadata,
    })
    if (error) {
      // Sin orden no se debe cobrar: el pago quedaría sin registro.
      await stripe.checkout.sessions.expire(session.id).catch(() => {})
      return json({ error: 'No se pudo registrar tu orden. No se realizó ningún cargo.' }, 500)
    }

    return json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Error de Stripe', err)
    return json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' }, 502)
  }
}
