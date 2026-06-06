/**
 * =============================================================================
 * useReservation.ts — Hook del flujo de reservación/cotización (capa LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Orquesta el asistente multi-paso de reservación: mantiene el paso actual,
 *   el formulario, la validación y el envío al backend. La vista solo invoca
 *   acciones y observa el estado.
 *
 * DEPENDENCIAS
 *   - ../../services/reservations.service → envío al backend NestJS.
 *   - ../../store/auth.store              → prellena nombre/email del usuario.
 *   - ../../types                         → ReservationRequest, interés.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `step` (1..3) controla el asistente. `data` guarda el formulario.
 *   - `validateStep` calcula errores por paso ANTES de avanzar.
 *   - `submit` envía la solicitud; si no hay backend, simula recepción para
 *     permitir probar el flujo de UI. `status`: idle | sending | success | error.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/api/useReservation.ts
 *   2. Uso: `const r = useReservation()` → r.step, r.data, r.next, r.submit…
 * =============================================================================
 */

import { useState, useCallback } from 'react'
import { reservationsService } from '../../services/reservations.service'
import { useAuthStore } from '../../store/auth.store'
import { isStripeConfigured } from '../../lib/stripe'
import type { ReservationInterest, ReservationRequest } from '../../types'

export type ReservationStatus = 'idle' | 'sending' | 'success' | 'error'

export interface ReservationErrors {
  interest?: string
  full_name?: string
  email?: string
  phone?: string
  attendees?: string
  message?: string
}

const EMPTY: ReservationRequest = {
  interest: 'Congreso',
  full_name: '',
  email: '',
  phone: '',
  organization: '',
  attendees: 1,
  preferred_date: '',
  message: '',
}

export interface UseReservationResult {
  step: number
  data: ReservationRequest
  errors: ReservationErrors
  status: ReservationStatus
  serverError: string | null
  setInterest: (interest: ReservationInterest) => void
  setField: <K extends keyof ReservationRequest>(key: K, value: ReservationRequest[K]) => void
  next: () => void
  back: () => void
  submit: () => Promise<void>
  reset: () => void
}

export function useReservation(): UseReservationResult {
  const user = useAuthStore((s) => s.user)
  const [step, setStep] = useState(1)
  const [data, setData] = useState<ReservationRequest>({
    ...EMPTY,
    full_name: user?.full_name ?? '',
    email: user?.email ?? '',
  })
  const [errors, setErrors] = useState<ReservationErrors>({})
  const [status, setStatus] = useState<ReservationStatus>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const setInterest = useCallback((interest: ReservationInterest) => {
    setData((d) => ({ ...d, interest }))
  }, [])

  const setField = useCallback(
    <K extends keyof ReservationRequest>(key: K, value: ReservationRequest[K]) => {
      setData((d) => ({ ...d, [key]: value }))
    },
    [],
  )

  const validateStep = useCallback(
    (current: number): boolean => {
      const next: ReservationErrors = {}
      if (current === 1 && !data.interest) next.interest = 'Selecciona una opción.'
      if (current === 2) {
        if (data.full_name.trim().length < 3) next.full_name = 'Ingresa tu nombre completo.'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) next.email = 'Correo no válido.'
        if (data.phone.trim().length < 8) next.phone = 'Teléfono no válido.'
        if (data.attendees < 1) next.attendees = 'Mínimo 1 asistente.'
      }
      if (current === 3 && data.message.trim().length < 10) {
        next.message = 'Cuéntanos un poco más (mín. 10 caracteres).'
      }
      setErrors(next)
      return Object.keys(next).length === 0
    },
    [data],
  )

  const next = useCallback(() => {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1))
  }, [step, validateStep])

  const back = useCallback(() => setStep((s) => Math.max(1, s - 1)), [])

  const submit = useCallback(async () => {
    if (!validateStep(3)) return
    setStatus('sending')
    setServerError(null)

    // Modo demo: sin backend configurado, simulamos recepción.
    if (!isStripeConfigured) {
      await new Promise((r) => setTimeout(r, 1400))
      setStatus('success')
      return
    }

    try {
      await reservationsService.create(data)
      setStatus('success')
    } catch {
      setStatus('error')
      setServerError('No se pudo enviar tu solicitud. Inténtalo de nuevo.')
    }
  }, [data, validateStep])

  const reset = useCallback(() => {
    setStep(1)
    setData({ ...EMPTY, full_name: user?.full_name ?? '', email: user?.email ?? '' })
    setErrors({})
    setStatus('idle')
    setServerError(null)
  }, [user])

  return { step, data, errors, status, serverError, setInterest, setField, next, back, submit, reset }
}
