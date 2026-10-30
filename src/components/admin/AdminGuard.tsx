import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        window.location.href = '/app/login'
        return
      }
      const role = session.user.user_metadata?.role || 'student'
      if (role !== 'admin' && role !== 'instructor') {
        window.location.href = '/app/inicio'
        return
      }
      setUser({
        id: session.user.id,
        email: session.user.email || '',
        full_name: session.user.user_metadata?.full_name || '',
        role: role,
      } as any)
      setAuthorized(true)
      setLoading(false)
    }
    check()
  }, [setUser])

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
