import { itemRoutes, SESSION_POLL } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, PUT, DELETE } = itemRoutes(SESSION_POLL)
