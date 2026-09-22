// Supabase Edge Function: genera una recomendación en lenguaje natural para
// un cliente de AI Patient Scoring usando un modelo de lenguaje real (Google
// Gemini, tier gratis). El puntaje numérico sigue calculándose con la
// fórmula determinística en scoringService.js — esto sólo redacta la
// explicación/recomendación.
//
// Deploy: supabase functions deploy patient-insight
// Secret requerido: GEMINI_API_KEY (Project Settings > Edge Functions > Secrets,
// o `supabase secrets set GEMINI_API_KEY=...`) — se consigue gratis, sin
// tarjeta, en https://aistudio.google.com/apikey

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const MODEL = 'gemini-3.6-flash'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Falta configurar el secret GEMINI_API_KEY en el proyecto de Supabase.')
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // thinkingBudget: 0 evita que el modelo gaste el límite de tokens de
          // salida en "razonamiento" interno antes de escribir la respuesta
          // (causaba textos cortados a mitad de frase).
          generationConfig: { maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } },
        }),
      },
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const insight = parts.map((p) => p.text ?? '').join('').trim() || 'No se pudo generar una recomendación.'

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
