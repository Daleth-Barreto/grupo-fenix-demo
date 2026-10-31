import { collectionRoutes, SESSION_POLL } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(SESSION_POLL)
