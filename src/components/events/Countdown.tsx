import { useState, useEffect } from 'react'

interface Props {
  targetDate: string
}

export default function Countdown({ targetDate }: Props) {
  const calc = () => {
    const diff = Math.max(0, new Date(targetDate).getTime() - Date.now())
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
    }
  }

  const [time, setTime] = useState(calc)

  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [])

  const Unit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-[22px] font-bold leading-tight text-white">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] font-semibold text-primary-fixed-dim tracking-widest">{label}</span>
    </div>
  )

  return (
    <div className="glass-on-navy rounded-2xl p-4 flex items-center justify-between">
      <Unit value={time.days} label="DÍAS" />
      <span className="text-primary-fixed-dim font-bold">:</span>
      <Unit value={time.hours} label="HORAS" />
      <span className="text-primary-fixed-dim font-bold">:</span>
      <Unit value={time.mins} label="MIN" />
      <span className="text-primary-fixed-dim font-bold">:</span>
      <Unit value={time.secs} label="SEG" />
    </div>
  )
}
