import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json } from '../../lib/admin-auth'

const ROLES = ['student', 'instructor', 'admin'] as const

// Lista las lecciones completadas del usuario, en un curso o en todos.
export const GET: APIRoute = async ({ request, locals, url }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  let query = auth.db
    .from('user_progress')
    .select('course_id, lesson_id')
    .eq('user_id', auth.userId)

  const courseId = url.searchParams.get('course_id')
  if (courseId) query = query.eq('course_id', courseId)

  const { data, error } = await query
  if (error) return json({ error: error.message }, 500)

  const rows = (data ?? []) as Array<{ course_id: string; lesson_id: string }>
  return json({ lesson_ids: rows.map((r) => r.lesson_id), rows })
}

// Marca o desmarca una lección. El usuario solo puede tocar su propio progreso.
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, [...ROLES])
  if (!auth.ok) return auth.response

  try {
    const body: any = await request.json()
    const courseId = typeof body?.course_id === 'string' ? body.course_id : ''
    const lessonId = typeof body?.lesson_id === 'string' ? body.lesson_id : ''
    const completed = body?.completed === true

    if (!courseId || !lessonId) return json({ error: 'course_id y lesson_id requeridos' }, 400)

    if (completed) {
      const { error } = await auth.db
        .from('user_progress')
        .upsert({ user_id: auth.userId, course_id: courseId, lesson_id: lessonId }, { onConflict: 'user_id,lesson_id' })
      if (error) return json({ error: error.message }, 500)
    } else {
      const { error } = await auth.db
        .from('user_progress')
        .delete()
        .eq('user_id', auth.userId)
        .eq('lesson_id', lessonId)
      if (error) return json({ error: error.message }, 500)
    }

    return json({ ok: true, completed })
  } catch (e: any) {
    return json({ error: e.message }, 400)
  }
}
