import { getSecret } from 'astro:env/server'

/**
 * Variables del servidor. En Vercel se leen del entorno en cada petición, y en local de .env.
 * Las PUBLIC_* también pueden venir del build mediante import.meta.env.
 */
export function getEnv(key: string): string {
  const value = getSecret(key) ?? (import.meta.env as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : ''
}
