import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

const ROLES = ['student', 'instructor', 'admin'] as const

// Sala de una sesión: materiales, preguntas y encuestas, solo para quien tiene acceso al evento.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  const sessionId = params.id as string
  const { data: session, error } = await auth.db
    .from('event_sessions')
    .select('id, event_id, title, description, speaker_name, speaker_bio, room, starts_at, ends_at')
    .eq('id', sessionId)
    .maybeSingle()
  if (error) return json({ error: 'No se pudo cargar la sesión.' }, 500)
  if (!session) return json({ error: 'Sesión no encontrada.' }, 404)

  const access = await auth.db.rpc('has_event_access', { p_event: session.event_id })
  if (access.data !== true) return json({ error: 'Esta sesión es solo para personas inscritas.' }, 403)

  const [materials, questions, polls] = await Promise.all([
    auth.db.from('session_materials').select('id, title, url, kind').eq('session_id', sessionId),
    auth.db.from('session_questions').select('id, user_id, body, answered, created_at').eq('session_id', sessionId).order('created_at', { ascending: true }),
    auth.db.rpc('poll_results', { p_session: sessionId }),
  ])
  if (materials.error || questions.error || polls.error) return json({ error: 'No se pudo cargar la sesión.' }, 500)

  // Las preguntas se muestran sin autor: solo se indica cuáles son propias.
  const rows = (questions.data ?? []) as Array<{ id: string; user_id: string; body: string; answered: boolean; created_at: string }>
  return json({
    session,
    materials: materials.data ?? [],
    polls: polls.data ?? [],
    questions: rows.map(({ user_id: owner, ...question }) => ({ ...question, mine: owner === auth.userId })),
  })
}

// Enviar una pregunta. Las reglas de la base exigen inscripción.
export const POST: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { body?: unknown } | null
  const text = typeof body?.body === 'string' ? body.body.trim() : ''
  if (text.length < 1 || text.length > 500) return json({ error: 'Escribe una pregunta de hasta 500 caracteres.' }, 400)

  const { error } = await auth.db.from('session_questions').insert({ session_id: params.id, user_id: auth.userId, body: text })
  if (error) {
    console.error('[preguntas]', error.message)
    return json({ error: 'No se pudo enviar tu pregunta.' }, 403)
  }
  return json({ ok: true }, 201)
}
