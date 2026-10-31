import type { APIRoute } from 'astro'

export const prerender = false
import { requireRole, json, pickFields } from '../../../../lib/admin-auth'

const PROFILE_FIELDS = ['full_name', 'phone', 'avatar_url', 'role']
const VALID_ROLES = ['student', 'instructor', 'admin']

// Solo administradores pueden editar usuarios, y solo ellos pueden cambiar roles.
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['admin'])
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const update = pickFields(body, PROFILE_FIELDS)
    if ('role' in update && !VALID_ROLES.includes(update.role as string)) {
      return json({ error: 'Rol no válido' }, 400)
    }

    const { data, error } = await auth.db
      .from('user_profiles')
      .update(update)
      .eq('id', params.id)
      .select()
      .single()

    if (error) return json({ error: error.message }, 500)
    return json({ data })
  } catch (e: any) {
    return json({ error: e.message }, 400)
  }
}
