import { collectionRoutes, MEDIA } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(MEDIA)
