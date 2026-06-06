interface ProgressBarProps {
  value: number
  className?: string
  showLabel?: boolean
}

export default function ProgressBar({ value, className = '', showLabel = false }: ProgressBarProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-1.5 bg-[#dce2f3] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#fd761a] rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-[#44474d] w-8 text-right font-medium">{value}%</span>
      )}
    </div>
  )
}
