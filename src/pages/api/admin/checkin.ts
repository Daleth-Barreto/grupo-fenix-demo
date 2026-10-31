import type { APIRoute } from 'astro'
import type { PostgrestError } from '@supabase/supabase-js'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const isUuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value)

function failure(error: PostgrestError): Response {
  console.error('[registro]', error.code, error.message)
  if (error.code === 'PGRST202' || error.code === 'PGRST205') {
    return json({ error: 'Falta correr docs/sql/boletos_y_asistencia.sql en Supabase.' }, 500)
  }
  return json({ error: 'No se pudo completar el registro.' }, 500)
}

// Totales del evento y búsqueda de asistentes por nombre.
export const GET: APIRoute = async ({ request, locals, url }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const eventId = url.searchParams.get('event_id')
  if (!isUuid(eventId)) return json({ error: 'Elige un evento.' }, 400)

  const { data, error } = await auth.db.rpc('event_attendance', { p_event: eventId, p_term: url.searchParams.get('q') ?? '' })
  if (error) return failure(error)
  return json({ data })
}

// Registra una entrada con el código del QR o, si se busca por nombre, con la inscripción.
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { event_id?: unknown; code?: unknown; enrollment_id?: unknown } | null
  if (!isUuid(body?.event_id)) return json({ error: 'Elige un evento.' }, 400)

  // Cualquier QR ajeno, como el de un sitio web, se reporta como boleto no válido.
  if (body.code !== undefined && !isUuid(body.code)) return json({ data: { status: 'invalido' } })
  if (body.code === undefined && !isUuid(body.enrollment_id)) return json({ error: 'Falta el boleto.' }, 400)

  const { data, error } = await auth.db.rpc('check_in_attendee', {
    p_event: body.event_id,
    p_code: body.code ?? null,
    p_enrollment: body.code === undefined ? body.enrollment_id : null,
  })
  if (error) return failure(error)
  return json({ data })
}

// Corrige un registro hecho por error.
export const DELETE: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { enrollment_id?: unknown } | null
  if (!isUuid(body?.enrollment_id)) return json({ error: 'Falta la inscripción.' }, 400)

  const { error } = await auth.db.rpc('undo_check_in', { p_enrollment: body.enrollment_id })
  if (error) return failure(error)
  return json({ ok: true })
}
