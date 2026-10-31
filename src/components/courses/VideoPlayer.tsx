import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

interface Props {
  backHref: string
  instructor: string
  courseTitle: string
  lessonTitle: string
  duration: string
  videoUrl?: string
}

// Reproductor real: si la lección no tiene video lo dice, en vez de simular controles.
export default function VideoPlayer({ backHref, instructor, courseTitle, lessonTitle, duration, videoUrl }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    if (videoUrl.includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(videoUrl)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) setError(true) })
      return () => hls.destroy()
    }
    video.src = videoUrl
  }, [videoUrl])

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="bg-black w-full relative" style={{ aspectRatio: '16/9' }}>
        <a href={backHref} aria-label="Volver al curso" className="absolute top-3 left-3 z-20 text-white bg-black/60 backdrop-blur-sm rounded-full p-2.5 hover:bg-black/80 transition-colors active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </a>
        {videoUrl && !error ? (
          <video ref={videoRef} className="w-full h-full" controls playsInline onError={() => setError(true)} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <span className="material-symbols-outlined text-[48px] mb-2">videocam_off</span>
            <p className="text-sm">{error ? 'No se pudo cargar el video.' : 'El video de esta lección todavía no está disponible.'}</p>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 py-4 bg-surface flex-1">
        <h1 className="text-[17px] sm:text-[18px] font-bold text-primary leading-snug">{lessonTitle}</h1>
        <p className="text-xs text-on-surface-variant mt-2">{instructor} · {courseTitle}</p>
        <p className="text-xs text-outline mt-1">Duración: {duration}</p>
      </div>
    </div>
  )
}
