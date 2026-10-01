import { NextRequest, NextResponse } from "next/server";

// Give the AI up to 60s so long generations don't get cut off on Vercel.
export const maxDuration = 60;

// Fast model: much quicker than Sonnet for structured JSON like this.
// To go back to higher quality, change to "claude-sonnet-4-5".
const MODEL = "claude-haiku-4-5-20251001";

// "Estimated Savings" = unspent budget (budget - actual grocery total).
// Simple and honest: what you didn't have to spend out of your weekly budget.

// Reference prices for common staples, used to anchor the AI so the same
// item doesn't cost wildly different amounts across different generations.
// Rough national averages, in local currency. Adjust as you get real data.
const PRICE_ANCHORS: Record<string, string> = {
  CA: `Eggs (dozen) ~CA$4.50, Milk (2L) ~CA$4.20, Chicken breast (1kg) ~CA$11-14, Ground beef (1kg) ~CA$10-13, Rice (2kg) ~CA$6, Bread (loaf) ~CA$3.50, Bananas (1kg) ~CA$1.70, Butter (454g) ~CA$5.50, Cheddar cheese (500g) ~CA$6.50, Pasta (500g) ~CA$2, Onions (1kg) ~CA$2.50, Potatoes (5lb bag) ~CA$5, Canned beans ~CA$1.80, Yogurt (750g) ~CA$5, Frozen vegetables (1kg) ~CA$4.50`,
  US: `Eggs (dozen) ~$3.50, Milk (1 gal) ~$3.80, Chicken breast (1lb) ~$4-5, Ground beef (1lb) ~$5-6, Rice (2lb) ~$3, Bread (loaf) ~$3, Bananas (1lb) ~$0.60, Butter (1lb) ~$4.50, Cheddar cheese (8oz) ~$3.50, Pasta (1lb) ~$1.50, Onions (1lb) ~$1, Potatoes (5lb bag) ~$4, Canned beans ~$1.20, Yogurt (32oz) ~$4.50, Frozen vegetables (1lb) ~$2.50`,
};

async function callClaude(prompt: string, maxTokens: number) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text: string = data.content?.[0]?.text || "";
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error(`No JSON returned (${data.error?.message || data.stop_reason || "unknown"})`);
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(req: NextRequest) {
  try {
    const { family, budget, store, diet, cuisine, country, ingredients, recipeOnly, recipeName, familyProfiles } = await req.json();

    // ---------- Recipe only mode ----------
    if (recipeOnly && recipeName) {
      const recipePrompt = `Generate a detailed recipe for "${recipeName}".
Diet: ${diet}. Cuisine: ${cuisine}.
Return ONLY valid JSON (no markdown):
{
  "prepTime": "15 mins",
  "cookTime": "25 mins",
  "servings": 4,
  "difficulty": "Easy",
  "calories": "480 kcal",
  "ingredients": [
    { "name": "Chicken breast", "qty": "600g" }
  ],
  "steps": [
    "Prepare all ingredients by washing and chopping.",
    "Heat oil in a large pan over medium-high heat.",
    "Cook the main ingredients thoroughly.",
    "Season generously and serve hot."
  ],
  "tip": "One key tip to make this dish even better."
}
Keep steps short and clear. 5-8 steps. 6-12 ingredients. Follow ${diet} diet restrictions.`;

      const recipe = await callClaude(recipePrompt, 1200);
      return NextResponse.json({ recipe });
    }

    // ---------- Meal plan mode ----------
    const sym = country === "CA" ? "CA$" : "$";

    const ingredientNote = ingredients?.length > 0
      ? `The user already has: ${ingredients.join(", ")}. Build meals around these first, and do NOT put them in the shopping list (the user does not need to buy them).`
      : "";

    const familyNote = familyProfiles?.length > 0
      ? `IMPORTANT - Family restrictions (MUST follow for ALL meals):
${familyProfiles.map((m: any) => `- ${m.name}: ${[...(m.diets || []), ...(m.allergies || [])].join(", ") || "No restrictions"}`).join("\n")}`
      : "";

    const prompt = `You are GoEat AI. Generate a 7-day meal plan.
Family: ${family} people | Budget: ${sym}${budget} | Store: ${store} | Diet: ${diet} | Cuisine: ${cuisine}
${ingredientNote}
${familyNote}

Return ONLY valid JSON (no markdown):
{
  "mealPlan": [
    { "day": "Monday", "meals": [
      { "type": "Breakfast", "name": "Oatmeal with Banana", "photoQuery": "oatmeal banana bowl", "calories": "340 kcal", "tip": "Quick 5-min breakfast" },
      { "type": "Lunch", "name": "Chicken Caesar Wrap", "photoQuery": "chicken caesar wrap", "calories": "480 kcal", "tip": "Great for lunchboxes" },
      { "type": "Dinner", "name": "Beef Stir-Fry with Rice", "photoQuery": "beef stir fry rice", "calories": "620 kcal", "tip": "Use leftover rice tomorrow" }
    ]}
  ],
  "shoppingList": [
    { "category": "Meat & Protein", "emoji": "🥩", "items": [{ "name": "Chicken breast", "qty": "2 kg", "price": 12.99 }] },
    { "category": "Produce", "emoji": "🥦", "items": [] },
    { "category": "Dairy & Eggs", "emoji": "🧀", "items": [] },
    { "category": "Pantry", "emoji": "🥫", "items": [] },
    { "category": "Grains", "emoji": "🍞", "items": [] },
    { "category": "Condiments", "emoji": "🧂", "items": [] }
  ],
  "wasteReduction": {
    "mealsFromLeftovers": 5,
    "estimatedWasteReduced": "2.1 kg",
    "co2Saved": "3.8 kg CO2",
    "moneySavedFromWaste": 14.20
  }
}
HARD BUDGET RULE:
- The sum of every item's "price" in shoppingList MUST add up to between ${sym}${Math.round(budget * 0.85)} and ${sym}${budget}. Not more than ${sym}${budget}. This is a strict limit, not a suggestion.
- Before you output the JSON, manually add up all the prices you're about to write. If the sum is over ${sym}${budget}, remove items, shrink quantities, or swap in cheaper staples/store-brand equivalents until it fits. Recheck the sum again after adjusting.
- To stay in budget: favor larger economy packs (better $/unit), in-season produce, and simple staples over premium or specialty items. Fewer, well-chosen items are better than many small ones.

Other rules:
- All 7 days Mon-Sun, 3 meals each.
- The shopping list contains ONLY what the user still needs to buy.
- No duplicate items: each distinct product should appear only once in the whole list.
- Follow ${diet} diet.
- "photoQuery": 2-4 plain English words for finding a matching food photo. Name what is visibly on the plate, most distinctive item first (e.g. "zucchini noodles meat sauce", "bacon eggs mushrooms"). No cuisine labels, adjectives, or words like "leftover", "easy", "homemade".

PER-ITEM PRICING (for accuracy and consistency):
- Reference prices for this country, to keep pricing realistic and consistent across different plans (adjust up/down for ${store} specifically, and for the exact quantity you list): ${PRICE_ANCHORS[country] || PRICE_ANCHORS.US}
- Price every item as if you were reading real shelf tags at ${store}. Use realistic package sizes actually sold there (e.g. "2 kg", "1 dozen", "454 g") rather than odd amounts.
- Prices should look like real prices (e.g. 6.49, 11.29) — avoid suspiciously flat numbers like 5.00, 10.00, 20.00 for everything.
- Every item price must be greater than 0.`;

    let result = await callClaude(prompt, 4500);

    // ---------- Compute totals in code (not by the AI) ----------
    const sumList = (r: any) => {
      const list = Array.isArray(r.shoppingList) ? r.shoppingList : [];
      let total = 0;
      for (const cat of list) {
        if (!Array.isArray(cat.items)) cat.items = [];
        // Drop items with no real price (garbage output) and de-dupe by name.
        const seen = new Set<string>();
        cat.items = cat.items.filter((item: any) => {
          const price = Number(String(item.price ?? "").replace(/[^0-9.]/g, "")) || 0;
          item.price = Math.round(price * 100) / 100;
          const key = String(item.name || "").trim().toLowerCase();
          if (item.price <= 0 || !key || seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        for (const item of cat.items) total += item.price;
      }
      r.shoppingList = list;
      return Math.round(total * 100) / 100;
    };

    let total = sumList(result);

    // Safety net: if the model still blew past budget, ask it once to trim
    // the exact list down rather than re-generating from scratch.
    const budgetNum = Number(budget) || 0;
    if (budgetNum > 0 && total > budgetNum) {
      const trimPrompt = `This shopping list totals ${sym}${total}, which is over the ${sym}${budgetNum} budget.
Shopping list JSON: ${JSON.stringify(result.shoppingList)}

Return ONLY the corrected "shoppingList" as valid JSON (same shape, no markdown), edited so the sum of all prices is at or under ${sym}${budgetNum}. Reduce quantities, remove the least essential items, or substitute cheaper alternatives. Keep it realistic for ${store}.
{ "shoppingList": [ ... ] }`;
      try {
        const trimmed = await callClaude(trimPrompt, 3000);
        if (Array.isArray(trimmed.shoppingList)) {
          result.shoppingList = trimmed.shoppingList;
          total = sumList(result);
        }
      } catch {
        // If the trim call fails, fall back to the original list/total as-is.
      }
    }

    result.totalCost = total;

    const budgetForSavings = Number(budget) || 0;
    result.savings = Math.max(0, Math.round((budgetForSavings - result.totalCost) * 100) / 100);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
