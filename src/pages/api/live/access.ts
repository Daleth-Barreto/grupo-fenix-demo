import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Entrega la URL del stream solo si el usuario tiene acceso a esa transmisión.
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { liveStreamId?: unknown } | null
  const liveId = typeof body?.liveStreamId === 'string' ? body.liveStreamId : ''
  if (!liveId) return json({ error: 'Falta liveStreamId' }, 400)

  const { data: live, error } = await auth.db
    .from('lives')
    .select('id, title, description, speaker, status, scheduled_at, hls_url, event_id, course_id')
    .eq('id', liveId)
    .maybeSingle()

  if (error) return json({ error: 'No se pudo consultar la transmisión.' }, 500)
  if (!live) return json({ error: 'Transmisión no encontrada.' }, 404)

  const info = {
    title: live.title,
    description: live.description,
    speaker: live.speaker,
    status: live.status,
    scheduled_at: live.scheduled_at,
  }

  // Una transmisión sin evento ni curso es abierta para cualquier usuario con sesión.
  let allowed = auth.role !== 'student' || (!live.event_id && !live.course_id)
  if (!allowed) {
    const filters = [
      live.event_id ? `event_id.eq.${live.event_id}` : '',
      live.course_id ? `course_id.eq.${live.course_id}` : '',
    ].filter(Boolean).join(',')
    const { data: enrollment, error: enrollmentError } = await auth.db
      .from('enrollments')
      .select('id')
      .eq('user_id', auth.userId)
      .eq('status', 'activo')
      .or(filters)
      .limit(1)
    if (enrollmentError) return json({ error: 'No se pudo verificar tu inscripción.' }, 500)
    allowed = (enrollment?.length ?? 0) > 0
  }

  if (!allowed) return json({ allowed: false, live: info })

  return json({
    allowed: true,
    live: info,
    hlsUrl: live.status === 'en_vivo' ? live.hls_url : null,
  })
}
