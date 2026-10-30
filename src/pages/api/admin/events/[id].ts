import type { APIRoute } from 'astro'

export const prerender = false
import { getAdminSupabase } from '../../../../lib/supabase-admin'

export const GET: APIRoute = async ({ params }) => {
  const { id } = params
  const { data, error } = await getAdminSupabase()
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { data, error } = await getAdminSupabase()
      .from('events')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 })
  }
}

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params
  const { data, error } = await getAdminSupabase()
    .from('events')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
