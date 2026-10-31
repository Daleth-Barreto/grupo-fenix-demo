import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

// Órdenes con el nombre del comprador. Solo administradores: incluye datos de pago.
export const GET: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  const { data, error } = await auth.db
    .from('orders')
    .select('id, user_id, amount, currency, status, created_at, metadata')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return json({ error: 'No se pudieron cargar las órdenes.' }, 500)

  const rows = (data ?? []) as Array<{ user_id: string | null } & Record<string, unknown>>
  const ids = [...new Set(rows.map((o) => o.user_id).filter((id): id is string => Boolean(id)))]
  const names = new Map<string, string | null>()
  if (ids.length > 0) {
    const { data: profiles, error: profilesError } = await auth.db
      .from('user_profiles')
      .select('id, full_name')
      .in('id', ids)
    if (profilesError) return json({ error: 'No se pudieron cargar los compradores.' }, 500)
    for (const p of (profiles ?? []) as Array<{ id: string; full_name: string | null }>) names.set(p.id, p.full_name)
  }

  return json({ data: rows.map((o) => ({ ...o, buyer: (o.user_id && names.get(o.user_id)) || null })) })
}
