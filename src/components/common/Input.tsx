/**
 * =============================================================================
 * Input.tsx — Campo de entrada premium (capa de PRESENTACIÓN)
 * =============================================================================
 * PROPÓSITO
 *   Input del sistema "Phoenix Professional": fondo gris tenue, `rounded-2xl`,
 *   ícono opcional, label, toggle de contraseña y mensaje de error accesible.
 *
 * DEPENDENCIAS
 *   - React + Tailwind. Material Symbols para íconos.
 *
 * LÓGICA DE ESTADO
 *   - Estado local mínimo: `showPassword` (solo si type="password"). El valor lo
 *     controla el componente padre (patrón controlado).
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/components/common/Input.tsx
 *   2. Uso: <Input label="Correo" icon="mail" value={x} onChange={...} />
 * =============================================================================
 */

import { useState, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: string
  error?: string | null
}

export default function Input({
  label,
  icon,
  error,
  type = 'text',
  id,
  className = '',
  ...rest
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type
  const inputId = id ?? `field-${label?.toLowerCase().replace(/\s+/g, '-') ?? 'input'}`

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="text-[13px] font-semibold text-primary ml-1">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          type={resolvedType}
          aria-invalid={!!error}
          className={`w-full bg-surface-soft rounded-2xl py-3.5 text-sm text-primary placeholder:text-outline
            outline-none transition-all
            ${icon ? 'pl-12' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'}
            ${error
              ? 'border border-error focus:ring-4 focus:ring-error/10'
              : 'border border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10'}
            ${className}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-error ml-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
