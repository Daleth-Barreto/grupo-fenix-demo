import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'

export default function LogoutButtonProfile() {
  const clear = useAuthStore((state) => state.clear)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clear()
    window.location.href = '/app/login'
  }

  return (
    <button 
      onClick={handleLogout} 
      className="flex items-center justify-center gap-2.5 text-error text-sm font-bold hover:opacity-75 transition-opacity active:scale-95 px-4 mt-2"
    >
      <span className="material-symbols-outlined">logout</span>
      Cerrar sesión
    </button>
  )
}
