import { useState, useEffect } from 'react'
import { parseDate } from '../../utils/format'

interface Props {
  targetDate: string
}

function Unit({ value, label }: { value: number | null; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[22px] font-bold leading-tight text-white">
        {value === null ? '--' : String(value).padStart(2, '0')}
      </span>
      <span className="text-[11px] font-semibold text-primary-fixed-dim tracking-widest">{label}</span>
    </div>
  )
}

const remaining = (targetDate: string) => {
  const diff = Math.max(0, parseDate(targetDate).getTime() - Date.now())
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  }
}

export default function Countdown({ targetDate }: Props) {
  // Empieza vacío y se llena en el navegador: la hora del build nunca coincide con la del
  // cliente, y esa diferencia rompe la hidratación de React (error #418).
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null)

  useEffect(() => {
    setTime(remaining(targetDate))
    const id = setInterval(() => setTime(remaining(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="glass-on-navy rounded-2xl p-4 flex items-center justify-between">
      <Unit value={time?.days ?? null} label="DÍAS" />
      <span className="text-primary-fixed-dim font-bold">:</span>
      <Unit value={time?.hours ?? null} label="HORAS" />
      <span className="text-primary-fixed-dim font-bold">:</span>
      <Unit value={time?.mins ?? null} label="MIN" />
      <span className="text-primary-fixed-dim font-bold">:</span>
      <Unit value={time?.secs ?? null} label="SEG" />
    </div>
  )
}
