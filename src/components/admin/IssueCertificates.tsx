import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

interface EventOption { id: string; title: string }

// Emite constancias según la asistencia registrada en la entrada.
export default function IssueCertificates() {
  const [events, setEvents] = useState<EventOption[]>([])
  const [eventId, setEventId] = useState('')
  const [percent, setPercent] = useState('80')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    adminFetch('/api/admin/events').then(async (res) => {
      if (!res.ok) return
      const list = ((await res.json()) as { data?: EventOption[] }).data ?? []
      setEvents(list)
      setEventId(list[0]?.id ?? '')
    }).catch(() => {})
  }, [])

  const issue = async () => {
    setBusy(true)
    setMessage(null)
    try {
      const res = await adminFetch('/api/admin/certificates/issue', { method: 'POST', body: JSON.stringify({ event_id: eventId, min_percent: Number(percent) }) })
      const body = (await res.json().catch(() => ({}))) as { data?: { status: string; created?: number; event_days?: number }; error?: string }
      if (!res.ok || !body.data) throw new Error(body.error || 'No se pudieron emitir las constancias.')
      if (body.data.status !== 'ok') throw new Error('Revisa el evento y el porcentaje.')
      setMessage({ ok: true, text: `Constancias nuevas: ${body.data.created}. El evento dura ${body.data.event_days} ${body.data.event_days === 1 ? 'día' : 'días'}. Recarga para verlas en la lista.` })
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'No se pudieron emitir las constancias.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="bg-white rounded-2xl border border-[#dce2f3] shadow-sm p-5 flex flex-col gap-3" aria-label="Emitir por asistencia">
      <h2 className="font-semibold text-primary">Emitir por asistencia</h2>
      <p className="text-sm text-on-surface-variant">Crea constancias para quienes alcanzaron el porcentaje de días con entrada registrada. Quien ya tiene constancia no recibe otra.</p>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_10rem] gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <label htmlFor="issue-event" className="text-sm font-semibold text-primary">Evento</label>
          <select id="issue-event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-[#dce2f3] text-base">
            {events.map((event) => <option key={event.id} value={event.id}>{event.title}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="issue-percent" className="text-sm font-semibold text-primary">Asistencia mínima %</label>
          <input id="issue-percent" type="number" min="1" max="100" value={percent} onChange={(e) => setPercent(e.target.value)} className="w-full px-3 py-3 rounded-xl border border-[#dce2f3] text-base" />
        </div>
      </div>
      <button type="button" id="issue-submit" disabled={busy || !eventId} onClick={issue} className="self-start bg-secondary text-on-secondary px-5 py-3 rounded-xl font-semibold min-h-[48px] disabled:opacity-60">{busy ? 'Emitiendo…' : 'Emitir constancias'}</button>
      {message && <p id="issue-message" role="status" className={`text-sm ${message.ok ? 'text-success' : 'text-error'}`}>{message.text}</p>}
    </section>
  )
}
