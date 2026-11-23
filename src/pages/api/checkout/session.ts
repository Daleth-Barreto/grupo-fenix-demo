import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'
import { getStripe } from '../../../lib/stripe-server'
import { getCourse, getEvent, listTickets } from '../../../lib/catalog'
import { isEventPast } from '../../../utils/format'

export const prerender = false

// Límite de intentos por persona: frena scripts que crearían cientos de sesiones y órdenes.
const MAX_INTENTOS = 5
const VENTANA_MIN = 10
// Las sesiones de Stripe Checkout duran 24 h; se buscan abiertas dentro de ese plazo, con margen.
const REUSO_HORAS = 23

// Crea la sesión de Stripe Checkout. El precio siempre sale del servidor, nunca del navegador.
// Los métodos de pago (tarjeta, OXXO, meses sin intereses) se activan en el panel de Stripe.
export const POST: APIRoute = async ({ request, locals, url }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const stripe = getStripe()
  if (!stripe) return json({ error: 'El pago en línea todavía no está disponible.' }, 503)

  const body = (await request.json().catch(() => null)) as { event_id?: unknown; course_id?: unknown; ticket_id?: unknown } | null
  const event = typeof body?.event_id === 'string' ? await getEvent(body.event_id) : null
  const course = !event && typeof body?.course_id === 'string' ? await getCourse(body.course_id) : null
  const item = event ?? course
  if (!item) return json({ error: 'No encontramos lo que quieres comprar.' }, 404)
  if (event && isEventPast(event.date_end)) return json({ error: 'Este evento ya finalizó.' }, 409)

  // El precio sale de la entrada elegida, siempre leída en el servidor.
  const tickets = event ? await listTickets(event.id) : []
  const ticket = tickets.find((option) => option.id === body?.ticket_id)
  if (tickets.length > 0 && !ticket) return json({ error: 'Elige un tipo de entrada.' }, 409)
  if (ticket?.sold_out) return json({ error: 'Esta entrada está agotada.' }, 409)
  const price = ticket?.price ?? item.price
  if (!(price > 0)) return json({ error: 'Esta inscripción no se paga en línea. Escríbenos para inscribirte.' }, 409)

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

  // Doble clic, dos pestañas o volver atrás: si ya hay un pago abierto de lo mismo, se reusa
  // en lugar de abrir otro. Así no puede pagar dos veces lo mismo por accidente.
  const reusoDesde = new Date(Date.now() - REUSO_HORAS * 3600_000).toISOString()
  const { data: abiertas } = await auth.db
    .from('orders')
    .select('stripe_session_id, amount, metadata')
    .eq('user_id', auth.userId)
    .eq('status', 'pendiente')
    .contains('metadata', { [column]: item.id })
    .gte('created_at', reusoDesde)
    .order('created_at', { ascending: false })
    .limit(5)
  for (const orden of (abiertas ?? []) as { stripe_session_id: string | null; amount: number; metadata: Record<string, unknown> | null }[]) {
    const mismaEntrada = (orden.metadata?.ticket_id ?? null) === (ticket?.id ?? null)
    if (!orden.stripe_session_id || !mismaEntrada || Number(orden.amount) !== price) continue
    try {
      const abierta = await stripe.checkout.sessions.retrieve(orden.stripe_session_id)
      if (abierta.status === 'open' && abierta.url) return json({ url: abierta.url })
    } catch {
      // Si Stripe no la encuentra, se sigue y se crea una nueva.
    }
  }

  const limiteDesde = new Date(Date.now() - VENTANA_MIN * 60_000).toISOString()
  const { count: recientes, error: countError } = await auth.db
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.userId)
    .gte('created_at', limiteDesde)
  if (countError) return json({ error: 'No se pudo iniciar el pago. Intenta de nuevo.' }, 500)
  if ((recientes ?? 0) >= MAX_INTENTOS) {
    return json({ error: 'Hiciste muchos intentos seguidos. Espera unos minutos y vuelve a intentarlo.' }, 429)
  }

  // event_title se conserva porque los comprobantes ya lo leen, también en compras de cursos.
  const metadata = { [column]: item.id, event_title: item.title, user_id: auth.userId, ...(ticket ? { ticket_id: ticket.id, ticket_name: ticket.name, ticket_kind: ticket.kind } : {}) }
  const back = event ? `/app/checkout/${item.id}` : `/app/checkout/curso/${item.id}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es-419',
      allow_promotion_codes: true,
      client_reference_id: auth.userId,
      customer_email: auth.email || undefined,
      metadata,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'mxn',
          unit_amount: Math.round(price * 100),
          product_data: { name: ticket ? `${item.title} · ${ticket.name}` : item.title },
        },
      }],
      success_url: `${url.origin}/app/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/app/checkout/error?volver=${encodeURIComponent(back)}`,
    }, {
      // Llave de idempotencia: dos peticiones iguales en el mismo minuto reciben la misma sesión
      // de Stripe en lugar de crear dos (cubre el doble clic que llegue al mismo tiempo).
      idempotencyKey: ['checkout', auth.userId, column, item.id, ticket?.id ?? 'sin-entrada', Math.round(price * 100), Math.floor(Date.now() / 60_000)].join(':'),
    })

    const { error } = await auth.db.from('orders').insert({
      user_id: auth.userId,
      amount: price,
      currency: 'mxn',
      status: 'pendiente',
      stripe_session_id: session.id,
      metadata,
    })
    // 23505 = la orden de esta sesión ya existe: la creó la otra mitad del doble clic. Es la misma sesión.
    if (error?.code === '23505') return json({ url: session.url })
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
