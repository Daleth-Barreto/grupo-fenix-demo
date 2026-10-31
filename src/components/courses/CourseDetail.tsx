import { useCourse } from './useCourse'

export default function CourseDetail({ courseId }: { courseId: string }) {
  const { course, done, error } = useCourse(courseId)

  if (error) {
    return (
      <div className="text-center py-12">
        <p role="alert" className="text-sm text-on-surface-variant mb-6">{error}</p>
        <a href="/app/cursos" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ir a mis cursos</a>
      </div>
    )
  }
  if (!course) return <p role="status" className="text-sm text-on-surface-variant text-center py-12">Cargando curso…</p>

  const lessons = course.modules.flatMap((m) => m.lessons)
  const completed = lessons.filter((l) => done.has(l.id)).length
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0
  const next = lessons.find((l) => !done.has(l.id))

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-navy-gradient rounded-3xl p-5 shadow-hero">
        <h1 className="text-[20px] font-bold text-white leading-snug">{course.title}</h1>
        {course.instructor && <p className="text-xs text-primary-fixed-dim mt-1">{course.instructor}</p>}
        <div className="flex items-center justify-between text-xs text-white/80 mt-4 mb-2">
          <span>Progreso del curso</span>
          <span id="course-progress-label" className="font-bold text-white">{percent}% ({completed}/{lessons.length})</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-secondary rounded-full" style={{ width: `${percent}%` }} />
        </div>
      </section>

      {next && (
        <a id="course-continue" href={`/app/cursos/${course.id}/video/${next.id}`} className="flex items-center justify-between gap-3 bg-secondary text-on-secondary rounded-2xl px-4 py-4 font-semibold text-sm min-h-[52px] shadow-card">
          <span className="min-w-0 break-words">{completed > 0 ? 'Continuar' : 'Empezar'}: {next.title}</span>
          <span className="material-symbols-outlined">play_circle</span>
        </a>
      )}

      {course.description && <p className="text-sm text-on-surface-variant leading-relaxed">{course.description}</p>}

      {course.modules.length === 0 && <p className="text-sm text-on-surface-variant text-center py-8">Este curso todavía no tiene contenido.</p>}

      {course.modules.map((module) => (
        <section key={module.id} className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 p-4">
          <h2 className="text-sm font-semibold text-primary">{module.title}</h2>
          {module.description && <p className="text-xs text-on-surface-variant mt-1">{module.description}</p>}
          <div className="mt-2">
            {module.lessons.map((lesson) => {
              const isDone = done.has(lesson.id)
              return (
                <a key={lesson.id} href={`/app/cursos/${course.id}/video/${lesson.id}`} data-lesson-id={lesson.id}
                  className="flex items-center gap-3 py-3 border-b border-surface-variant/50 last:border-0 hover:bg-surface-container-low rounded-xl px-2 -mx-2 transition-colors">
                  <span className={`lesson-icon material-symbols-outlined text-[20px] ${isDone ? 'text-success filled' : 'text-outline'}`}>{isDone ? 'check_circle' : 'play_circle'}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm text-primary font-medium">{lesson.title}</span>
                    {lesson.duration_minutes ? <span className="block text-xs text-outline">{lesson.duration_minutes} min</span> : null}
                  </span>
                </a>
              )
            })}
            {module.lessons.length === 0 && <p className="text-xs text-outline py-3">Sin lecciones todavía.</p>}
          </div>
        </section>
      ))}
    </div>
  )
}
