// Supabase Edge Function: genera una recomendación en lenguaje natural para
// un cliente de AI Patient Scoring usando un modelo de lenguaje real (Claude).
// El puntaje numérico sigue calculándose con la fórmula determinística en
// scoringService.js — esto sólo redacta la explicación/recomendación.
//
// Deploy: supabase functions deploy patient-insight
// Secret requerido: ANTHROPIC_API_KEY (Project Settings > Edge Functions > Secrets,
// o `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`)

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const MODEL = 'claude-haiku-4-5-20251001'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Falta configurar el secret ANTHROPIC_API_KEY en el proyecto de Supabase.')
    }

    const { patientName, score, priority, recencyDays, completedCount, cancellationRate } = await req.json()

    const prompt = `Sos un asistente de un centro de estética y bienestar. Con estos datos de un cliente, escribí en
español, en un solo párrafo breve (máximo 3 oraciones), una explicación de su prioridad y una recomendación concreta
y accionable para el equipo (por ejemplo: contactarlo, ofrecerle un beneficio de fidelización, o no hacer nada por
ahora). No repitas los números crudos tal cual, redactalo en lenguaje natural.

Cliente: ${patientName}
Puntaje de prioridad: ${score}/100 (${priority})
Días desde el último turno: ${recencyDays ?? 'sin turnos registrados'}
Turnos realizados: ${completedCount}
Proporción de cancelaciones: ${Math.round((cancellationRate ?? 0) * 100)}%`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Anthropic API error: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const insight = data.content?.[0]?.text?.trim() ?? 'No se pudo generar una recomendación.'

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
