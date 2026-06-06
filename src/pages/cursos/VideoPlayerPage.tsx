import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourseById } from '../../hooks/api/useCourses'

type Tab = 'Descripción' | 'Recursos' | 'Comentarios'
const TABS: Tab[] = ['Descripción', 'Recursos', 'Comentarios']

const RESOURCES = [
  'Material de apoyo — Sesión 1.pdf',
  'Casos clínicos resueltos.pdf',
  'Referencias bibliográficas.pdf',
]

export default function VideoPlayerPage() {
  const { id = '', lessonId = '' } = useParams()
  const navigate = useNavigate()
  const { course } = useCourseById(id)
  const [playing, setPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('Descripción')
  const [progress, setProgress] = useState(35)

  const lesson = course?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === lessonId)

  return (
    <div className="min-h-screen bg-[#f9f9ff] flex flex-col">
      {/* Video Player */}
      <div className="bg-black w-full relative" style={{ aspectRatio: '16/9' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        {/* More options */}
        <button className="absolute top-4 right-4 z-20 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>

        {/* Play/Pause central */}
        <button
          onClick={() => setPlaying(!playing)}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-5 transition-all active:scale-95 border border-white/30">
            <span
              className="material-symbols-outlined text-white text-[44px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {playing ? 'pause' : 'play_arrow'}
            </span>
          </div>
        </button>

        {/* Barra de controles inferior */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 z-10"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white text-xs font-medium">
              {Math.floor((lesson?.duration ? parseInt(lesson.duration) * progress / 100 : 0))}:00
            </span>
            <div
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setProgress(Math.round(((e.clientX - rect.left) / rect.width) * 100))
              }}
            >
              <div className="h-full bg-[#fd761a] rounded-full relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#fd761a] rounded-full border-2 border-white shadow" />
              </div>
            </div>
            <span className="text-white text-xs font-medium">{lesson?.duration ?? '24:15'}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button className="text-white p-1">
                <span className="material-symbols-outlined text-[20px]">skip_previous</span>
              </button>
              <button className="text-white p-1">
                <span className="material-symbols-outlined text-[20px]">skip_next</span>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <button className="text-white p-1">
                <span className="material-symbols-outlined text-[20px]">closed_caption</span>
              </button>
              <button className="text-white p-1">
                <span className="material-symbols-outlined text-[20px]">fullscreen</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col">
        {/* Info de la lección */}
        <div className="px-5 py-4 bg-white border-b border-[#dce2f3]">
          <h1 className="text-[16px] font-bold text-[#0a192f] leading-snug">
            {lesson?.title ?? 'Fundamentos teóricos'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-7 h-7 rounded-full bg-[#f0f3ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-[#0a192f]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            </div>
            <span className="text-xs text-[#44474d] font-medium">{course?.instructor ?? 'Dr. Roberto Sánchez'}</span>
            <span className="mx-1 text-[#c5c6cd]">·</span>
            <span className="text-xs text-[#44474d]">{course?.title}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#dce2f3] bg-white px-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 mr-6 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab
                  ? 'text-[#fd761a] border-[#fd761a]'
                  : 'text-[#44474d] border-transparent hover:text-[#0a192f]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 px-5 py-5 max-w-2xl mx-auto w-full">
          {activeTab === 'Descripción' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#44474d] leading-relaxed">
                En esta primera sesión abordaremos los principios conceptuales que rigen la práctica clínica actual, incorporando evidencia sobre los protocolos diagnósticos y cómo la integración de nuevas tecnologías ha transformado el abordaje tópico del paciente.
              </p>
              <p className="text-sm text-[#44474d] leading-relaxed">
                Se enfatizará la importancia del razonamiento clínico estructurado y la toma de decisiones basada en evidencias recientes, estableciendo la base para los módulos avanzados que componen esta certificación profesional.
              </p>
              <div className="bg-[#f0f3ff] rounded-xl p-4 mt-2">
                <p className="text-xs font-semibold text-[#0a192f] mb-1">Lo que aprenderás</p>
                <ul className="text-xs text-[#44474d] flex flex-col gap-1.5 mt-2">
                  {['Principios del diagnóstico clínico moderno', 'Protocolos de atención basados en evidencia', 'Integración tecnológica en la práctica'].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[#fd761a] text-[14px] mt-0.5">check_circle</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'Recursos' && (
            <div className="flex flex-col gap-3">
              {RESOURCES.map((r) => (
                <div
                  key={r}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-[#dce2f3] flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#f0f3ff] flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#0a192f] text-[22px]">picture_as_pdf</span>
                  </div>
                  <span className="flex-1 text-sm text-[#0a192f] font-medium truncate">{r}</span>
                  <button className="text-[#fd761a] hover:text-orange-600 transition-colors active:scale-95">
                    <span className="material-symbols-outlined text-[22px]">download</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Comentarios' && (
            <div className="text-center py-12 text-[#44474d]">
              <span className="material-symbols-outlined text-[48px] text-[#c5c6cd] block mb-3">forum</span>
              <p className="text-sm">Los comentarios estarán disponibles próximamente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
