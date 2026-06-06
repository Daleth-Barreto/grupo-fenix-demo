/**
 * =============================================================================
 * Checkout.tsx — Pasarela de pago de inscripción (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Resume la compra de una inscripción y dispara el pago vía Stripe. La vista
 *   NO conoce Stripe: invoca `useCheckout().pay()` y reacciona a `status`.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useEventDetail → datos del evento a pagar.
 *   - ../../hooks/api/useCheckout     → orquestación del pago (Stripe/backend).
 *   - ../../components/common/Button   → CTA.
 *   - ../../components/common/Spinner  → carga del evento.
 *   - ../../utils/format               → moneda y fechas.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useEventDetail(id)` carga el resumen. `useCheckout()` maneja la máquina
 *     de estados del pago (idle/processing/success/error). Al éxito, se muestra
 *     una pantalla de confirmación con accesos a "Mis Cursos"/"Constancias".
 *   - El cálculo de totales (subtotal, IVA, total) es presentación pura.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/checkout/Checkout.tsx
 *   2. Ruta en App.tsx: <Route path="/checkout/:id" element={<Checkout />} />
 *   3. NOTA: en modo demo (sin VITE_STRIPE_PUBLIC_KEY) el pago se simula.
 * =============================================================================
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useEventDetail } from '../../hooks/api/useEventDetail'
import { useCheckout } from '../../hooks/api/useCheckout'
import { isStripeConfigured } from '../../lib/stripe'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { formatPrice, formatDateRange } from '../../utils/format'

const TAX_RATE = 0.16

export default function Checkout() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { event, isLoading, notFound } = useEventDetail(id)
  const { status, error, pay } = useCheckout()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined text-[56px] text-outline-variant mb-3">receipt_long</span>
        <h1 className="text-lg font-bold text-primary">No se pudo cargar la inscripción</h1>
        <Button variant="secondary" className="mt-5" onClick={() => navigate('/congresos')}>
          Volver al catálogo
        </Button>
      </div>
    )
  }

  // ----- Pantalla de éxito -----
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6 animate-fade-in-up">
          <span className="material-symbols-outlined text-secondary text-[56px] filled">check_circle</span>
        </div>
        <h1 className="text-[22px] font-bold text-primary">¡Inscripción confirmada!</h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
          Tu lugar en <strong className="text-primary">{event.title}</strong> está asegurado. Te enviamos el comprobante a tu correo.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs mt-8">
          <Button variant="primary" fullWidth onClick={() => navigate('/cursos')}>
            Ir a Mis Cursos
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/inicio')}>
            Volver al inicio
          </Button>
        </div>
      </div>
    )
  }

  // ----- Cálculo de totales (presentación) -----
  const subtotal = event.price
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax
  const isProcessing = status === 'processing'

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-variant">
        <div className="px-5 max-w-2xl mx-auto flex items-center gap-3 h-16">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full text-primary hover:bg-surface-container transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="font-bold text-primary text-[17px]">Confirmar inscripción</span>
        </div>
      </header>

      <main className="px-5 max-w-2xl mx-auto py-6 flex flex-col gap-6">
        {/* Resumen del evento */}
        <section className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 p-4 flex gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-primary">
            {event.image_url ? (
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-navy-gradient">
                <span className="material-symbols-outlined text-white/40 text-[28px]">event</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-primary leading-snug line-clamp-2">{event.title}</h2>
            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              {formatDateRange(event.date_start, event.date_end)}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {event.location}
            </p>
          </div>
        </section>

        {/* Método de pago */}
        <section>
          <h3 className="text-[15px] font-bold text-primary mb-3">Método de pago</h3>
          <div className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-4 border-b border-surface-variant/70">
              <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[20px]">credit_card</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary">Tarjeta de crédito o débito</p>
                <p className="text-xs text-on-surface-variant">Procesado de forma segura por Stripe</p>
              </div>
              <span className="material-symbols-outlined text-secondary filled">radio_button_checked</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-success">lock</span>
              Tus datos viajan cifrados de extremo a extremo.
            </div>
          </div>

          {!isStripeConfigured && (
            <p className="text-[11px] text-outline mt-2 ml-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">info</span>
              Modo demostración: el cobro se simula (sin llave de Stripe configurada).
            </p>
          )}
        </section>

        {/* Desglose */}
        <section className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 p-5 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="text-primary font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">IVA (16%)</span>
            <span className="text-primary font-medium">{formatPrice(tax)}</span>
          </div>
          <div className="h-px bg-surface-variant/70 my-1" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-primary">Total</span>
            <span className="text-[22px] font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </section>

        {error && (
          <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}
      </main>

      {/* CTA fija */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-surface-variant px-5 py-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto">
          <Button
            variant="primary"
            fullWidth
            size="lg"
            leftIcon={isProcessing ? undefined : 'lock'}
            isLoading={isProcessing}
            onClick={() => pay(event.id)}
          >
            {isProcessing ? 'Procesando pago…' : `Pagar ${formatPrice(total)}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
