/**
 * =============================================================================
 * useEventDetail.ts — Hook de detalle de un evento (capa de LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Carga un evento por su `id` para la pantalla de detalle. Aísla la llamada
 *   a la API de NestJS y normaliza el estado de carga/no-encontrado para que la
 *   vista solo renderice.
 *
 * DEPENDENCIAS
 *   - ../../services/events.service → getById.
 *   - ../../services/mock.data      → fallback sin backend.
 *   - ../../types                   → modelo `Event`.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useEffect` reactivo a `id`: recarga si cambia la ruta. Intenta API real,
 *     cae a MOCK_EVENTS. `notFound` true cuando ningún origen tiene el id.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/api/useEventDetail.ts
 *   2. Uso: `const { event, isLoading, notFound } = useEventDetail(id)`
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { eventsService } from '../../services/events.service'
import { MOCK_EVENTS } from '../../services/mock.data'
import type { Event } from '../../types'

export interface UseEventDetailResult {
  event: Event | null
  isLoading: boolean
  notFound: boolean
}

export function useEventDetail(id: string): UseEventDetailResult {
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setNotFound(false)

    const load = async () => {
      try {
        const res = await eventsService.getById(id)
        if (active) setEvent(res.data)
      } catch {
        const fallback = MOCK_EVENTS.find((e) => e.id === id) ?? null
        if (active) {
          setEvent(fallback)
          setNotFound(fallback === null)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [id])

  return { event, isLoading, notFound }
}
