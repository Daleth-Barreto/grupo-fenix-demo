import type { SupabaseClient } from '@supabase/supabase-js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface OrderTarget {
  orderId: string
  userId: string | null
  metadata: Record<string, unknown> | null
}

function targetOf(metadata: OrderTarget['metadata']): { column: 'event_id' | 'course_id'; id: string } | null {
  const eventId = metadata?.event_id
  if (typeof eventId === 'string' && UUID.test(eventId)) return { column: 'event_id', id: eventId }
  const courseId = metadata?.course_id
  if (typeof courseId === 'string' && UUID.test(courseId)) return { column: 'course_id', id: courseId }
  return null
}

/**
 * Da acceso por una orden pagada. Se puede repetir sin duplicar, porque Stripe reenvía eventos.
 * Devuelve true solo si el acceso es nuevo, para no mandar el mismo correo dos veces.
 */
export async function enrollFromOrder(db: SupabaseClient, order: OrderTarget): Promise<boolean> {
  const target = targetOf(order.metadata)
  // Una reservación es un primer pago: el equipo inscribe a la persona cuando complete el resto.
  if (!order.userId || !target || order.metadata?.ticket_kind === 'reservacion') return false

  const { data: existing, error } = await db
    .from('enrollments')
    .select('id, status')
    .eq('user_id', order.userId)
    .eq(target.column, target.id)
    .limit(1)
  if (error) throw error

  const current = existing?.[0] as { id: string; status: string } | undefined
  if (current) {
    if (current.status !== 'expirado') return false
    const { error: updateError } = await db.from('enrollments').update({ status: 'activo', order_id: order.orderId }).eq('id', current.id)
    if (updateError) throw updateError
    return true
  }

  const { error: insertError } = await db
    .from('enrollments')
    .insert({ user_id: order.userId, [target.column]: target.id, order_id: order.orderId, status: 'activo' })
  if (insertError) throw insertError
  return true
}

/** Retira el acceso dado por una orden que se canceló o se reembolsó. */
export async function expireFromOrder(db: SupabaseClient, orderId: string): Promise<void> {
  const { error } = await db.from('enrollments').update({ status: 'expirado' }).eq('order_id', orderId).eq('status', 'activo')
  if (error) throw error
}
