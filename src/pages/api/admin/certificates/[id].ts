import { itemRoutes, CERTIFICATE } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, PUT, DELETE } = itemRoutes(CERTIFICATE)
