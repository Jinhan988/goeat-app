import { NextRequest, NextResponse } from "next/server";

// Give the AI up to 60s so long generations don't get cut off on Vercel.
export const maxDuration = 60;

// Fast model: much quicker than Sonnet for structured JSON like this.
// To go back to higher quality, change to "claude-sonnet-4-5".
const MODEL = "claude-haiku-4-5-20251001";

// Assumption behind "Estimated Savings":
// roughly what ONE restaurant/takeout dinner costs per person.
// Savings = (family x 7 dinners out) - (this week's grocery total).
// Tune these two numbers if you want the estimate more or less conservative.
const DINNER_OUT_PER_PERSON = { US: 12, CA: 14 };

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
      { "type": "Breakfast", "name": "Oatmeal with Banana", "calories": "340 kcal", "tip": "Quick 5-min breakfast" },
      { "type": "Lunch", "name": "Chicken Caesar Wrap", "calories": "480 kcal", "tip": "Great for lunchboxes" },
      { "type": "Dinner", "name": "Beef Stir-Fry with Rice", "calories": "620 kcal", "tip": "Use leftover rice tomorrow" }
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
Rules:
- All 7 days Mon-Sun, 3 meals each.
- The shopping list contains ONLY what the user still needs to buy.
- Plan a realistic, economical week. Keep the shopping list total within ${sym}${budget}, but do NOT pad it to reach the budget. Spending less than the budget is fine.
- Each item "price" is one number: the realistic ${store} price for the full quantity listed.
- Follow ${diet} diet.`;

    const result = await callClaude(prompt, 4500);

    // ---------- Compute totals in code (not by the AI) ----------
    const list = Array.isArray(result.shoppingList) ? result.shoppingList : [];
    let total = 0;
    for (const cat of list) {
      if (!Array.isArray(cat.items)) cat.items = [];
      for (const item of cat.items) {
        const price = Number(String(item.price ?? "").replace(/[^0-9.]/g, "")) || 0;
        item.price = Math.round(price * 100) / 100;
        total += item.price;
      }
    }
    result.shoppingList = list;
    result.totalCost = Math.round(total * 100) / 100;

    const perDinnerOut = country === "CA" ? DINNER_OUT_PER_PERSON.CA : DINNER_OUT_PER_PERSON.US;
    const eatingOutDinners = Number(family || 1) * 7 * perDinnerOut;
    result.savings = Math.max(0, Math.round((eatingOutDinners - result.totalCost) * 100) / 100);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
