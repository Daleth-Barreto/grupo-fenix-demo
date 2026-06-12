export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'student' | 'admin'
}

export interface Event {
  id: string
  title: string
  description: string
  category: 'Congreso' | 'Capacitación' | 'Curso' | 'Taller' | 'Diplomado' | 'Seminario'
  date_start: string
  date_end: string
  location: string
  modality: 'Presencial' | 'En línea' | 'Híbrido'
  price: number
  image_url?: string
  is_enrolled?: boolean
  /** Otorga constancia con valor curricular */
  has_certification?: boolean
  /** Horas con valor curricular */
  curricular_hours?: number
  speakers_count?: number
  /** Marca el congreso destacado en el hero */
  is_featured?: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  thumbnail_url?: string
  total_lessons: number
  progress: number
  current_lesson?: string
  modules: Module[]
}

export interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
  is_locked: boolean
  /** Actividades/entregables del módulo (tareas a realizar). */
  activities?: Activity[]
}

export interface Lesson {
  id: string
  title: string
  duration: string
  video_url?: string
  is_completed: boolean
  order: number
}

/** Actividad a realizar dentro de un curso (tarea, entregable, lectura). */
export interface Activity {
  id: string
  title: string
  description?: string
  type: 'tarea' | 'entregable' | 'lectura' | 'cuestionario'
  /** Fecha límite ISO (opcional). */
  due_date?: string
  is_done: boolean
}

export interface Constancia {
  id: string
  title: string
  issued_at: string
  event_id?: string
  course_id?: string
  pdf_url?: string
  preview_url?: string
}

export interface GalleryEvent {
  id: string
  title: string
  category: 'Congreso' | 'Capacitación' | 'Curso' | 'Taller'
  year: number
  location: string
  cover_url: string
  /** URLs de las fotos del montaje del evento. */
  photos: string[]
  attendees?: number
}

export type ReservationInterest =
  | 'Congreso'
  | 'Capacitación a medida'
  | 'Curso o taller'
  | 'Evento corporativo'

/** Solicitud de reservación / cotización enviada por el usuario. */
export interface ReservationRequest {
  interest: ReservationInterest
  full_name: string
  email: string
  phone: string
  organization?: string
  attendees: number
  preferred_date?: string
  message: string
}

/** Canal de contacto directo mostrado en la pantalla de reservaciones. */
export interface ContactChannel {
  id: string
  icon: string
  label: string
  value: string
  href: string
}

/** Datos fiscales para la emisión de factura (IVA opcional por transacción). */
export interface InvoiceDetails {
  rfc: string
  business_name: string
  fiscal_email: string
}

/**
 * TODO (futuro) — Transmisiones en vivo (clases online).
 * Modelo preparado para la implementación de streaming en vivo.
 */
export interface LiveStream {
  id: string
  title: string
  course_id?: string
  /** Estado de la transmisión. */
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string
  /** URL del stream (HLS/WebRTC) — a definir con el backend. */
  stream_url?: string
  presenter: string
}

/**
 * TODO (futuro) — Módulo de tienda / e-commerce.
 * Modelo base para el catálogo de productos.
 */
export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url?: string
  category: string
  stock: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export type FilterTab = 'Todos' | 'En Curso' | 'Finalizados'
export type EventCategory = 'Todos' | 'Congreso' | 'Capacitación' | 'Curso' | 'Taller'
