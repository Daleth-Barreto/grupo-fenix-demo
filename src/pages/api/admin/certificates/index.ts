import { collectionRoutes, CERTIFICATE } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(CERTIFICATE)
