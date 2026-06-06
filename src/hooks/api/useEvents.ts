/**
 * =============================================================================
 * useEvents.ts — Hook de listado de eventos (capa de LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Provee el catálogo de eventos a las vistas (Congresos, Inicio). Aísla la
 *   llamada a la API de NestJS y expone valores DERIVADOS listos para render
 *   (evento destacado + resto) para que la vista no calcule nada.
 *
 * DEPENDENCIAS
 *   - ../../services/events.service → cliente HTTP (Axios + JWT).
 *   - ../../services/mock.data      → fallback sin backend.
 *   - ../../types                   → modelo `Event`.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useEffect` carga una vez al montar. Intenta la API real; si falla, usa
 *     MOCK_EVENTS. `featuredEvent` y `listEvents` se derivan del array.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/api/useEvents.ts
 *   2. Uso: `const { featuredEvent, listEvents, isLoading } = useEvents()`
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { eventsService } from '../../services/events.service'
import { MOCK_EVENTS } from '../../services/mock.data'
import type { Event } from '../../types'

export interface UseEventsResult {
  events: Event[]
  featuredEvent: Event | null
  listEvents: Event[]
  isLoading: boolean
  error: string | null
}

export function useEvents(): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await eventsService.getAll()
        if (active) setEvents(res.data)
      } catch {
        if (active) {
          setEvents(MOCK_EVENTS)
          setError(null)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const featuredEvent = events.find((e) => e.is_featured) ?? events[0] ?? null
  const listEvents = events.filter((e) => e.id !== featuredEvent?.id)

  return { events, featuredEvent, listEvents, isLoading, error }
}
