/**
 * =============================================================================
 * App.tsx — Enrutador raíz, Providers y code-splitting (capa de COMPOSICIÓN)
 * =============================================================================
 * PROPÓSITO
 *   Define el árbol de rutas (React Router), monta el listener global de sesión
 *   de Supabase y aplica CODE-SPLITTING por ruta con React.lazy + Suspense para
 *   reducir el bundle inicial (cada pantalla se descarga bajo demanda).
 *
 * DEPENDENCIAS
 *   - react (lazy, Suspense)                  → carga diferida.
 *   - react-router-dom                        → enrutamiento SPA/PWA.
 *   - ./hooks/auth/useAuth (useAuthSession)   → sincroniza Supabase ↔ Zustand.
 *   - ./components/common/Spinner             → fallback de carga.
 *   - ./components/auth/ProtectedRoute        → guarda de rutas (lista para usar).
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - `useAuthSession()` se invoca aquí (y solo aquí) para evitar listeners
 *     duplicados.
 *   - Cada página se importa con `lazy()`, por lo que Vite genera un chunk
 *     independiente por ruta. `<Suspense>` muestra un Spinner mientras descarga.
 *   - MODO DEMO: rutas públicas. Para exigir login, envolver las privadas con
 *     <Route element={<ProtectedRoute/>}> … </Route>.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/App.tsx
 *   2. Verifica: npx tsc --noEmit && npx vite build (revisa los chunks).
 * =============================================================================
 */

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthSession } from './hooks/auth/useAuth'
import Spinner from './components/common/Spinner'

// Carga diferida por ruta (code-splitting)
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const InicioPage = lazy(() => import('./pages/inicio/InicioPage'))
const CongresosPage = lazy(() => import('./pages/congresos/CongresosPage'))
const GaleriaPage = lazy(() => import('./pages/galeria/GaleriaPage'))
const ReservacionesPage = lazy(() => import('./pages/reservaciones/ReservacionesPage'))
const EventDetails = lazy(() => import('./pages/events/EventDetails'))
const Checkout = lazy(() => import('./pages/checkout/Checkout'))
const MisCursosPage = lazy(() => import('./pages/cursos/MisCursosPage'))
const CourseDashboardPage = lazy(() => import('./pages/cursos/CourseDashboardPage'))
const VideoPlayerPage = lazy(() => import('./pages/cursos/VideoPlayerPage'))
const ConstanciasPage = lazy(() => import('./pages/constancias/ConstanciasPage'))
const PerfilPage = lazy(() => import('./pages/perfil/PerfilPage'))
const ConfiguracionPage = lazy(() => import('./pages/perfil/ConfiguracionPage'))

/** Fallback a pantalla completa mientras se descarga el chunk de la ruta. */
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner />
    </div>
  )
}

export default function App() {
  useAuthSession()

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Públicas — autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* App (modo demo: públicas). Para exigir sesión, mover dentro de:
              <Route element={<ProtectedRoute />}> ... </Route> */}
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/inicio" element={<InicioPage />} />
          <Route path="/congresos" element={<CongresosPage />} />
          <Route path="/galeria" element={<GaleriaPage />} />
          <Route path="/reservaciones" element={<ReservacionesPage />} />
          <Route path="/congresos/:id" element={<EventDetails />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/cursos" element={<MisCursosPage />} />
          <Route path="/cursos/:id" element={<CourseDashboardPage />} />
          <Route path="/cursos/:id/video/:lessonId" element={<VideoPlayerPage />} />
          <Route path="/constancias" element={<ConstanciasPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/inicio" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
