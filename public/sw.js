// Service worker mínimo: hace la app instalable (PWA, auditoría A11).
// Todavía no cachea nada: el navegador sigue descargando desde la red.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
