import Badge from '../common/Badge'
import { formatDateRange, daysUntil } from '../../utils/format'
import type { Event } from '../../types'

interface FeaturedEventHeroProps {
  event: Event
  onEnroll?: (event: Event) => void
}

export default function FeaturedEventHero({ event, onEnroll }: FeaturedEventHeroProps) {
  const days = daysUntil(event.date_start)

  return (
    <section className="relative rounded-3xl overflow-hidden shadow-hero bg-navy-gradient animate-fade-in-up">
      {/* Imagen de fondo tenue */}
      {event.image_url && (
        <img
          src={event.image_url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
        />
      )}

      {/* Línea acento superior */}
      <div className="absolute top-0 left-0 right-0 h-1 accent-line" />

      <div className="relative z-10 p-6 flex flex-col gap-5">
        {/* Etiquetas */}
        <div className="flex items-center gap-2">
          <Badge label="Próximo congreso" variant="orange" />
          {event.has_certification && <Badge label="Valor curricular" variant="gold" icon="verified" />}
        </div>

        {/* Título */}
        <div>
          <h2 className="text-[26px] font-bold text-white leading-tight tracking-tight">{event.title}</h2>
          <p className="text-[13px] text-primary-fixed-dim leading-relaxed mt-2 max-w-md">
            {event.description}
          </p>
        </div>

        {/* Meta en línea */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">calendar_month</span>
            <span className="font-medium">{formatDateRange(event.date_start, event.date_end)}</span>
          </div>
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">location_on</span>
            <span className="font-medium">{event.location}</span>
          </div>
        </div>

        {/* Franja de datos premium */}
        <div className="glass-on-navy rounded-2xl px-5 py-4 flex items-center justify-around">
          <div className="text-center">
            <p className="text-[22px] font-bold text-white leading-none">{days}</p>
            <p className="text-[9px] text-primary-fixed-dim tracking-widest mt-1">DÍAS</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="text-center">
            <p className="text-[22px] font-bold text-white leading-none">{event.speakers_count ?? '—'}</p>
            <p className="text-[9px] text-primary-fixed-dim tracking-widest mt-1">PONENTES</p>
          </div>
          <div className="w-px h-8 bg-white/15" />
          <div className="text-center">
            <p className="text-[22px] font-bold text-white leading-none">{event.curricular_hours ?? '—'}</p>
            <p className="text-[9px] text-primary-fixed-dim tracking-widest mt-1">HORAS</p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onEnroll?.(event)}
          className="w-full bg-secondary hover:bg-secondary-deep text-on-secondary font-semibold text-sm py-4 rounded-2xl
            shadow-card transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Reservar mi lugar
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </section>
  )
}
