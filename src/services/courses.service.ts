import api from './api'
import type { Course, Constancia } from '../types'

export const coursesService = {
  getMyCourses: () => api.get<Course[]>('/courses/my-courses'),
  getById: (id: string) => api.get<Course>(`/courses/${id}`),
  markLessonComplete: (courseId: string, lessonId: string) =>
    api.post(`/courses/${courseId}/lessons/${lessonId}/complete`),
  getConstancias: () => api.get<Constancia[]>('/constancias'),
  downloadConstancia: (id: string) => api.get(`/constancias/${id}/download`, { responseType: 'blob' }),
}
