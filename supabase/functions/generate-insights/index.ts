import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { dataset_id } = await req.json();
    if (!dataset_id) return json({ error: "dataset_id required" }, 400);

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "unauthorized" }, 401);
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Fetch dataset + sample rows
    const { data: ds } = await admin.from("datasets").select("*").eq("id", dataset_id).eq("user_id", user.id).single();
    if (!ds) return json({ error: "dataset not found" }, 404);

    const { data: batch } = await admin.from("dataset_rows").select("rows").eq("dataset_id", dataset_id).eq("batch_index", 0).maybeSingle();
    const sample = ((batch?.rows as any[]) ?? []).slice(0, 30);

    const prompt = `You are a senior business analyst. Analyze this dataset and produce a concise executive summary.

Dataset: "${ds.name}"
Rows: ${ds.row_count}, Columns: ${ds.column_count}
Quality score: ${ds.quality_score}%
Columns: ${JSON.stringify(ds.columns)}
Sample rows (first 30):
${JSON.stringify(sample, null, 2)}

Write 4–6 short paragraphs covering:
1. What this dataset appears to contain (in plain English).
2. The most notable patterns, distributions, or outliers.
3. Data quality observations (missing values, duplicates, unusual ranges).
4. 2–3 concrete recommended next actions.

Be specific and reference actual column names and values. Do not use markdown headings — use plain paragraphs.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a senior business intelligence analyst who writes clear, actionable summaries." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      const body = await aiRes.text();
      console.error(`AI gateway ${aiRes.status}: ${body}`);
      return json({ error: "AI request failed", status: aiRes.status, details: body }, aiRes.status);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content ?? "No summary generated.";

    await admin.from("insights").insert({ dataset_id, kind: "summary", content });
    await admin.from("notifications").insert({
      user_id: user.id, type: "insight_ready",
      title: `AI summary ready for ${ds.name}`,
      body: content.slice(0, 140) + "…",
    });

    return json({ ok: true, content });
  } catch (e) {
    console.error("generate-insights error", e);
    return json({ error: e instanceof Error ? e.message : "unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
