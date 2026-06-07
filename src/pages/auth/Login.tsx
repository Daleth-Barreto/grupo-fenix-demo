/**
 * =============================================================================
 * Login.tsx — Pantalla de inicio de sesión (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Vista premium de acceso. Recoge credenciales y delega TODA la lógica de
 *   autenticación en `useAuth()`. No contiene llamadas directas a Supabase.
 *
 * DEPENDENCIAS
 *   - ../../hooks/auth/useAuth      → signInWithEmail.
 *   - ../../components/common/Input  → campos premium.
 *   - ../../components/common/Button → CTA premium.
 *   - react-router-dom               → navegación + ruta de retorno.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Estado LOCAL de formulario (email, password, error, isSubmitting).
 *   - Al enviar: llama signInWithEmail → si éxito navega a `from` (ruta previa
 *     guardada por ProtectedRoute) o a /inicio; si falla muestra el error
 *     traducido devuelto por el hook.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/auth/Login.tsx
 *   2. Ruta pública en App.tsx: <Route path="/login" element={<Login />} />
 *   3. Verifica: npx tsc --noEmit && npx vite build
 * =============================================================================
 */

import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'

interface LocationState {
  from?: string
}

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signInWithEmail } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const from = (location.state as LocationState | null)?.from ?? '/inicio'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const result = await signInWithEmail(email.trim(), password)
    setIsSubmitting(false)
    if (result.success) navigate(from, { replace: true })
    else setError(result.error)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero superior Deep Navy */}
      <div className="bg-navy-gradient pt-14 pb-10 px-6 rounded-b-[2.5rem] shadow-hero relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 accent-line" />
        <div className="relative z-10 flex flex-col items-center text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-card p-2.5">
            <img src="/brand/logo-fenix-navy.png" alt="Grupo Fénix" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Grupo FÉNIX</h1>
          <p className="text-sm text-primary-fixed-dim mt-1">Formación y congresos profesionales</p>
        </div>
      </div>

      {/* Formulario */}
      <main className="flex-1 px-6 py-8 max-w-md w-full mx-auto">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold text-primary">Bienvenido de nuevo</h2>
          <p className="text-sm text-on-surface-variant mt-1">Ingresa para continuar tu formación.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            icon="mail"
            type="email"
            autoComplete="email"
            required
            placeholder="tucorreo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Contraseña"
            icon="lock"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex justify-end -mt-1">
            <Link to="/recuperar" className="text-xs font-semibold text-secondary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container text-sm rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Iniciar sesión
          </Button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="font-semibold text-secondary hover:underline">
            Regístrate
          </Link>
        </p>
      </main>
    </div>
  )
}
