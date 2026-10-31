import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

// Boleto del propio usuario: siempre se filtra por su id, nunca se entrega el de otra persona.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('enrollments')
    .select('id, ticket_code, events(id, title, start_date, end_date, location)')
    .eq('user_id', auth.userId)
    .eq('event_id', params.eventId as string)
    .in('status', ['activo', 'completado'])
    .limit(1)

  if (error) {
    console.error('[boleto]', error.message)
    return json({ error: 'No se pudo cargar tu boleto.' }, 500)
  }
  const enrollment = data?.[0] as any
  if (!enrollment?.events) return json({ error: 'No estás inscrito en este evento.' }, 404)
  if (!enrollment.ticket_code) return json({ error: 'Tu boleto todavía no está disponible.' }, 500)

  const { data: days } = await auth.db
    .from('checkins')
    .select('check_in_date')
    .eq('enrollment_id', enrollment.id)

  return json({
    data: {
      ticket_code: enrollment.ticket_code,
      event: enrollment.events,
      days_attended: (days ?? []).length,
    },
  })
}
