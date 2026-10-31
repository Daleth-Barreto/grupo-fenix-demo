import type { APIRoute } from 'astro'
import { getServiceClient, json } from '../../../lib/admin-auth'
import { appUrl, sendEmail } from '../../../lib/email'
import { getEnv } from '../../../lib/server-env'

export const prerender = false

const DAYS_BEFORE = 3

// Lo llama Vercel Cron una vez al día con Authorization: Bearer CRON_SECRET.
// Como corre a diario y filtra por una sola fecha, cada evento recuerda una sola vez.
export const GET: APIRoute = async ({ request, url }) => {
  const secret = getEnv('CRON_SECRET')
  if (!secret) return json({ error: 'Recordatorios sin configurar.' }, 503)
  if (request.headers.get('authorization') !== `Bearer ${secret}`) return json({ error: 'No autorizado' }, 401)

  const db = getServiceClient()
  if (!db) return json({ error: 'Falta la llave de servicio.' }, 503)

  const target = new Date(Date.now() + DAYS_BEFORE * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
  const { data: events, error } = await db.from('events').select('id, title, location').eq('start_date', target)
  if (error) return json({ error: error.message }, 500)

  let sent = 0
  for (const event of events ?? []) {
    const { data: enrollments, error: enrollmentsError } = await db
      .from('enrollments')
      .select('user_id')
      .eq('event_id', event.id)
      .eq('status', 'activo')
    if (enrollmentsError) return json({ error: enrollmentsError.message }, 500)

    for (const { user_id: userId } of enrollments ?? []) {
      if (!userId) continue
      const { data: found } = await db.auth.admin.getUserById(userId)
      const ok = await sendEmail(found?.user?.email, `Faltan ${DAYS_BEFORE} días: ${event.title}`, `Faltan ${DAYS_BEFORE} días para tu evento`, [`${event.title} empieza el ${target}.`, ...(event.location ? [`Lugar: ${event.location}`] : [])], { href: appUrl('/app/mis-eventos', url.origin), label: 'Ver mis inscripciones' })
      if (ok) sent++
    }
  }
  return json({ date: target, events: events?.length ?? 0, sent })
}
