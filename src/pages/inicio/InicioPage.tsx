/**
 * =============================================================================
 * InicioPage.tsx — Pantalla de inicio / dashboard (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Landing de la PWA: saludo personalizado, hero del próximo congreso con
 *   cuenta regresiva, accesos rápidos y próximos eventos. Solo consume hooks.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useEvents       → featuredEvent + listEvents.
 *   - ../../store/auth.store          → nombre del usuario (lectura).
 *   - ../../components/layout/*       → TopBar, BottomNav.
 *   - ../../components/common/Badge    → etiquetas.
 *   - ../../utils/format               → fechas, días restantes.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useCountdown` (local) recalcula cada segundo la cuenta regresiva del
 *     evento destacado. Los datos del catálogo vienen de `useEvents()`.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/inicio/InicioPage.tsx
 *   2. Ruta: <Route path="/inicio" element={<InicioPage />} />
 * =============================================================================
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Badge from '../../components/common/Badge'
import { useEvents } from '../../hooks/api/useEvents'
import { useAuthStore } from '../../store/auth.store'
import { formatDateRange } from '../../utils/format'
import type { Event } from '../../types'

interface CountdownValue {
  days: number
  hours: number
  mins: number
  secs: number
}

function useCountdown(target: Date): CountdownValue {
  const calc = (): CountdownValue => {
    const diff = Math.max(0, target.getTime() - Date.now())
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState<CountdownValue>(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return time
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[22px] font-bold leading-tight text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-semibold text-primary-fixed-dim tracking-widest">{label}</span>
    </div>
  )
}

interface QuickAccess {
  icon: string
  label: string
  path: string
}
const QUICK_ACCESS: QuickAccess[] = [
  { icon: 'local_activity', label: 'Congresos', path: '/congresos' },
  { icon: 'play_circle', label: 'Cursos', path: '/cursos' },
  { icon: 'workspace_premium', label: 'Constancias', path: '/constancias' },
  { icon: 'person', label: 'Perfil', path: '/perfil' },
]

export default function InicioPage() {
  const navigate = useNavigate()
  const { featuredEvent, listEvents, isLoading } = useEvents()
  const user = useAuthStore((s) => s.user)
  const countdown = useCountdown(new Date(featuredEvent?.date_start ?? '2024-10-24T09:00:00'))

  const firstName = (user?.full_name ?? 'María Fernanda').split(' ')[0]
  const upcoming = listEvents.slice(0, 2)

  const goToFeatured = () => featuredEvent && navigate(`/congresos/${featuredEvent.id}`)
  const goToEvent = (event: Event) => navigate(`/congresos/${event.id}`)

  return (
    <div className="min-h-screen bg-surface pb-28">
      <TopBar title="Grupo FÉNIX" />

      <main className="px-5 pt-6 pb-10 flex flex-col gap-9 max-w-2xl mx-auto">
        {/* Bienvenida */}
        <section className="animate-fade-in-up">
          <h1 className="text-[22px] font-bold text-primary leading-tight">
            ¡Hola, {firstName}! <span>👋</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">¿Qué quieres aprender hoy?</p>
        </section>

        {/* Hero — Próximo Congreso */}
        {featuredEvent && (
          <section className="animate-fade-in-up">
            <div className="rounded-3xl overflow-hidden relative shadow-hero bg-navy-gradient">
              <div className="absolute top-0 left-0 right-0 h-1 accent-line" />
              <div className="relative z-10 p-6 flex flex-col gap-5">
                <div>
                  <Badge label="Próximo congreso" variant="orange" />
                  <h2 className="text-[24px] font-bold text-white leading-snug tracking-tight mt-3">
                    {featuredEvent.title}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px] mt-0.5">calendar_month</span>
                    <div>
                      <p className="font-semibold text-white text-xs">{formatDateRange(featuredEvent.date_start, featuredEvent.date_end)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px] mt-0.5">location_on</span>
                    <div>
                      <p className="font-semibold text-white text-xs">{featuredEvent.location}</p>
                    </div>
                  </div>
                </div>

                {/* Countdown */}
                <div className="glass-on-navy rounded-2xl p-4 flex items-center justify-between">
                  <CountUnit value={countdown.days} label="DÍAS" />
                  <span className="text-primary-fixed-dim font-bold">:</span>
                  <CountUnit value={countdown.hours} label="HORAS" />
                  <span className="text-primary-fixed-dim font-bold">:</span>
                  <CountUnit value={countdown.mins} label="MIN" />
                  <span className="text-primary-fixed-dim font-bold">:</span>
                  <CountUnit value={countdown.secs} label="SEG" />
                </div>

                <button
                  onClick={goToFeatured}
                  className="w-full bg-secondary hover:bg-secondary-deep text-on-secondary font-semibold text-sm py-4 rounded-2xl
                    transition-colors flex items-center justify-center gap-2 active:scale-[0.98] shadow-card"
                >
                  Inscribirme ahora
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <div className="w-2 h-2 rounded-full bg-surface-variant" />
              <div className="w-2 h-2 rounded-full bg-surface-variant" />
            </div>
          </section>
        )}

        {/* Acceso rápido */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[18px] font-semibold text-primary">Acceso rápido</h3>
            <button onClick={() => navigate('/congresos')} className="text-xs font-semibold text-secondary hover:underline">
              Ver todo
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_ACCESS.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-2.5 group active:scale-95 transition-transform duration-150"
              >
                <div className="w-16 h-16 rounded-3xl bg-surface-container-low flex items-center justify-center text-primary
                  group-hover:bg-primary group-hover:text-white transition-colors shadow-card">
                  <span className="material-symbols-outlined text-[26px]">{item.icon}</span>
                </div>
                <span className="text-[11px] font-semibold text-center text-primary group-hover:text-secondary transition-colors leading-tight">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Próximos eventos */}
        <section>
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[18px] font-semibold text-primary">Próximos eventos</h3>
            <button onClick={() => navigate('/congresos')} className="text-xs font-semibold text-secondary hover:underline">
              Ver calendario
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 bg-surface-container-low rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((event) => (
                <button
                  key={event.id}
                  onClick={() => goToEvent(event)}
                  className="bg-surface rounded-3xl p-4 shadow-card border border-surface-variant/70 flex gap-4 items-center
                    hover:shadow-elevated transition-all w-full text-left active:scale-[0.98] duration-150 group"
                >
                  <div className="w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden bg-primary">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy-gradient">
                        <span className="material-symbols-outlined text-white/40 text-[32px]">event</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow gap-1 min-w-0">
                    <h4 className="text-sm font-semibold text-primary line-clamp-2 leading-snug">{event.title}</h4>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                      <span>{formatDateRange(event.date_start, event.date_end)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[13px]">location_on</span>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors flex-shrink-0">chevron_right</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
