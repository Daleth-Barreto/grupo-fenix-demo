import type { APIRoute } from 'astro'

export const prerender = false
import { getAdminSupabase } from '../../../../lib/supabase-admin'

export const GET: APIRoute = async () => {
  const { data, error } = await getAdminSupabase()
    .from('lives')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json()
    const { data, error } = await getAdminSupabase()
      .from('lives')
      .insert([body])
      .select()
      .single()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    return new Response(JSON.stringify({ data }), { status: 201, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 })
  }
}
