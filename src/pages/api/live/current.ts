import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../lib/admin-auth'

export const prerender = false

// Transmisiones activas para el banner de Inicio. Nunca incluye la URL del stream.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('lives')
    .select('id, title, speaker')
    .eq('status', 'en_vivo')
    .order('started_at', { ascending: false })

  if (error) return json({ error: 'No se pudieron cargar las transmisiones.' }, 500)
  return json({ data: data ?? [] })
}
