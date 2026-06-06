import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Spinner from '../../components/common/Spinner'
import { useCourseById } from '../../hooks/api/useCourses'
import type { Module } from '../../types'

function AccordionModule({
  mod,
  courseId,
  defaultOpen = false,
}: {
  mod: Module
  courseId: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#dce2f3] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#f9f9ff] transition-colors text-left"
      >
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] font-bold text-[#75777e] uppercase tracking-wider">
            Módulo {mod.order}
          </span>
          <span className="text-[15px] font-semibold text-[#0a192f]">{mod.title}</span>
        </div>
        <span
          className="material-symbols-outlined text-[#0a192f] ml-4 transition-transform duration-300 flex-shrink-0"
          style={open ? { transform: 'rotate(180deg)' } : undefined}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="border-t border-[#dce2f3]">
          {mod.is_locked ? (
            <div className="px-4 py-5 flex items-center gap-3 text-[#44474d]">
              <span className="material-symbols-outlined text-[#c5c6cd]">lock</span>
              <p className="text-sm">Completa el módulo anterior para desbloquear.</p>
            </div>
          ) : mod.lessons.length === 0 ? (
            <div className="px-4 py-5 text-center text-sm text-[#75777e]">Sin lecciones disponibles aún.</div>
          ) : (
            <ul>
              {mod.lessons.map((lesson, i) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => navigate(`/cursos/${courseId}/video/${lesson.id}`)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 hover:bg-[#f0f3ff] transition-colors text-left group ${
                      i < mod.lessons.length - 1 ? 'border-b border-[#dce2f3]' : ''
                    } ${lesson.is_completed ? 'opacity-60' : ''}`}
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] flex-shrink-0 transition-colors ${
                        lesson.is_completed
                          ? 'text-[#0a192f]'
                          : 'text-[#0a192f] group-hover:text-[#fd761a]'
                      }`}
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {lesson.is_completed ? 'check_circle' : 'play_circle'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-[#0a192f] group-hover:text-[#fd761a] transition-colors ${lesson.is_completed ? 'line-through' : ''}`}>
                        {lesson.title}
                      </p>
                    </div>
                    <span className="text-xs text-[#75777e] whitespace-nowrap ml-2 flex-shrink-0">{lesson.duration}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default function CourseDashboardPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { course, isLoading } = useCourseById(id)

  if (isLoading) return <div className="min-h-screen bg-[#f9f9ff]"><TopBar showBack /><Spinner /></div>
  if (!course) return null

  const firstUnfinished = course.modules
    .flatMap((m) => m.lessons)
    .find((l) => !l.is_completed)

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-24">
      <TopBar title={course.title} showBack showMore />

      {/* Hero */}
      <div className="relative overflow-hidden px-5 pt-5 pb-7 mx-5 mt-4 rounded-2xl shadow-sm" style={{ background: '#0a192f' }}>
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-10 rounded-full"
          style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -40%)' }}
        />
        <div className="relative z-10">
          <h2 className="text-[20px] font-bold text-white leading-snug mb-1">{course.title}</h2>
          <p className="text-sm text-[#b9c7e4] mb-5">{course.description}</p>

          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-white">Tu Progreso</span>
            <span className="text-xs text-[#b9c7e4]">{course.progress}% completo</span>
          </div>
          <div className="w-full h-2.5 bg-[#39475f] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#fd761a] rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>
      </div>

      <main className="px-5 py-6 max-w-2xl mx-auto flex flex-col gap-4">
        {/* Botón continuar */}
        {firstUnfinished && (
          <button
            onClick={() => navigate(`/cursos/${id}/video/${firstUnfinished.id}`)}
            className="w-full bg-[#fd761a] hover:bg-orange-500 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.98]"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            Continuar donde lo dejé
          </button>
        )}

        {/* Módulos */}
        <h3 className="text-[17px] font-semibold text-[#0a192f] mt-2">Módulos del Curso</h3>

        <div className="flex flex-col gap-2">
          {course.modules.map((mod, i) => (
            <AccordionModule
              key={mod.id}
              mod={mod}
              courseId={id}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
