import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

export default function MarkCompleteButton({ lessonId, courseId }: { lessonId: string, courseId: string }) {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Al cargar, revisa en Supabase si esta lección ya fue completada.
  useEffect(() => {
    let cancelled = false
    adminFetch(`/api/progress?course_id=${encodeURIComponent(courseId)}`)
      .then(async (res) => {
        if (!res.ok || cancelled) return
        const json = (await res.json()) as { lesson_ids: string[] }
        if (!cancelled) setCompleted(json.lesson_ids.includes(lessonId))
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lessonId, courseId])

  const handleMarkComplete = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await adminFetch('/api/progress', {
        method: 'POST',
        body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, completed: true }),
      })
      if (!res.ok) {
        const json = (await res.json().catch(() => ({}))) as any
        throw new Error(json.error || 'No se pudo guardar')
      }
      setCompleted(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-4 min-h-[52px]">
        <span className="w-5 h-5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  if (completed) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-2xl border border-green-200">
        <span className="material-symbols-outlined text-green-600 filled">check_circle</span>
        <span className="text-sm font-semibold text-green-700">Lección completada</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleMarkComplete}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-secondary text-on-secondary rounded-2xl font-semibold text-sm hover:bg-secondary-deep transition-colors active:scale-[0.98] disabled:opacity-60 min-h-[52px]"
      >
        {saving ? (
          <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
        ) : (
          <>
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            Marcar como completada
          </>
        )}
      </button>
      {error && <p className="text-xs text-error text-center">{error}</p>}
    </div>
  )
}
