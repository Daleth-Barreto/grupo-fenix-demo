import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

/** Acceso al panel. Solo se muestra si el servidor confirma que la cuenta es de admin o instructor. */
export default function AdminPanelLink() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    adminFetch('/api/admin/me')
      .then(async (res) => {
        if (!res.ok) return
        const { role } = (await res.json()) as { role?: string }
        setAllowed(role === 'admin' || role === 'instructor')
      })
      .catch(() => {})
  }, [])

  if (!allowed) return null

  return (
    <a id="admin-panel-link" href="/admin" className="flex items-center justify-between gap-3 bg-primary text-white rounded-2xl px-4 py-4 shadow-card font-semibold text-sm min-h-[52px] active:scale-[0.98] transition-transform">
      <span className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
        Panel de administración
      </span>
      <span className="material-symbols-outlined">chevron_right</span>
    </a>
  )
}
