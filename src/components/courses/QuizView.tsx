import { useEffect, useState, type FormEvent } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

interface Question { id: string; prompt: string; options: string[] }
interface Quiz { questions: Question[]; best: number | null; attempts: number }

export default function QuizView({ lessonId }: { lessonId: string }) {
  const url = `/api/lessons/${encodeURIComponent(lessonId)}/quiz`
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [result, setResult] = useState<{ score: number; total: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    adminFetch(url)
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: Quiz; error?: string }
        if (!res.ok || !body.data) throw new Error(body.error || 'No se pudo cargar el cuestionario.')
        setQuiz(body.data)
      })
      .catch((err: Error) => setError(err.message))
  }, [url])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await adminFetch(url, { method: 'POST', body: JSON.stringify({ answers }) })
      const body = (await res.json().catch(() => ({}))) as { data?: { status: string; score: number; total: number }; error?: string }
      if (!res.ok || body.data?.status !== 'ok') throw new Error(body.error || 'No se pudo calificar el cuestionario.')
      setResult({ score: body.data.score, total: body.data.total })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo calificar el cuestionario.')
    } finally {
      setBusy(false)
    }
  }

  if (error && !quiz) return <p role="alert" className="text-sm text-error">{error}</p>
  if (!quiz) return <p role="status" className="text-sm text-on-surface-variant">Cargando cuestionario…</p>
  if (quiz.questions.length === 0) return <p className="text-sm text-on-surface-variant">Este cuestionario todavía no tiene preguntas.</p>

  const complete = quiz.questions.every((q) => answers[q.id] !== undefined)

  return (
    <form id="quiz-form" onSubmit={submit} className="flex flex-col gap-4">
      <h2 className="text-[17px] font-bold text-primary">Cuestionario</h2>
      {quiz.best !== null && !result && <p className="text-sm text-on-surface-variant">Tu mejor resultado: {quiz.best} de {quiz.questions.length}. Puedes intentarlo de nuevo.</p>}
      {quiz.questions.map((question, number) => (
        <fieldset key={question.id} className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-primary mb-1 break-words">{number + 1}. {question.prompt}</legend>
          {question.options.map((option, index) => (
            <label key={option} className="flex items-center gap-3 rounded-xl border border-surface-variant px-3 py-3 text-sm text-primary cursor-pointer min-h-[44px]">
              <input type="radio" name={question.id} checked={answers[question.id] === index} onChange={() => setAnswers({ ...answers, [question.id]: index })} className="w-5 h-5 accent-[#fe9511] flex-shrink-0" />
              <span className="break-words min-w-0">{option}</span>
            </label>
          ))}
        </fieldset>
      ))}
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      {result && <p id="quiz-result" role="status" className="text-base font-bold text-primary">Resultado: {result.score} de {result.total}</p>}
      <button type="submit" disabled={busy || !complete} className="self-start bg-secondary text-on-secondary px-5 py-3 rounded-2xl font-semibold text-sm min-h-[44px] disabled:opacity-60">{busy ? 'Calificando…' : result ? 'Enviar de nuevo' : 'Enviar respuestas'}</button>
    </form>
  )
}
