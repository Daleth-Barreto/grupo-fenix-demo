import { useCallback, useEffect, useState } from 'react'
import { adminFetch } from '../../lib/admin-fetch'
import { supabase } from '../../lib/supabase'
import { uploadToMedia } from './AdminForm'

interface MediaRow {
  id: string
  name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  path: string | null
}

const size = (bytes: number | null) => (bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '')

export default function MediaLibrary() {
  const [rows, setRows] = useState<MediaRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  const load = useCallback(async () => {
    const res = await adminFetch('/api/admin/media')
    const body = (await res.json().catch(() => ({}))) as { data?: MediaRow[]; error?: string }
    if (!res.ok) setError(body.error || 'No se pudieron cargar los archivos.')
    setRows(body.data ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const upload = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const { url, path } = await uploadToMedia(file)
      const res = await adminFetch('/api/admin/media', {
        method: 'POST',
        body: JSON.stringify({ name: file.name, file_url: url, file_type: file.type, file_size: file.size, bucket: 'media', path }),
      })
      if (!res.ok) throw new Error('El archivo se subió, pero no se pudo registrar.')
      setMessage('Archivo subido.')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (row: MediaRow) => {
    setConfirming(null)
    setError(null)
    setMessage(null)
    if (row.path) {
      const { error: storageError } = await supabase.storage.from('media').remove([row.path])
      if (storageError) return setError('No se pudo eliminar el archivo.')
    }
    const res = await adminFetch(`/api/admin/media/${row.id}`, { method: 'DELETE' })
    if (!res.ok) return setError('No se pudo eliminar el registro del archivo.')
    await load()
  }

  const copy = async (row: MediaRow) => {
    setError(null)
    try {
      await navigator.clipboard.writeText(row.file_url)
      setMessage('Dirección copiada.')
    } catch {
      setMessage(row.file_url)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <label htmlFor="media-upload" className="self-start inline-flex items-center gap-2 bg-secondary text-on-secondary px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-secondary-deep transition-colors min-h-[44px] cursor-pointer">
        <span className="material-symbols-outlined text-[20px]">upload</span>
        {busy ? 'Subiendo…' : 'Subir archivo'}
      </label>
      <input id="media-upload" type="file" disabled={busy} className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = '' }} />
      <p className="text-xs text-on-surface-variant">Hasta 20 MB. Para videos largos, usa un servicio de video y pega su dirección en la lección.</p>
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      {message && <p role="status" className="text-sm text-success break-all">{message}</p>}

      <div className="bg-white rounded-2xl border border-[#dce2f3] shadow-sm divide-y divide-[#dce2f3]">
        {rows === null && <p role="status" className="p-8 text-center text-sm text-on-surface-variant">Cargando…</p>}
        {rows?.length === 0 && <p className="p-8 text-center text-sm text-on-surface-variant">Todavía no hay archivos.</p>}
        {rows?.map((row) => (
          <article key={row.id} className="media-row p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {row.file_type?.startsWith('image/')
                ? <img src={row.file_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                : <span className="material-symbols-outlined text-[32px] text-outline flex-shrink-0">description</span>}
              <div className="min-w-0">
                <a href={row.file_url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary break-all underline">{row.name}</a>
                <p className="text-xs text-on-surface-variant">{size(row.file_size)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => copy(row)} className="px-3 py-2 rounded-lg text-sm font-semibold border border-[#dce2f3] text-primary min-h-[40px]">Copiar dirección</button>
              {confirming === row.id
                ? <button type="button" data-action="confirm-delete" onClick={() => remove(row)} className="px-3 py-2 rounded-lg text-sm font-semibold bg-error text-white min-h-[40px]">Sí, eliminar</button>
                : <button type="button" data-action="delete" onClick={() => setConfirming(row.id)} className="px-3 py-2 rounded-lg text-sm font-semibold text-error min-h-[40px]">Eliminar</button>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
