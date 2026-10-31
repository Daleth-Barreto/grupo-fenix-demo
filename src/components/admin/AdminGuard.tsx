import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'

// El rol se verifica en el servidor (/api/admin/me) contra user_profiles.
// Ya no se usa user_metadata: el usuario puede editarlo desde el navegador.
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        window.location.href = '/app/login'
        return
      }

      const res = await fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) {
        window.location.href = '/app/inicio'
        return
      }
      const { role } = (await res.json()) as { role: string }
      if (role !== 'admin' && role !== 'instructor') {
        window.location.href = '/app/inicio'
        return
      }

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || '',
        role,
      } as any)
      setAuthorized(true)
      setLoading(false)
    }
    check()
  }, [setUser])

  // Los <script> de la página corren antes de que exista su DOM: ver utils/app-ready.ts
  useEffect(() => {
    if (authorized) {
      document.documentElement.dataset.appReady = 'true'
      document.dispatchEvent(new Event('app:ready'))
    }
  }, [authorized])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }
  if (!authorized) return null
  return <>{children}</>
}
