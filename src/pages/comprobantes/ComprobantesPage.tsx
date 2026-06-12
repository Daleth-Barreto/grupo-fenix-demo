/**
 * =============================================================================
 * ComprobantesPage.tsx — Historial de comprobantes/pagos (capa de VISTA)
 * =============================================================================
 * PROPÓSITO
 *   Lista los comprobantes de pago del usuario (recibos y facturas). Solo
 *   consume el hook `useComprobantes`.
 *
 * DEPENDENCIAS
 *   - ../../hooks/api/useComprobantes → datos.
 *   - ../../components/layout/*       → TopBar, BottomNav.
 *   - ../../components/common/Spinner.
 *   - ../../utils/format              → moneda y fechas.
 *
 * INTEGRACIÓN
 *   1. Guarda en: src/pages/comprobantes/ComprobantesPage.tsx
 *   2. Ruta: <Route path="/comprobantes" element={<ComprobantesPage />} />
 * =============================================================================
 */

import TopBar from '../../components/layout/TopBar'
import BottomNav from '../../components/layout/BottomNav'
import Spinner from '../../components/common/Spinner'
import { useComprobantes } from '../../hooks/api/useComprobantes'
import { formatPrice } from '../../utils/format'
import type { Receipt } from '../../types'

const STATUS_META: Record<Receipt['status'], { label: string; cls: string; icon: string }> = {
  pagado: { label: 'Pagado', cls: 'text-[#1b7d3f] bg-[#e3f6ea]', icon: 'check_circle' },
  pendiente: { label: 'Pendiente', cls: 'text-[#9d4300] bg-[#fff0e0]', icon: 'schedule' },
  reembolsado: { label: 'Reembolsado', cls: 'text-[#606060] bg-[#ececed]', icon: 'undo' },
}

function formatLongDate(date: string): string {
  return new Date(date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function ComprobantesPage() {
  const { receipts, isLoading } = useComprobantes()

  const totalPagado = receipts
    .filter((r) => r.status === 'pagado')
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-28">
      <TopBar title="Mis comprobantes" showBack />

      <main className="px-5 pt-6 pb-10 max-w-2xl mx-auto flex flex-col gap-5">
        {/* Resumen */}
        {!isLoading && receipts.length > 0 && (
          <section className="relative overflow-hidden rounded-3xl bg-navy-gradient shadow-hero p-6">
            <div className="absolute top-0 left-0 right-0 h-1 accent-line" />
            <img
              src="/brand/phoenix/phoenix_5_white.png"
              alt=""
              aria-hidden
              className="absolute -right-8 -bottom-10 w-44 opacity-[0.07] pointer-events-none select-none"
            />
            <div className="relative z-10">
              <p className="text-white/80 text-sm">Total pagado</p>
              <p className="text-[32px] font-bold text-white leading-tight mt-1">{formatPrice(totalPagado)}</p>
              <p className="text-[#b9c7e4] text-xs mt-1">{receipts.length} movimientos en tu historial</p>
            </div>
          </section>
        )}

        {isLoading ? (
          <Spinner />
        ) : receipts.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-[56px] text-[#c5c6cd] block mb-3">receipt_long</span>
            <p className="text-sm font-semibold text-[#0f2a44]">Aún no tienes comprobantes</p>
            <p className="text-xs text-[#75777e] mt-1">Tus recibos y facturas aparecerán aquí tras tu primera compra.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {receipts.map((r) => {
              const st = STATUS_META[r.status]
              return (
                <article
                  key={r.id}
                  className="bg-white rounded-3xl shadow-card border border-[#dce2f3] p-4 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#f0f3ff] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#0f2a44] text-[22px]">receipt_long</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#0f2a44] leading-snug">{r.concept}</h3>
                      <p className="text-xs text-[#75777e] mt-0.5">{formatLongDate(r.date)} · {r.method}</p>
                    </div>
                    <span className="text-[15px] font-bold text-[#0f2a44] whitespace-nowrap">{formatPrice(r.amount)}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#dce2f3] pt-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${st.cls}`}>
                        <span className="material-symbols-outlined text-[12px]">{st.icon}</span>
                        {st.label}
                      </span>
                      {r.has_invoice && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-[#0f2a44] bg-[#e7eefe] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">description</span>
                          Factura
                        </span>
                      )}
                    </div>
                    <button className="text-[#fe9511] hover:text-[#9d4300] transition-colors flex items-center gap-1 text-xs font-semibold active:scale-95">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      PDF
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
