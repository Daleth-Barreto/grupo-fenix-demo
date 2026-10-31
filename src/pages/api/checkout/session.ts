import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'
import { getStripe } from '../../../lib/stripe-server'
import { getCourse, getEvent } from '../../../lib/catalog'
import { isEventPast } from '../../../utils/format'

export const prerender = false

// Crea la sesión de Stripe Checkout. El precio siempre sale del servidor, nunca del navegador.
// Los métodos de pago (tarjeta, OXXO, meses sin intereses) se activan en el panel de Stripe.
export const POST: APIRoute = async ({ request, locals, url }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const stripe = getStripe()
  if (!stripe) return json({ error: 'El pago en línea todavía no está disponible.' }, 503)

  const body = (await request.json().catch(() => null)) as { event_id?: unknown; course_id?: unknown } | null
  const event = typeof body?.event_id === 'string' ? await getEvent(body.event_id) : null
  const course = !event && typeof body?.course_id === 'string' ? await getCourse(body.course_id) : null
  const item = event ?? course
  if (!item) return json({ error: 'No encontramos lo que quieres comprar.' }, 404)
  if (event && isEventPast(event.date_end)) return json({ error: 'Este evento ya finalizó.' }, 409)
  if (!(item.price > 0)) return json({ error: 'Esta inscripción no se paga en línea. Escríbenos para inscribirte.' }, 409)

  const column = event ? 'event_id' : 'course_id'
  const { data: enrolled, error: enrolledError } = await auth.db
    .from('enrollments')
    .select('id')
    .eq('user_id', auth.userId)
    .eq(column, item.id)
    .in('status', ['activo', 'completado'])
    .limit(1)
  if (enrolledError) return json({ error: 'No se pudo verificar tu inscripción.' }, 500)
  if (enrolled && enrolled.length > 0) return json({ error: 'Ya estás inscrito.' }, 409)

  // event_title se conserva porque los comprobantes ya lo leen, también en compras de cursos.
  const metadata = { [column]: item.id, event_title: item.title, user_id: auth.userId }
  const back = event ? `/app/checkout/${item.id}` : `/app/checkout/curso/${item.id}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es-419',
      client_reference_id: auth.userId,
      customer_email: auth.email || undefined,
      metadata,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(item.price * 100),
          product_data: { name: item.title },
        },
      }],
      success_url: `${url.origin}/app/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/app/checkout/error?volver=${encodeURIComponent(back)}`,
    })

    const { error } = await auth.db.from('orders').insert({
      user_id: auth.userId,
      amount: item.price,
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
