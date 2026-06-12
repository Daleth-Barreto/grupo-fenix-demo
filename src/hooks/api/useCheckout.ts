/**
 * =============================================================================
 * useCheckout.ts — Hook del flujo de pago Stripe (capa de LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Orquesta TODO el proceso de pago de una inscripción. La vista de Checkout
 *   solo invoca `pay()` y observa `status`. Sin lógica de Stripe ni de red en
 *   la vista.
 *
 * DEPENDENCIAS
 *   - ../../services/payments.service → crea la sesión en el backend NestJS.
 *   - ../../lib/stripe                → SDK Stripe + flag isStripeConfigured.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Máquina de estados local: 'idle' → 'processing' → 'success' | 'error'.
 *   - `pay(eventId)`:
 *       1. Pide al backend una CheckoutSession.
 *       2a. Si responde `url` → redirige a Stripe Checkout (hosted).
 *       2b. Si responde `clientSecret` → lo deja disponible para Elements.
 *       3. Si NO hay backend/llave (modo demo) → simula un cobro exitoso para
 *          permitir probar el flujo de UI sin infraestructura.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/api/useCheckout.ts
 *   2. Uso: `const { status, error, clientSecret, pay, reset } = useCheckout()`
 * =============================================================================
 */

import { useState, useCallback } from 'react'
import { paymentsService } from '../../services/payments.service'
import { isStripeConfigured } from '../../lib/stripe'
import type { InvoiceDetails } from '../../types'

export type CheckoutStatus = 'idle' | 'processing' | 'success' | 'error'

/** Opciones de pago: factura/IVA por transacción. */
export interface PayOptions {
  requiresInvoice?: boolean
  invoice?: InvoiceDetails
}

const TAX_RATE = 0.16

export interface UseCheckoutResult {
  status: CheckoutStatus
  error: string | null
  clientSecret: string | null
  pay: (eventId: string, options?: PayOptions) => Promise<void>
  reset: () => void
}

export function useCheckout(): UseCheckoutResult {
  const [status, setStatus] = useState<CheckoutStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  const pay = useCallback(async (eventId: string, options?: PayOptions) => {
    setStatus('processing')
    setError(null)

    // Modo demo: sin backend ni llave pública, simulamos el cobro.
    if (!isStripeConfigured) {
      await new Promise((r) => setTimeout(r, 1600))
      setStatus('success')
      return
    }

    try {
      const { data } = await paymentsService.createCheckoutSession({
        eventId,
        quantity: 1,
        requiresInvoice: options?.requiresInvoice ?? false,
        taxRate: options?.requiresInvoice ? TAX_RATE : 0,
        invoice: options?.invoice,
      })

      if (data.url) {
        window.location.href = data.url // Stripe Checkout hosted
        return
      }
      if (data.clientSecret) {
        setClientSecret(data.clientSecret) // Stripe Elements embebido
        setStatus('success')
        return
      }
      setStatus('error')
      setError('Respuesta de pago inválida del servidor.')
    } catch {
      setStatus('error')
      setError('No se pudo procesar el pago. Inténtalo de nuevo.')
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
    setClientSecret(null)
  }, [])

  return { status, error, clientSecret, pay, reset }
}
