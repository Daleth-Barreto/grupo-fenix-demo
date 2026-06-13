import type { Event, Course, Constancia, GalleryEvent } from '../types'

export const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: '1er. Congreso Internacional de Neurodesarrollo y Neuroeducación',
    description: 'Encuentro internacional sobre los últimos avances en neurodesarrollo y su aplicación en la neuroeducación, con especialistas de talla mundial.',
    category: 'Congreso',
    date_start: '2026-10-21',
    date_end: '2026-10-24',
    location: 'Puebla, Puebla',
    modality: 'Presencial',
    price: 2500,
    has_certification: true,
    curricular_hours: 32,
    speakers_count: 14,
    is_featured: true,
    image_url: '/events/neurodesarrollo.jpeg',
  },
  {
    id: '2',
    title: '3er. Congreso Nacional de Sexualidad y Psicoterapia de Pareja',
    description: 'Tercera edición del congreso nacional dedicado a la sexualidad y la psicoterapia de pareja, con enfoque clínico, ético y vivencial.',
    category: 'Congreso',
    date_start: '2026-11-12',
    date_end: '2026-11-15',
    location: 'San Cristóbal de las Casas, Chiapas',
    modality: 'Presencial',
    price: 2300,
    has_certification: true,
    curricular_hours: 30,
    speakers_count: 12,
    image_url: '/events/sexualidad.jpg',
  },
  {
    id: '3',
    title: '2do. Congreso Nacional de Tanatología',
    description: 'Segunda edición del congreso nacional de tanatología, centrado en el acompañamiento del duelo y los cuidados al final de la vida.',
    category: 'Congreso',
    date_start: '2027-03-18',
    date_end: '2027-03-21',
    location: 'Guadalajara, Jalisco',
    modality: 'Híbrido',
    price: 2400,
    has_certification: true,
    curricular_hours: 32,
    speakers_count: 13,
    image_url: '/events/tanatologia.png',
  },
  {
    id: '4',
    title: '1er. Congreso Nacional de Psicooncología',
    description: 'Primer congreso nacional de psicooncología: abordaje psicológico integral del paciente oncológico y su familia.',
    category: 'Congreso',
    date_start: '2027-03-18',
    date_end: '2027-03-21',
    location: 'Guadalajara, Jalisco',
    modality: 'Híbrido',
    price: 2200,
    has_certification: true,
    curricular_hours: 30,
    speakers_count: 11,
    image_url: '/events/psicooncologia.png',
  },
  {
    id: '5',
    title: 'Capacitación: Primeros Auxilios Psicológicos',
    description: 'Programa intensivo con valor curricular para la intervención en crisis y la contención emocional.',
    category: 'Capacitación',
    date_start: '2026-09-05',
    date_end: '2026-09-06',
    location: 'En línea',
    modality: 'En línea',
    price: 950,
    has_certification: true,
    curricular_hours: 12,
    speakers_count: 3,
    image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  },
  {
    id: '6',
    title: 'Taller de Intervención en Duelo',
    description: 'Herramientas prácticas para el acompañamiento terapéutico de procesos de duelo complejo.',
    category: 'Taller',
    date_start: '2026-08-18',
    date_end: '2026-08-18',
    location: 'Ciudad de México',
    modality: 'Presencial',
    price: 700,
    has_certification: false,
    speakers_count: 2,
    image_url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
  },
]

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Fundamentos de Neuroeducación',
    description: 'Curso completo sobre los principios neurocientíficos aplicados al aprendizaje y la enseñanza.',
    instructor: 'Dra. Ana García',
    thumbnail_url: '/events/neurodesarrollo.jpeg',
    total_lessons: 12,
    progress: 65,
    current_lesson: 'Módulo 2: Plasticidad neuronal',
    modules: [
      {
        id: 'm1', title: 'Introducción a la Neurociencia', order: 1, is_locked: false,
        lessons: [
          { id: 'l1', title: 'Fundamentos teóricos', duration: '24:15', is_completed: true, order: 1 },
          { id: 'l2', title: 'El cerebro y el aprendizaje', duration: '18:30', is_completed: true, order: 2 },
          { id: 'l3', title: 'Neurotransmisores clave', duration: '22:00', is_completed: false, order: 3 },
        ],
        activities: [
          { id: 'a1', title: 'Mapa conceptual del sistema nervioso', type: 'tarea', is_done: true },
          { id: 'a2', title: 'Cuestionario: Bases neurológicas', type: 'cuestionario', due_date: '2026-07-15', is_done: false },
        ],
      },
      {
        id: 'm2', title: 'Plasticidad Neuronal', order: 2, is_locked: false,
        lessons: [
          { id: 'l4', title: 'Neuroplasticidad adaptativa', duration: '20:45', is_completed: false, order: 1 },
          { id: 'l5', title: 'Estrategias de estimulación', duration: '26:10', is_completed: false, order: 2 },
        ],
        activities: [
          { id: 'a3', title: 'Ensayo: Plasticidad en el aula', type: 'entregable', due_date: '2026-07-22', is_done: false },
        ],
      },
      {
        id: 'm3', title: 'Aplicaciones en el Aula', order: 3, is_locked: true,
        lessons: [
          { id: 'l6', title: 'Diseño de experiencias', duration: '19:30', is_completed: false, order: 1 },
        ],
      },
    ],
  },
  {
    id: 'c2',
    title: 'Psicoterapia de Pareja Avanzada',
    description: 'Técnicas avanzadas de intervención y acompañamiento terapéutico en parejas.',
    instructor: 'Dr. Roberto Sánchez',
    thumbnail_url: '/events/sexualidad.jpg',
    total_lessons: 8,
    progress: 100,
    current_lesson: 'Completado',
    modules: [
      {
        id: 'm4', title: 'Modelos Terapéuticos', order: 1, is_locked: false,
        lessons: [
          { id: 'l7', title: 'Terapia Sistémica', duration: '30:00', is_completed: true, order: 1 },
          { id: 'l8', title: 'Terapia Cognitivo-Conductual', duration: '28:15', is_completed: true, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'c3',
    title: 'Intervención en Crisis y Primeros Auxilios Psicológicos',
    description: 'Protocolo de intervención en crisis emocional y técnicas de primeros auxilios psicológicos.',
    instructor: 'Mtra. Laura Mendoza',
    thumbnail_url: '/events/tanatologia.png',
    total_lessons: 10,
    progress: 30,
    current_lesson: 'Módulo 1: Evaluación de riesgo',
    modules: [
      {
        id: 'm5', title: 'Evaluación de Riesgo', order: 1, is_locked: false,
        lessons: [
          { id: 'l9', title: 'Indicadores de riesgo', duration: '22:00', is_completed: true, order: 1 },
          { id: 'l10', title: 'Protocolos de actuación', duration: '25:30', is_completed: false, order: 2 },
        ],
      },
    ],
  },
  {
    id: 'c4',
    title: 'Psicooncología: Acompañamiento Integral',
    description: 'Abordaje psicológico integral del paciente oncológico y su familia.',
    instructor: 'Dr. Carlos Vega',
    thumbnail_url: '/events/psicooncologia.png',
    total_lessons: 15,
    progress: 100,
    current_lesson: 'Completado',
    modules: [
      {
        id: 'm6', title: 'Impacto Emocional del Diagnóstico', order: 1, is_locked: false,
        lessons: [
          { id: 'l11', title: 'Reacciones emocionales', duration: '20:00', is_completed: true, order: 1 },
          { id: 'l12', title: 'Estrategias de afrontamiento', duration: '24:45', is_completed: true, order: 2 },
        ],
      },
    ],
  },
]

export const MOCK_CONSTANCIAS: Constancia[] = [
  {
    id: 'cert1',
    title: '1er. Congreso Internacional de Neurodesarrollo y Neuroeducación',
    issued_at: '24 de mayo de 2026',
    event_id: '1',
  },
  {
    id: 'cert2',
    title: 'Capacitación: Primeros Auxilios Psicológicos',
    issued_at: '6 de septiembre de 2026',
    event_id: '5',
  },
  {
    id: 'cert3',
    title: 'Psicoterapia de Pareja Avanzada',
    issued_at: '15 de agosto de 2026',
    course_id: 'c2',
  },
]

export const MOCK_GALLERY: GalleryEvent[] = [
  {
    id: 'g1',
    title: 'Congreso de Neurodesarrollo 2025',
    category: 'Congreso',
    year: 2025,
    location: 'Puebla, Puebla',
    cover_url: '/events/neurodesarrollo.jpeg',
    photos: ['/events/neurodesarrollo.jpeg'],
    attendees: 350,
  },
  {
    id: 'g2',
    title: 'Congreso de Sexualidad y Psicoterapia 2024',
    category: 'Congreso',
    year: 2024,
    location: 'San Cristóbal de las Casas',
    cover_url: '/events/sexualidad.jpg',
    photos: ['/events/sexualidad.jpg'],
    attendees: 280,
  },
  {
    id: 'g3',
    title: 'Congreso de Tanatología 2024',
    category: 'Congreso',
    year: 2024,
    location: 'Guadalajara, Jalisco',
    cover_url: '/events/tanatologia.png',
    photos: ['/events/tanatologia.png'],
    attendees: 310,
  },
  {
    id: 'g4',
    title: 'Congreso de Psicooncología 2023',
    category: 'Congreso',
    year: 2023,
    location: 'Guadalajara, Jalisco',
    cover_url: '/events/psicooncologia.png',
    photos: ['/events/psicooncologia.png'],
    attendees: 250,
  },
]

/** Helpers */
export function getEventById(id: string): Event | undefined {
  return MOCK_EVENTS.find((e) => e.id === id)
}

export function getFeaturedEvent(): Event | undefined {
  return MOCK_EVENTS.find((e) => e.is_featured)
}

export function getCourseById(id: string): Course | undefined {
  return MOCK_COURSES.find((c) => c.id === id)
}
