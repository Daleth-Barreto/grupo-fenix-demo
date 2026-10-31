import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { adminFetch } from '../../lib/admin-fetch'

interface Session {
  id: string
  title: string
  description: string | null
  speaker_name: string | null
  speaker_bio: string | null
  room: string | null
  starts_at: string
  ends_at: string | null
}

interface Agenda {
  sessions: Session[]
  signed_in: boolean
  enrolled: boolean
  favorites: string[]
}

const dayLabel = (iso: string) => new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
const hourLabel = (iso: string) => new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

export default function EventAgenda({ eventId }: { eventId: string }) {
  const [agenda, setAgenda] = useState<Agenda | null>(null)
  const [onlyMine, setOnlyMine] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getSession()
      const url = `/api/events/${encodeURIComponent(eventId)}/agenda`
      const res = data.session ? await adminFetch(url) : await fetch(url)
      if (!res.ok) throw new Error('No se pudo cargar la agenda.')
      setAgenda((await res.json()) as Agenda)
    }
    load().catch((err: Error) => setError(err.message))
  }, [eventId])

  if (error) return <p role="alert" className="text-sm text-error">{error}</p>
  if (!agenda || agenda.sessions.length === 0) return null

  const toggle = async (sessionId: string) => {
    const favorite = !agenda.favorites.includes(sessionId)
    const res = await adminFetch('/api/sessions/favorites', { method: 'POST', body: JSON.stringify({ session_id: sessionId, favorite }) })
    if (!res.ok) return setError('No se pudo actualizar tu agenda.')
    setAgenda({ ...agenda, favorites: favorite ? [...agenda.favorites, sessionId] : agenda.favorites.filter((id) => id !== sessionId) })
  }

  const visible = agenda.sessions.filter((s) => !onlyMine || agenda.favorites.includes(s.id))
  const days = [...new Set(visible.map((s) => dayLabel(s.starts_at)))]

  return (
    <section id="agenda" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[17px] font-bold text-primary">Agenda</h2>
        {agenda.signed_in && (
          <button type="button" id="agenda-mine" aria-pressed={onlyMine} onClick={() => setOnlyMine(!onlyMine)} className={`px-4 py-2 rounded-full text-sm font-semibold min-h-[40px] ${onlyMine ? 'bg-secondary text-on-secondary' : 'bg-surface border border-surface-variant text-on-surface-variant'}`}>
            Mi agenda ({agenda.favorites.length})
          </button>
        )}
      </div>
      {days.length === 0 && <p className="text-sm text-on-surface-variant">Marca sesiones con la estrella para armar tu agenda.</p>}
      {days.map((day) => (
        <div key={day} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-primary first-letter:uppercase">{day}</h3>
          {visible.filter((s) => dayLabel(s.starts_at) === day).map((session) => {
            const favorite = agenda.favorites.includes(session.id)
            return (
              <article key={session.id} className="agenda-session bg-surface rounded-2xl border border-surface-variant/70 p-4 flex gap-3">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <p className="text-xs font-semibold text-on-surface-variant" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {hourLabel(session.starts_at)}{session.ends_at ? ` a ${hourLabel(session.ends_at)}` : ''}{session.room ? ` · ${session.room}` : ''}
                  </p>
                  <h4 className="text-sm font-semibold text-primary leading-snug break-words">{session.title}</h4>
                  {session.speaker_name && <p className="text-xs text-on-surface-variant break-words">{session.speaker_name}</p>}
                  {session.speaker_bio && <p className="text-xs text-outline break-words">{session.speaker_bio}</p>}
                  {session.description && <p className="text-xs text-on-surface-variant leading-relaxed break-words">{session.description}</p>}
                  {agenda.enrolled && <a href={`/app/sesion/${session.id}`} data-action="room" className="text-sm font-semibold text-primary underline mt-1 self-start min-h-[32px]">Entrar a la sesión</a>}
                </div>
                {agenda.signed_in && (
                  <button type="button" data-action="favorite" aria-pressed={favorite} aria-label={favorite ? 'Quitar de mi agenda' : 'Agregar a mi agenda'} onClick={() => toggle(session.id)} className="w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0 hover:bg-surface-container-low">
                    <span className={`material-symbols-outlined text-[24px] ${favorite ? 'filled text-secondary' : 'text-outline'}`}>star</span>
                  </button>
                )}
              </article>
            )
          })}
        </div>
      ))}
    </section>
  )
}
