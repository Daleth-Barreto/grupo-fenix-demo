import type { APIRoute } from 'astro'

export const prerender = false
import { getAdminSupabase } from '../../../../lib/supabase-admin'

export const GET: APIRoute = async () => {
  const { data, error } = await getAdminSupabase()
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
