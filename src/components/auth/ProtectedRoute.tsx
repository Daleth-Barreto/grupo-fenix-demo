/**
 * =============================================================================
 * ProtectedRoute.tsx — Guarda de rutas privadas (capa de PRESENTACIÓN/CONTROL)
 * =============================================================================
 * PROPÓSITO
 *   Envuelve rutas que requieren sesión activa. Si el usuario no está
 *   autenticado, redirige a /login conservando la ruta de origen para volver
 *   tras el login.
 *
 * DEPENDENCIAS
 *   - react-router-dom (Navigate, useLocation, Outlet).
 *   - ../../hooks/auth/useAuth → estado de sesión (isAuthenticated, isLoading).
 *   - ../common/Spinner        → estado de carga.
 *
 * LÓGICA DE ESTADO
 *   - Mientras `isLoading` (verificación inicial de Supabase) muestra Spinner
 *     para evitar parpadeos/redirecciones prematuras.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/components/auth/ProtectedRoute.tsx
 *   2. Uso en App.tsx:
 *        <Route element={<ProtectedRoute />}>
 *          <Route path="/perfil" element={<PerfilPage />} />
 *        </Route>
 * =============================================================================
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'
import Spinner from '../common/Spinner'

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
