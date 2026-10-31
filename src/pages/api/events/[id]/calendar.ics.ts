import type { APIRoute } from 'astro'
import { getEvent } from '../../../../lib/catalog'

export const prerender = false

const escapeIcs = (value: string) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
const compact = (date: string) => date.slice(0, 10).replace(/-/g, '')

function dayAfter(date: string): string {
  const next = new Date(`${date.slice(0, 10)}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

// Archivo para agregar el evento a cualquier calendario. En este formato, la fecha final no se incluye.
export const GET: APIRoute = async ({ params, url }) => {
  const event = await getEvent(params.id as string)
  if (!event) return new Response('Evento no encontrado', { status: 404 })

  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Grupo Fenix//App//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@grupofenix`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${compact(event.date_start)}`,
    `DTEND;VALUE=DATE:${compact(dayAfter(event.date_end))}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(event.location)}`,
    `DESCRIPTION:${escapeIcs(event.description)}`,
    `URL:${url.origin}/app/congresos/${event.id}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="evento-grupo-fenix.ics"',
    },
  })
}
