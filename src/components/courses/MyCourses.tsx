import { useEffect, useMemo, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

interface MyCourse {
  id: string
  title: string
  description: string | null
  instructor: string | null
  cover_image: string | null
  lesson_ids: string[]
}

const TABS = ['Todos', 'En curso', 'Finalizado'] as const
type Tab = (typeof TABS)[number]

export default function MyCourses() {
  const [courses, setCourses] = useState<MyCourse[] | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('Todos')

  useEffect(() => {
    Promise.all([adminFetch('/api/courses'), adminFetch('/api/progress')])
      .then(async ([coursesRes, progressRes]) => {
        const body = (await coursesRes.json().catch(() => ({}))) as { data?: MyCourse[]; error?: string }
        if (!coursesRes.ok) throw new Error(body.error || 'No se pudieron cargar tus cursos.')
        setCourses(body.data ?? [])
        if (progressRes.ok) setDone(new Set(((await progressRes.json()) as { lesson_ids: string[] }).lesson_ids))
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const rows = useMemo(() => (courses ?? []).map((course) => {
    const total = course.lesson_ids.length
    const completed = course.lesson_ids.filter((id) => done.has(id)).length
    const percent = total ? Math.round((completed / total) * 100) : 0
    return { course, percent, status: (total > 0 && percent === 100 ? 'Finalizado' : 'En curso') as Tab }
  }), [courses, done])

  if (error) return <p role="alert" className="text-sm text-error text-center py-8">{error}</p>
  if (!courses) return <p role="status" className="text-sm text-on-surface-variant text-center py-8">Cargando tus cursos…</p>

  if (courses.length === 0) {
    return (
      <div className="bg-surface rounded-3xl p-8 text-center shadow-card border border-surface-variant/70">
        <span className="material-symbols-outlined text-outline text-[48px] block mb-3">school</span>
        <h2 className="text-lg font-bold text-primary mb-2">Aún no estás inscrito en ningún curso</h2>
        <p className="text-sm text-on-surface-variant mb-6">Cuando te inscribas, tus cursos aparecerán aquí.</p>
        <a href="/app/cursos/catalogo" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ver cursos disponibles</a>
      </div>
    )
  }

  const visible = rows.filter((row) => tab === 'Todos' || row.status === tab)

  return (
    <>
      <div className="flex gap-2">
        {TABS.map((item) => (
          <button key={item} type="button" aria-pressed={tab === item} onClick={() => setTab(item)}
            className={`flex-1 py-3 rounded-2xl text-sm font-semibold transition-all active:scale-95 ${tab === item ? 'bg-secondary text-on-secondary shadow-card' : 'bg-surface border border-surface-variant text-on-surface-variant'}`}>
            {item}
          </button>
        ))}
      </div>

      <a href="/app/cursos/catalogo" className="text-sm font-semibold text-primary underline text-center">Ver cursos disponibles</a>

      <div className="flex flex-col gap-4">
        {visible.map(({ course, percent, status }) => (
          <a key={course.id} href={`/app/cursos/${course.id}`} data-course-id={course.id}
            className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden hover:shadow-elevated transition-all active:scale-[0.98] block">
            <div className="relative w-full h-36 overflow-hidden bg-navy">
              {course.cover_image
                ? <img src={course.cover_image} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-navy-gradient" />}
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-semibold bg-navy/90 text-white">{status}</div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <h2 className="text-[15px] font-semibold text-primary line-clamp-2 leading-snug">{course.title}</h2>
              {course.instructor && <p className="text-xs text-on-surface-variant">{course.instructor}</p>}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${percent}%` }} />
                </div>
                <span className="course-percent text-xs text-on-surface-variant w-8 text-right font-medium">{percent}%</span>
              </div>
            </div>
          </a>
        ))}
        {visible.length === 0 && <p className="text-sm text-on-surface-variant text-center py-12">No hay cursos en esta categoría.</p>}
      </div>
    </>
  )
}
