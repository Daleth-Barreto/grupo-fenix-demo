import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

// Emite constancias a quienes alcanzaron el porcentaje de días con entrada registrada.
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { event_id?: unknown; min_percent?: unknown } | null
  const percent = Number(body?.min_percent)
  if (typeof body?.event_id !== 'string' || !Number.isInteger(percent)) return json({ error: 'Elige un evento y un porcentaje.' }, 400)

  const { data, error } = await auth.db.rpc('issue_event_certificates', { p_event: body.event_id, p_min_percent: percent })
  if (error) {
    console.error('[constancias]', error.message)
    return json({ error: 'No se pudieron emitir las constancias.' }, 500)
  }
  return json({ data })
}
