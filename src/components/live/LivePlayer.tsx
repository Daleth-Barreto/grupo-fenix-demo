import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface LivePlayerProps {
  hlsUrl: string
  title: string
  presenter: string
}

export default function LivePlayer({ hlsUrl, title, presenter }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      })
      
      hls.loadSource(hlsUrl)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false)
        video.play().catch(() => {
          // Autoplay blocked, user needs to interact
        })
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Error al cargar la transmisión en vivo')
          setLoading(false)
        }
      })
      
      return () => {
        hls.destroy()
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari nativo
      video.src = hlsUrl
      const onLoaded = () => {
        setLoading(false)
        video.play().catch(() => {})
      }
      const onError = () => {
        setError('Error al cargar la transmisión en vivo')
        setLoading(false)
      }
      video.addEventListener('loadedmetadata', onLoaded)
      video.addEventListener('error', onError)
      return () => {
        video.removeEventListener('loadedmetadata', onLoaded)
        video.removeEventListener('error', onError)
      }
    } else {
      setError('Tu navegador no soporta reproducción HLS')
      setLoading(false)
    }
  }, [hlsUrl])

  return (
    <div className="w-full">
      <div className="bg-black w-full relative" style={{ aspectRatio: '16/9' }}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="w-9 h-9 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 text-white px-4 text-center">
            <span className="material-symbols-outlined text-[48px] mb-2">error</span>
            <p className="text-sm">{error}</p>
          </div>
        )}
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          webkit-playsinline="true"
        />
      </div>
      
      <div className="px-4 sm:px-5 py-4 bg-surface border-b border-surface-variant" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            EN VIVO
          </span>
        </div>
        <h1 className="text-[17px] sm:text-[18px] font-bold text-primary leading-snug">{title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          </div>
          <span className="text-xs sm:text-sm text-on-surface-variant font-medium">{presenter}</span>
        </div>
      </div>
    </div>
  )
}
