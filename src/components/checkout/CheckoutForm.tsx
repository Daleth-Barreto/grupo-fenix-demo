import type { FormEvent } from 'react'

interface Props { event: any }

// Auditoría C1: el pago aún no está conectado a Stripe.
// No se capturan datos de tarjeta ni se simula un cobro exitoso.
export default function CheckoutForm({ event }: Props) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-surface rounded-3xl p-5 shadow-sm border border-surface-variant/70">
        <h3 className="text-sm font-bold text-primary mb-2">Pago en línea no disponible</h3>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Todavía no podemos cobrar en línea. No se realizó ningún cargo y no se guardaron datos de tarjeta.
          Para inscribirte a <strong>{event?.title}</strong>, comunícate con nosotros para indicarte cómo hacerlo.
        </p>
      </div>

      <button type="submit" disabled
        className="w-full bg-surface-soft text-outline font-semibold text-[15px] py-4 rounded-2xl min-h-[52px] cursor-not-allowed">
        Pago no disponible
      </button>
    </form>
  )
}
