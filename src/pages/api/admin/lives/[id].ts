import type { APIRoute } from 'astro'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../../types/database.types'

const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params
    const body = await request.json()
    const { data, error } = await supabase
      .from('lives')
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
  const { data, error } = await supabase
    .from('lives')
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify({ data }), { status: 200, headers: { 'Content-Type': 'application/json' } })
}
