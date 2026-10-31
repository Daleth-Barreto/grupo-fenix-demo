/** Qué se puede crear y editar en cada sección del panel. Un solo lugar para agregar campos. */

export type FieldType = 'text' | 'textarea' | 'number' | 'date' | 'datetime' | 'url' | 'select' | 'checkbox' | 'image' | 'file'

export interface FieldOption {
  value: string
  label: string
}

export interface Field {
  name: string
  label: string
  type?: FieldType
  required?: boolean
  options?: FieldOption[]
  /** Carga las opciones de otra sección, por ejemplo la lista de usuarios. */
  source?: 'users' | 'events' | 'courses'
  help?: string
}

export type Row = Record<string, any>
export type Lookups = Partial<Record<'users' | 'events' | 'courses', Map<string, string>>>

export interface Column {
  label: string
  value: (row: Row, lookups: Lookups) => string
}

export interface RowAction {
  label: string
  patch: (row: Row) => Row
  visible?: (row: Row) => boolean
}

export interface Section {
  singular: string
  endpoint: string
  empty: string
  fields: Field[]
  columns: Column[]
  canCreate?: boolean
  canDelete?: boolean
  defaults?: () => Row
  validate?: (values: Row) => string | null
  actions?: RowAction[]
  link?: (row: Row) => { href: string; label: string }
}

const CATEGORIES: FieldOption[] = [
  { value: 'congreso', label: 'Congreso' },
  { value: 'capacitacion', label: 'Capacitación' },
  { value: 'curso', label: 'Curso' },
  { value: 'taller', label: 'Taller' },
  { value: 'diplomado', label: 'Diplomado' },
  { value: 'seminario', label: 'Seminario' },
]
const MODALITIES: FieldOption[] = [
  { value: 'presencial', label: 'Presencial' },
  { value: 'en_linea', label: 'En línea' },
  { value: 'hibrido', label: 'Híbrido' },
]
const LIVE_STATUS: FieldOption[] = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_vivo', label: 'En vivo' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'cancelado', label: 'Cancelado' },
]
const ENROLLMENT_STATUS: FieldOption[] = [
  { value: 'activo', label: 'Activo' },
  { value: 'completado', label: 'Completado' },
  { value: 'expirado', label: 'Expirado' },
]
const ROLES: FieldOption[] = [
  { value: 'student', label: 'Estudiante' },
  { value: 'instructor', label: 'Instructor' },
  { value: 'admin', label: 'Administrador' },
]

const labelOf = (options: FieldOption[], value: unknown) => options.find((o) => o.value === value)?.label ?? String(value ?? '—')
const money = (value: unknown) => `$${Number(value ?? 0).toLocaleString('es-MX')} MXN`
const day = (value: unknown) => (value ? new Date(String(value)).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: String(value).length === 10 ? 'UTC' : undefined }) : '—')
const person = (row: Row, lookups: Lookups) => lookups.users?.get(row.user_id) ?? 'Usuario sin nombre'
const target = (row: Row) => row.courses?.title ?? row.events?.title ?? '—'
const needsTarget = (values: Row) => (values.course_id || values.event_id ? null : 'Elige un curso o un evento.')

export const SECTIONS = {
  events: {
    singular: 'evento',
    endpoint: '/api/admin/events',
    empty: 'Todavía no hay eventos. Crea el primero y aparecerá en la app.',
    canCreate: true,
    canDelete: true,
    defaults: () => ({ category: 'congreso', modality: 'presencial' }),
    validate: (v) => (v.end_date < v.start_date ? 'La fecha de fin no puede ser anterior a la de inicio.' : null),
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea', required: true },
      { name: 'category', label: 'Categoría', type: 'select', options: CATEGORIES, required: true },
      { name: 'modality', label: 'Modalidad', type: 'select', options: MODALITIES, required: true },
      { name: 'start_date', label: 'Fecha de inicio', type: 'date', required: true },
      { name: 'end_date', label: 'Fecha de fin', type: 'date', required: true },
      { name: 'location', label: 'Lugar o plataforma' },
      { name: 'price', label: 'Precio (MXN)', type: 'number', required: true },
      { name: 'hours', label: 'Horas curriculares', type: 'number', help: 'Si tiene horas, la app muestra que da constancia.' },
      { name: 'cover_image', label: 'Imagen de portada', type: 'image' },
      { name: 'featured', label: 'Destacar en Inicio', type: 'checkbox' },
    ],
    columns: [
      { label: 'Evento', value: (r) => r.title },
      { label: 'Fechas', value: (r) => `${day(r.start_date)} a ${day(r.end_date)}` },
      { label: 'Tipo', value: (r) => `${labelOf(CATEGORIES, r.category)} · ${labelOf(MODALITIES, r.modality)}` },
      { label: 'Precio', value: (r) => money(r.price) },
    ],
  },
  lives: {
    singular: 'transmisión',
    endpoint: '/api/admin/lives',
    empty: 'Todavía no hay transmisiones.',
    canCreate: true,
    canDelete: true,
    defaults: () => ({ status: 'programado' }),
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'speaker', label: 'Ponente' },
      { name: 'description', label: 'Descripción', type: 'textarea' },
      { name: 'status', label: 'Estado', type: 'select', options: LIVE_STATUS, required: true },
      { name: 'scheduled_at', label: 'Fecha y hora', type: 'datetime' },
      { name: 'hls_url', label: 'URL del video (.m3u8)', type: 'url' },
      { name: 'event_id', label: 'Evento', type: 'select', source: 'events', help: 'Solo los inscritos a este evento podrán verla. Sin evento ni curso, la ve cualquier usuario con sesión.' },
      { name: 'course_id', label: 'Curso', type: 'select', source: 'courses' },
    ],
    columns: [
      { label: 'Transmisión', value: (r) => r.title },
      { label: 'Ponente', value: (r) => r.speaker || '—' },
      { label: 'Estado', value: (r) => labelOf(LIVE_STATUS, r.status) },
      { label: 'Acceso', value: (r, l) => l.events?.get(r.event_id) ?? l.courses?.get(r.course_id) ?? 'Cualquier usuario con sesión' },
    ],
    actions: [
      { label: 'Poner en vivo', visible: (r) => r.status !== 'en_vivo', patch: () => ({ status: 'en_vivo', started_at: new Date().toISOString() }) },
      { label: 'Finalizar', visible: (r) => r.status === 'en_vivo', patch: () => ({ status: 'finalizado', ended_at: new Date().toISOString() }) },
    ],
  },
  courses: {
    singular: 'curso',
    endpoint: '/api/admin/courses',
    empty: 'Todavía no hay cursos. Crea el primero y luego agrégale módulos y lecciones.',
    canCreate: true,
    canDelete: true,
    defaults: () => ({ published: true, requires_enrollment: true }),
    link: (r) => ({ href: `/admin/cursos/contenido?id=${encodeURIComponent(r.id)}`, label: 'Contenido' }),
    fields: [
      { name: 'title', label: 'Título', required: true },
      { name: 'description', label: 'Descripción', type: 'textarea' },
      { name: 'instructor', label: 'Instructor' },
      { name: 'price', label: 'Precio (MXN)', type: 'number' },
      { name: 'cover_image', label: 'Imagen de portada', type: 'image' },
      { name: 'published', label: 'Publicado', type: 'checkbox' },
      { name: 'featured', label: 'Destacado', type: 'checkbox' },
    ],
    columns: [
      { label: 'Curso', value: (r) => r.title },
      { label: 'Instructor', value: (r) => r.instructor || '—' },
      { label: 'Precio', value: (r) => money(r.price) },
      { label: 'Estado', value: (r) => (r.published ? 'Publicado' : 'Borrador') },
    ],
  },
  enrollments: {
    singular: 'inscripción',
    endpoint: '/api/admin/enrollments',
    empty: 'Todavía no hay inscripciones.',
    canCreate: true,
    canDelete: true,
    defaults: () => ({ status: 'activo' }),
    validate: (v) => (v.course_id && v.event_id ? 'Elige solo un curso o un evento.' : needsTarget(v)),
    fields: [
      { name: 'user_id', label: 'Usuario', type: 'select', source: 'users', required: true },
      { name: 'course_id', label: 'Curso', type: 'select', source: 'courses' },
      { name: 'event_id', label: 'Evento', type: 'select', source: 'events' },
      { name: 'status', label: 'Estado', type: 'select', options: ENROLLMENT_STATUS, required: true },
    ],
    columns: [
      { label: 'Usuario', value: person },
      { label: 'Inscrito en', value: target },
      { label: 'Estado', value: (r) => labelOf(ENROLLMENT_STATUS, r.status) },
    ],
  },
  certificates: {
    singular: 'constancia',
    endpoint: '/api/admin/certificates',
    empty: 'Todavía no hay constancias.',
    canCreate: true,
    canDelete: true,
    defaults: () => ({
      issued_at: new Date().toISOString().slice(0, 10),
      certificate_number: `GF-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    }),
    validate: needsTarget,
    fields: [
      { name: 'user_id', label: 'Usuario', type: 'select', source: 'users', required: true },
      { name: 'event_id', label: 'Evento', type: 'select', source: 'events' },
      { name: 'course_id', label: 'Curso', type: 'select', source: 'courses' },
      { name: 'certificate_number', label: 'Folio', required: true },
      { name: 'issued_at', label: 'Fecha de emisión', type: 'date', required: true },
    ],
    columns: [
      { label: 'Usuario', value: person },
      { label: 'Constancia de', value: target },
      { label: 'Folio', value: (r) => r.certificate_number || '—' },
      { label: 'Emitida', value: (r) => day(r.issued_at) },
      { label: 'Enviada', value: (r) => (r.sent_at ? day(r.sent_at) : 'No') },
    ],
    actions: [
      { label: 'Marcar enviada', visible: (r) => !r.sent_at, patch: () => ({ sent_at: new Date().toISOString() }) },
    ],
  },
  users: {
    singular: 'usuario',
    endpoint: '/api/admin/users',
    empty: 'Los usuarios aparecerán aquí al registrarse.',
    fields: [
      { name: 'full_name', label: 'Nombre completo', required: true },
      { name: 'phone', label: 'Teléfono' },
      { name: 'role', label: 'Rol', type: 'select', options: ROLES, required: true },
    ],
    columns: [
      { label: 'Usuario', value: (r) => r.full_name || 'Sin nombre' },
      { label: 'Teléfono', value: (r) => r.phone || '—' },
      { label: 'Rol', value: (r) => labelOf(ROLES, r.role) },
    ],
  },
} satisfies Record<string, Section>

export type SectionName = keyof typeof SECTIONS

export const LESSON_TYPES: FieldOption[] = [
  { value: 'video', label: 'Video' },
  { value: 'texto', label: 'Texto' },
  { value: 'actividad', label: 'Actividad' },
  { value: 'recurso', label: 'Recurso' },
]
