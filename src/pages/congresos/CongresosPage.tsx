import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Spinner from '../../components/common/Spinner'
import EventCard from '../../components/events/EventCard'
import FeaturedEventHero from '../../components/events/FeaturedEventHero'
import { useEvents } from '../../hooks/api/useEvents'
import type { Event, EventCategory } from '../../types'

const CATEGORIES: EventCategory[] = ['Todos', 'Congreso', 'Capacitación', 'Curso', 'Taller']

export default function CongresosPage() {
  const navigate = useNavigate()
  const { featuredEvent, listEvents, isLoading } = useEvents()

  const [category, setCategory] = useState<EventCategory>('Todos')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return listEvents.filter((e) => {
      const matchCat = category === 'Todos' || e.category === category
      const matchSearch =
        !q || e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [listEvents, category, search])

  const handleEnroll = (event: Event) => navigate(`/checkout/${event.id}`)
  const handleOpen = (event: Event) => navigate(`/congresos/${event.id}`)

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar title="Congresos" />

      <main className="px-5 max-w-2xl mx-auto flex flex-col gap-7 pt-2">
        {/* ===== Título de sección ===== */}
        <div className="pt-1">
          <h1 className="text-[28px] font-bold text-primary leading-tight tracking-tight">
            Vive la experiencia<br />
            <span className="text-secondary">Grupo Fénix</span>
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
            Congresos, capacitaciones y talleres con valor curricular impartidos por especialistas.
          </p>

          <button
            onClick={() => navigate('/galeria')}
            className="mt-4 w-full flex items-center justify-between bg-surface rounded-2xl border border-surface-variant/70 shadow-card px-4 py-3
              hover:shadow-elevated transition-all active:scale-[0.98] group"
          >
            <span className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-primary group-hover:text-secondary transition-colors">
                <span className="material-symbols-outlined text-[20px]">photo_library</span>
              </span>
              <span className="text-sm font-semibold text-primary">Ver eventos realizados</span>
            </span>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">chevron_right</span>
          </button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            {/* ===== Hero congreso destacado ===== */}
            {featuredEvent && <FeaturedEventHero event={featuredEvent} onEnroll={handleEnroll} />}

            {/* ===== Buscador ===== */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text"
                inputMode="search"
                placeholder="Buscar congreso, ciudad o tema…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface border border-surface-variant rounded-2xl pl-12 pr-11 py-3.5 text-sm text-primary
                  placeholder:text-outline outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all shadow-card"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>

            {/* ===== Chips de filtro ===== */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
              {CATEGORIES.map((cat) => {
                const active = category === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      active
                        ? 'bg-secondary text-on-secondary shadow-card'
                        : 'bg-surface border border-surface-variant text-on-surface-variant hover:border-secondary hover:text-secondary'
                    }`}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* ===== Resultados ===== */}
            <div className="flex items-center justify-between -mt-2">
              <p className="text-xs text-outline font-medium">
                {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
                {category !== 'Todos' ? ` · ${category}` : ''}
              </p>
              <button className="flex items-center gap-1 text-xs font-semibold text-secondary hover:underline">
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Ordenar
              </button>
            </div>

            {/* ===== Grid de tarjetas ===== */}
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-[56px] text-outline-variant block mb-3">
                  search_off
                </span>
                <p className="text-sm font-semibold text-primary">No encontramos eventos</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Ajusta tu búsqueda o elige otra categoría
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {filtered.map((event, i) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={i}
                    onEnroll={handleEnroll}
                    onOpen={handleOpen}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
