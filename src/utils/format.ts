/** Formatea un precio en pesos mexicanos sin decimales. */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

/** Formatea un rango de fechas de forma legible y compacta. */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
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
  const d = new Date(date)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    month: d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '').toUpperCase(),
  }
}

/** Calcula los días restantes hasta una fecha (>= 0). */
export function daysUntil(date: string): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}
