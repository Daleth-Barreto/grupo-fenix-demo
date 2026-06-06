/**
 * =============================================================================
 * Button.tsx — Botón premium reutilizable (capa de PRESENTACIÓN)
 * =============================================================================
 * PROPÓSITO
 *   Botón único del sistema "Phoenix Professional". Centraliza variantes,
 *   tamaños, estado de carga y radios (`rounded-2xl`) para garantizar
 *   consistencia visual en toda la PWA.
 *
 * DEPENDENCIAS
 *   - Ninguna externa. Solo React + Tailwind (tokens de DESIGN.md).
 *
 * LÓGICA DE ESTADO
 *   - Sin estado propio. `isLoading` deshabilita el botón y muestra un spinner.
 *     Es un componente 100% controlado por props.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/components/common/Button.tsx
 *   2. Uso: <Button variant="primary" isLoading={x}>Texto</Button>
 * =============================================================================
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  fullWidth?: boolean
  leftIcon?: string
  rightIcon?: string
  children: ReactNode
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-secondary text-on-secondary hover:bg-secondary-deep shadow-card hover:shadow-elevated',
  secondary:
    'bg-transparent text-primary border border-primary hover:bg-surface-container-low',
  ghost: 'bg-transparent text-secondary hover:bg-surface-container-low',
  danger: 'bg-error text-white hover:brightness-90 shadow-card',
}

const SIZES: Record<ButtonSize, string> = {
  md: 'text-sm py-3 px-5',
  lg: 'text-[15px] py-4 px-6',
}

export default function Button({
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-2xl
        transition-all duration-200 active:scale-[0.98]
        disabled:opacity-60 disabled:pointer-events-none
        ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {isLoading ? (
        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="material-symbols-outlined text-[20px]">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="material-symbols-outlined text-[20px]">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}
