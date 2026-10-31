import { getEnv } from './server-env'
import { escapeHtml } from '../utils/escape-html'

/**
 * Correos automáticos con Resend. Requiere RESEND_API_KEY y EMAIL_FROM. Sin ellas no envía nada.
 * Un correo que falla nunca debe tumbar un pago o una inscripción, así que solo deja registro.
 */
export async function sendEmail(to: string | null | undefined, subject: string, title: string, lines: string[], link?: { href: string; label: string }): Promise<boolean> {
  const key = getEnv('RESEND_API_KEY')
  const from = getEnv('EMAIL_FROM')
  if (!key || !from || !to) return false

  const paragraphs = lines.map((line) => `<p style="margin:0 0 12px">${escapeHtml(line)}</p>`).join('')
  const button = link && /^https?:\/\//.test(link.href)
    ? `<p style="margin:20px 0"><a href="${escapeHtml(link.href)}" style="background:#fe9511;color:#0f2a44;padding:12px 20px;border-radius:10px;font-weight:600;text-decoration:none">${escapeHtml(link.label)}</a></p>`
    : ''
  const html = `<div style="font-family:Arial,sans-serif;color:#0f2a44;max-width:520px"><h1 style="font-size:20px">${escapeHtml(title)}</h1>${paragraphs}${button}<p style="color:#4c5d70;font-size:12px">Grupo Fénix</p></div>`

  try {
    const res = await fetch(getEnv('RESEND_API_URL') || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [to], subject, html }),
    })
    if (!res.ok) console.error('[correo] Resend respondió', res.status)
    return res.ok
  } catch (err) {
    console.error('[correo] No se pudo enviar', err)
    return false
  }
}

export function appUrl(path: string, fallbackOrigin?: string): string {
  const base = (getEnv('PUBLIC_SITE_URL') || fallbackOrigin || '').replace(/\/$/, '')
  return `${base}${path}`
}
