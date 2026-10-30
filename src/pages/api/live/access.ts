import type { APIRoute } from 'astro'

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const liveStreamId = body.liveStreamId as string | undefined

    if (!liveStreamId) {
      return new Response(JSON.stringify({ error: 'Falta liveStreamId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // TODO: FASE 4 - Validar sesión y inscripción con Supabase
    // Verificar que el usuario esté logueado e inscrito al curso/evento
    // Retornar URL firmada o directa de HLS desde Owncast

    return new Response(
      JSON.stringify({
        allowed: false,
        message: 'Validación pendiente - FASE 4',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
