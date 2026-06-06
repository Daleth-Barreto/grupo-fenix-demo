/**
 * =============================================================================
 * ConfiguracionPage.tsx — Ajustes de la cuenta (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Centro de ajustes: cuenta, preferencias (toggles), información legal y zona
 *   de peligro (eliminar cuenta con confirmación en bottom sheet).
 *
 * DEPENDENCIAS
 *   - ../../components/layout/TopBar.
 *
 * LÓGICA DE ESTADO Y EFECTOS
 *   - Estado LOCAL de toggles y del diálogo de eliminación. En producción, cada
 *     toggle debería persistir vía un hook (p.ej. usePreferences) contra la API;
 *     aquí se mantiene local para la demo de UI.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/perfil/ConfiguracionPage.tsx
 *   2. Ruta: <Route path="/configuracion" element={<ConfiguracionPage />} />
 * =============================================================================
 */

import { useState } from 'react'

import TopBar from '../../components/layout/TopBar'
import Button from '../../components/common/Button'

interface ToggleSwitchProps {
  checked: boolean
  onChange: () => void
  id: string
}
function ToggleSwitch({ checked, onChange, id }: ToggleSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-secondary' : 'bg-surface-variant'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

interface RowProps {
  icon: string
  label: string
  sub?: string
  onPress?: () => void
}
function NavRow({ icon, label, sub, onPress }: RowProps) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center justify-between px-4 py-4 hover:bg-surface-container-low transition-colors border-b border-surface-variant/70 last:border-0 text-left active:scale-[0.98] duration-150"
    >
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
        <div>
          <p className="text-sm font-medium text-primary">{label}</p>
          {sub && <p className="text-xs text-outline mt-0.5">{sub}</p>}
        </div>
      </div>
      <span className="material-symbols-outlined text-outline-variant text-[20px]">chevron_right</span>
    </button>
  )
}

interface ToggleRowProps {
  icon: string
  label: string
  checked: boolean
  onChange: () => void
  id: string
}
function ToggleRow({ icon, label, checked, onChange, id }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-surface-variant/70 last:border-0">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
        <p className="text-sm font-medium text-primary">{label}</p>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} id={id} />
    </div>
  )
}

export default function ConfiguracionPage() {
  const [notifEvents, setNotifEvents] = useState(true)
  const [emails, setEmails] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)

  return (
    <div className="min-h-screen bg-surface-soft">
      <TopBar title="Configuración" showBack />

      <main className="px-5 py-6 flex flex-col gap-5 max-w-xl mx-auto pb-12">
        {/* Cuenta */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-bold text-primary uppercase tracking-widest ml-1">Cuenta</h2>
          <div className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden">
            <NavRow icon="person" label="Información personal" />
            <NavRow icon="lock" label="Cambiar contraseña" />
            <NavRow icon="credit_card" label="Métodos de pago" />
          </div>
        </section>

        {/* Preferencias */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-bold text-primary uppercase tracking-widest ml-1">Preferencias</h2>
          <div className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden">
            <ToggleRow icon="notifications" label="Notificaciones de eventos" checked={notifEvents} onChange={() => setNotifEvents((v) => !v)} id="t1" />
            <ToggleRow icon="mail" label="Correos promocionales" checked={emails} onChange={() => setEmails((v) => !v)} id="t2" />
            <NavRow icon="high_quality" label="Calidad de video" sub="Solo WiFi" />
          </div>
        </section>

        {/* Acerca de */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-bold text-primary uppercase tracking-widest ml-1">Acerca de</h2>
          <div className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden">
            <NavRow icon="description" label="Términos y condiciones" />
            <NavRow icon="policy" label="Aviso de privacidad" />
          </div>
        </section>

        {/* Zona de peligro */}
        <section className="flex flex-col gap-2">
          <h2 className="text-[11px] font-bold text-error uppercase tracking-widest ml-1">Zona de Peligro</h2>
          <div className="bg-surface rounded-3xl shadow-card border border-surface-variant/70 overflow-hidden">
            <button
              onClick={() => setDeleteDialog(true)}
              className="w-full flex items-center gap-4 px-4 py-4 hover:bg-error-container transition-colors text-left"
            >
              <span className="material-symbols-outlined text-error text-[22px]">delete</span>
              <span className="text-sm font-bold text-error">Eliminar mi cuenta</span>
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-outline mt-4">Grupo FÉNIX App v1.0.0</p>
      </main>

      {/* Bottom sheet de confirmación */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/50 backdrop-blur-sm">
          <div className="bg-surface rounded-t-3xl w-full max-w-md p-6 flex flex-col gap-4 animate-slide-up">
            <div className="w-12 h-1 bg-surface-variant rounded-full mx-auto mb-2" />
            <h3 className="text-[18px] font-bold text-primary">¿Eliminar tu cuenta?</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Esta acción es permanente. Perderás acceso a todos tus cursos, constancias y datos. No se puede deshacer.
            </p>
            <Button variant="danger" fullWidth>Sí, eliminar mi cuenta</Button>
            <Button variant="secondary" fullWidth onClick={() => setDeleteDialog(false)}>Cancelar</Button>
          </div>
        </div>
      )}
    </div>
  )
}
