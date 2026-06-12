/**
 * =============================================================================
 * live.service.ts — Transmisiones en vivo (capa SERVICIOS) — TODO / FUTURO
 * =============================================================================
 * PROPÓSITO (FUTURO)
 *   Gestionar las clases online en vivo (streaming). Estructura preparada para
 *   la futura implementación; aún NO conectada a la UI.
 *
 * TODO:
 *   - Definir con el backend el protocolo de streaming (HLS / WebRTC / proveedor
 *     externo tipo Mux, Vimeo Live, Agora o LiveKit).
 *   - Endpoints sugeridos:
 *       GET  /live                → próximas transmisiones / en vivo
 *       GET  /live/:id            → detalle + URL del stream (token temporal)
 *       POST /live/:id/join       → registrar asistencia / obtener credenciales
 *   - Manejo de chat en vivo y preguntas (websocket).
 *   - Grabaciones: al terminar, exponer el video como lección del curso.
 * =============================================================================
 */

import api from './api'
import type { LiveStream } from '../types'

export const liveService = {
  // TODO: implementar cuando el backend exponga el módulo de streaming.
  getUpcoming: () => api.get<LiveStream[]>('/live'),
  getById: (id: string) => api.get<LiveStream>(`/live/${id}`),
  join: (id: string) => api.post<{ stream_url: string; token: string }>(`/live/${id}/join`),
}
