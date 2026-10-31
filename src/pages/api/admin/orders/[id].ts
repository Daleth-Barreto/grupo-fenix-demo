import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

const STATUS = ['pendiente', 'pagado', 'cancelado', 'reembolsado']

// Solo el estado es editable: el monto y el comprador no se cambian desde el panel.
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  if (typeof body?.status !== 'string' || !STATUS.includes(body.status)) return json({ error: 'Estado no válido.' }, 400)

  const { data, error } = await auth.db.from('orders').update({ status: body.status }).eq('id', params.id as string).select('id, status').maybeSingle()
  if (error) return json({ error: error.message }, 500)
  if (!data) return json({ error: 'No se pudo guardar: no existe o no tienes permiso.' }, 404)
  return json({ data })
}
