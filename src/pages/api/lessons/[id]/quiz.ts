import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

const ROLES = ['student', 'instructor', 'admin'] as const

// Preguntas sin la respuesta correcta: la base califica, nunca el navegador.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response
  const { data, error } = await auth.db.rpc('get_quiz', { p_lesson: params.id })
  if (error) return json({ error: error.code === '42501' ? 'No estás inscrito en este curso.' : 'No se pudo cargar el cuestionario.' }, error.code === '42501' ? 403 : 500)
  return json({ data })
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as { answers?: unknown } | null
  if (!body?.answers || typeof body.answers !== 'object') return json({ error: 'Responde el cuestionario.' }, 400)
  const { data, error } = await auth.db.rpc('submit_quiz', { p_lesson: params.id, p_answers: body.answers })
  if (error) return json({ error: error.code === '42501' ? 'No estás inscrito en este curso.' : 'No se pudo calificar el cuestionario.' }, error.code === '42501' ? 403 : 500)
  return json({ data })
}
