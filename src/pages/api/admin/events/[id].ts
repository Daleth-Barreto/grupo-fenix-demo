import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json, pickFields } from '../../../../lib/admin-auth'

const EVENT_FIELDS = [
  'title', 'slug', 'description', 'category', 'modality', 'start_date', 'end_date',
  'location', 'price', 'hours', 'featured', 'cover_image',
]

export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return json({ error: error.message }, 500)
  return json({ data })
}

export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const { data, error } = await auth.db
      .from('events')
      .update(pickFields(body, EVENT_FIELDS))
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
    .from('events')
    .delete()
    .eq('id', params.id)
    .select()
    .single()

  if (error) return json({ error: error.message }, 500)
  return json({ data })
}
