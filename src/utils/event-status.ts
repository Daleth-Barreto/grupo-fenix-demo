import { daysUntil, isEventPast } from './format'

/**
 * Las páginas de eventos se generan al compilar, así que "ya pasó" y "faltan N días"
 * se calculan en el navegador para no quedar congelados hasta el siguiente deploy.
 *
 *  [data-event-end]         contenedor del evento (fecha de fin)
 *  [data-if-upcoming]       se oculta si el evento ya pasó
 *  [data-if-past]           se muestra solo si el evento ya pasó
 *  [data-remove-if-past]    en el contenedor: lo oculta completo si ya pasó
 *  [data-days-until]        texto con los días que faltan para esa fecha
 */
function apply(): void {
  document.querySelectorAll<HTMLElement>('[data-event-end]').forEach((root) => {
    const past = isEventPast(root.dataset.eventEnd ?? '')
    if (root.hasAttribute('data-remove-if-past')) root.style.display = past ? 'none' : ''
    root.querySelectorAll<HTMLElement>('[data-if-upcoming]').forEach((el) => { el.style.display = past ? 'none' : '' })
    root.querySelectorAll<HTMLElement>('[data-if-past]').forEach((el) => { el.style.display = past ? '' : 'none' })
  })
  document.querySelectorAll<HTMLElement>('[data-days-until]').forEach((el) => {
    el.textContent = String(daysUntil(el.dataset.daysUntil ?? ''))
  })
}

apply()
document.addEventListener('app:ready', apply)
