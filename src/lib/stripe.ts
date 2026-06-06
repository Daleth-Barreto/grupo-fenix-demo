/**
 * =============================================================================
 * stripe.ts — Inicialización del SDK de Stripe (capa LIB)
 * =============================================================================
 * PROPÓSITO
 *   Carga el SDK de Stripe.js una sola vez con la llave PÚBLICA del cliente.
 *   La llave pública es segura en el frontend; la llave secreta JAMÁS debe
 *   exponerse aquí (vive en el backend NestJS).
 *
 * DEPENDENCIAS
 *   - @stripe/stripe-js → loadStripe.
 *   - Variable de entorno VITE_STRIPE_PUBLIC_KEY (ver .env.example).
 *
 * LÓGICA
 *   - `stripePromise` es un singleton (Promise<Stripe | null>). Se reutiliza en
 *     toda la app para no recargar el script en cada render.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/lib/stripe.ts
 *   2. Define VITE_STRIPE_PUBLIC_KEY en tu .env
 * =============================================================================
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'

const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY as string | undefined

if (!publicKey) {
  console.warn('[Stripe] VITE_STRIPE_PUBLIC_KEY no configurada. El pago correrá en modo simulación.')
}

/** Singleton del SDK de Stripe. Null si no hay llave pública configurada. */
export const stripePromise: Promise<Stripe | null> = publicKey
  ? loadStripe(publicKey)
  : Promise.resolve(null)

/** Indica si Stripe está realmente configurado (hay llave pública). */
export const isStripeConfigured = Boolean(publicKey)
