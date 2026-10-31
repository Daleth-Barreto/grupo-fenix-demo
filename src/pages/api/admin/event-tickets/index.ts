import { collectionRoutes, EVENT_TICKET } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(EVENT_TICKET)
