/**
 * =============================================================================
 * EventDetails.tsx — Detalle de un congreso/evento (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Vista premium de detalle. Muestra Hero de imagen con header colapsable,
 *   metadatos, beneficios, ponentes y ubicación, con una barra de acción fija
 *   inferior (precio + "Inscribirme") que lleva al checkout.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useEventDetail  → carga del evento por id.
 *   - ../../hooks/useScrollCollapse   → efecto SliverAppBar (header al hacer scroll).
 *   - ../../components/common/Badge    → etiquetas.
 *   - ../../components/common/Button   → CTA.
 *   - ../../components/common/Spinner  → estado de carga.
 *   - ../../utils/format               → fechas y moneda.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Toda la carga vive en `useEventDetail(id)`. La vista solo decide entre
 *     loading / notFound / render. El header se colapsa según el scroll.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/events/EventDetails.tsx
 *   2. Ruta en App.tsx: <Route path="/congresos/:id" element={<EventDetails />} />
 * =============================================================================
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useEventDetail } from '../../hooks/api/useEventDetail'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { formatPrice, formatDateRange, daysUntil } from '../../utils/format'

interface Benefit {
  icon: string
  label: string
}

const BENEFITS: Benefit[] = [
  { icon: 'verified', label: 'Constancia con valor curricular' },
  { icon: 'group', label: 'Acceso a todas las ponencias' },
  { icon: 'description', label: 'Material y recursos digitales' },
  { icon: 'coffee', label: 'Coffee breaks y networking' },
]

export default function EventDetails() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { event, isLoading, notFound } = useEventDetail(id)
  const collapsed = useScrollCollapse(220)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined text-[56px] text-outline-variant mb-3">event_busy</span>
        <h1 className="text-lg font-bold text-primary">Evento no encontrado</h1>
        <Button variant="secondary" className="mt-5" onClick={() => navigate('/congresos')}>
          Volver al catálogo
        </Button>
      </div>
    )
  }

  const days = daysUntil(event.date_start)

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header colapsable */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          collapsed ? 'bg-surface/95 backdrop-blur-md border-b border-surface-variant shadow-card' : 'bg-transparent'
        }`}
      >
        <div className="px-5 max-w-2xl mx-auto flex items-center gap-3 h-16">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 -ml-2 rounded-full transition-colors active:scale-95 ${
              collapsed ? 'text-primary hover:bg-surface-container' : 'text-white bg-black/30 hover:bg-black/50'
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          {collapsed && (
            <span className="font-semibold text-primary text-[15px] truncate animate-fade-in-up">
              {event.title}
            </span>
          )}
        </div>
      </header>

      {/* Hero de imagen */}
      <div className="relative h-72 bg-primary overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-navy-gradient" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, #0f2a44 0%, rgba(10,25,47,0.2) 55%, rgba(10,25,47,0.35) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Badge label={event.category} variant="orange" />
            <Badge label={event.modality} variant="glass" />
          </div>
          <h1 className="text-[24px] font-bold text-white leading-tight tracking-tight">{event.title}</h1>
        </div>
      </div>

      <main className="px-5 max-w-2xl mx-auto -mt-2 flex flex-col gap-6 pt-6">
        {/* Tarjeta de datos clave */}
        <section className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 p-5 grid grid-cols-3 gap-3 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-secondary text-[22px]">event</span>
            <p className="text-[11px] text-outline">Faltan</p>
            <p className="text-sm font-bold text-primary">{days} días</p>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-surface-variant/70">
            <span className="material-symbols-outlined text-secondary text-[22px]">groups</span>
            <p className="text-[11px] text-outline">Ponentes</p>
            <p className="text-sm font-bold text-primary">{event.speakers_count ?? '—'}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="material-symbols-outlined text-secondary text-[22px]">schedule</span>
            <p className="text-[11px] text-outline">Duración</p>
            <p className="text-sm font-bold text-primary">{event.curricular_hours ?? '—'} hrs</p>
          </div>
        </section>

        {/* Fecha y ubicación */}
        <section className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{formatDateRange(event.date_start, event.date_end)}</p>
              <p className="text-xs text-on-surface-variant">Agenda completa disponible al inscribirte</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">{event.location}</p>
              <p className="text-xs text-on-surface-variant">{event.modality}</p>
            </div>
          </div>
        </section>

        {/* Descripción */}
        <section>
          <h2 className="text-[17px] font-bold text-primary mb-2">Acerca del evento</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed">{event.description}</p>
        </section>

        {/* Beneficios */}
        <section>
          <h2 className="text-[17px] font-bold text-primary mb-3">¿Qué incluye?</h2>
          <div className="grid grid-cols-1 gap-2">
            {BENEFITS.map((b) => (
              <div
                key={b.label}
                className="flex items-center gap-3 bg-surface rounded-2xl border border-surface-variant/70 px-4 py-3"
              >
                <span className="material-symbols-outlined text-secondary text-[20px] filled">{b.icon}</span>
                <span className="text-sm text-primary font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Certificación destacada */}
        {event.has_certification && (
          <section className="bg-navy-gradient rounded-3xl p-5 relative overflow-hidden shadow-card">
            <div className="absolute top-0 left-0 right-0 h-1 accent-line" />
            <div className="flex items-center gap-4 relative z-10">
              <span className="material-symbols-outlined text-gold text-[36px] filled">workspace_premium</span>
              <div>
                <p className="text-sm font-bold text-white">Constancia con valor curricular</p>
                <p className="text-xs text-primary-fixed-dim mt-0.5 leading-relaxed">
                  Avalada por Grupo Fénix. {event.curricular_hours} horas reconocidas para tu desarrollo profesional.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Barra de acción fija */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-surface-variant px-5 py-3"
        style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-outline uppercase tracking-wider font-medium">Inversión</p>
            <p className="text-[20px] font-bold text-primary leading-tight">{formatPrice(event.price)}</p>
          </div>
          <Button
            variant="primary"
            fullWidth
            rightIcon="arrow_forward"
            onClick={() => navigate(`/checkout/${event.id}`)}
          >
            Inscribirme
          </Button>
        </div>
      </div>
    </div>
  )
}
