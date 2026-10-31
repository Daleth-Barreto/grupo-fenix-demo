import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

export interface CourseLesson {
  id: string
  title: string
  type: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  resources: Array<{ id: string; title: string; file_url: string | null }>
  activities: Array<{ id: string; title: string; description: string | null }>
}

export interface CourseData {
  id: string
  title: string
  description: string | null
  instructor: string | null
  modules: Array<{ id: string; title: string; description: string | null; lessons: CourseLesson[] }>
}

/** Carga el curso y las lecciones que el usuario ya completó. */
export function useCourse(courseId: string) {
  const [course, setCourse] = useState<CourseData | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      adminFetch(`/api/courses/${encodeURIComponent(courseId)}`),
      adminFetch(`/api/progress?course_id=${encodeURIComponent(courseId)}`),
    ])
      .then(async ([courseRes, progressRes]) => {
        const body = (await courseRes.json().catch(() => ({}))) as { data?: CourseData; error?: string }
        if (!courseRes.ok || !body.data) throw new Error(body.error || 'No se pudo cargar el curso.')
        setCourse(body.data)
        if (progressRes.ok) setDone(new Set(((await progressRes.json()) as { lesson_ids: string[] }).lesson_ids))
      })
      .catch((err: Error) => setError(err.message))
  }, [courseId])

  return { course, done, error }
}
