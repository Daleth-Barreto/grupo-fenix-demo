import { itemRoutes, ACTIVITY } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, PUT, DELETE } = itemRoutes(ACTIVITY)
