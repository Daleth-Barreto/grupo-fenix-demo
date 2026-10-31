/**
 * El contenido de las páginas de /app va dentro de <AuthGuard client:load>, que
 * no renderiza los hijos hasta confirmar la sesión. Los <script> de la página se
 * ejecutan antes, así que sus getElementById/querySelectorAll no encontraban nada
 * y ningún botón funcionaba.
 *
 * AuthGuard marca el documento con data-app-ready y dispara "app:ready" cuando ya
 * existe el DOM de la página. Este helper ejecuta `fn` en ese momento (o de inmediato
 * si ya ocurrió).
 */
export function onAppReady(fn: () => void): void {
  if (document.documentElement.dataset.appReady === 'true') {
    fn()
    return
  }
  document.addEventListener('app:ready', fn, { once: true })
}
