import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { adminFetch } from '../../lib/admin-fetch'

interface Props {
  backHref: string
  instructor: string
  courseTitle: string
  lessonTitle: string
  duration: string
  videoUrl?: string
  isVideo?: boolean
  lessonId?: string
}

const SAVE_EVERY_SECONDS = 15

// Reproductor real: si la lección no tiene video lo dice, en vez de simular controles.
export default function VideoPlayer({ backHref, instructor, courseTitle, lessonTitle, duration, videoUrl, isVideo = true, lessonId }: Props) {
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

  // Continuar donde se quedó: guarda cada cierto tiempo y al pausar.
  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl || !lessonId) return
    const url = `/api/lessons/${encodeURIComponent(lessonId)}/position`
    let lastSaved = 0
    let resume = 0

    const save = () => {
      const seconds = Math.floor(video.currentTime)
      if (seconds === lastSaved) return
      lastSaved = seconds
      adminFetch(url, { method: 'PUT', body: JSON.stringify({ seconds }) }).catch(() => {})
    }
    const onTime = () => { if (Math.abs(video.currentTime - lastSaved) >= SAVE_EVERY_SECONDS) save() }
    const seek = () => {
      // Si casi lo terminó, vuelve a empezar en lugar de saltar al final.
      if (resume > 0 && (!video.duration || resume < video.duration - 10)) video.currentTime = resume
    }

    adminFetch(url)
      .then(async (res) => {
        if (!res.ok) return
        resume = ((await res.json()) as { seconds: number }).seconds
        lastSaved = resume
        if (video.readyState >= 1) seek()
      })
      .catch(() => {})

    video.addEventListener('loadedmetadata', seek)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('pause', save)
    return () => {
      video.removeEventListener('loadedmetadata', seek)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('pause', save)
    }
  }, [videoUrl, lessonId])

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="bg-black w-full relative" style={isVideo || videoUrl ? { aspectRatio: '16/9' } : { height: '4.5rem' }}>
        <a href={backHref} aria-label="Volver al curso" className="absolute top-3 left-3 z-20 text-white bg-black/60 backdrop-blur-sm rounded-full p-2.5 hover:bg-black/80 transition-colors active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </a>
        {videoUrl && !error ? (
          <video ref={videoRef} className="w-full h-full" controls playsInline onError={() => setError(true)} />
        ) : !isVideo ? null : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <span className="material-symbols-outlined text-[48px] mb-2">videocam_off</span>
            <p className="text-sm">{error ? 'No se pudo cargar el video.' : 'El video de esta lección todavía no está disponible.'}</p>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 py-4 bg-surface flex-1">
        <h1 className="text-[17px] sm:text-[18px] font-bold text-primary leading-snug">{lessonTitle}</h1>
        <p className="text-xs text-on-surface-variant mt-2">{instructor ? `${instructor} · ` : ''}{courseTitle}</p>
        {duration && <p className="text-xs text-outline mt-1">Duración: {duration}</p>}
      </div>
    </div>
  )
}
