import VideoPlayer from './VideoPlayer'
import MarkCompleteButton from './MarkCompleteButton'
import { useCourse } from './useCourse'

export default function LessonView({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const { course, error } = useCourse(courseId)
  const back = `/app/cursos/${courseId}`

  if (error) {
    return (
      <div className="text-center py-16 px-5">
        <p role="alert" className="text-sm text-on-surface-variant mb-6">{error}</p>
        <a href="/app/cursos" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ir a mis cursos</a>
      </div>
    )
  }
  if (!course) return <p role="status" className="text-sm text-on-surface-variant text-center py-16">Cargando lección…</p>

  const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId)
  if (!lesson) {
    return (
      <div className="text-center py-16 px-5">
        <p className="text-sm text-on-surface-variant mb-6">Esta lección ya no existe.</p>
        <a href={back} className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Volver al curso</a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <VideoPlayer backHref={back} instructor={course.instructor ?? ''} courseTitle={course.title} lessonTitle={lesson.title}
        duration={lesson.duration_minutes ? `${lesson.duration_minutes} min` : ''} videoUrl={lesson.video_url ?? undefined} isVideo={lesson.type === 'video'} />

      <div className="px-4 sm:px-5 bg-surface flex flex-col gap-4 pb-4">
        {lesson.content && <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{lesson.content}</p>}

        {lesson.resources.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-primary mb-2">Recursos</h2>
            <ul className="flex flex-col gap-2">
              {lesson.resources.map((r) => (
                <li key={r.id}>{r.file_url
                  ? <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary underline">{r.title}</a>
                  : <span className="text-sm text-primary">{r.title}</span>}</li>
              ))}
            </ul>
          </section>
        )}

        {lesson.activities.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-primary mb-2">Actividades</h2>
            <ul className="flex flex-col gap-2">
              {lesson.activities.map((a) => (
                <li key={a.id} className="text-sm text-primary">
                  {a.title}
                  {a.description && <span className="block text-xs text-on-surface-variant">{a.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="px-4 sm:px-5 py-4 bg-surface border-t border-surface-variant" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto">
          <MarkCompleteButton lessonId={lessonId} courseId={courseId} />
        </div>
      </div>
    </div>
  )
}
