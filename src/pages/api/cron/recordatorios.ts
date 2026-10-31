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

  // Aviso de "mi agenda": un solo correo por persona con sus sesiones de las próximas 24 horas.
  const from = new Date()
  const until = new Date(from.getTime() + 86400000)
  const { data: sessions, error: sessionsError } = await db
    .from('event_sessions')
    .select('id, title, room, starts_at')
    .gte('starts_at', from.toISOString())
    .lt('starts_at', until.toISOString())
    .order('starts_at', { ascending: true })
  if (sessionsError) return json({ error: sessionsError.message }, 500)

  const lines = new Map<string, string[]>()
  if (sessions?.length) {
    const { data: favorites, error: favoritesError } = await db
      .from('session_favorites')
      .select('user_id, session_id')
      .in('session_id', sessions.map((s) => s.id))
    if (favoritesError) return json({ error: favoritesError.message }, 500)
    for (const session of sessions) {
      const hour = new Date(session.starts_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' })
      for (const favorite of favorites ?? []) {
        if (favorite.session_id !== session.id) continue
        lines.set(favorite.user_id, [...(lines.get(favorite.user_id) ?? []), `${hour}: ${session.title}${session.room ? ` (${session.room})` : ''}`])
      }
    }
  }

  let sessionReminders = 0
  for (const [userId, agenda] of lines) {
    const { data: found } = await db.auth.admin.getUserById(userId)
    const ok = await sendEmail(found?.user?.email, 'Tu agenda de mañana', 'Tus sesiones de las próximas 24 horas', agenda, { href: appUrl('/app/mis-eventos', url.origin), label: 'Ver mis inscripciones' })
    if (ok) sessionReminders++
  }
  return json({ date: target, events: events?.length ?? 0, sent, session_reminders: sessionReminders })
}
