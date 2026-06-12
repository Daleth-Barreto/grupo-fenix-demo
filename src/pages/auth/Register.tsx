/**
 * =============================================================================
 * Register.tsx — Pantalla de registro (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Alta de nuevos usuarios. Valida el formulario en cliente y delega el alta
 *   en `useAuth().signUpWithEmail`. Sin lógica de Supabase en la vista.
 *
 * DEPENDENCIAS
 *   - ../../hooks/auth/useAuth      → signUpWithEmail.
 *   - ../../components/common/Input  → campos premium.
 *   - ../../components/common/Button → CTA premium.
 *   - react-router-dom               → navegación.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Estado LOCAL de formulario + validaciones (nombre, email, contraseña,
 *     confirmación, términos). `validate()` calcula errores por campo antes de
 *     llamar al hook. Tras un alta exitosa muestra estado de confirmación.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/auth/Register.tsx
 *   2. Ruta pública en App.tsx: <Route path="/registro" element={<Register />} />
 * =============================================================================
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

interface FormErrors {
  fullName?: string
  email?: string
  password?: string
  confirm?: string
  terms?: string
}

export default function Register() {
  const navigate = useNavigate()
  const { signUpWithEmail } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (fullName.trim().length < 3) next.fullName = 'Ingresa tu nombre completo.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Correo no válido.'
    if (password.length < 6) next.password = 'Mínimo 6 caracteres.'
    if (confirm !== password) next.confirm = 'Las contraseñas no coinciden.'
    if (!acceptTerms) next.terms = 'Debes aceptar los términos.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)
    if (!validate()) return
    setIsSubmitting(true)
    const result = await signUpWithEmail(email.trim(), password, fullName.trim())
    setIsSubmitting(false)
    if (result.success) setDone(true)
    else setServerError(result.error)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-secondary text-[44px] filled">mark_email_read</span>
        </div>
        <h1 className="text-[22px] font-bold text-primary">¡Revisa tu correo!</h1>
        <p className="text-sm text-on-surface-variant mt-2 max-w-xs leading-relaxed">
          Te enviamos un enlace de confirmación a <strong className="text-primary">{email}</strong>.
          Confírmalo para activar tu cuenta.
        </p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/login')}>
          Ir a iniciar sesión
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-navy-gradient pt-12 pb-9 px-6 rounded-b-[2.75rem] shadow-hero relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 accent-line" />
        <img
          src="/brand/phoenix/phoenix_5_white.png"
          alt=""
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -top-4 w-80 max-w-none opacity-[0.09] pointer-events-none select-none"
        />
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
          <img src="/brand/logo-fenix.png" alt="Grupo Fénix" className="w-32 max-w-[50%] object-contain drop-shadow-lg mb-3" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Crea tu cuenta</h1>
          <p className="text-sm text-primary-fixed-dim mt-1">Únete a la comunidad Grupo Fénix</p>
        </div>
      </div>

      <main className="flex-1 px-6 py-8 max-w-md w-full mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            icon="person"
            autoComplete="name"
            placeholder="María Fernanda López"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />
          <Input
            label="Correo electrónico"
            icon="mail"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Contraseña"
            icon="lock"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <Input
            label="Confirmar contraseña"
            icon="lock_reset"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />

          <label className="flex items-start gap-3 cursor-pointer mt-1">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-5 h-5 rounded-md accent-[#fe9511] cursor-pointer"
            />
            <span className="text-xs text-on-surface-variant leading-relaxed">
              Acepto los{' '}
              <Link to="/terminos" className="text-secondary font-semibold hover:underline">
                Términos y Condiciones
              </Link>{' '}
              y el Aviso de Privacidad.
            </span>
          </label>
          {errors.terms && <p className="text-xs text-error ml-1 -mt-2">{errors.terms}</p>}

          {serverError && (
            <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {serverError}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting} className="mt-1">
            Crear cuenta
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-semibold text-secondary hover:underline">
            Inicia sesión
          </Link>
        </p>
      </main>
    </div>
  )
}
