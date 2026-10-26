import { useState } from 'react'

export default function MarkCompleteButton({ lessonId, courseId }: { lessonId: string, courseId: string }) {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMarkComplete = async () => {
    setLoading(true)
    // TODO: Persistir en Supabase (user_progress)
    setTimeout(() => {
      setCompleted(true)
      setLoading(false)
    }, 500)
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
    <button
      onClick={handleMarkComplete}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-on-secondary rounded-2xl font-semibold text-sm hover:bg-secondary-deep transition-colors active:scale-[0.98] disabled:opacity-60"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : (
        <>
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Marcar como completada
        </>
      )}
    </button>
  )
}
