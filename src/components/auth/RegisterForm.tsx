import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

export default function RegisterForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const validate = () => {
    const e: Record<string, string> = {}
    if (fullName.trim().length < 3) e.fullName = 'Ingresa tu nombre completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Correo no válido.'
    if (password.length < 6) e.password = 'Mínimo 6 caracteres.'
    if (confirm !== password) e.confirm = 'Las contraseñas no coinciden.'
    if (!acceptTerms) e.terms = 'Debes aceptar los términos.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault()
    setServerError(null)
    if (!validate()) return
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { data: { full_name: fullName.trim() } },
    })
    setLoading(false)
    if (error) setServerError(error.message)
    else setDone(true)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-secondary text-[44px] filled">mark_email_read</span>
        </div>
        <h1 className="text-[22px] font-bold text-primary">¡Revisa tu correo!</h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
          Te enviamos un enlace de confirmación a <strong className="text-primary">{email}</strong>.
        </p>
        <a href="/app/login" className="mt-6 inline-flex items-center justify-center gap-2 font-semibold rounded-2xl bg-secondary text-on-secondary hover:bg-secondary-deep shadow-card text-[15px] py-4 px-6">
          Ir a iniciar sesión
        </a>
      </div>
    )
  }

  const Field = ({ label, icon, id, type = 'text', value, onChange, error, autoComplete, placeholder }: any) => (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-primary ml-1">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">{icon}</span>
        <input id={id} type={type} autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={onChange}
          className={`w-full bg-surface-soft rounded-2xl py-3.5 text-sm text-primary placeholder:text-outline outline-none pl-12 pr-4 transition-all ${error ? 'border border-error focus:ring-4 focus:ring-error/10' : 'border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10'}`} />
      </div>
      {error && <p className="text-xs text-error ml-1 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">error</span>{error}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nombre completo" icon="person" id="fullName" autoComplete="name" placeholder="María Fernanda López" value={fullName} onChange={(e: any) => setFullName(e.target.value)} error={errors.fullName} />
      <Field label="Correo electrónico" icon="mail" id="email" type="email" autoComplete="email" placeholder="tucorreo@ejemplo.com" value={email} onChange={(e: any) => setEmail(e.target.value)} error={errors.email} />
      <Field label="Contraseña" icon="lock" id="pw" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e: any) => setPassword(e.target.value)} error={errors.password} />
      <Field label="Confirmar contraseña" icon="lock_reset" id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e: any) => setConfirm(e.target.value)} error={errors.confirm} />

      <label className="flex items-start gap-3 cursor-pointer mt-1">
        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-0.5 w-5 h-5 rounded-md accent-[#fe9511] cursor-pointer" />
        <span className="text-xs text-on-surface-variant leading-relaxed">
          Acepto los <a href="/terminos" className="text-secondary font-semibold hover:underline">Términos y Condiciones</a> y el Aviso de Privacidad.
        </span>
      </label>
      {errors.terms && <p className="text-xs text-error ml-1 -mt-2">{errors.terms}</p>}

      {serverError && (
        <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>{serverError}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-2xl bg-secondary text-on-secondary hover:bg-secondary-deep shadow-card text-[15px] py-4 px-6 mt-1 disabled:opacity-60 transition-all active:scale-[0.98]">
        {loading ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-on-surface-variant mt-6">
        ¿Ya tienes cuenta?{' '}<a href="/app/login" className="font-semibold text-secondary hover:underline">Inicia sesión</a>
      </p>
    </form>
  )
}
