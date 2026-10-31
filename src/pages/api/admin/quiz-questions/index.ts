import { collectionRoutes, QUIZ_QUESTION } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, POST } = collectionRoutes(QUIZ_QUESTION)
