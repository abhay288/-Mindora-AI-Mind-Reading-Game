import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getOpenAIClient, corsHeaders } from "../_shared/openai.ts";

console.log("Hello from Deduplicate Function!");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name } = await req.json();
    if (!name) throw new Error("Name is required");

    // 1. Generate Embedding
    const openai = getOpenAIClient();
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: name,
    });
    const embedding = embeddingResponse.data[0].embedding;

    // 2. Query Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Call RPC 'match_entities'
    const { data: matches, error } = await supabase.rpc('match_entities', {
      query_embedding: embedding,
      match_threshold: 0.80,
      match_count: 5
    });

    if (error) throw error;

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
