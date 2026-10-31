import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json } from '../../../lib/admin-auth'

// Tablas con referencias al usuario que no se borran en cascada.
// Si el usuario tiene registros en alguna, no se borra nada: el historial
// de compras y constancias no debe perderse, y la base lo rechazaría a medias.
const BLOCKING_REFERENCES: Array<[string, string]> = [
  ['orders', 'user_id'],
  ['enrollments', 'user_id'],
  ['certificates', 'user_id'],
  ['events', 'created_by'],
  ['courses', 'created_by'],
  ['lives', 'created_by'],
  ['media', 'uploaded_by'],
]

export const POST: APIRoute = async ({ request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  if (!auth.hasServiceRole) {
    return json({ error: 'Por ahora, escríbenos a soporte para eliminar tu cuenta.' }, 503)
  }

  const userId = auth.userId

  // 1) Revisar referencias antes de tocar nada.
  for (const [table, column] of BLOCKING_REFERENCES) {
    const { count, error } = await auth.db
      .from(table)
      .select('id', { count: 'exact', head: true })
      .eq(column, userId)
    if (error) return json({ error: `No se pudo verificar la cuenta: ${error.message}` }, 500)
    if ((count ?? 0) > 0) {
      return json({
        error: 'Tu cuenta tiene compras, inscripciones o constancias registradas. Escríbenos a soporte para eliminarla.',
      }, 409)
    }
  }

  // 2) Guardar el perfil para poder restaurarlo si el borrado de auth falla.
  const { data: profile } = await auth.db
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  const { error: profileError } = await auth.db
    .from('user_profiles')
    .delete()
    .eq('id', userId)
  if (profileError) return json({ error: profileError.message }, 500)

  // 3) Borrar el usuario de auth (el progreso se borra en cascada).
  const { error } = await auth.db.auth.admin.deleteUser(userId)
  if (error) {
    if (profile) await auth.db.from('user_profiles').insert(profile)
    return json({ error: `No se pudo eliminar la cuenta: ${error.message}` }, 500)
  }

  return json({ ok: true })
}
