import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { adminFetch } from '../../lib/admin-fetch'

interface Certificate {
  certificate_number: string | null
  issued_at: string | null
  full_name: string | null
  events: { title: string; hours: number | null } | null
  courses: { title: string } | null
}

export default function CertificateView({ certificateId }: { certificateId: string }) {
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [qr, setQr] = useState<string | null>(null)
  const [verifyUrl, setVerifyUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminFetch(`/api/account/certificates/${encodeURIComponent(certificateId)}`)
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: Certificate; error?: string }
        if (!res.ok || !body.data) throw new Error(body.error || 'No se pudo cargar la constancia.')
        setCertificate(body.data)
        if (body.data.certificate_number) {
          const url = `${window.location.origin}/verificar/${encodeURIComponent(body.data.certificate_number)}`
          setVerifyUrl(url)
          setQr(await QRCode.toDataURL(url, { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' } }))
        }
      })
      .catch((err: Error) => setError(err.message))
  }, [certificateId])

  if (error) return <p role="alert" className="text-sm text-error text-center py-12">{error}</p>
  if (!certificate) return <p role="status" className="text-sm text-on-surface-variant text-center py-12">Cargando constancia…</p>

  const title = certificate.events?.title ?? certificate.courses?.title ?? 'Constancia'
  const hours = certificate.events?.hours

  return (
    <div className="flex flex-col gap-4">
      <button type="button" id="certificate-print" onClick={() => window.print()} className="no-print self-center bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm min-h-[48px]">Descargar o imprimir PDF</button>
      <p className="no-print text-xs text-on-surface-variant text-center">En el cuadro de impresión, elige "Guardar como PDF".</p>

      <article id="certificate" className="bg-white text-[#0f2a44] border-4 border-[#0f2a44] rounded-lg p-6 sm:p-10 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-bold tracking-widest">GRUPO FÉNIX</p>
        <h1 className="text-[26px] font-bold">Constancia</h1>
        <p className="text-sm">Se otorga a</p>
        <p id="certificate-name" className="text-[22px] font-bold break-words">{certificate.full_name || 'Participante'}</p>
        <p className="text-sm">por su participación en</p>
        <p className="text-lg font-semibold break-words">{title}</p>
        {hours ? <p className="text-sm">con valor de {hours} horas curriculares</p> : null}
        {certificate.issued_at && <p className="text-sm">Emitida el {new Date(certificate.issued_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        {qr && <img id="certificate-qr" src={qr} alt="Código QR para verificar esta constancia" width={140} height={140} className="mt-2" />}
        <p id="certificate-folio" className="text-xs font-semibold break-all">Folio: {certificate.certificate_number}</p>
        {verifyUrl && <p className="text-[11px] break-all">Verifica en {verifyUrl}</p>}
      </article>
    </div>
  )
}
