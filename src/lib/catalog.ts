import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Event } from '../types'
import { isEventPast } from '../utils/format'
import { getEnv } from './server-env'

/** Catálogo de eventos: se lee de Supabase en cada petición, para que los cambios del admin se vean de inmediato. */

const CATEGORY: Record<string, Event['category']> = {
  congreso: 'Congreso',
  capacitacion: 'Capacitación',
  curso: 'Curso',
  taller: 'Taller',
  diplomado: 'Diplomado',
  seminario: 'Seminario',
}

const MODALITY: Record<string, Event['modality']> = {
  presencial: 'Presencial',
  en_linea: 'En línea',
  hibrido: 'Híbrido',
}

interface EventRow {
  id: string
  title: string
  description: string | null
  category: string | null
  modality: string | null
  start_date: string | null
  end_date: string | null
  location: string | null
  price: number | null
  hours: number | null
  featured: boolean | null
  cover_image: string | null
}

function toEvent(row: EventRow): Event {
  const start = row.start_date ?? ''
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    category: CATEGORY[row.category ?? ''] ?? 'Congreso',
    modality: MODALITY[row.modality ?? ''] ?? 'Presencial',
    date_start: start,
    date_end: row.end_date ?? start,
    location: row.location ?? '',
    price: Number(row.price ?? 0),
    image_url: row.cover_image ?? undefined,
    has_certification: (row.hours ?? 0) > 0,
    curricular_hours: row.hours ?? undefined,
    is_featured: Boolean(row.featured),
  }
}

function publicClient(): SupabaseClient | null {
  const url = getEnv('PUBLIC_SUPABASE_URL')
  const key = getEnv('PUBLIC_SUPABASE_ANON_KEY')
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export interface EventList {
  events: Event[]
  failed: boolean
}

export async function listEvents(): Promise<EventList> {
  const db = publicClient()
  if (!db) return { events: [], failed: true }
  const { data, error } = await db.from('events').select('*').order('start_date', { ascending: true })
  if (error) {
    console.error('[catalogo] No se pudieron leer los eventos', error.message)
    return { events: [], failed: true }
  }
  return { events: ((data ?? []) as EventRow[]).filter((row) => row.start_date).map(toEvent), failed: false }
}

export async function getEvent(id: string): Promise<Event | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const db = publicClient()
  if (!db) return null
  const { data, error } = await db.from('events').select('*').eq('id', id).maybeSingle()
  if (error || !data || !(data as EventRow).start_date) return null
  return toEvent(data as EventRow)
}

export const upcomingEvents = (events: Event[]): Event[] => events.filter((e) => !isEventPast(e.date_end))

/** El evento marcado como destacado o, si no hay, el siguiente disponible. */
export function featuredEvent(events: Event[]): Event | undefined {
  const upcoming = upcomingEvents(events)
  return upcoming.find((e) => e.is_featured) ?? upcoming[0]
}
