/**
 * =============================================================================
 * mock.data.ts — Datos de respaldo para desarrollo sin backend (capa SERVICIOS)
 * =============================================================================
 * PROPÓSITO
 *   Fuente única de datos usada como FALLBACK cuando la API de NestJS no está
 *   disponible. Los congresos reflejan el catálogo REAL de
 *   eventosgrupofenix.com/congresos (títulos, fechas y sedes reales). Las
 *   imágenes se descargaron del sitio oficial a /public/events.
 *
 * DEPENDENCIAS
 *   - ../types → modelo `Event`.
 *
 * NOTA
 *   El sitio oficial no publica precios; los importes aquí son tentativos para
 *   habilitar la demo de checkout y deben ajustarse con datos reales.
 * =============================================================================
 */

import type { Event } from '../types'

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '1er. Congreso Internacional de Neurodesarrollo y Neuroeducación',
    description:
      'Encuentro internacional sobre los últimos avances en neurodesarrollo y su aplicación en la neuroeducación, con especialistas de talla mundial.',
    category: 'Congreso',
    date_start: '2026-05-21',
    date_end: '2026-05-24',
    location: 'Puebla, Puebla',
    modality: 'Presencial',
    price: 2500,
    has_certification: true,
    curricular_hours: 32,
    speakers_count: 14,
    is_featured: true,
    image_url: '/events/neurodesarrollo.jpeg',
  },
  {
    id: '2',
    title: '3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja',
    description:
      'Tercera edición del congreso nacional dedicado a la sexualidad y la psicoterapia de pareja, con enfoque clínico, ético y vivencial.',
    category: 'Congreso',
    date_start: '2026-11-12',
    date_end: '2026-11-15',
    location: 'San Cristóbal de las Casas, Chiapas',
    modality: 'Presencial',
    price: 2300,
    has_certification: true,
    curricular_hours: 30,
    speakers_count: 12,
    image_url: '/events/sexualidad.jpg',
  },
  {
    id: '3',
    title: '2do. Congreso Nacional de Tanatología',
    description:
      'Segunda edición del congreso nacional de tanatología, centrado en el acompañamiento del duelo y los cuidados al final de la vida.',
    category: 'Congreso',
    date_start: '2027-03-18',
    date_end: '2027-03-21',
    location: 'Guadalajara, Jalisco',
    modality: 'Híbrido',
    price: 2400,
    has_certification: true,
    curricular_hours: 32,
    speakers_count: 13,
    image_url: '/events/tanatologia.png',
  },
  {
    id: '4',
    title: '1er. Congreso Nacional de Psicooncología',
    description:
      'Primer congreso nacional de psicooncología: abordaje psicológico integral del paciente oncológico y su familia.',
    category: 'Congreso',
    date_start: '2027-03-18',
    date_end: '2027-03-21',
    location: 'Guadalajara, Jalisco',
    modality: 'Híbrido',
    price: 2200,
    has_certification: true,
    curricular_hours: 30,
    speakers_count: 11,
    image_url: '/events/psicooncologia.png',
  },
  {
    id: '5',
    title: 'Capacitación: Primeros Auxilios Psicológicos',
    description:
      'Programa intensivo con valor curricular para la intervención en crisis y la contención emocional.',
    category: 'Capacitación',
    date_start: '2026-02-05',
    date_end: '2026-02-06',
    location: 'En línea',
    modality: 'En línea',
    price: 950,
    has_certification: true,
    curricular_hours: 12,
    speakers_count: 3,
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  },
  {
    id: '6',
    title: 'Taller de Intervención en Duelo',
    description:
      'Herramientas prácticas para el acompañamiento terapéutico de procesos de duelo complejo.',
    category: 'Taller',
    date_start: '2026-01-18',
    date_end: '2026-01-18',
    location: 'Ciudad de México',
    modality: 'Presencial',
    price: 700,
    has_certification: false,
    speakers_count: 2,
    image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
  },
]
