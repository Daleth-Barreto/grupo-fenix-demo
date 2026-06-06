/**
 * =============================================================================
 * gallery.service.ts — Cliente HTTP de la galería (capa SERVICIOS)
 * =============================================================================
 * PROPÓSITO
 *   Encapsula las llamadas al backend NestJS para obtener los eventos pasados
 *   (galería de montajes realizados por Grupo Fénix).
 *
 * DEPENDENCIAS
 *   - ./api → instancia Axios con JWT.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/services/gallery.service.ts
 *   2. El backend debe exponer GET /gallery
 * =============================================================================
 */

import api from './api'
import type { GalleryEvent } from '../types'

export const galleryService = {
  getAll: () => api.get<GalleryEvent[]>('/gallery'),
  getById: (id: string) => api.get<GalleryEvent>(`/gallery/${id}`),
}
