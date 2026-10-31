import { env as workerEnv } from 'cloudflare:workers'

/**
 * Variables del servidor. En Astro 6 `locals.runtime.env` lanza una excepción:
 * las variables y secretos del Worker se leen de `cloudflare:workers`.
 * Las PUBLIC_* también pueden venir del build mediante import.meta.env.
 * En local, los secretos van en .dev.vars (ignorado por git).
 */
export function getEnv(key: string): string {
  const runtime = workerEnv as unknown as Record<string, unknown>
  const value = runtime[key] ?? (import.meta.env as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}
