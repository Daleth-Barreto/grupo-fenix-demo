import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'

let client: SupabaseClient<Database> | null = null

/**
 * Cliente de Supabase para los endpoints de /api/admin.
 * Se crea al primer uso, no al cargar el módulo, para que el build
 * no falle cuando faltan las variables de entorno.
 */
export function getAdminSupabase(): SupabaseClient<Database> {
  if (!client) {
    const url = import.meta.env.PUBLIC_SUPABASE_URL
    const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Faltan PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY')
    }
    client = createClient<Database>(url, key)
  }
  return client
}
