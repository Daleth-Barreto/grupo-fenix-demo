import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { adminFetch } from '../../lib/admin-fetch'
import { formatDateRange } from '../../utils/format'
import { useAuthStore } from '../../store/auth.store'

interface Ticket {
  ticket_code: string
  days_attended: number
  event: { id: string; title: string; start_date: string | null; end_date: string | null; location: string | null }
}

export default function TicketView({ eventId }: { eventId: string }) {
  const user = useAuthStore((state) => state.user)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [image, setImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminFetch(`/api/account/tickets/${encodeURIComponent(eventId)}`)
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: Ticket; error?: string }
        if (!res.ok || !body.data) throw new Error(body.error || 'No se pudo cargar tu boleto.')
        setTicket(body.data)
        // El QR va en negro sobre blanco con margen: los lectores lo necesitan aunque el tema cambie.
        setImage(await QRCode.toDataURL(body.data.ticket_code, { width: 640, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }))
      })
      .catch((err: Error) => setError(err.message))
  }, [eventId])

  if (error) {
    return (
      <div className="text-center py-12">
        <p role="alert" className="text-sm text-on-surface-variant mb-6">{error}</p>
        <a href="/app/mis-eventos" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ir a mis eventos</a>
      </div>
    )
  }
  if (!ticket) return <p role="status" className="text-sm text-on-surface-variant text-center py-12">Cargando tu boleto…</p>

  const start = ticket.event.start_date ?? ''
  const end = ticket.event.end_date ?? start

  return (
    <article className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 p-5 flex flex-col items-center text-center gap-3">
      <h1 className="text-[18px] font-bold text-primary leading-snug">{ticket.event.title}</h1>
      {user?.full_name && <p className="text-sm font-semibold text-primary">{user.full_name}</p>}
      {start && <p className="text-sm text-on-surface-variant">{formatDateRange(start, end)}</p>}
      {ticket.event.location && <p className="text-sm text-on-surface-variant">{ticket.event.location}</p>}

      {image && <img id="ticket-qr" src={image} alt="Código QR de tu boleto" width={320} height={320} className="w-full max-w-[320px] h-auto rounded-2xl mt-2" />}

      <p className="text-sm text-on-surface-variant">Muestra este código en la entrada y sube el brillo de tu pantalla.</p>
      <p className="text-xs text-outline">Es personal. Si lo compartes, otra persona podría registrar tu entrada.</p>
      {ticket.days_attended > 0 && (
        <p id="ticket-days" className="text-sm font-semibold text-success">
          Asistencia registrada: {ticket.days_attended} {ticket.days_attended === 1 ? 'día' : 'días'}
        </p>
      )}
    </article>
  )
}
