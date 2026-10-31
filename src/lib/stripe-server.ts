import Stripe from 'stripe'
import { getEnv } from './server-env'

/** Cliente de Stripe para el Worker. Devuelve null si falta la clave secreta. */
export function getStripe(): Stripe | null {
  const key = getEnv('STRIPE_SECRET_KEY')
  if (!key) return null
  return new Stripe(key, { httpClient: Stripe.createFetchHttpClient() })
}
