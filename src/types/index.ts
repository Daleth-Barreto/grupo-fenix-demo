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
  has_certification?: boolean
  curricular_hours?: number
  speakers_count?: number
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

export interface Activity {
  id: string
  title: string
  description?: string
  type: 'tarea' | 'entregable' | 'lectura' | 'cuestionario'
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
  photos: string[]
  attendees?: number
}

export type ReservationInterest =
  | 'Congreso'
  | 'Capacitación a medida'
  | 'Curso o taller'
  | 'Evento corporativo'

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

export interface ContactChannel {
  id: string
  icon: string
  label: string
  value: string
  href: string
}

export interface InvoiceDetails {
  rfc: string
  business_name: string
  fiscal_email: string
}

export interface LiveStream {
  id: string
  title: string
  course_id?: string
  status: 'scheduled' | 'live' | 'ended'
  scheduled_at: string
  stream_url?: string
  presenter: string
}

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
