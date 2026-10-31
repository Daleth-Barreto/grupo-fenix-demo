import { itemRoutes, QUIZ_QUESTION } from '../../../../lib/admin-crud'

export const prerender = false
export const { GET, PUT, DELETE } = itemRoutes(QUIZ_QUESTION)
