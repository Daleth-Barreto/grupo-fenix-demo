/**
 * =============================================================================
 * payments.service.ts — Cliente HTTP de pagos (capa SERVICIOS)
 * =============================================================================
 * PROPÓSITO
 *   Encapsula las llamadas al backend NestJS relacionadas con Stripe. El
 *   backend es quien crea la sesión/intent con la llave SECRETA y devuelve los
 *   identificadores que el frontend necesita.
 *
 * DEPENDENCIAS
 *   - ./api → instancia Axios con JWT de Supabase inyectado.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/services/payments.service.ts
 *   2. El backend debe exponer POST /payments/checkout-session
 * =============================================================================
 */

import api from './api'
import type { InvoiceDetails } from '../types'

/** Respuesta del backend al crear una sesión de pago de Stripe. */
export interface CheckoutSessionResponse {
  /** URL de Stripe Checkout (modo hosted) para redirigir al usuario. */
  url?: string
  /** clientSecret de un PaymentIntent (modo Elements embebido). */
  clientSecret?: string
  /** Id de la sesión/intent para conciliación. */
  sessionId?: string
}

export interface CreateCheckoutPayload {
  eventId: string
  quantity?: number
  /** Si el usuario solicita factura → el backend aplica el IVA. */
  requiresInvoice?: boolean
  /** Tasa de IVA aplicada (ej. 0.16). El backend valida/recalcula. */
  taxRate?: number
  /** Datos fiscales (solo si requiresInvoice). */
  invoice?: InvoiceDetails
}

export const paymentsService = {
  /** Crea una sesión de pago en el backend para un evento. */
  createCheckoutSession: (payload: CreateCheckoutPayload) =>
    api.post<CheckoutSessionResponse>('/payments/checkout-session', payload),

  /** Confirma/consulta el estado de un pago por su sessionId. */
  getPaymentStatus: (sessionId: string) =>
    api.get<{ status: 'paid' | 'pending' | 'failed' }>(`/payments/${sessionId}/status`),
}
