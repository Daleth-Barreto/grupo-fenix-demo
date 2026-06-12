import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setLoading(false)
    if (err) setError(err.message)
    else window.location.href = '/app/inicio'
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-[22px] font-bold text-primary">Bienvenido de nuevo</h2>
        <p className="text-sm text-on-surface-variant mt-1">Ingresa para continuar tu formación.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-[13px] font-semibold text-primary ml-1">Correo electrónico</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">mail</span>
            <input id="email" type="email" autoComplete="email" required placeholder="tucorreo@ejemplo.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-soft rounded-2xl py-3.5 text-sm text-primary placeholder:text-outline outline-none pl-12 pr-4 border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-[13px] font-semibold text-primary ml-1">Contraseña</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">lock</span>
            <input id="password" type={showPw ? 'text' : 'password'} autoComplete="current-password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-soft rounded-2xl py-3.5 text-sm text-primary placeholder:text-outline outline-none pl-12 pr-12 border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all" />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors" aria-label={showPw ? 'Ocultar' : 'Mostrar'}>
              <span className="material-symbols-outlined text-[20px]">{showPw ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end -mt-1">
          <a href="/app/recuperar" className="text-xs font-semibold text-secondary hover:underline">¿Olvidaste tu contraseña?</a>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>{error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-60 bg-secondary text-on-secondary hover:bg-secondary-deep shadow-card hover:shadow-elevated text-[15px] py-4 px-6">
          {loading ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        ¿No tienes cuenta?{' '}<a href="/app/registro" className="font-semibold text-secondary hover:underline">Regístrate</a>
      </p>
    </>
  )
}
