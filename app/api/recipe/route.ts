import { NextRequest, NextResponse } from "next/server";
import { parseRecipe } from "../../lib/recipeFormat";

// One recipe per dish name, cached on Vercel's CDN. The first person to open
// a dish waits for the AI; everyone after gets it instantly.
export const maxDuration = 60;

const MODEL = "claude-haiku-4-5-20251001";

export async function GET(req: NextRequest) {
  const name = (req.nextUrl.searchParams.get("name") || "").trim().slice(0, 80);
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400, headers: { "Cache-Control": "no-store" } });

  const prompt = `Write a home-cooking recipe for "${name}" for 4 servings.
Output ONLY this exact plain-text format, nothing else:
PREP: 15 mins
COOK: 25 mins
SERVINGS: 4
DIFFICULTY: Easy
CALORIES: 480 kcal
INGREDIENTS:
- 600 g | Chicken breast
- 2 tbsp | Soy sauce
STEPS:
1. Short clear step.
2. Short clear step.
TIP: One tip that makes it better.

Rules: 6-12 ingredients, 5-8 short steps. CALORIES is a rough per-serving estimate.
LANGUAGE: Write EVERYTHING in English (ingredients, steps, tip), even when the dish comes from another country or its name is in another language. Use ingredient names a North American shopper would find at the store (e.g. "boneless chicken thighs", "soy sauce", "mirin"). If the name was typed in another language, figure out the dish and still answer in English.`;

  // Non-Latin scripts (Japanese, Chinese, Korean…) mean the model ignored the
  // English rule; such a recipe is never returned or cached.
  const NON_LATIN = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff]/;
  try {
    let recipe = parseRecipe("");
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: MODEL, max_tokens: 900, messages: [{ role: "user", content: attempt ? prompt + "\n\nIMPORTANT: your answer must be 100% English." : prompt }] }),
      });
      const data = await response.json();
      recipe = parseRecipe(data.content?.[0]?.text || "");
      const text = [...recipe.ingredients.map(i => i.name), ...recipe.steps].join(" ");
      if (!NON_LATIN.test(text)) break;
      recipe = parseRecipe("");
    }
    if (recipe.ingredients.length === 0 || recipe.steps.length === 0) {
      return NextResponse.json({ error: "No recipe returned" }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    return NextResponse.json({ recipe }, {
      // Cache good recipes at the edge for 30 days (and serve stale while refreshing).
      headers: { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("Recipe error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
