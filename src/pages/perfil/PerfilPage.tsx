/**
 * =============================================================================
 * PerfilPage.tsx — Perfil del usuario (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Muestra los datos del usuario, su resumen de eventos inscritos y accesos a
 *   constancias/comprobantes/datos. El cierre de sesión se delega en useAuth.
 *
 * DEPENDENCIAS
 *   - ../../hooks/auth/useAuth        → user + signOut.
 *   - ../../components/layout/*       → TopBar, BottomNav.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Sin estado local relevante. `handleLogout` llama a `signOut()` (limpia
 *     Supabase + Zustand) y redirige a /login.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/perfil/PerfilPage.tsx
 *   2. Ruta: <Route path="/perfil" element={<PerfilPage />} />
 * =============================================================================
 */

import { useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import { useAuth } from '../../hooks/auth/useAuth'

interface MenuItem {
  icon: string
  label: string
  sub: string
  path: string
}
const MENU_ITEMS: MenuItem[] = [
  { icon: 'workspace_premium', label: 'Mis constancias', sub: 'Descarga tus certificados', path: '/constancias' },
  { icon: 'event_available', label: 'Reservaciones y cotización', sub: 'Solicita un evento a tu medida', path: '/reservaciones' },
  { icon: 'receipt_long', label: 'Mis comprobantes', sub: 'Historial de pagos y facturas', path: '/configuracion' },
  { icon: 'person', label: 'Datos personales', sub: 'Actualiza tu información', path: '/configuracion' },
]

export default function PerfilPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const displayName = user?.full_name ?? 'María Fernanda'
  const email = user?.email ?? 'mfernanda@grupofenix.com'
  const initial = displayName.trim().charAt(0).toUpperCase()

  return (
    <div className="min-h-screen bg-background pb-28">
      <TopBar title="Perfil" showSettings />

      <main className="px-5 pt-6 pb-10 flex flex-col gap-7 max-w-xl mx-auto">
        {/* Avatar */}
        <section className="flex flex-col items-center text-center animate-fade-in-up">
          <div className="relative mb-3.5">
            <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-surface shadow-card">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navy-gradient flex items-center justify-center">
                  <span className="text-white text-[32px] font-bold">{initial}</span>
                </div>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary rounded-full p-1.5 shadow-card border-2 border-surface hover:bg-secondary-deep transition-colors active:scale-95">
              <span className="material-symbols-outlined text-[14px] filled">edit</span>
            </button>
          </div>
          <h1 className="text-[20px] font-bold text-primary">{displayName}</h1>
          <p className="text-sm text-outline mt-0.5">{email}</p>
        </section>

        {/* Eventos inscritos */}
        <section
          onClick={() => navigate('/congresos')}
          className="relative overflow-hidden rounded-3xl shadow-card bg-navy-gradient cursor-pointer hover:shadow-elevated transition-shadow active:scale-[0.98] duration-150"
        >
          <div className="absolute top-0 left-0 right-0 h-1 accent-line" />
          <div className="relative z-10 flex items-center justify-between p-6">
            <div>
              <p className="text-white/80 text-sm font-medium mb-2">Mis eventos inscritos</p>
              <div className="flex items-center gap-2.5">
                <span className="text-[32px] font-bold text-white leading-none">3</span>
                <span className="material-symbols-outlined text-secondary text-[28px] filled">local_activity</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-full p-2.5 hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-white">chevron_right</span>
            </div>
          </div>
        </section>

        {/* Menú */}
        <nav className="flex flex-col gap-1.5">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="flex items-center justify-between py-4 px-4 bg-surface rounded-3xl shadow-card border border-surface-variant/70
                hover:shadow-elevated hover:border-surface-variant transition-all duration-200 text-left active:scale-[0.98] w-full group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-surface-container-low group-hover:bg-primary p-2.5 rounded-full text-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px] filled">{item.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">{item.label}</p>
                  <p className="text-xs text-outline mt-0.5">{item.sub}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline-variant group-hover:text-secondary transition-colors">chevron_right</span>
            </button>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 text-error text-sm font-bold hover:opacity-75 transition-opacity active:scale-95 px-4 mt-2"
        >
          <span className="material-symbols-outlined">logout</span>
          Cerrar sesión
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
