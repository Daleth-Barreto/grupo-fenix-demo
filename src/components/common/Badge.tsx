interface BadgeProps {
  label: string
  variant?: 'orange' | 'navy' | 'outline' | 'gold' | 'glass'
  icon?: string
  size?: 'sm' | 'md'
}

const VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  orange: 'bg-secondary text-on-secondary',
  navy: 'bg-primary text-on-primary',
  outline: 'border border-outline-variant text-on-surface-variant bg-surface',
  gold: 'text-primary',
  glass: 'glass-on-navy text-white',
}

export default function Badge({ label, variant = 'orange', icon, size = 'sm' }: BadgeProps) {
  const sizing = size === 'sm' ? 'text-[10px] px-2.5 py-1' : 'text-[11px] px-3 py-1.5'
  const goldStyle =
    variant === 'gold'
      ? { background: 'linear-gradient(90deg, #e7c873 0%, #fec627 100%)' }
      : undefined

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wider ${sizing} ${VARIANTS[variant]}`}
      style={goldStyle}
    >
      {icon && <span className="material-symbols-outlined text-[12px] filled">{icon}</span>}
      {label}
    </span>
  )
}
