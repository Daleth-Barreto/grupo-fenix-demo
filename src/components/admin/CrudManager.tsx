import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'
import AdminForm from './AdminForm'
import { SECTIONS, type FieldOption, type Lookups, type Row, type Section, type SectionName } from './crud-config'

const SOURCES = {
  users: { endpoint: '/api/admin/users', label: (r: Row) => r.full_name || 'Usuario sin nombre' },
  events: { endpoint: '/api/admin/events', label: (r: Row) => r.title },
  courses: { endpoint: '/api/admin/courses', label: (r: Row) => r.title },
}

async function send(url: string, method: string, body?: Row): Promise<any> {
  const res = await adminFetch(url, { method, ...(body ? { body: JSON.stringify(body) } : {}) })
  const json = (await res.json().catch(() => ({}))) as { error?: string }
  if (!res.ok) throw new Error(json.error || 'No se pudo completar la acción.')
  return json
}

/** Lista con buscar, crear, editar y eliminar para cualquier sección de crud-config. */
// `scope` limita la lista a un registro padre indicado en la URL, por ejemplo ?id=<sesión>.
export default function CrudManager({ section: name, scope }: { section: SectionName; scope?: { column: string; param: string } }) {
  const section: Section = SECTIONS[name]
  const scopeValue = useMemo(() => (scope ? new URLSearchParams(window.location.search).get(scope.param) ?? '' : ''), [scope])
  const listUrl = scope ? `${section.endpoint}?${scope.column}=${encodeURIComponent(scopeValue)}` : section.endpoint
  const [rows, setRows] = useState<Row[] | null>(null)
  const [lookups, setLookups] = useState<Lookups>({})
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Row | 'new' | null>(() => (section.canCreate && new URLSearchParams(window.location.search).has('nuevo') ? 'new' : null))
  const [confirming, setConfirming] = useState<string | null>(null)

  const sources = useMemo(() => [...new Set(section.fields.map((f) => f.source).filter(Boolean))] as Array<keyof typeof SOURCES>, [section])
  const needsUsers = name === 'enrollments' || name === 'certificates'

  const load = useCallback(async () => {
    try {
      setRows((await send(listUrl, 'GET')).data ?? [])
    } catch (err) {
      setRows([])
      setError(err instanceof Error ? err.message : 'No se pudo cargar la información.')
    }
  }, [listUrl])

  useEffect(() => {
    load()
    const wanted = new Set(sources)
    if (needsUsers) wanted.add('users')
    wanted.forEach(async (source) => {
      const list: Row[] = await send(SOURCES[source].endpoint, 'GET').then((r) => r.data ?? []).catch(() => [])
      setLookups((current) => ({ ...current, [source]: new Map(list.map((r) => [r.id, SOURCES[source].label(r)])) }))
    })
  }, [load, sources, needsUsers])

  const options = useMemo(() => {
    const out: Record<string, FieldOption[]> = {}
    for (const field of section.fields) {
      const map = field.source ? lookups[field.source] : undefined
      if (map) out[field.name] = [...map].map(([value, label]) => ({ value, label }))
    }
    return out
  }, [section, lookups])

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term || !rows) return rows ?? []
    return rows.filter((row) => section.columns.some((c) => c.value(row, lookups).toLowerCase().includes(term)))
  }, [rows, search, section, lookups])

  const run = async (action: () => Promise<unknown>) => {
    setError(null)
    try {
      await action()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar la acción.')
    }
  }

  if (editing) {
    const isNew = editing === 'new'
    return (
      <AdminForm
        title={`${isNew ? 'Nuevo' : 'Editar'}: ${section.singular}`}
        fields={section.fields}
        initial={isNew ? section.defaults?.() : section.toForm ? section.toForm(editing as Row) : (editing as Row)}
        options={options}
        validate={section.validate}
        onCancel={() => setEditing(null)}
        onSubmit={async (values) => {
          const body = { ...(section.fromForm ? section.fromForm(values) : values), ...(scope ? { [scope.column]: scopeValue } : {}) }
          await send(isNew ? section.endpoint : `${section.endpoint}/${(editing as Row).id}`, isNew ? 'POST' : 'PUT', body)
          setEditing(null)
          await load()
        }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <input type="search" aria-label={`Buscar ${section.singular}`} placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[12rem] max-w-md px-3 py-2.5 rounded-xl border border-[#dce2f3] text-sm focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none" />
        {section.canCreate && (
          <button type="button" data-action="new" onClick={() => setEditing('new')} className="inline-flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary-deep transition-colors min-h-[44px]">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo: {section.singular}
          </button>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-error">{error}</p>}

      <div className="bg-white rounded-2xl border border-[#dce2f3] shadow-sm divide-y divide-[#dce2f3]">
        {rows === null && <p role="status" className="p-8 text-center text-sm text-on-surface-variant">Cargando…</p>}
        {rows !== null && visible.length === 0 && <p className="crud-empty p-8 text-center text-sm text-on-surface-variant">{search ? 'Sin resultados.' : section.empty}</p>}
        {visible.map((row) => (
          <article key={row.id} className="crud-row p-4 sm:p-5 flex flex-wrap items-start justify-between gap-3">
            <dl className="flex-1 min-w-[14rem] grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
              {section.columns.map((column, index) => (
                <div key={column.label} className={index === 0 ? 'sm:col-span-2' : ''}>
                  <dt className="sr-only">{column.label}</dt>
                  <dd className={index === 0 ? 'font-semibold text-primary break-words' : 'text-sm text-on-surface-variant break-words'}>{column.value(row, lookups)}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-2">
              {section.link && <a href={section.link(row).href} className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-white min-h-[40px] inline-flex items-center">{section.link(row).label}</a>}
              {section.actions?.filter((a) => a.visible?.(row) ?? true).map((action) => (
                <button key={action.label} type="button" onClick={() => run(() => send(`${section.endpoint}/${row.id}`, 'PUT', action.patch(row)))} className="px-3 py-2 rounded-lg text-sm font-semibold bg-surface-container-low text-primary min-h-[40px]">{action.label}</button>
              ))}
              {section.canEdit !== false && <button type="button" data-action="edit" onClick={() => setEditing(row)} className="px-3 py-2 rounded-lg text-sm font-semibold border border-[#dce2f3] text-primary min-h-[40px]">Editar</button>}
              {section.canDelete && (confirming === row.id ? (
                <>
                  <button type="button" data-action="confirm-delete" onClick={() => { setConfirming(null); run(() => send(`${section.endpoint}/${row.id}`, 'DELETE')) }} className="px-3 py-2 rounded-lg text-sm font-semibold bg-error text-white min-h-[40px]">Sí, eliminar</button>
                  <button type="button" onClick={() => setConfirming(null)} className="px-3 py-2 rounded-lg text-sm font-semibold text-primary min-h-[40px]">No</button>
                </>
              ) : (
                <button type="button" data-action="delete" onClick={() => setConfirming(row.id)} className="px-3 py-2 rounded-lg text-sm font-semibold text-error min-h-[40px]">Eliminar</button>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
