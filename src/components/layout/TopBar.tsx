import { useNavigate } from 'react-router-dom'

interface TopBarProps {
  /** Nombre de la sección actual (Inicio, Congresos, Perfil…). Se muestra bajo la marca. */
  title?: string
  showBack?: boolean
  showSettings?: boolean
  showMore?: boolean
  onMore?: () => void
}

export default function TopBar({
  title,
  showBack = false,
  showSettings = false,
  showMore = false,
  onMore,
}: TopBarProps) {
  const navigate = useNavigate()
  // Evita subtítulo redundante si alguien pasa la marca como título.
  const section = title && title !== 'Grupo FÉNIX' ? title : null

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#dce2f3] flex items-center justify-between px-5 h-16 shadow-sm">
      <div className="w-10 flex items-center">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="text-[#0a192f] hover:opacity-70 p-2 -ml-2 rounded-full transition-opacity active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
      </div>

      {/* Marca (solo letras) + sección actual */}
      <div className="flex flex-col items-center leading-tight">
        <span className="font-bold text-[#0a192f] text-[16px] tracking-tight">
          Grupo <span className="text-[#fd761a]">FÉNIX</span>
        </span>
        {section && (
          <span className="text-[11px] font-medium text-[#75777e] -mt-0.5 max-w-[60vw] truncate">
            {section}
          </span>
        )}
      </div>

      <div className="w-10 flex justify-end">
        {showSettings && (
          <button
            onClick={() => navigate('/configuracion')}
            className="text-[#0a192f] hover:opacity-70 p-2 -mr-2 rounded-full transition-opacity active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        )}
        {showMore && (
          <button
            onClick={onMore}
            className="text-[#75777e] hover:text-[#fd761a] p-2 -mr-2 rounded-full transition-colors active:scale-95 duration-150"
          >
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        )}
      </div>
    </header>
  )
}
