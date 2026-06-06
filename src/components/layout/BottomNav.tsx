/**
 * =============================================================================
 * BottomNav.tsx — Navegación inferior persistente (capa de PRESENTACIÓN)
 * =============================================================================
 * PROPÓSITO
 *   Barra de navegación principal de la PWA con 4 destinos fijos. Siempre
 *   visible (no se oculta en escritorio) para mantener la experiencia tipo app
 *   móvil. Marca el destino activo según la ruta.
 *
 * DEPENDENCIAS
 *   - react-router-dom (useNavigate, useLocation).
 *
 * LÓGICA DE ESTADO
 *   - Sin estado propio. Deriva el "tab activo" de `location.pathname`.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/components/layout/BottomNav.tsx
 *   2. Inclúyela al final de cada pantalla de tab (Inicio, Congresos,
 *      Mis Cursos, Constancias, Perfil) y deja `pb-28` en el <main>.
 * =============================================================================
 */

import { useNavigate, useLocation } from 'react-router-dom'

interface Tab {
  path: string
  icon: string
  label: string
  /** Rutas adicionales que también activan este tab. */
  match?: string[]
}

const TABS: Tab[] = [
  { path: '/inicio', icon: 'home', label: 'Inicio' },
  { path: '/congresos', icon: 'local_activity', label: 'Congresos', match: ['/congresos', '/checkout', '/galeria', '/reservaciones'] },
  { path: '/cursos', icon: 'play_circle', label: 'Mis Cursos' },
  { path: '/perfil', icon: 'person', label: 'Perfil', match: ['/perfil', '/configuracion', '/constancias'] },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = (tab: Tab): boolean => {
    const targets = tab.match ?? [tab.path]
    return targets.some((t) => pathname === t || pathname.startsWith(`${t}/`))
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 flex justify-around items-center
        bg-surface/95 backdrop-blur-md border-t border-surface-variant shadow-[0_-4px_24px_rgba(10,25,47,0.06)]"
      style={{ paddingTop: '8px', paddingBottom: 'calc(8px + env(safe-area-inset-bottom))' }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab)
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`relative flex flex-col items-center justify-center w-16 gap-0.5 pt-1.5
              transition-colors duration-200 active:scale-90 ${
                active ? 'text-secondary' : 'text-outline hover:text-secondary'
              }`}
          >
            {/* Indicador activo superior */}
            <span
              className={`absolute -top-[9px] h-1 rounded-full transition-all duration-300 accent-line ${
                active ? 'w-8 opacity-100' : 'w-0 opacity-0'
              }`}
            />
            <span
              className="material-symbols-outlined text-[24px]"
              style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {tab.icon}
            </span>
            <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
