import { itemRoutes, SESSION_QUESTION } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, PUT, DELETE } = itemRoutes(SESSION_QUESTION)
