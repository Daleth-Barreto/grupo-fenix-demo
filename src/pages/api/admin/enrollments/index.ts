import { collectionRoutes, ENROLLMENT } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(ENROLLMENT)
