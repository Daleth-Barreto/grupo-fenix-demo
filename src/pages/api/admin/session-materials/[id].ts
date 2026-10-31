import { itemRoutes, SESSION_MATERIAL } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, PUT, DELETE } = itemRoutes(SESSION_MATERIAL)
