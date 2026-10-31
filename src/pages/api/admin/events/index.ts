import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json, pickFields } from '../../../../lib/admin-auth'

const EVENT_FIELDS = [
  'title', 'slug', 'description', 'category', 'modality', 'start_date', 'end_date',
  'location', 'price', 'hours', 'featured', 'cover_image',
]

export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return json({ error: error.message }, 500)
  return json({ data })
}

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin', 'instructor'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const row = { ...pickFields(body, EVENT_FIELDS), created_by: auth.userId }
    const { data, error } = await auth.db
      .from('events')
      .insert([row])
      .select()
      .single()

    if (error) return json({ error: error.message }, 500)
    return json({ data }, 201)
  } catch (e: any) {
    return json({ error: e.message }, 400)
  }
}
