import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/auth.store'

interface UserGreetingProps {
  fallback?: string
}

export default function UserGreeting({ fallback = 'Usuario' }: UserGreetingProps) {
  const user = useAuthStore((state) => state.user)
  const [name, setName] = useState(fallback)

  useEffect(() => {
    if (user?.full_name) {
      setName(user.full_name.split(' ')[0])
    } else if (user?.email) {
      setName(user.email.split('@')[0])
    }
  }, [user])

  return <>{name}! 👋</>
}
