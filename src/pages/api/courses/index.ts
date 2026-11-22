import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

const conLecciones = (row: any) => {
  const { modules, ...course } = row
  const lessonIds = (modules ?? []).flatMap((m: any) => (m.lessons ?? []).map((l: any) => l.id))
  return { ...course, lesson_ids: lessonIds }
}

// "Mis cursos": el alumno ve solo los cursos en los que está inscrito.
// El admin y el instructor ven todos, porque los administran y pueden entrar a revisarlos.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  if (auth.role === 'admin' || auth.role === 'instructor') {
    const { data, error } = await auth.db
      .from('courses')
      .select('id, title, description, instructor, cover_image, modules(lessons(id))')
      .order('created_at', { ascending: false })
    if (error) return json({ error: 'No se pudieron cargar los cursos.' }, 500)
    return json({ data: ((data ?? []) as any[]).map(conLecciones) })
  }

  const { data, error } = await auth.db
    .from('enrollments')
    .select('status, courses(id, title, description, instructor, cover_image, modules(lessons(id)))')
    .eq('user_id', auth.userId)
    .not('course_id', 'is', null)
    .in('status', ['activo', 'completado'])

  if (error) return json({ error: 'No se pudieron cargar tus cursos.' }, 500)

  const courses = ((data ?? []) as any[])
    .filter((row) => row.courses)
    .map((row) => conLecciones(row.courses))

  return json({ data: courses })
}
