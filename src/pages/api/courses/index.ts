import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// "Mis cursos": solo los cursos en los que el usuario está inscrito, sea cual sea su rol.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('enrollments')
    .select('status, courses(id, title, description, instructor, cover_image, modules(lessons(id)))')
    .eq('user_id', auth.userId)
    .not('course_id', 'is', null)
    .in('status', ['activo', 'completado'])

  if (error) return json({ error: 'No se pudieron cargar tus cursos.' }, 500)

  const courses = ((data ?? []) as any[])
    .filter((row) => row.courses)
    .map((row) => {
      const { modules, ...course } = row.courses
      const lessonIds = (modules ?? []).flatMap((m: any) => (m.lessons ?? []).map((l: any) => l.id))
      return { ...course, lesson_ids: lessonIds }
    })

  return json({ data: courses })
}
