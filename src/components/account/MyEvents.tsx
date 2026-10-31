import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'
import { formatDateRange, isEventPast } from '../../utils/format'

interface MyEvent {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
  location: string | null
}

export default function MyEvents() {
  const [events, setEvents] = useState<MyEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminFetch('/api/account/events')
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: MyEvent[]; error?: string }
        if (!res.ok) throw new Error(body.error || 'No se pudieron cargar tus eventos.')
        setEvents(body.data ?? [])
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p role="alert" className="text-sm text-error text-center py-8">{error}</p>
  if (!events) return <p role="status" className="text-sm text-on-surface-variant text-center py-8">Cargando tus eventos…</p>

  if (events.length === 0) {
    return (
      <div className="bg-surface rounded-3xl p-8 text-center shadow-card border border-surface-variant/70">
        <span className="material-symbols-outlined text-outline text-[48px] block mb-3">local_activity</span>
        <h2 className="text-lg font-bold text-primary mb-2">Aún no estás inscrito en ningún evento</h2>
        <p className="text-sm text-on-surface-variant mb-6">Cuando te inscribas, tus eventos aparecerán aquí.</p>
        <a href="/app/congresos" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ver eventos</a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => {
        const start = event.start_date ?? ''
        const end = event.end_date ?? start
        const finished = Boolean(end) && isEventPast(end)
        return (
          <article key={event.id} className="my-event bg-surface rounded-3xl p-5 shadow-card border border-surface-variant/70 flex flex-col gap-1">
            <span className="text-xs font-semibold text-on-surface-variant">{finished ? 'Finalizado' : 'Próximo'}</span>
            <h2 className="text-[15px] font-semibold text-primary leading-snug">
              <a href={`/app/congresos/${event.id}`} className="hover:underline">{event.title}</a>
            </h2>
            {start && <p className="text-sm text-on-surface-variant">{formatDateRange(start, end)}</p>}
            {event.location && <p className="text-sm text-on-surface-variant">{event.location}</p>}
            {!finished && (
              <a href={`/app/boleto/${event.id}`} data-action="ticket" className="mt-3 self-start inline-flex items-center gap-2 bg-secondary text-on-secondary px-5 py-3 rounded-2xl font-semibold text-sm min-h-[44px]">
                <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                Ver boleto
              </a>
            )}
          </article>
        )
      })}
    </div>
  )
}
