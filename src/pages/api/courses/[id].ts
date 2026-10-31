import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'
import { hasCourseAccess } from '../../../lib/course-access'

export const prerender = false

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position

// Contenido del curso, incluidos los videos: solo para inscritos y staff.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const courseId = params.id as string
  if (!(await hasCourseAccess(auth.db, auth.userId, auth.role, courseId))) {
    return json({ error: 'No estás inscrito en este curso.' }, 403)
  }

  const { data, error } = await auth.db
    .from('courses')
    .select('id, title, description, instructor, cover_image, published, modules(id, title, description, position, lessons(id, title, type, content, video_url, duration_minutes, is_free, position, resources(id, title, file_url, file_type, position), activities(id, title, description, type, position)))')
    .eq('id', courseId)
    .maybeSingle()

  if (error) return json({ error: 'No se pudo cargar el curso.' }, 500)
  if (!data) return json({ error: 'Curso no encontrado.' }, 404)

  const course = data as any
  course.modules = (course.modules ?? []).sort(byPosition).map((module: any) => ({
    ...module,
    lessons: (module.lessons ?? []).sort(byPosition).map((lesson: any) => ({
      ...lesson,
      resources: (lesson.resources ?? []).sort(byPosition),
      activities: (lesson.activities ?? []).sort(byPosition),
    })),
  }))

  return json({ data: course })
}
