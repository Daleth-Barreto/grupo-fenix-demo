import { collectionRoutes, SESSION_QUESTION } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(SESSION_QUESTION)
