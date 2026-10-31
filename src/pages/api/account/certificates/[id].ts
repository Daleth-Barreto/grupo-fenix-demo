import type { APIRoute } from 'astro'
import { requireRole, json } from '../../../../lib/admin-auth'

export const prerender = false

// Constancia del propio usuario, para verla e imprimirla.
export const GET: APIRoute = async ({ params, request, locals }) => {
  const auth = await requireRole(request, locals, ['student', 'instructor', 'admin'])
  if (!auth.ok) return auth.response

  const [certificate, profile] = await Promise.all([
    auth.db.from('certificates').select('id, certificate_number, issued_at, events(title, hours), courses(title)').eq('id', params.id as string).eq('user_id', auth.userId).maybeSingle(),
    auth.db.from('user_profiles').select('full_name').eq('id', auth.userId).maybeSingle(),
  ])
  if (certificate.error) return json({ error: 'No se pudo cargar la constancia.' }, 500)
  if (!certificate.data) return json({ error: 'Constancia no encontrada.' }, 404)
  return json({ data: { ...certificate.data, full_name: profile.data?.full_name ?? null } })
}
