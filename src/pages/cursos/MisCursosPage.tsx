/**
 * =============================================================================
 * MisCursosPage.tsx — Listado de cursos del usuario (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Muestra los cursos inscritos con filtros por estado y progreso. Solo
 *   consume hooks; sin lógica de red.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useCourses      → cursos del usuario.
 *   - ../../components/layout/*       → TopBar, BottomNav.
 *   - ../../components/common/ProgressBar, Spinner.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Estado LOCAL `filter` (Todos/En Curso/Finalizados). El filtrado se hace
 *     en memoria sobre los datos del hook. La carga vive en `useCourses()`.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/cursos/MisCursosPage.tsx
 *   2. Ruta: <Route path="/cursos" element={<MisCursosPage />} />
 * =============================================================================
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import ProgressBar from '../../components/common/ProgressBar'
import Spinner from '../../components/common/Spinner'
import { useCourses } from '../../hooks/api/useCourses'
import type { FilterTab } from '../../types'

const FILTERS: FilterTab[] = ['Todos', 'En Curso', 'Finalizados']

export default function MisCursosPage() {
  const navigate = useNavigate()
  const { courses, isLoading } = useCourses()
  const [filter, setFilter] = useState<FilterTab>('Todos')

  const filtered = courses.filter((c) => {
    if (filter === 'En Curso') return c.progress > 0 && c.progress < 100
    if (filter === 'Finalizados') return c.progress === 100
    return true
  })

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar title="Mis Cursos" />

      <main className="px-5 pt-6 pb-10 flex flex-col gap-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-[28px] font-bold text-primary leading-tight tracking-tight">Mis Cursos</h2>
          <p className="text-sm text-on-surface-variant mt-1">Continúa tu formación profesional.</p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {FILTERS.map((f) => {
            const active = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 active:scale-95 ${
                  active
                    ? 'bg-secondary text-on-secondary shadow-card'
                    : 'bg-surface border border-surface-variant text-on-surface-variant hover:border-secondary hover:text-secondary'
                }`}
              >
                {f}
              </button>
            )
          })}
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-[56px] text-outline-variant block mb-3">school</span>
                <p className="text-sm text-on-surface-variant">No tienes cursos en esta categoría.</p>
              </div>
            )}
            {filtered.map((course) => (
              <button
                key={course.id}
                onClick={() => navigate(`/cursos/${course.id}`)}
                className="bg-surface rounded-3xl p-4 shadow-card border border-surface-variant/70 flex items-center gap-4
                  hover:shadow-elevated transition-all duration-200 text-left w-full active:scale-[0.98] group"
              >
                <div className="w-20 h-20 rounded-2xl flex-shrink-0 overflow-hidden bg-primary">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-navy-gradient">
                      <span className="material-symbols-outlined text-white/40 text-[32px]">play_circle</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-primary truncate">{course.title}</h3>
                  <p className="text-xs text-on-surface-variant truncate">{course.current_lesson}</p>
                  <ProgressBar value={course.progress} showLabel />
                </div>

                <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors flex-shrink-0">
                  chevron_right
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
