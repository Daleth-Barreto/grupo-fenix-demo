import { useState, useEffect } from 'react'

/**
 * Devuelve `true` cuando el scroll vertical supera el umbral dado.
 * Útil para colapsar headers tipo SliverAppBar.
 */
export function useScrollCollapse(threshold = 120): boolean {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setCollapsed(window.scrollY > threshold)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [threshold])

  return collapsed
}
