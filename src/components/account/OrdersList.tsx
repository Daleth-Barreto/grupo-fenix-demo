import { useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'
import { formatPrice } from '../../utils/format'

interface Order {
  id: string
  amount: number
  status: 'pagado' | 'cancelado' | 'reembolsado'
  created_at: string
  metadata: { event_title?: string } | null
}

const STATUS: Record<Order['status'], string> = {
  pagado: 'Pagado',
  cancelado: 'Cancelado',
  reembolsado: 'Reembolsado',
}

export default function OrdersList() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminFetch('/api/account/orders')
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: Order[]; error?: string }
        if (!res.ok) throw new Error(body.error || 'No se pudieron cargar tus comprobantes.')
        setOrders(body.data ?? [])
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  if (error) return <p role="alert" className="text-sm text-error text-center py-8">{error}</p>
  if (!orders) return <p role="status" className="text-sm text-on-surface-variant text-center py-8">Cargando comprobantes…</p>

  if (orders.length === 0) {
    return (
      <div className="bg-surface rounded-3xl p-8 text-center shadow-card border border-surface-variant/70">
        <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-outline text-[40px]">receipt_long</span>
        </div>
        <h2 className="text-lg font-bold text-primary mb-2">Sin comprobantes</h2>
        <p className="text-sm text-on-surface-variant mb-6">Aún no has realizado ningún pago</p>
        <a href="/app/congresos" className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-secondary-deep transition-colors active:scale-95">
          Ver congresos
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    )
  }

  return (
    <>
      {orders.map((order) => (
        <article key={order.id} className="bg-surface rounded-3xl p-5 shadow-card border border-surface-variant/70 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-primary leading-snug">{order.metadata?.event_title || 'Compra'}</h2>
            <span className="text-xs font-semibold text-on-surface-variant whitespace-nowrap">{STATUS[order.status] ?? order.status}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">
              {new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="font-bold text-primary">{formatPrice(order.amount)}</span>
          </div>
        </article>
      ))}
    </>
  )
}
