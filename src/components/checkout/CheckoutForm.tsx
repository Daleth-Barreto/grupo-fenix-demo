import { useState } from 'react'
import type { FormEvent } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

type Props = { eventId: string; courseId?: undefined } | { courseId: string; eventId?: undefined }

// La tarjeta se captura en la página de Stripe: la app nunca recibe esos datos.
export default function CheckoutForm({ eventId, courseId }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await adminFetch('/api/checkout/session', {
        method: 'POST',
        body: JSON.stringify(eventId ? { event_id: eventId } : { course_id: courseId }),
      })
      if (res.status === 401) {
        window.location.href = `/app/login?next=${encodeURIComponent(window.location.pathname)}`
        return
      }
      const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
      if (!res.ok || !body.url) throw new Error(body.error || 'No se pudo iniciar el pago.')
      window.location.href = body.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el pago.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="bg-surface rounded-3xl p-5 shadow-sm border border-surface-variant/70 flex gap-3">
        <span className="material-symbols-outlined text-secondary text-[22px]">lock</span>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Te llevaremos a la página segura de Stripe para completar tu pago. Tu inscripción se confirma cuando el pago se acredita.
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-error text-center">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-secondary hover:bg-secondary-deep text-on-secondary font-semibold text-[15px] py-4 rounded-2xl min-h-[52px] shadow-card transition-all active:scale-[0.98] disabled:opacity-60">
        {loading ? 'Conectando con Stripe…' : 'Continuar al pago'}
      </button>
    </form>
  )
}
