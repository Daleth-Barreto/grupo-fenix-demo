/**
 * =============================================================================
 * reservations.service.ts — Cliente HTTP de reservaciones (capa SERVICIOS)
 * =============================================================================
 * PROPÓSITO
 *   Encapsula el envío de solicitudes de reservación/cotización al backend
 *   NestJS, que se encarga de registrarlas y notificar al equipo comercial.
 *
 * DEPENDENCIAS
 *   - ./api → instancia Axios con JWT.
 *   - ../types → modelo `ReservationRequest`.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/services/reservations.service.ts
 *   2. El backend debe exponer POST /reservations
 * =============================================================================
 */

import api from './api'
import type { ReservationRequest } from '../types'

export interface ReservationResponse {
  id: string
  status: 'received'
}

export const reservationsService = {
  /** Envía una solicitud de reservación/cotización. */
  create: (payload: ReservationRequest) =>
    api.post<ReservationResponse>('/reservations', payload),
}
