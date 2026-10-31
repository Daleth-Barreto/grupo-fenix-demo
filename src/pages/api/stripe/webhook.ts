import type { APIRoute } from 'astro'
import Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getServiceClient, json } from '../../../lib/admin-auth'
import { getStripe } from '../../../lib/stripe-server'
import { getEnv } from '../../../lib/server-env'

export const prerender = false

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Marca la orden como pagada. Stripe puede repetir el evento: repetirlo no debe duplicar nada.
async function markPaid(db: SupabaseClient, session: Stripe.Checkout.Session): Promise<void> {
  const eventId = session.metadata?.event_id ?? ''
  const userId = session.metadata?.user_id ?? session.client_reference_id ?? null

  const { data: updated, error } = await db
    .from('orders')
    .update({ status: 'pagado' })
    .eq('stripe_session_id', session.id)
    .select('id')
  if (error) throw error

  let orderId: string | undefined = updated?.[0]?.id
  if (!orderId) {
    const { data, error: insertError } = await db
      .from('orders')
      .insert({
        user_id: userId,
        amount: (session.amount_total ?? 0) / 100,
        currency: session.currency ?? 'mxn',
        status: 'pagado',
        stripe_session_id: session.id,
        metadata: session.metadata ?? {},
      })
      .select('id')
      .single()
    if (insertError) throw insertError
    orderId = data.id
  }

  // enrollments.event_id es uuid: los eventos del catálogo de ejemplo solo quedan en la orden.
  if (!userId || !UUID.test(eventId)) return

  const { data: existing, error: existingError } = await db
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .limit(1)
  if (existingError) throw existingError
  if (existing && existing.length > 0) return

  const { error: enrollError } = await db
    .from('enrollments')
    .insert({ user_id: userId, event_id: eventId, order_id: orderId, status: 'activo' })
  if (enrollError) throw enrollError
}

export const POST: APIRoute = async ({ request }) => {
  const stripe = getStripe()
  const webhookSecret = getEnv('STRIPE_WEBHOOK_SECRET')
  const db = getServiceClient()
  if (!stripe || !webhookSecret || !db) return json({ error: 'Webhook no configurado' }, 500)

  const signature = request.headers.get('stripe-signature')
  if (!signature) return json({ error: 'Falta stripe-signature' }, 400)

  let event: Stripe.Event
  try {
    // En Workers no hay crypto síncrono: se necesita la variante asíncrona.
    event = await stripe.webhooks.constructEventAsync(
      await request.text(),
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider(),
    )
  } catch {
    return json({ error: 'Firma inválida' }, 400)
  }

  try {
    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.payment_status === 'paid') await markPaid(db, session)
    } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { error } = await db
        .from('orders')
        .update({ status: 'cancelado' })
        .eq('stripe_session_id', session.id)
        .eq('status', 'pendiente')
      if (error) throw error
    }
    return json({ received: true })
  } catch (err) {
    // Un 500 hace que Stripe reintente el evento más tarde.
    console.error('[webhook] No se pudo procesar', event.type, err)
    return json({ error: 'No se pudo procesar el evento' }, 500)
  }
}
