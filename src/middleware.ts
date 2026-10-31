import { defineMiddleware } from 'astro:middleware'

/**
 * Lee el cuerpo que un endpoint no consumió, por ejemplo al responder 401 antes de
 * parsearlo. Si queda sin leer, en `wrangler dev` la siguiente petición de esa conexión
 * se cuelga o recibe un 503 ("Your worker restarted mid-request").
 */
export const onRequest = defineMiddleware(async ({ request }, next) => {
  const response = await next()
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body && !request.bodyUsed) {
    await request.arrayBuffer().catch(() => {})
  }
  return response
})
