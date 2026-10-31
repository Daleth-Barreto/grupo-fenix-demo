import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'

type Estado = 'verificando' | 'listo' | 'invalido' | 'guardado'

// Pantalla a la que llega el usuario desde el enlace del correo de recuperación.
// Supabase lee el token de la URL y dispara PASSWORD_RECOVERY.
export default function NewPasswordForm() {
  const [estado, setEstado] = useState<Estado>('verificando')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) setEstado('listo')
    })
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setEstado('listo')
      else setTimeout(() => setEstado((prev) => (prev === 'verificando' ? 'invalido' : prev)), 1500)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (err) return setError(err.message)
    await supabase.auth.signOut()
    setEstado('guardado')
  }

  if (estado === 'verificando') {
    return <p className="text-center text-sm text-on-surface-variant py-8">Verificando tu enlace…</p>
  }

  if (estado === 'invalido') {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-4">
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Este enlace no es válido o ya venció.
        </p>
        <a href="/app/recuperar" className="inline-flex items-center justify-center font-semibold rounded-2xl bg-secondary text-on-secondary shadow-card text-[15px] py-4 px-6 min-h-[52px]">
          Solicitar un enlace nuevo
        </a>
      </div>
    )
  }

  if (estado === 'guardado') {
    return (
      <div className="flex flex-col items-center text-center py-8 gap-4">
        <h2 className="text-[22px] font-bold text-primary">¡Contraseña actualizada!</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <a href="/app/login" className="inline-flex items-center justify-center font-semibold rounded-2xl bg-secondary text-on-secondary shadow-card text-[15px] py-4 px-6 min-h-[52px]">
          Iniciar sesión
        </a>
      </div>
    )
  }

  const inputClass = 'w-full bg-surface-soft rounded-2xl py-4 px-4 text-base text-primary placeholder:text-outline border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all min-h-[52px]'

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="new-pw" className="text-[13px] font-semibold text-primary ml-1">Nueva contraseña</label>
        <input id="new-pw" type="password" autoComplete="new-password" required placeholder="Mínimo 8 caracteres"
          value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm-pw" className="text-[13px] font-semibold text-primary ml-1">Confirmar contraseña</label>
        <input id="confirm-pw" type="password" autoComplete="new-password" required placeholder="Repite la contraseña"
          value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>{error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 font-semibold rounded-2xl bg-secondary text-on-secondary hover:bg-secondary-deep shadow-card text-[15px] py-4 px-6 disabled:opacity-60 transition-all active:scale-[0.98] min-h-[52px]">
        {loading ? <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : 'Guardar contraseña'}
      </button>
    </form>
  )
}
