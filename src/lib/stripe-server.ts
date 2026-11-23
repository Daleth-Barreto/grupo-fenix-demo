import Stripe from 'stripe'
import { getEnv } from './server-env'

/** Cliente de Stripe para el Worker. Devuelve null si falta la clave secreta. */
export function getStripe(): Stripe | null {
  const key = getEnv('STRIPE_SECRET_KEY')
  if (!key) return null
  // Solo para pruebas locales con un Stripe simulado (p. ej. http://127.0.0.1:12111).
  // En producción no se define y se usa la API real de Stripe.
  const base = getEnv('STRIPE_API_BASE')
  const local = base ? new URL(base) : null
  return new Stripe(key, {
    httpClient: Stripe.createFetchHttpClient(),
    ...(local ? { host: local.hostname, port: Number(local.port), protocol: local.protocol.replace(':', '') as 'http' | 'https' } : {}),
  })
}
