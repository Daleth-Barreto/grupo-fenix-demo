import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

interface Certificate {
  id: string
  certificate_number: string | null
  issued_at: string | null
  sent_at: string | null
  events: { title: string } | null
  courses: { title: string } | null
}

export default function CertificatesList() {
  const [items, setItems] = useState<Certificate[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminFetch('/api/account/certificates')
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: Certificate[]; error?: string }
        if (!res.ok) throw new Error(body.error || 'No se pudieron cargar tus constancias.')
        setItems(body.data ?? [])
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p role="alert" className="text-sm text-error text-center py-8">{error}</p>
  if (!items) return <p role="status" className="text-sm text-on-surface-variant text-center py-8">Cargando constancias…</p>

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-[56px] text-outline-variant block mb-3">workspace_premium</span>
        <p className="text-sm text-on-surface-variant">Aún no tienes constancias disponibles.</p>
        <p className="text-xs text-outline mt-1">Completa un evento o curso para obtener tu certificado.</p>
      </div>
    )
  }

  return (
    <>
      {items.map((item) => (
        <article key={item.id} className="bg-surface shadow-sm border border-surface-variant/70 p-5 flex gap-4 items-start rounded-3xl">
          <span className="material-symbols-outlined text-secondary text-[32px] filled">workspace_premium</span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-primary leading-snug">
              {item.events?.title || item.courses?.title || 'Constancia Grupo Fénix'}
            </h2>
            {item.issued_at && (
              <p className="text-xs text-on-surface-variant mt-1">
                Emitida el {new Date(item.issued_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            {item.certificate_number && <p className="text-xs text-outline mt-0.5">Folio: {item.certificate_number}</p>}
            {item.sent_at && <p className="text-xs text-on-surface-variant mt-0.5">Enviada a tu correo</p>}
          </div>
        </article>
      ))}
    </>
  )
}
