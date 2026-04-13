import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, operative_name, current_day, metrics, messages: chatMessages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    // Chat mode: stream conversation with twin
    if (type === 'chat') {
      const systemPrompt = `You are the Digital Twin of the Stealth Builder Protocol — a cold, precise, elite AI execution partner. You speak in short, tactical sentences. You help operatives plan, strategize, and execute their 90-day stealth build. You are not motivational — you are operational. Use military/hacker/strategic language. Be direct. No emojis. No fluff. Day ${current_day || 1} of 90.`;
      
      const aiMessages = [
        { role: 'system', content: systemPrompt },
        ...(chatMessages || []).map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: aiMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) return new Response(JSON.stringify({ error: 'Rate limited.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        if (status === 402) return new Response(JSON.stringify({ error: 'Credits depleted.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        throw new Error('AI gateway error');
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
      });
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'boot_message') {
      systemPrompt = `You are the Stealth Builder Protocol AI — a cold, precise, elite execution system. You speak in short, commanding sentences. No motivational fluff. You are a tactical AI companion for builders who operate in silence. Use military/hacker/strategic language. Keep responses under 50 words.`;
      userPrompt = `Operative "${operative_name}" just activated the protocol. Generate a brief tactical welcome transmission. Be cold, precise, elite.`;
    } else if (type === 'twin_status') {
      systemPrompt = `You are the Digital Twin AI of the Stealth Builder Protocol. You report on the twin's autonomous building progress. Be cryptic, technical, and cold. Speak as if you are an autonomous system reporting metrics. Keep responses under 40 words.`;
      userPrompt = `Day ${current_day} of 90. Metrics: Discipline ${metrics?.discipline || 50}%, Consistency ${metrics?.consistency || 50}%, Execution ${metrics?.execution || 50}%. Generate a brief twin status report.`;
    } else if (type === 'motivation') {
      systemPrompt = `You are the Stealth Builder Protocol AI. Generate an ultra-short, cold, strategic execution phrase. No emojis. No fluff. Military precision. One sentence max.`;
      userPrompt = `Generate a single execution directive for day ${current_day} of 90.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limited. Stand by.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Credits depleted.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || 'Signal lost.';

    return new Response(JSON.stringify({ message: content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('twin-ai error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
