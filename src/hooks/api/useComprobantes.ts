/**
 * =============================================================================
 * useComprobantes.ts — Historial de comprobantes/pagos (capa de LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Provee a la vista de "Mis comprobantes" el historial de pagos del usuario.
 *   Aísla la llamada a la API y ofrece un fallback con datos de ejemplo.
 *
 * DEPENDENCIAS
 *   - ../../services/api  → cliente HTTP (Axios + JWT).
 *   - ../../types         → modelo `Receipt`.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/api/useComprobantes.ts
 *   2. Uso: `const { receipts, isLoading } = useComprobantes()`
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import api from '../../services/api'
import type { Receipt } from '../../types'

const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 'r1',
    concept: 'Congreso Nacional de Tanatología',
    date: '2024-10-20',
    amount: 2900,
    method: 'Tarjeta •••• 4242',
    status: 'pagado',
    has_invoice: true,
  },
  {
    id: 'r2',
    concept: 'Diplomado en Cardiología',
    date: '2024-08-12',
    amount: 8000,
    method: 'Tarjeta •••• 4242',
    status: 'pagado',
    has_invoice: false,
  },
  {
    id: 'r3',
    concept: 'Capacitación: Primeros Auxilios Psicológicos',
    date: '2024-12-05',
    amount: 1102,
    method: 'Tarjeta •••• 1881',
    status: 'pagado',
    has_invoice: true,
  },
  {
    id: 'r4',
    concept: 'Taller de Intervención en Duelo',
    date: '2025-01-18',
    amount: 700,
    method: 'PayPal',
    status: 'reembolsado',
    has_invoice: false,
  },
]

export interface UseComprobantesResult {
  receipts: Receipt[]
  isLoading: boolean
}

export function useComprobantes(): UseComprobantesResult {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await api.get<Receipt[]>('/payments/receipts')
        if (active) setReceipts(res.data)
      } catch {
        if (active) setReceipts(MOCK_RECEIPTS)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  return { receipts, isLoading }
}
