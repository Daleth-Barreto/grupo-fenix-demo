import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'

interface AuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, redirectTo = '/app/login' }: AuthGuardProps) {
  const { user, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          role: 'student',
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
        } as any)
      } else {
        setUser(null)
        if (typeof window !== 'undefined') {
          window.location.href = redirectTo
        }
      }
      setLoading(false)
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          role: 'student',
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
        } as any)
      } else {
        setUser(null)
        if (typeof window !== 'undefined' && event === 'SIGNED_OUT') {
          window.location.href = redirectTo
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, redirectTo])

  // Cuando los hijos ya están en el DOM, avisamos a los <script> de la página
  // (ver src/utils/app-ready.ts). Sin esto, sus botones no se conectan.
  useEffect(() => {
    if (!loading && user) {
      document.documentElement.dataset.appReady = 'true'
      document.dispatchEvent(new Event('app:ready'))
    }
  }, [loading, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
