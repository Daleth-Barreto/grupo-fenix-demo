import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'

interface Summary { enrolled: number; courses: number; certificates: number }

const STATS = [
  { key: 'enrolled', icon: 'local_activity', label: 'Inscritos', path: '/app/mis-eventos' },
  { key: 'courses', icon: 'play_circle', label: 'Cursos', path: '/app/cursos' },
  { key: 'certificates', icon: 'workspace_premium', label: 'Constancias', path: '/app/constancias' },
] as const

// Si no se puede cargar muestra "—": nunca un número inventado.
export default function DashboardStats() {
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    adminFetch('/api/account/summary')
      .then(async (res) => { if (res.ok) setSummary((await res.json()) as Summary) })
      .catch(() => {})
  }, [])

  return (
    <section className="grid grid-cols-3 gap-3 -mt-4 animate-fade-in-up">
      {STATS.map((stat) => (
        <a key={stat.key} href={stat.path} className="bg-surface rounded-2xl border border-surface-variant/70 shadow-card px-3 py-4 flex flex-col items-center gap-1 active:scale-95 transition-transform hover:shadow-elevated">
          <span className="material-symbols-outlined text-secondary text-[24px] filled">{stat.icon}</span>
          <span className="text-[18px] font-bold text-primary leading-none">{summary ? summary[stat.key] : '—'}</span>
          <span className="text-[11px] text-on-surface-variant font-medium">{stat.label}</span>
        </a>
      ))}
    </section>
  )
}
