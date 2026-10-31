import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import type { Field, FieldOption, Row } from './crud-config'

const inputClass = 'w-full px-4 py-3 rounded-xl border border-[#dce2f3] bg-surface focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none transition-all text-base'
const MAX_BYTES = 20 * 1024 * 1024

/** Sube un archivo al bucket media y devuelve su dirección pública. */
export async function uploadToMedia(file: File): Promise<{ url: string; path: string }> {
  if (file.size > MAX_BYTES) throw new Error('El archivo debe pesar máximo 20 MB.')
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-')
  const path = `${Date.now()}-${safeName}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
  if (error) throw new Error('No se pudo subir el archivo.')
  return { url: supabase.storage.from('media').getPublicUrl(path).data.publicUrl, path }
}

function toInput(field: Field, value: unknown): string {
  if (value === null || value === undefined) return ''
  if (field.type === 'date') return String(value).slice(0, 10)
  if (field.type === 'datetime') {
    const d = new Date(String(value))
    return Number.isNaN(d.getTime()) ? '' : new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
  }
  return String(value)
}

function fromInput(field: Field, value: unknown): unknown {
  if (field.type === 'checkbox') return Boolean(value)
  if (value === '' || value === undefined) return null
  if (field.type === 'number') return Number(value)
  if (field.type === 'datetime') return new Date(String(value)).toISOString()
  return value
}

interface Props {
  title: string
  fields: Field[]
  initial?: Row
  options?: Partial<Record<string, FieldOption[]>>
  validate?: (values: Row) => string | null
  onSubmit: (values: Row) => Promise<void>
  onCancel: () => void
}

export default function AdminForm({ title, fields, initial = {}, options = {}, validate, onSubmit, onCancel }: Props) {
  const [values, setValues] = useState<Row>(() => Object.fromEntries(fields.map((f) => [f.name, f.type === 'checkbox' ? Boolean(initial[f.name]) : toInput(f, initial[f.name])])))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (name: string, value: unknown) => setValues((current) => ({ ...current, [name]: value }))

  const upload = async (field: Field, file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      set(field.name, (await uploadToMedia(file)).url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el archivo.')
    } finally {
      setBusy(false)
    }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const row = Object.fromEntries(fields.map((f) => [f.name, fromInput(f, values[f.name])]))
    const problem = validate?.(row)
    if (problem) return setError(problem)
    setBusy(true)
    setError(null)
    try {
      await onSubmit(row)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.')
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} aria-label={title} className="admin-form bg-white rounded-2xl border border-[#dce2f3] shadow-sm p-5 sm:p-6 flex flex-col gap-4">
      <h2 className="font-semibold text-primary text-lg">{title}</h2>
      {fields.map((field) => {
        const id = `campo-${field.name}`
        const value = values[field.name]
        if (field.type === 'checkbox') {
          return (
            <label key={field.name} htmlFor={id} className="flex items-center gap-3 cursor-pointer text-sm text-primary">
              <input id={id} name={field.name} type="checkbox" checked={Boolean(value)} onChange={(e) => set(field.name, e.target.checked)} className="w-5 h-5 rounded accent-[#fe9511]" />
              {field.label}
            </label>
          )
        }
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-semibold text-primary">{field.label}{field.required ? ' *' : ''}</label>
            {field.type === 'textarea' ? (
              <textarea id={id} name={field.name} rows={4} required={field.required} value={value} onChange={(e) => set(field.name, e.target.value)} className={`${inputClass} resize-y`} />
            ) : field.type === 'select' ? (
              <select id={id} name={field.name} required={field.required} value={value} onChange={(e) => set(field.name, e.target.value)} className={inputClass}>
                {!field.required || !value ? <option value="">{field.required ? 'Elige una opción' : 'Ninguno'}</option> : null}
                {(field.options ?? options[field.name] ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : field.type === 'image' || field.type === 'file' ? (
              <div className="flex flex-col gap-2">
                <input id={id} name={field.name} type="url" placeholder="https://..." value={value} onChange={(e) => set(field.name, e.target.value)} className={inputClass} />
                <input aria-label={`Subir archivo para ${field.label}`} data-upload={field.name} type="file" accept={field.type === 'image' ? 'image/*' : undefined} onChange={(e) => upload(field, e.target.files?.[0])} className="text-sm" />
              </div>
            ) : (
              <input id={id} name={field.name} required={field.required} value={value} onChange={(e) => set(field.name, e.target.value)} className={inputClass}
                type={field.type === 'datetime' ? 'datetime-local' : field.type ?? 'text'} step={field.type === 'number' ? 'any' : undefined} min={field.type === 'number' ? 0 : undefined} />
            )}
            {field.help && <p className="text-xs text-on-surface-variant">{field.help}</p>}
          </div>
        )
      })}
      {error && <p role="alert" className="text-sm text-error">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-semibold hover:bg-secondary-deep transition-colors min-h-[48px] disabled:opacity-60">{busy ? 'Guardando…' : 'Guardar'}</button>
        <button type="button" onClick={onCancel} className="bg-white text-primary px-8 py-3 rounded-xl font-semibold border border-[#dce2f3] hover:bg-surface-container-low transition-colors min-h-[48px]">Cancelar</button>
      </div>
    </form>
  )
}
