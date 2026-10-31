import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

const ROLES = ['student', 'instructor', 'admin'] as const

// Segundo del video donde se quedó el propio usuario.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response
  const { data } = await auth.db.from('lesson_positions').select('seconds').eq('user_id', auth.userId).eq('lesson_id', params.id as string).maybeSingle()
  return json({ seconds: data?.seconds ?? 0 })
}

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response
  const body = (await request.json().catch(() => null)) as { seconds?: unknown } | null
  const seconds = Math.floor(Number(body?.seconds))
  if (!Number.isFinite(seconds) || seconds < 0) return json({ error: 'Posición no válida.' }, 400)
  const { error } = await auth.db.from('lesson_positions').upsert(
    { user_id: auth.userId, lesson_id: params.id, seconds, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,lesson_id' },
  )
  if (error) return json({ error: 'No se pudo guardar tu avance.' }, 500)
  return json({ ok: true })
}
