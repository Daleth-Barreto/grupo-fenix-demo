import { useCallback, useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { adminFetch } from '../../lib/admin-fetch'

interface EventOption {
  id: string
  title: string
  start_date: string | null
  end_date: string | null
}

interface Attendee {
  enrollment_id: string
  full_name: string | null
  present_today: boolean
  days_attended: number
}

interface Attendance {
  enrolled: number
  present_today: number
  attendees: Attendee[]
}

interface Result {
  status: string
  name?: string | null
}

const RESULT: Record<string, { text: string; className: string }> = {
  ok: { text: 'Entrada registrada', className: 'bg-green-100 text-green-900' },
  repetido: { text: 'Ya registró su entrada hoy', className: 'bg-amber-100 text-amber-900' },
  invalido: { text: 'Boleto no válido', className: 'bg-red-100 text-red-900' },
  otro_evento: { text: 'Este boleto es de otro evento', className: 'bg-red-100 text-red-900' },
  cancelado: { text: 'Inscripción cancelada', className: 'bg-red-100 text-red-900' },
  fuera_de_fecha: { text: 'Este evento no se realiza hoy', className: 'bg-red-100 text-red-900' },
}

const SCAN_EVERY_MS = 250
const SAME_CODE_WAIT_MS = 4000

const todayInMexico = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })

async function send(method: string, body?: object, query = ''): Promise<any> {
  const res = await adminFetch(`/api/admin/checkin${query}`, { method, ...(body ? { body: JSON.stringify(body) } : {}) })
  const json = (await res.json().catch(() => ({}))) as { error?: string; data?: unknown }
  if (!res.ok) throw new Error(json.error || 'No se pudo completar el registro.')
  return json.data
}

export default function CheckIn() {
  const [events, setEvents] = useState<EventOption[] | null>(null)
  const [eventId, setEventId] = useState('')
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [term, setTerm] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const busyRef = useRef(false)
  const lastRef = useRef({ code: '', at: 0 })
  const eventRef = useRef('')
  const termRef = useRef('')
  eventRef.current = eventId
  termRef.current = term

  useEffect(() => {
    adminFetch('/api/admin/events')
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: EventOption[]; error?: string }
        if (!res.ok) throw new Error(body.error || 'No se pudieron cargar los eventos.')
        const list = (body.data ?? []).filter((e) => e.start_date).sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)))
        const today = todayInMexico()
        const current = list.find((e) => String(e.start_date).slice(0, 10) <= today && String(e.end_date ?? e.start_date).slice(0, 10) >= today)
        const next = list.find((e) => String(e.start_date).slice(0, 10) >= today)
        setEvents(list)
        setEventId((current ?? next ?? list[0])?.id ?? '')
      })
      .catch((err: Error) => { setEvents([]); setError(err.message) })
  }, [])

  const refresh = useCallback(async () => {
    if (!eventRef.current) return
    try {
      const query = `?event_id=${encodeURIComponent(eventRef.current)}&q=${encodeURIComponent(termRef.current.trim())}`
      setAttendance(await send('GET', undefined, query))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la asistencia.')
    }
  }, [])

  useEffect(() => {
    setAttendance(null)
    setResult(null)
    setError(null)
    refresh()
  }, [eventId, refresh])

  useEffect(() => {
    const timer = setTimeout(refresh, 250)
    return () => clearTimeout(timer)
  }, [term, refresh])

  const register = useCallback(async (payload: { code: string } | { enrollment_id: string }) => {
    setError(null)
    try {
      setResult(await send('POST', { event_id: eventRef.current, ...payload }))
      await refresh()
    } catch (err) {
      setResult(null)
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro.')
    }
  }, [refresh])

  const undo = async (enrollmentId: string) => {
    setError(null)
    try {
      await send('DELETE', { enrollment_id: enrollmentId })
      setResult(null)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo corregir el registro.')
    }
  }

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setScanning(false)
  }, [])

  useEffect(() => stop, [stop])

  const start = async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Este navegador no permite usar la cámara. Busca a la persona por nombre.')
      return
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      setScanning(true)
    } catch {
      setError('No se pudo abrir la cámara. Revisa el permiso del navegador o busca a la persona por nombre.')
    }
  }

  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return
    const video = videoRef.current
    video.srcObject = streamRef.current
    video.play().catch(() => {})

    const timer = setInterval(async () => {
      const canvas = canvasRef.current
      if (busyRef.current || !canvas || video.readyState < video.HAVE_ENOUGH_DATA) return
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) return
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const frame = context.getImageData(0, 0, canvas.width, canvas.height)
      const found = jsQR(frame.data, frame.width, frame.height, { inversionAttempts: 'dontInvert' })
      if (!found?.data) return

      // La cámara lee el mismo QR muchas veces por segundo: se espera antes de repetirlo.
      const now = Date.now()
      if (found.data === lastRef.current.code && now - lastRef.current.at < SAME_CODE_WAIT_MS) return
      lastRef.current = { code: found.data, at: now }
      busyRef.current = true
      await register({ code: found.data })
      busyRef.current = false
    }, SCAN_EVERY_MS)

    return () => clearInterval(timer)
  }, [scanning, register])

  if (events === null) return <p role="status" className="text-sm text-on-surface-variant">Cargando eventos…</p>
  if (events.length === 0) return error ? <p role="alert" className="text-sm text-error">{error}</p> : <p className="text-sm text-on-surface-variant">Todavía no hay eventos. Crea uno en la sección Eventos.</p>

  const shown = result ? RESULT[result.status] ?? RESULT.invalido : null

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      <div className="flex flex-col gap-2">
        <label htmlFor="checkin-event" className="text-sm font-semibold text-primary">Evento</label>
        <select id="checkin-event" value={eventId} onChange={(e) => setEventId(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#dce2f3] bg-surface text-base outline-none focus:border-secondary">
          {events.map((event) => <option key={event.id} value={event.id}>{event.title} ({String(event.start_date).slice(0, 10)})</option>)}
        </select>
      </div>

      <p id="checkin-count" className="text-lg font-bold text-primary" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {attendance ? `${attendance.present_today} de ${attendance.enrolled} presentes hoy` : 'Cargando asistencia…'}
      </p>

      <div id="checkin-result" role="status" aria-live="assertive" className={`rounded-2xl p-4 min-h-[4.5rem] ${shown ? shown.className : 'bg-surface-container-low text-on-surface-variant'}`}>
        {shown ? (
          <>
            <p className="text-lg font-bold">{shown.text}</p>
            {result?.name && <p className="text-base break-words">{result.name}</p>}
          </>
        ) : (
          <p className="text-sm">Escanea un boleto o busca a la persona por nombre.</p>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      <section className="flex flex-col gap-3" aria-label="Lector de QR">
        <video ref={videoRef} muted playsInline hidden={!scanning} aria-label="Vista de la cámara" className="w-full rounded-2xl bg-black" style={{ aspectRatio: '4/3', objectFit: 'cover' }} />
        <canvas ref={canvasRef} hidden />
        <button type="button" id="checkin-camera" onClick={scanning ? stop : start} className="self-start inline-flex items-center gap-2 bg-secondary text-on-secondary px-5 py-3 rounded-xl font-semibold min-h-[48px]">
          <span className="material-symbols-outlined text-[20px]">{scanning ? 'videocam_off' : 'qr_code_scanner'}</span>
          {scanning ? 'Detener cámara' : 'Escanear boletos'}
        </button>
      </section>

      <section className="flex flex-col gap-3" aria-label="Buscar por nombre">
        <label htmlFor="checkin-search" className="text-sm font-semibold text-primary">Si olvidó su boleto, búscalo por nombre</label>
        <input id="checkin-search" type="search" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Nombre del asistente" className="w-full px-4 py-3 rounded-xl border border-[#dce2f3] text-base outline-none focus:border-secondary" />
        <div className="bg-white rounded-2xl border border-[#dce2f3] divide-y divide-[#dce2f3]">
          {attendance?.attendees.map((person) => (
            <div key={person.enrollment_id} className="attendee p-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-primary break-words">{person.full_name || 'Sin nombre'}</p>
                <p className="text-xs text-on-surface-variant">{person.present_today ? 'Presente hoy' : 'Sin registrar hoy'} · {person.days_attended} {person.days_attended === 1 ? 'día' : 'días'} en total</p>
              </div>
              {person.present_today ? (
                <button type="button" data-action="undo" onClick={() => undo(person.enrollment_id)} className="px-3 py-2 rounded-lg text-sm font-semibold text-error min-h-[40px]">Deshacer</button>
              ) : (
                <button type="button" data-action="register" onClick={() => register({ enrollment_id: person.enrollment_id })} className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-white min-h-[40px]">Registrar</button>
              )}
            </div>
          ))}
          {attendance?.attendees.length === 0 && <p className="p-4 text-sm text-on-surface-variant text-center">{term ? 'Sin resultados.' : 'Este evento todavía no tiene inscritos.'}</p>}
        </div>
      </section>
    </div>
  )
}
