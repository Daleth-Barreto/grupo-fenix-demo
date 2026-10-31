import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'

export default function LogoutButton() {
  const clear = useAuthStore((state) => state.clear)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clear()
    window.location.href = '/app/login'
  }

  return (
    <button 
      onClick={handleLogout}
      className="text-primary hover:opacity-70 p-2.5 -mr-2 rounded-full transition-opacity active:scale-95 duration-150 min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Cerrar sesión"
    >
      <span className="material-symbols-outlined">logout</span>
    </button>
  )
}
