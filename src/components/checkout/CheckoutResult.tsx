import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

type State = 'checking' | 'paid' | 'unpaid' | 'unknown'

const COPY: Record<State, { icon: string; title: string; text: string }> = {
  checking: { icon: 'hourglass_top', title: 'Confirmando tu pago…', text: 'Esto toma solo unos segundos.' },
  paid: { icon: 'check_circle', title: '¡Pago exitoso!', text: 'Stripe confirmó tu pago. Puedes ver tu comprobante en cualquier momento.' },
  unpaid: { icon: 'schedule', title: 'Pago pendiente', text: 'Stripe todavía no confirma tu pago. Revisa tus comprobantes más tarde.' },
  unknown: { icon: 'help', title: 'No pudimos confirmar el pago', text: 'Revisa tus comprobantes. Si ves un cargo sin comprobante, contáctanos.' },
}

// Muestra lo que Stripe confirma para esta sesión, no lo que dice la URL.
export default function CheckoutResult() {
  const [state, setState] = useState<State>('checking')

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id')
    if (!sessionId) {
      setState('unknown')
      return
    }
    adminFetch(`/api/checkout/status?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        if (!res.ok) return setState('unknown')
        const body = (await res.json()) as { paid: boolean }
        setState(body.paid ? 'paid' : 'unpaid')
      })
      .catch(() => setState('unknown'))
  }, [])

  const copy = COPY[state]
  return (
    <>
      <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-secondary text-[48px] filled">{copy.icon}</span>
      </div>
      <h1 className="text-[28px] font-bold text-primary mb-2">{copy.title}</h1>
      <p role="status" className="text-sm text-on-surface-variant mb-8 max-w-xs leading-relaxed">{copy.text}</p>
    </>
  )
}
