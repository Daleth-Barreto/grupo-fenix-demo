import type { APIRoute } from 'astro'

export const prerender = false
import Stripe from 'stripe'

const stripeSecretKey = import.meta.env.STRIPE_SECRET_KEY
const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null

export const POST: APIRoute = async ({ request }) => {
  if (!stripe || !webhookSecret) {
    return new Response(JSON.stringify({ error: 'Stripe no está configurado' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Falta stripe-signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await request.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // TODO: FASE 2 - Procesar eventos (checkout.session.completed, etc.)
    // Crear orden, inscripción y otorgar acceso al curso/congreso

    return new Response(JSON.stringify({ received: true, type: event.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error: `Webhook error: ${message}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
