import { useCallback, useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'
import AdminForm from './AdminForm'
import { LESSON_TYPES, type Field, type Row } from './crud-config'

const KINDS = {
  modules: {
    singular: 'módulo',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea' },
      { name: 'position', label: 'Orden', type: 'number' },
    ],
  },
  lessons: {
    singular: 'lección',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'type', label: 'Tipo', type: 'select', options: LESSON_TYPES, required: true },
      { name: 'video_url', label: 'Video', type: 'file', help: 'Pega la dirección del video (.mp4 o .m3u8) o sube uno de hasta 20 MB.' },
      { name: 'content', label: 'Texto de la lección', type: 'textarea' },
      { name: 'duration_minutes', label: 'Duración (minutos)', type: 'number' },
      { name: 'position', label: 'Orden', type: 'number' },
    ],
  },
  resources: {
    singular: 'recurso',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'file_url', label: 'Archivo', type: 'file', required: true },
      { name: 'position', label: 'Orden', type: 'number' },
    ],
  },
  activities: {
    singular: 'actividad',
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'description', label: 'Instrucciones', type: 'textarea' },
      { name: 'position', label: 'Orden', type: 'number' },
    ],
  },
} satisfies Record<string, { singular: string; fields: Field[] }>

type Kind = keyof typeof KINDS
interface Editing {
  kind: Kind
  row?: Row
  defaults: Row
  extra: Row
}

async function send(url: string, method: string, body?: Row): Promise<any> {
  const res = await adminFetch(url, { method, ...(body ? { body: JSON.stringify(body) } : {}) })
  const json = (await res.json().catch(() => ({}))) as { error?: string; data?: unknown }
  if (!res.ok) throw new Error(json.error || 'No se pudo completar la acción.')
  return json
}

/** Módulos, lecciones, recursos y actividades de un curso. El curso se indica con ?id=... */
export default function CourseContent() {
  const courseId = new URLSearchParams(window.location.search).get('id') ?? ''
  const [course, setCourse] = useState<Row | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setCourse((await send(`/api/courses/${encodeURIComponent(courseId)}`, 'GET')).data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el curso.')
    }
  }, [courseId])

  useEffect(() => { load() }, [load])

  const remove = async (kind: Kind, id: string) => {
    setConfirming(null)
    setError(null)
    try {
      await send(`/api/admin/${kind}/${id}`, 'DELETE')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.')
    }
  }

  const controls = (kind: Kind, row: Row, extra: Row = {}) => (
    <span className="flex flex-wrap items-center gap-2">
      <button type="button" data-action="edit" data-kind={kind} onClick={() => setEditing({ kind, row, defaults: {}, extra })} className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-[#dce2f3] text-primary min-h-[36px]">Editar</button>
      {confirming === row.id ? (
        <button type="button" data-action="confirm-delete" onClick={() => remove(kind, row.id)} className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-error text-white min-h-[36px]">Sí, eliminar</button>
      ) : (
        <button type="button" data-action="delete" data-kind={kind} onClick={() => setConfirming(row.id)} className="px-3 py-1.5 rounded-lg text-sm font-semibold text-error min-h-[36px]">Eliminar</button>
      )}
    </span>
  )

  const add = (kind: Kind, siblings: Row[], extra: Row, defaults: Row = {}) => (
    <button type="button" data-action="add" data-kind={kind} onClick={() => setEditing({ kind, extra, defaults: { position: siblings.length + 1, ...defaults } })}
      className="inline-flex items-center gap-1 text-sm font-semibold text-accent-link text-primary underline min-h-[36px]">
      + Agregar {KINDS[kind].singular}
    </button>
  )

  if (!courseId) return <p className="text-sm text-on-surface-variant">Elige un curso desde la lista.</p>
  if (!course) return error ? <p role="alert" className="text-sm text-error">{error}</p> : <p role="status" className="text-sm text-on-surface-variant">Cargando contenido…</p>

  if (editing) {
    const config = KINDS[editing.kind]
    return (
      <AdminForm
        title={`${editing.row ? 'Editar' : 'Nuevo'}: ${config.singular}`}
        fields={config.fields}
        initial={editing.row ?? editing.defaults}
        onCancel={() => setEditing(null)}
        onSubmit={async (values) => {
          const body = { ...values, ...editing.extra, position: values.position ?? 0 }
          await send(editing.row ? `/api/admin/${editing.kind}/${editing.row.id}` : `/api/admin/${editing.kind}`, editing.row ? 'PUT' : 'POST', body)
          setEditing(null)
          await load()
        }}
      />
    )
  }

  const modules: Row[] = course.modules ?? []

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-bold text-primary break-words">{course.title}</h1>
        <p className="text-sm text-on-surface-variant mt-1">Organiza el curso en módulos y lecciones. Los inscritos ven los cambios de inmediato.</p>
      </div>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      {modules.map((module) => (
        <section key={module.id} className="course-module bg-white rounded-2xl border border-[#dce2f3] shadow-sm p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-primary break-words">{module.title}</h2>
            {controls('modules', module, { course_id: courseId })}
          </div>

          {(module.lessons ?? []).map((lesson: Row) => (
            <div key={lesson.id} className="course-lesson border-t border-[#dce2f3] pt-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-primary break-words">{lesson.title}</p>
                {controls('lessons', lesson, { module_id: module.id })}
              </div>
              <div className="pl-3 flex flex-col gap-1">
                {(lesson.resources ?? []).map((resource: Row) => (
                  <div key={resource.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-on-surface-variant">
                    <span className="break-words">Recurso: {resource.title}</span>
                    {controls('resources', resource, { course_id: courseId, lesson_id: lesson.id })}
                  </div>
                ))}
                {(lesson.activities ?? []).map((activity: Row) => (
                  <div key={activity.id} className="flex flex-wrap items-center justify-between gap-2 text-sm text-on-surface-variant">
                    <span className="break-words">Actividad: {activity.title}</span>
                    {controls('activities', activity, { lesson_id: lesson.id })}
                  </div>
                ))}
                <div className="flex flex-wrap gap-4">
                  {add('resources', lesson.resources ?? [], { course_id: courseId, lesson_id: lesson.id })}
                  {add('activities', lesson.activities ?? [], { lesson_id: lesson.id })}
                </div>
              </div>
            </div>
          ))}

          <div>{add('lessons', module.lessons ?? [], { module_id: module.id }, { type: 'video' })}</div>
        </section>
      ))}

      {modules.length === 0 && <p className="text-sm text-on-surface-variant">Este curso no tiene contenido. Agrega el primer módulo.</p>}
      <div>{add('modules', modules, { course_id: courseId })}</div>
    </div>
  )
}
