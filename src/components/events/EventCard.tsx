import Badge from '../common/Badge'
import { formatPrice, formatDateRange, getDateChip } from '../../utils/format'
import type { Event } from '../../types'

interface EventCardProps {
  event: Event
  onEnroll?: (event: Event) => void
  onOpen?: (event: Event) => void
  index?: number
}

const MODALITY_ICON: Record<Event['modality'], string> = {
  Presencial: 'location_on',
  'En línea': 'wifi',
  Híbrido: 'hub',
}

export default function EventCard({ event, onEnroll, onOpen, index = 0 }: EventCardProps) {
  const chip = getDateChip(event.date_start)

  return (
    <article
      onClick={() => onOpen?.(event)}
      className={`group bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden
        hover:shadow-elevated hover:border-surface-variant transition-all duration-300 cursor-pointer
        animate-fade-in-up delay-${Math.min(index + 1, 4)}`}
    >
      {/* Imagen */}
      <div className="relative h-44 overflow-hidden bg-primary">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-navy-gradient">
            <span className="material-symbols-outlined text-white/25 text-[64px]">event</span>
          </div>
        )}

        {/* Velo inferior para legibilidad */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,25,47,0.55) 0%, transparent 45%)' }}
        />

        {/* Chip de fecha */}
        <div className="absolute top-3 left-3 bg-surface/95 backdrop-blur-sm rounded-2xl px-3 py-1.5 text-center shadow-card">
          <p className="text-[18px] font-bold leading-none text-primary">{chip.day}</p>
          <p className="text-[9px] font-semibold text-secondary tracking-widest mt-0.5">{chip.month}</p>
        </div>

        {/* Categoría */}
        <div className="absolute top-3 right-3">
          <Badge label={event.category} variant="glass" />
        </div>

        {/* Modalidad */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium">
          <span className="material-symbols-outlined text-[15px]">{MODALITY_ICON[event.modality]}</span>
          <span>{event.modality}</span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {event.has_certification && (
            <Badge label="Constancia con valor curricular" variant="gold" icon="verified" />
          )}
        </div>

        <h3 className="text-[17px] font-semibold text-primary leading-snug">{event.title}</h3>
        <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-2">
          {event.description}
        </p>

        {/* Meta */}
        <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant pt-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[15px]">calendar_today</span>
            <span>{formatDateRange(event.date_start, event.date_end)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[15px]">location_on</span>
            <span>{event.location}</span>
          </div>
          {event.speakers_count && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[15px]">groups</span>
              <span>{event.speakers_count} ponentes{event.curricular_hours ? ` · ${event.curricular_hours} hrs` : ''}</span>
            </div>
          )}
        </div>

        {/* Precio + CTA */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-surface-variant/70">
          <div>
            <p className="text-[10px] text-outline uppercase tracking-wider font-medium">Inversión</p>
            <p className="text-[19px] font-bold text-primary leading-tight">{formatPrice(event.price)}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEnroll?.(event)
            }}
            className="bg-secondary hover:bg-secondary-deep text-on-secondary text-sm font-semibold px-6 py-3 rounded-2xl
              shadow-card hover:shadow-elevated transition-all active:scale-[0.97]"
          >
            Inscribirme
          </button>
        </div>
      </div>
    </article>
  )
}
