import { useState, type FormEvent } from 'react'

interface Props { event: any }

export default function CheckoutForm({ event }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate Stripe processing
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
    }, 2000)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center text-center py-10 px-5 relative overflow-hidden">
        <img
          src="/brand/phoenix/phoenix_5.png"
          alt=""
          aria-hidden
          className="absolute top-2 left-1/2 -translate-x-1/2 w-64 opacity-[0.05] pointer-events-none select-none"
        />
        <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6 relative z-10">
          <span className="material-symbols-outlined text-secondary text-[52px] filled">check_circle</span>
        </div>
        <h2 className="text-[24px] font-bold text-primary mb-2 relative z-10">¡Pago exitoso!</h2>
        <p className="text-sm text-on-surface-variant mb-8 max-w-xs leading-relaxed">
          Te has inscrito correctamente a <strong>{event.title}</strong>. Se ha enviado el recibo a tu correo.
        </p>
        <a href="/app/congresos" className="w-full bg-secondary hover:bg-secondary-deep text-on-secondary font-semibold text-[15px] py-4 rounded-2xl shadow-card transition-all active:scale-[0.98]">
          Ver mis eventos
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="bg-surface rounded-3xl p-5 shadow-sm border border-surface-variant/70">
        <h3 className="text-sm font-bold text-primary mb-4">Información de pago</h3>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-primary ml-1">Titular de la tarjeta</label>
            <input type="text" required placeholder="Nombre como aparece en la tarjeta"
              className="w-full bg-surface-soft rounded-2xl py-3.5 px-4 text-sm text-primary placeholder:text-outline border border-transparent focus:border-secondary outline-none transition-all" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-primary ml-1">Número de tarjeta</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">credit_card</span>
              <input type="text" required placeholder="0000 0000 0000 0000" maxLength={19}
                className="w-full bg-surface-soft rounded-2xl py-3.5 pl-11 pr-4 text-sm text-primary placeholder:text-outline border border-transparent focus:border-secondary outline-none transition-all font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-primary ml-1">Expiración</label>
              <input type="text" required placeholder="MM/AA" maxLength={5}
                className="w-full bg-surface-soft rounded-2xl py-3.5 px-4 text-sm text-primary placeholder:text-outline border border-transparent focus:border-secondary outline-none transition-all text-center" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-primary ml-1">CVV</label>
              <input type="text" required placeholder="123" maxLength={4}
                className="w-full bg-surface-soft rounded-2xl py-3.5 px-4 text-sm text-primary placeholder:text-outline border border-transparent focus:border-secondary outline-none transition-all text-center" />
            </div>
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-primary hover:bg-[#163859] text-white font-semibold text-[15px] py-4 rounded-2xl shadow-card transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2">
        {loading ? (
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Pagar {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(event.price)}
            <span className="material-symbols-outlined text-[18px]">lock</span>
          </>
        )}
      </button>

      <p className="text-center text-xs text-outline flex items-center justify-center gap-1.5">
        <span className="material-symbols-outlined text-[14px]">security</span>
        Pago seguro encriptado
      </p>
    </form>
  )
}
