import { useEffect, useState } from 'react'

interface LiveStream {
  id: string
  title: string
  presenter: string
  status: 'live' | 'scheduled' | 'ended'
}

export default function LiveBanner() {
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([])

  useEffect(() => {
    // TODO: Obtener desde Supabase. Hasta entonces no se muestra ningún "EN VIVO" falso (auditoría A3).
    setLiveStreams([])
  }, [])

  const liveStreamsFiltered = liveStreams.filter(s => s.status === 'live')

  if (liveStreamsFiltered.length === 0) return null

  return (
    <section className="animate-fade-in-up">
      {liveStreamsFiltered.map((stream) => (
        <a
          key={stream.id}
          href={`/app/en-vivo/${stream.id}`}
          className="relative overflow-hidden rounded-3xl shadow-card bg-gradient-to-r from-red-600 to-red-700 hover:shadow-elevated transition-shadow active:scale-[0.98] duration-150 block group"
        >
          <div className="absolute inset-0 bg-[url('/brand/phoenix/phoenix_5_white.png')] bg-no-repeat bg-right-bottom opacity-10 bg-[length:120px]"></div>
          <div className="relative z-10 flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[28px] filled">podcasts</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    EN VIVO
                  </span>
                </div>
                <p className="text-white font-bold text-sm leading-tight">{stream.title}</p>
                <p className="text-white/80 text-xs mt-0.5">{stream.presenter}</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-full p-2 group-hover:bg-white/20 transition-colors">
              <span className="material-symbols-outlined text-white">chevron_right</span>
            </div>
          </div>
        </a>
      ))}
    </section>
  )
}
