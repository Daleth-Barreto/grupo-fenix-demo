import type { APIRoute } from 'astro'
import { requireRole, json, pickFields, type AppRole } from './admin-auth'

/**
 * Rutas de administración para una tabla. Solo aceptan los campos de `fields`, y las
 * cadenas vacías se guardan como null para que las fechas y números opcionales no fallen.
 */
interface CrudOptions {
  table: string
  fields: string[]
  roles: AppRole[]
  /** Parámetros de la URL que se pueden usar como filtro exacto, como ?course_id=... */
  filters?: string[]
  select?: string
  order?: { column: string; ascending?: boolean }
  /** Guarda quién creó el registro en esta columna. */
  ownerColumn?: string
}

function clean(row: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value === '' ? null : value]))
}

export function collectionRoutes(options: CrudOptions): { GET: APIRoute; POST: APIRoute } {
  const { table, fields, roles, filters = [], select = '*', order, ownerColumn } = options
  return {
    GET: async ({ request, locals, url }) => {
      const auth = await requireRole(request, locals, roles)
      if (!auth.ok) return auth.response

      let query = auth.db.from(table).select(select)
      for (const filter of filters) {
        const value = url.searchParams.get(filter)
        if (value) query = query.eq(filter, value)
      }
      if (order) query = query.order(order.column, { ascending: order.ascending ?? true })

      const { data, error } = await query
      if (error) return json({ error: error.message }, 500)
      return json({ data: data ?? [] })
    },
    POST: async ({ request, locals }) => {
      const auth = await requireRole(request, locals, roles)
      if (!auth.ok) return auth.response

      const body = await request.json().catch(() => null)
      if (!body || typeof body !== 'object') return json({ error: 'Datos no válidos.' }, 400)

      const row = clean(pickFields(body, fields))
      if (ownerColumn) row[ownerColumn] = auth.userId

      const { data, error } = await auth.db.from(table).insert([row]).select(select).single()
      if (error) return json({ error: error.message }, 500)
      return json({ data }, 201)
    },
  }
}

export function itemRoutes(options: CrudOptions): { GET: APIRoute; PUT: APIRoute; DELETE: APIRoute } {
  const { table, fields, roles, select = '*' } = options
  return {
    GET: async ({ params, request, locals }) => {
      const auth = await requireRole(request, locals, roles)
      if (!auth.ok) return auth.response
      const { data, error } = await auth.db.from(table).select(select).eq('id', params.id as string).maybeSingle()
      if (error) return json({ error: error.message }, 500)
      if (!data) return json({ error: 'No encontrado.' }, 404)
      return json({ data })
    },
    PUT: async ({ params, request, locals }) => {
      const auth = await requireRole(request, locals, roles)
      if (!auth.ok) return auth.response

      const body = await request.json().catch(() => null)
      if (!body || typeof body !== 'object') return json({ error: 'Datos no válidos.' }, 400)

      const { data, error } = await auth.db
        .from(table)
        .update(clean(pickFields(body, fields)))
        .eq('id', params.id as string)
        .select(select)
        .maybeSingle()
      if (error) return json({ error: error.message }, 500)
      if (!data) return json({ error: 'No se pudo guardar: no existe o no tienes permiso.' }, 404)
      return json({ data })
    },
    DELETE: async ({ params, request, locals }) => {
      const auth = await requireRole(request, locals, roles)
      if (!auth.ok) return auth.response

      const { data, error } = await auth.db.from(table).delete().eq('id', params.id as string).select('id')
      if (error) return json({ error: error.message }, 500)
      if (!data || data.length === 0) return json({ error: 'No se pudo eliminar: no existe o no tienes permiso.' }, 404)
      return json({ ok: true })
    },
  }
}

export const STAFF: AppRole[] = ['admin', 'instructor']
export const ADMIN: AppRole[] = ['admin']

export const COURSE = {
  table: 'courses',
  fields: ['title', 'slug', 'description', 'instructor', 'price', 'cover_image', 'featured', 'published', 'requires_enrollment'],
  roles: STAFF,
  order: { column: 'created_at', ascending: false },
  ownerColumn: 'created_by',
}
export const MODULE = {
  table: 'modules',
  fields: ['course_id', 'title', 'description', 'position'],
  roles: STAFF,
  filters: ['course_id'],
  order: { column: 'position' },
}
export const LESSON = {
  table: 'lessons',
  fields: ['module_id', 'title', 'type', 'content', 'video_url', 'duration_minutes', 'is_free', 'position'],
  roles: STAFF,
  filters: ['module_id'],
  order: { column: 'position' },
}
export const ACTIVITY = {
  table: 'activities',
  fields: ['lesson_id', 'module_id', 'title', 'description', 'type', 'position'],
  roles: STAFF,
  filters: ['lesson_id', 'module_id'],
  order: { column: 'position' },
}
export const RESOURCE = {
  table: 'resources',
  fields: ['course_id', 'module_id', 'lesson_id', 'title', 'file_url', 'file_type', 'position'],
  roles: STAFF,
  filters: ['course_id', 'module_id', 'lesson_id'],
  order: { column: 'position' },
}
export const ENROLLMENT = {
  table: 'enrollments',
  fields: ['user_id', 'course_id', 'event_id', 'status'],
  roles: ADMIN,
  filters: ['course_id', 'event_id', 'user_id'],
  select: 'id, user_id, course_id, event_id, status, created_at, courses(title), events(title)',
  order: { column: 'created_at', ascending: false },
}
export const CERTIFICATE = {
  table: 'certificates',
  fields: ['user_id', 'course_id', 'event_id', 'certificate_number', 'issued_at', 'sent_at'],
  roles: STAFF,
  select: 'id, user_id, course_id, event_id, certificate_number, issued_at, sent_at, created_at, events(title), courses(title)',
  order: { column: 'created_at', ascending: false },
}
export const MEDIA = {
  table: 'media',
  fields: ['name', 'file_url', 'file_type', 'file_size', 'bucket', 'path'],
  roles: STAFF,
  order: { column: 'created_at', ascending: false },
  ownerColumn: 'uploaded_by',
}
export const SESSION = {
  table: 'event_sessions',
  fields: ['event_id', 'title', 'description', 'speaker_name', 'speaker_bio', 'room', 'starts_at', 'ends_at'],
  roles: STAFF,
  filters: ['event_id'],
  order: { column: 'starts_at' },
}
export const SESSION_MATERIAL = {
  table: 'session_materials',
  fields: ['session_id', 'title', 'url', 'kind'],
  roles: STAFF,
  filters: ['session_id'],
  order: { column: 'created_at' },
}
export const SESSION_POLL = {
  table: 'session_polls',
  fields: ['session_id', 'question', 'options', 'is_open'],
  roles: STAFF,
  filters: ['session_id'],
  order: { column: 'created_at' },
}
export const SESSION_QUESTION = {
  table: 'session_questions',
  fields: ['answered'],
  roles: STAFF,
  filters: ['session_id'],
  order: { column: 'created_at' },
}
export const QUIZ_QUESTION = {
  table: 'quiz_questions',
  fields: ['lesson_id', 'prompt', 'options', 'correct_index', 'position'],
  roles: STAFF,
  filters: ['lesson_id'],
  order: { column: 'position' },
}
export const RESERVATION = {
  table: 'reservation_requests',
  fields: [] as string[],
  roles: ADMIN,
}
