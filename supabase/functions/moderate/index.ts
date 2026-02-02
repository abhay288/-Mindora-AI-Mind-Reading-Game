import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getOpenAIClient, corsHeaders } from "../_shared/openai.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, text, context } = await req.json();
    const openai = getOpenAIClient();

    let result;

    if (action === 'rewrite_question') {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a strict linguistic editor for a '20 Questions' game. Convert the input into a clear, concise 'Yes/No' question. Under 15 words. Return JSON: { \"rewritten\": string, \"is_valid\": boolean }" },
          { role: "user", content: `Input: "${text}". Context: ${JSON.stringify(context)}` }
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }
      });
      result = JSON.parse(completion.choices[0].message.content || "{}");

    } else if (action === 'moderate_entity') {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "Content Moderator. Analyze metadata. Flag offensive, sexual, hate, or PII. Return JSON: { \"flagged\": boolean, \"risk_score\": number, \"reason\": string }" },
          { role: "user", content: `Entity: "${text}". Desc: "${context?.description}"` }
        ],
        model: "gpt-4o-mini",
        response_format: { type: "json_object" }
      });
      const modResult = JSON.parse(completion.choices[0].message.content || "{}");

      // Log to moderation queue if flagged
      if (modResult.flagged || modResult.risk_score > 0.7) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from('moderation_queue').insert({
          entity_id: context?.entityId, // Optional link
          flagged_reason: modResult.reason,
          risk_score: modResult.risk_score,
          status: 'pending'
        });
      }
      result = modResult;
    } else {
      throw new Error("Invalid action");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
