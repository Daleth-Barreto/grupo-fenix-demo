import api from './api'
import type { Event } from '../types'

export const eventsService = {
  getAll: () => api.get<Event[]>('/events'),
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  enroll: (eventId: string) => api.post(`/events/${eventId}/enroll`),
  getMyEvents: () => api.get<Event[]>('/events/my-enrollments'),
}
