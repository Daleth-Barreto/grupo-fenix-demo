import type { APIRoute } from 'astro'
import { requireRole, json } from '../../lib/admin-auth'

export const prerender = false

const INTERESTS = ['Congreso', 'Capacitación a medida', 'Curso o taller', 'Evento corporativo']
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const text = (value: unknown, max: number): string =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

// Guarda la solicitud de cotización. Requiere docs/sql/reservation_requests.sql.
export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const interest = text(body?.interest, 60)
  const name = text(body?.name, 120)
  const email = text(body?.email, 200)
  const phone = text(body?.phone, 30)

  if (!INTERESTS.includes(interest)) return json({ error: 'Elige un tipo de evento.' }, 400)
  if (name.length < 3) return json({ error: 'Escribe tu nombre completo.' }, 400)
  if (!EMAIL.test(email)) return json({ error: 'Escribe un correo válido.' }, 400)
  if (phone.replace(/\D/g, '').length < 10) return json({ error: 'Escribe un teléfono de al menos 10 dígitos.' }, 400)

  const { error } = await auth.db.from('reservation_requests').insert({
    user_id: auth.userId,
    interest,
    name,
    email,
    phone,
    organization: text(body?.organization, 200) || null,
    message: text(body?.message, 2000) || null,
  })

  if (error) {
    console.error('[reservations] No se pudo guardar', error.message)
    return json({ error: 'No se pudo enviar tu solicitud. Intenta de nuevo.' }, 500)
  }
  return json({ ok: true }, 201)
}
