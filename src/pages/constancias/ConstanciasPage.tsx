import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Spinner from '../../components/common/Spinner'
import { useConstancias } from '../../hooks/api/useCourses'

export default function ConstanciasPage() {
  const { constancias, isLoading } = useConstancias()

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-24">
      <TopBar title="Constancias" showBack />

      <main className="px-5 pt-5 pb-10 max-w-2xl mx-auto">
        <section className="mb-7 text-center">
          <h1 className="text-[28px] font-bold text-[#0f2a44]">Constancias</h1>
          <p className="text-sm text-[#44474d] mt-1.5">Aquí encontrarás los certificados de tus eventos</p>
        </section>

        {isLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {constancias.map((c) => (
              <article
                key={c.id}
                className="bg-white shadow-sm border border-[#dce2f3] p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-300 relative overflow-hidden rounded-2xl"
              >
                {/* Glow decorativo */}
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#d6e3ff] rounded-full blur-3xl opacity-60 pointer-events-none" />

                {/* Preview */}
                <div className="w-full h-32 rounded-xl bg-[#0f2a44] flex items-center justify-center relative z-10 overflow-hidden">
                  {c.preview_url ? (
                    <img src={c.preview_url} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-white text-[44px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        workspace_premium
                      </span>
                      <span className="text-[#76849f] text-xs font-medium">Grupo FÉNIX</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="relative z-10">
                  <h3 className="text-[15px] font-semibold text-[#0f2a44] leading-snug">{c.title}</h3>
                  <p className="text-xs text-[#44474d] mt-1">{c.issued_at}</p>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 relative z-10">
                  <button className="flex-1 border border-[#0f2a44] text-[#0f2a44] text-sm font-semibold py-3 rounded-xl hover:bg-[#f0f3ff] transition-colors active:scale-[0.98]">
                    Descargar PDF
                  </button>
                  <button className="flex-1 bg-[#fe9511] text-white text-sm font-semibold py-3 rounded-xl hover:bg-orange-500 transition-colors shadow-sm active:scale-[0.98]">
                    Ver
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {!isLoading && constancias.length === 0 && (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[56px] text-[#c5c6cd] block mb-3">workspace_premium</span>
            <p className="text-sm text-[#44474d]">Aún no tienes constancias disponibles.</p>
            <p className="text-xs text-[#75777e] mt-1">Completa un evento o curso para obtener tu certificado.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
