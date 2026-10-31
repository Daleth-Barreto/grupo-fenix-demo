import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

interface Poll {
  id: string
  question: string
  options: string[]
  is_open: boolean
  my_vote: number | null
  totals: Record<string, number>
}

interface Room {
  session: { event_id: string; title: string; speaker_name: string | null; room: string | null }
  materials: Array<{ id: string; title: string; url: string; kind: string }>
  questions: Array<{ id: string; body: string; answered: boolean; mine: boolean }>
  polls: Poll[]
}

const REFRESH_MS = 15000

export default function SessionRoom({ sessionId }: { sessionId: string }) {
  const [room, setRoom] = useState<Room | null>(null)
  const [fatal, setFatal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [busy, setBusy] = useState(false)
  const url = `/api/sessions/${encodeURIComponent(sessionId)}`

  const load = useCallback(async () => {
    const res = await adminFetch(url)
    const body = (await res.json().catch(() => ({}))) as Room & { error?: string }
    if (!res.ok) throw new Error(body.error || 'No se pudo cargar la sesión.')
    setRoom(body)
  }, [url])

  useEffect(() => {
    load().catch((err: Error) => setFatal(err.message))
    const timer = setInterval(() => { if (!document.hidden) load().catch(() => {}) }, REFRESH_MS)
    return () => clearInterval(timer)
  }, [load])

  const ask = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await adminFetch(url, { method: 'POST', body: JSON.stringify({ body: question }) })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error || 'No se pudo enviar tu pregunta.')
      setQuestion('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar tu pregunta.')
    } finally {
      setBusy(false)
    }
  }

  const vote = async (pollId: string, option: number) => {
    setError(null)
    const res = await adminFetch('/api/sessions/vote', { method: 'POST', body: JSON.stringify({ poll_id: pollId, option }) })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      setError(body.error || 'No se pudo guardar tu voto.')
    }
    await load().catch(() => {})
  }

  if (fatal) {
    return (
      <div className="text-center py-12">
        <p role="alert" className="text-sm text-on-surface-variant mb-6">{fatal}</p>
        <a href="/app/mis-eventos" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ir a mis eventos</a>
      </div>
    )
  }
  if (!room) return <p role="status" className="text-sm text-on-surface-variant text-center py-12">Cargando sesión…</p>

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-[22px] font-bold text-primary leading-snug break-words">{room.session.title}</h1>
        {room.session.speaker_name && <p className="text-sm text-on-surface-variant mt-1 break-words">{room.session.speaker_name}</p>}
        <a href={`/app/congresos/${room.session.event_id}#agenda`} className="text-sm font-semibold text-primary underline inline-block mt-2">Ver agenda completa</a>
      </header>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      {room.polls.length > 0 && (
        <section className="flex flex-col gap-3" aria-label="Encuestas">
          <h2 className="text-[17px] font-bold text-primary">Encuestas</h2>
          {room.polls.map((poll) => {
            const total = Object.values(poll.totals).reduce((sum, n) => sum + Number(n), 0)
            return (
              <article key={poll.id} className="session-poll bg-surface rounded-2xl border border-surface-variant/70 p-4 flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-primary break-words">{poll.question}</h3>
                {poll.options.map((option, index) => {
                  const count = Number(poll.totals[index] ?? 0)
                  const percent = total ? Math.round((count / total) * 100) : 0
                  const mine = poll.my_vote === index
                  return (
                    <button key={option} type="button" data-option={index} aria-pressed={mine} disabled={!poll.is_open} onClick={() => vote(poll.id, index)} className={`relative overflow-hidden text-left rounded-xl border px-3 py-3 text-sm min-h-[44px] ${mine ? 'border-secondary font-semibold' : 'border-surface-variant'} disabled:cursor-default`}>
                      {poll.my_vote !== null && <span className="absolute inset-y-0 left-0 bg-secondary/20" style={{ width: `${percent}%` }} />}
                      <span className="relative flex justify-between gap-3 text-primary">
                        <span className="break-words min-w-0">{option}</span>
                        {poll.my_vote !== null && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{percent}%</span>}
                      </span>
                    </button>
                  )
                })}
                <p className="text-xs text-outline">{poll.is_open ? `${total} ${total === 1 ? 'voto' : 'votos'}. Puedes cambiar tu respuesta.` : `Encuesta cerrada · ${total} ${total === 1 ? 'voto' : 'votos'}`}</p>
              </article>
            )
          })}
        </section>
      )}

      <section className="flex flex-col gap-3" aria-label="Preguntas">
        <h2 className="text-[17px] font-bold text-primary">Preguntas</h2>
        <form onSubmit={ask} className="flex flex-col gap-2">
          <label htmlFor="session-question" className="text-sm font-semibold text-primary">Tu pregunta para el ponente</label>
          <textarea id="session-question" rows={3} maxLength={500} required value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full bg-surface-soft rounded-2xl p-3 text-base text-primary border border-transparent focus:border-secondary outline-none resize-none" />
          <button type="submit" disabled={busy || !question.trim()} className="self-start bg-secondary text-on-secondary px-5 py-3 rounded-2xl font-semibold text-sm min-h-[44px] disabled:opacity-60">{busy ? 'Enviando…' : 'Enviar pregunta'}</button>
        </form>
        {room.questions.map((item) => (
          <article key={item.id} className="session-question bg-surface rounded-2xl border border-surface-variant/70 p-3">
            <p className="text-sm text-primary break-words whitespace-pre-line">{item.body}</p>
            <p className="text-xs text-outline mt-1">{item.mine ? 'Tu pregunta' : 'Asistente'}{item.answered ? ' · Respondida' : ''}</p>
          </article>
        ))}
        {room.questions.length === 0 && <p className="text-sm text-on-surface-variant">Todavía no hay preguntas. Sé la primera persona en preguntar.</p>}
      </section>

      {room.materials.length > 0 && (
        <section className="flex flex-col gap-2" aria-label="Materiales">
          <h2 className="text-[17px] font-bold text-primary">Materiales y grabaciones</h2>
          {room.materials.map((material) => (
            <a key={material.id} href={material.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary underline break-words">
              {material.kind === 'grabacion' ? 'Grabación: ' : ''}{material.title}
            </a>
          ))}
        </section>
      )}
    </div>
  )
}
