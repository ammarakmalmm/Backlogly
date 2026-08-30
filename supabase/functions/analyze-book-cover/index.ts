import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { image, mediaType } = await req.json();
    if (!image) throw new Error('No image provided');

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('Server not configured: missing ANTHROPIC_API_KEY');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType || 'image/webp', data: image } },
            { type: 'text', text: 'Look at this book cover photo. Reply with ONLY a JSON object (no markdown formatting, no other text) with keys "title", "author", and "publisher" containing the book title, author name(s), and publisher exactly as printed on the cover. Use an empty string for any field you cannot determine.' },
          ],
        }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Anthropic API error ${res.status}: ${detail}`);
    }

    const json = await res.json();
    const text = json.content?.[0]?.text ?? '{}';
    const cleaned = text.trim().replace(/^```json\s*|```$/g, '');
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }), {
      status: 400,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  }
});
