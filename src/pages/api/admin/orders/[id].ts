import type { APIRoute } from 'astro'
import { requireRole, json, getServiceClient } from '../../../../lib/admin-auth'
import { enrollFromOrder, expireFromOrder } from '../../../../lib/enrollment'
import { appUrl, sendEmail } from '../../../../lib/email'

export const prerender = false

const STATUS = ['pendiente', 'pagado', 'cancelado', 'reembolsado']

// Solo el estado es editable. Marcar como pagada da acceso, por ejemplo tras una transferencia;
// cancelar o reembolsar lo retira. El acceso cambia primero: si falla, la orden queda como estaba.
export const PUT: APIRoute = async ({ params, request, locals, url }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => null)) as { status?: unknown } | null
  if (typeof body?.status !== 'string' || !STATUS.includes(body.status)) return json({ error: 'Estado no válido.' }, 400)

  const orderId = params.id as string
  const { data: order, error: readError } = await auth.db.from('orders').select('id, user_id, metadata').eq('id', orderId).maybeSingle()
  if (readError) return json({ error: readError.message }, 500)
  if (!order) return json({ error: 'Orden no encontrada.' }, 404)

  let enrolledNow = false
  try {
    if (body.status === 'pagado') {
      enrolledNow = await enrollFromOrder(auth.db, { orderId, userId: order.user_id, metadata: order.metadata })
    } else if (body.status === 'cancelado' || body.status === 'reembolsado') {
      await expireFromOrder(auth.db, orderId)
    }
  } catch (err) {
    console.error('[ordenes] No se pudo actualizar el acceso', err)
    return json({ error: 'No se pudo actualizar la inscripción. La orden no cambió.' }, 500)
  }

  const { data, error } = await auth.db.from('orders').update({ status: body.status }).eq('id', orderId).select('id, status').maybeSingle()
  if (error) return json({ error: error.message }, 500)
  if (!data) return json({ error: 'No se pudo guardar: no tienes permiso.' }, 404)

  // El correo del comprador solo se puede leer con la llave de servicio.
  const service = getServiceClient()
  if (enrolledNow && service && order.user_id) {
    const { data: found } = await service.auth.admin.getUserById(order.user_id)
    const title = String(order.metadata?.event_title ?? 'tu inscripción')
    await sendEmail(found?.user?.email, `Inscripción confirmada: ${title}`, '¡Tu inscripción está confirmada!', [`Ya quedaste inscrito en ${title}.`], { href: appUrl('/app/mis-eventos', url.origin), label: 'Ver mis inscripciones' })
  }

  return json({ data })
}
