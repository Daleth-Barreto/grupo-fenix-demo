import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

const MESSAGES: Record<string, string> = {
  cerrada: 'Esta encuesta ya cerró.',
  opcion_invalida: 'Elige una opción de la encuesta.',
  no_existe: 'La encuesta ya no existe.',
}

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { poll_id?: unknown; option?: unknown } | null
  if (typeof body?.poll_id !== 'string' || !Number.isInteger(body.option)) return json({ error: 'Elige una opción.' }, 400)

  const { data, error } = await auth.db.rpc('vote_poll', { p_poll: body.poll_id, p_option: body.option })
  if (error) return json({ error: error.code === '42501' ? 'Esta encuesta es solo para personas inscritas.' : 'No se pudo guardar tu voto.' }, error.code === '42501' ? 403 : 500)
  const status = (data as { status: string }).status
  if (status !== 'ok') return json({ error: MESSAGES[status] ?? 'No se pudo guardar tu voto.' }, 409)
  return json({ ok: true })
}
