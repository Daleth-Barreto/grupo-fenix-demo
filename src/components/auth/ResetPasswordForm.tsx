import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/app/reset-password`,
    })
    
    setLoading(false)
    if (err) setError(err.message)
    else setSent(true)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-green-600 text-[32px]">mark_email_read</span>
        </div>
        <h2 className="text-[22px] font-bold text-primary mb-2">Revisa tu correo</h2>
        <p className="text-sm text-on-surface-variant mb-6">
          Hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>
        </p>
        <a 
          href="/app/login" 
          className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] bg-surface-soft text-primary border border-surface-variant py-4 px-6"
        >
          Volver al login
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-primary">Recuperar contraseña</h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[13px] font-semibold text-primary ml-1">Correo electrónico</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">mail</span>
            <input 
              id="email" 
              type="email" 
              autoComplete="email" 
              required 
              placeholder="tucorreo@ejemplo.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-soft rounded-2xl py-3.5 text-sm text-primary placeholder:text-outline outline-none pl-12 pr-4 border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" 
            />
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 bg-secondary text-on-secondary hover:bg-secondary-deep shadow-card hover:shadow-elevated text-[15px] py-4 px-6"
        >
          {loading ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : 'Enviar enlace'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        <a href="/app/login" className="font-semibold text-secondary hover:underline">Volver al login</a>
      </p>
    </>
  )
}
