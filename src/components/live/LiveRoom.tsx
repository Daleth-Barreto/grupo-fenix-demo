import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'
import LivePlayer from './LivePlayer'

interface LiveInfo {
  title: string
  description: string | null
  speaker: string | null
  status: 'programado' | 'en_vivo' | 'finalizado' | 'cancelado'
  scheduled_at: string | null
}

interface AccessResponse {
  allowed?: boolean
  live?: LiveInfo
  hlsUrl?: string | null
  error?: string
}

function Message({ icon, title, children }: { icon: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="px-5 py-12 text-center">
      <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-primary text-[48px]">{icon}</span>
      </div>
      <h1 className="text-[24px] font-bold text-primary mb-2">{title}</h1>
      {children}
    </div>
  )
}

// La URL del stream solo llega del servidor después de validar el acceso.
export default function LiveRoom({ liveId }: { liveId: string }) {
  const [access, setAccess] = useState<AccessResponse | null>(null)

  useEffect(() => {
    adminFetch('/api/live/access', { method: 'POST', body: JSON.stringify({ liveStreamId: liveId }) })
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as AccessResponse
        setAccess(res.ok ? body : { error: body.error || 'No se pudo cargar la transmisión.' })
      })
      .catch(() => setAccess({ error: 'No se pudo cargar la transmisión.' }))
  }, [liveId])

  if (!access) return <p role="status" className="text-sm text-on-surface-variant text-center py-16">Cargando transmisión…</p>
  if (access.error || !access.live) {
    return <Message icon="error" title="Transmisión no disponible"><p className="text-sm text-on-surface-variant">{access.error}</p></Message>
  }

  const { live } = access
  if (!access.allowed) {
    return (
      <Message icon="lock" title={live.title}>
        <p className="text-sm text-on-surface-variant mb-6">Esta transmisión es solo para personas inscritas.</p>
        <a href="/app/congresos" className="inline-flex bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm">Ver congresos</a>
      </Message>
    )
  }

  if (live.status === 'en_vivo' && access.hlsUrl) {
    return <LivePlayer hlsUrl={access.hlsUrl} title={live.title} presenter={live.speaker ?? ''} />
  }
  if (live.status === 'en_vivo') {
    return <Message icon="sensors_off" title={live.title}><p className="text-sm text-on-surface-variant">La señal todavía no está disponible.</p></Message>
  }
  if (live.status === 'programado') {
    return (
      <Message icon="schedule" title={live.title}>
        {live.scheduled_at && (
          <p className="text-base font-bold text-primary mb-2">
            {new Date(live.scheduled_at).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' })}
          </p>
        )}
        {live.speaker && <p className="text-sm text-on-surface-variant">Por: {live.speaker}</p>}
      </Message>
    )
  }
  return (
    <Message icon="stop_circle" title={live.title}>
      <p className="text-sm text-on-surface-variant">
        {live.status === 'cancelado' ? 'Esta transmisión se canceló.' : 'Esta transmisión ya finalizó.'}
      </p>
    </Message>
  )
}
