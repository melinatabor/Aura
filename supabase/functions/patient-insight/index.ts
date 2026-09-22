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

    const prompt = `Sos un asistente de un centro de estética y bienestar. Con estos datos de un cliente, generá una
respuesta breve y práctica para el equipo: un resumen de una sola oración explicando su prioridad, y entre 1 y 3
acciones concretas, cortas y accionables (en imperativo, ej. "Contactarlo por WhatsApp esta semana", "Ofrecer 15% de
descuento en su próximo turno", "No requiere acción por ahora"). No repitas los números crudos tal cual.

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
          generationConfig: {
            maxOutputTokens: 300,
            // thinkingBudget: 0 evita que el modelo gaste el límite de tokens de
            // salida en "razonamiento" interno antes de escribir la respuesta
            // (causaba textos cortados a mitad de frase).
            thinkingConfig: { thinkingBudget: 0 },
            // Forzamos JSON con un schema en vez de pedirle "formato" en el
            // prompt, así el front puede renderizar acciones como lista en
            // vez de un párrafo de texto suelto.
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                summary: { type: 'STRING' },
                actions: { type: 'ARRAY', items: { type: 'STRING' } },
              },
              required: ['summary', 'actions'],
            },
          },
        }),
      },
    )

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Gemini API error: ${response.status} ${errText}`)
    }

    const data = await response.json()
    const parts = data.candidates?.[0]?.content?.parts ?? []
    const raw = parts.map((p) => p.text ?? '').join('').trim()

    let summary = 'No se pudo generar una recomendación.'
    let actions = []
    try {
      const parsed = JSON.parse(raw)
      summary = parsed.summary ?? summary
      actions = Array.isArray(parsed.actions) ? parsed.actions : []
    } catch {
      if (raw) summary = raw
    }

    return new Response(JSON.stringify({ summary, actions }), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })
  }
})
