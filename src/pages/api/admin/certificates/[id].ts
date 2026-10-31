import type { APIRoute } from 'astro'
import { itemRoutes, CERTIFICATE } from '../../../../lib/admin-crud'
import { getServiceClient } from '../../../../lib/admin-auth'
import { appUrl, sendEmail } from '../../../../lib/email'

export const prerender = false

const routes = itemRoutes(CERTIFICATE)
export const { GET, DELETE } = routes

// Al marcarla como enviada, avisa al alumno. Requiere la llave de servicio para leer su correo.
export const PUT: APIRoute = async (context) => {
  const payload = (await context.request.clone().json().catch(() => null)) as { sent_at?: unknown } | null
  const response = await routes.PUT(context)
  if (!response.ok || !payload?.sent_at) return response

  const service = getServiceClient()
  const { data } = (await response.clone().json()) as { data?: any }
  if (service && data?.user_id) {
    const { data: found } = await service.auth.admin.getUserById(data.user_id)
    const title = data.events?.title ?? data.courses?.title ?? 'tu evento'
    await sendEmail(found?.user?.email, 'Tu constancia está lista', 'Tu constancia está lista', [`Ya puedes consultar tu constancia de ${title}.`, `Folio: ${data.certificate_number ?? 'sin folio'}`], { href: appUrl('/app/constancias', context.url.origin), label: 'Ver mis constancias' })
  }
  return response
}
