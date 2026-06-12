import { useState, useEffect } from 'react'
import { coursesService } from '../../services/courses.service'
import type { Course, Constancia } from '../../types'

const MOCK_COURSES: Course[] = [
  {
    id: '1',
    title: 'Diplomado en Cardiología',
    description: 'Formación especializada en diagnóstico y tratamiento cardiovascular.',
    instructor: 'Dr. Roberto Sánchez',
    thumbnail_url: 'https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=400&q=80',
    total_lessons: 24,
    progress: 45,
    current_lesson: 'Módulo 3: Arritmias Complejas',
    modules: [
      {
        id: 'm1', title: 'Fundamentos de Cardiología', order: 1, is_locked: false,
        lessons: [
          { id: 'l1', title: '1.0 Bienvenida al curso', duration: '5 mins', is_completed: true, order: 1 },
          { id: 'l2', title: '1.1 Anatomía del corazón', duration: '25 mins', is_completed: true, order: 2 },
          { id: 'l3', title: '1.2 Fisiología cardíaca básica', duration: '32 mins', is_completed: false, order: 3 },
        ],
      },
      {
        id: 'm2', title: 'Electrocardiografía', order: 2, is_locked: false,
        lessons: [
          { id: 'l4', title: '2.1 Interpretación del ECG', duration: '40 mins', is_completed: false, order: 1 },
          { id: 'l5', title: '2.2 Arritmias comunes', duration: '35 mins', is_completed: false, order: 2 },
        ],
      },
      {
        id: 'm3', title: 'Arritmias Complejas', order: 3, is_locked: true,
        lessons: [],
      },
    ],
  },
  {
    id: '2',
    title: 'Gestión Hospitalaria',
    description: 'Estrategias de liderazgo y administración en entornos de salud.',
    instructor: 'Dra. Ana González',
    thumbnail_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&q=80',
    total_lessons: 18,
    progress: 15,
    current_lesson: 'Unidad 1: Liderazgo Estratégico',
    modules: [
      {
        id: 'm1', title: 'Liderazgo en Salud', order: 1, is_locked: false,
        lessons: [
          { id: 'l1', title: '1.1 Estilos de liderazgo', duration: '20 mins', is_completed: true, order: 1 },
          { id: 'l2', title: '1.2 Gestión de equipos', duration: '28 mins', is_completed: false, order: 2 },
        ],
        activities: [
          { id: 'a1', title: 'Lectura: Modelos de liderazgo hospitalario', type: 'lectura', due_date: '2026-07-10', is_done: true },
          { id: 'a2', title: 'Cuestionario de autoevaluación — Unidad 1', type: 'cuestionario', due_date: '2026-07-12', is_done: false },
          { id: 'a3', title: 'Entregable: Plan de gestión de tu equipo (PDF)', description: 'Sube un documento de 1–2 cuartillas con tu plan.', type: 'entregable', due_date: '2026-07-18', is_done: false },
        ],
      },
      {
        id: 'm2', title: 'Administración de Recursos', order: 2, is_locked: false,
        lessons: [
          { id: 'l3', title: '2.1 Presupuesto y costos', duration: '32 mins', is_completed: false, order: 1 },
        ],
        activities: [
          { id: 'a4', title: 'Tarea: Caso práctico de optimización de recursos', type: 'tarea', due_date: '2026-07-25', is_done: false },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Seminario: Biotecnología',
    description: 'Introducción a las técnicas de edición genómica y sus aplicaciones clínicas.',
    instructor: 'Dr. Luis Méndez',
    thumbnail_url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=400&q=80',
    total_lessons: 10,
    progress: 80,
    current_lesson: 'Unidad 4: CRISPR Avanzado',
    modules: [],
  },
  {
    id: '4',
    title: 'Certificación en Finanzas Corporativas',
    description: 'Domina el análisis financiero avanzado y la valoración de empresas.',
    instructor: 'Mtro. Carlos Vega',
    thumbnail_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
    total_lessons: 20,
    progress: 100,
    current_lesson: 'Completado',
    modules: [
      {
        id: 'm1', title: 'Fundamentos de Valoración', order: 1, is_locked: false,
        lessons: [
          { id: 'l1', title: '1.0 Bienvenida al curso', duration: '5 mins', is_completed: true, order: 1 },
          { id: 'l2', title: '1.1 Introducción al flujo de caja libre', duration: '25 mins', is_completed: true, order: 2 },
          { id: 'l3', title: '1.2 Cálculo del WACC', duration: '32 mins', is_completed: true, order: 3 },
        ],
      },
      {
        id: 'm2', title: 'Valoración de Empresas', order: 2, is_locked: false,
        lessons: [
          { id: 'l4', title: '2.1 Método DCF', duration: '45 mins', is_completed: true, order: 1 },
        ],
      },
      {
        id: 'm3', title: 'Análisis de Riesgo', order: 3, is_locked: false,
        lessons: [],
      },
    ],
  },
]

const MOCK_CONSTANCIAS: Constancia[] = [
  { id: '1', title: 'Congreso Nacional de Tanatología 2024', issued_at: 'Octubre 2024', event_id: '1' },
  { id: '2', title: 'Diplomado en Cardiología Avanzada', issued_at: 'Agosto 2024', course_id: '1' },
  { id: '3', title: 'Certificación en Finanzas Corporativas', issued_at: 'Junio 2024', course_id: '4' },
]

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await coursesService.getMyCourses()
        setCourses(res.data)
      } catch {
        setCourses(MOCK_COURSES)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return { courses, isLoading }
}

export function useCourseById(id: string) {
  const [course, setCourse] = useState<Course | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await coursesService.getById(id)
        setCourse(res.data)
      } catch {
        setCourse(MOCK_COURSES.find((c) => c.id === id) ?? null)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [id])

  return { course, isLoading }
}

export function useConstancias() {
  const [constancias, setConstancias] = useState<Constancia[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await coursesService.getConstancias()
        setConstancias(res.data)
      } catch {
        setConstancias(MOCK_CONSTANCIAS)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  return { constancias, isLoading }
}
