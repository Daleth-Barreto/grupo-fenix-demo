/**
 * =============================================================================
 * GaleriaPage.tsx — Galería de eventos realizados (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Feed visual tipo masonry con los montajes de eventos pasados de Grupo
 *   Fénix. Permite filtrar por año y abrir un lightbox con las fotos de cada
 *   evento. Solo consume el hook `useGallery`.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useGallery      → items + años.
 *   - ../../components/layout/*       → TopBar, BottomNav.
 *   - ../../components/common/Badge, Spinner.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Estado LOCAL: `year` (filtro) y `selected` (evento abierto en lightbox).
 *     Los datos vienen de `useGallery()`. El filtrado es en memoria.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/galeria/GaleriaPage.tsx
 *   2. Ruta: <Route path="/galeria" element={<GaleriaPage />} />
 * =============================================================================
 */

import { useState } from 'react'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import { useGallery } from '../../hooks/api/useGallery'
import type { GalleryEvent } from '../../types'

export default function GaleriaPage() {
  const { items, years, isLoading } = useGallery()
  const [year, setYear] = useState<number | 'Todos'>('Todos')
  const [selected, setSelected] = useState<GalleryEvent | null>(null)

  const filtered = year === 'Todos' ? items : items.filter((i) => i.year === year)

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar title="Eventos realizados" showBack />

      <main className="px-5 pt-5 pb-10 max-w-2xl mx-auto flex flex-col gap-5">
        <div>
          <h1 className="text-[26px] font-bold text-primary leading-tight tracking-tight">Nuestra trayectoria</h1>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
            Cada montaje refleja nuestra pasión por crear experiencias memorables.
          </p>
        </div>

        {/* Filtro por año */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(['Todos', ...years] as Array<number | 'Todos'>).map((y) => {
            const active = year === y
            return (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  active
                    ? 'bg-secondary text-on-secondary shadow-card'
                    : 'bg-surface border border-surface-variant text-on-surface-variant hover:border-secondary hover:text-secondary'
                }`}
              >
                {y}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          /* Masonry con CSS columns */
          <div className="columns-2 gap-4 [column-fill:_balance]">
            {filtered.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="mb-4 w-full break-inside-avoid rounded-3xl overflow-hidden shadow-card border border-surface-variant/70
                  bg-surface group relative block animate-fade-in-up"
                style={{ animationDelay: `${(i % 4) * 0.06}s` }}
              >
                <div className={`relative overflow-hidden ${i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-square'}`}>
                  <img
                    src={item.cover_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(10,25,47,0.85) 0%, transparent 55%)' }}
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <Badge label={String(item.year)} variant="glass" />
                  </div>
                  {item.photos.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-white text-[13px]">photo_library</span>
                      <span className="text-white text-[10px] font-semibold">{item.photos.length}</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <p className="text-white text-[13px] font-semibold leading-snug line-clamp-2">{item.title}</p>
                    <p className="text-primary-fixed-dim text-[11px] mt-0.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {item.location}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-primary/80 backdrop-blur-sm flex flex-col"
          onClick={() => setSelected(null)}
        >
          <div className="flex items-center justify-between px-5 h-16 flex-shrink-0">
            <div className="text-white">
              <p className="font-semibold text-sm">{selected.title}</p>
              <p className="text-primary-fixed-dim text-xs">{selected.location} · {selected.year}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div
            className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-4 px-5 snap-x snap-mandatory"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`${selected.title} — foto ${idx + 1}`}
                className="max-h-[70vh] w-auto rounded-3xl object-contain snap-center flex-shrink-0 shadow-hero"
              />
            ))}
          </div>

          {selected.attendees && (
            <div className="flex-shrink-0 px-5 py-4 text-center">
              <span className="glass-on-navy text-white text-xs font-medium rounded-full px-4 py-2 inline-flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">groups</span>
                {selected.attendees} asistentes
              </span>
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
