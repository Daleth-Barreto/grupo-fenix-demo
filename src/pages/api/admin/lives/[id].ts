import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json, pickFields } from '../../../../lib/admin-auth'

const LIVE_FIELDS = [
  'title', 'speaker', 'description', 'hls_url', 'owncast_url', 'status',
  'scheduled_at', 'started_at', 'ended_at', 'event_id', 'course_id',
]

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const { data, error } = await auth.db
      .from('lives')
      .update(pickFields(body, LIVE_FIELDS))
      .eq('id', params.id)
      .select()
      .single()

    if (error) return json({ error: error.message }, 500)
    return json({ data })
  } catch (e: any) {
    return json({ error: e.message }, 400)
  }
}

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('lives')
    .delete()
    .eq('id', params.id)
    .select()
    .single()

  if (error) return json({ error: error.message }, 500)
  return json({ data })
}
