/** Formatea un precio en pesos mexicanos sin decimales. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Convierte una fecha a Date.
 * Las fechas solo-día ("YYYY-MM-DD") se leen como medianoche LOCAL.
 * Con new Date("YYYY-MM-DD") se leen como UTC y en México salen un día antes (auditoría A1).
 */
export function parseDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(value)
}

/** Formatea un rango de fechas de forma legible y compacta. */
export function formatDateRange(start: string, end: string): string {
  const s = parseDate(start)
  const e = parseDate(end)
  const sameDay = s.toDateString() === e.toDateString()
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()

  if (sameDay) {
    return s.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  if (sameMonth) {
    return `${s.getDate()} al ${e.getDate()} de ${s.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

/** Devuelve el día y mes corto para el "date chip" de las tarjetas. */
export function getDateChip(date: string): { day: string; month: string } {
  const d = parseDate(date)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase(),
  }
}

/** Un evento ya pasó cuando terminó su último día. */
export function isEventPast(endDate: string): boolean {
  const end = parseDate(endDate)
  end.setHours(23, 59, 59, 999)
  return end.getTime() < Date.now()
}

/** Calcula los días restantes hasta una fecha (>= 0). */
export function daysUntil(date: string): number {
  const diff = parseDate(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}
