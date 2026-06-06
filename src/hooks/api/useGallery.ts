/**
 * =============================================================================
 * useGallery.ts — Hook de la galería de eventos realizados (capa de LÓGICA)
 * =============================================================================
 * PROPÓSITO
 *   Provee a la vista de Galería los eventos pasados con sus fotos. Aísla la
 *   llamada a la API y ofrece un fallback con imágenes de ejemplo.
 *
 * DEPENDENCIAS
 *   - ../../services/gallery.service → cliente HTTP.
 *   - ../../types                    → modelo `GalleryEvent`.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useEffect` carga una vez. Expone `years` derivado (lista única de años
 *     desc.) para construir filtros en la vista sin lógica extra.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/hooks/api/useGallery.ts
 *   2. Uso: `const { items, years, isLoading } = useGallery()`
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { galleryService } from '../../services/gallery.service'
import type { GalleryEvent } from '../../types'

const MOCK_GALLERY: GalleryEvent[] = [
  {
    id: 'g1',
    title: 'Congreso Nacional de Tanatología 1',
    category: 'Congreso',
    year: 2023,
    location: 'Querétaro',
    cover_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80',
    ],
    attendees: 420,
  },
  {
    id: 'g2',
    title: 'Congreso de Neurodesarrollo',
    category: 'Congreso',
    year: 2023,
    location: 'Guadalajara',
    cover_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    ],
    attendees: 310,
  },
  {
    id: 'g3',
    title: 'Capacitación en Intervención en Crisis',
    category: 'Capacitación',
    year: 2024,
    location: 'En línea',
    cover_url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80',
    ],
    attendees: 180,
  },
  {
    id: 'g4',
    title: 'Congreso de Sexualidad y Psicoterapia 2',
    category: 'Congreso',
    year: 2024,
    location: 'Ciudad de México',
    cover_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    ],
    attendees: 360,
  },
  {
    id: 'g5',
    title: 'Taller de Manejo del Duelo',
    category: 'Taller',
    year: 2024,
    location: 'Monterrey',
    cover_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
    photos: ['https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80'],
    attendees: 90,
  },
  {
    id: 'g6',
    title: 'Congreso Nacional de Psicooncología 1',
    category: 'Congreso',
    year: 2023,
    location: 'Puebla',
    cover_url: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
    photos: [
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80',
    ],
    attendees: 275,
  },
]

export interface UseGalleryResult {
  items: GalleryEvent[]
  years: number[]
  isLoading: boolean
}

export function useGallery(): UseGalleryResult {
  const [items, setItems] = useState<GalleryEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const res = await galleryService.getAll()
        if (active) setItems(res.data)
      } catch {
        if (active) setItems(MOCK_GALLERY)
      } finally {
        if (active) setIsLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const years = Array.from(new Set(items.map((i) => i.year))).sort((a, b) => b - a)

  return { items, years, isLoading }
}
