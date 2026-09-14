import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { family, budget, store, diet, cuisine, country, ingredients, recipeOnly, recipeName, familyProfiles } = await req.json();

    // Recipe only mode
    if (recipeOnly && recipeName) {
      const recipePrompt = `Generate a detailed recipe for "${recipeName}".
Diet: ${diet}. Cuisine: ${cuisine}.
Return ONLY valid JSON:
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
Keep steps clear. 5-8 steps. 6-12 ingredients. Follow ${diet} diet restrictions.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-5",
          max_tokens: 1500,
          messages: [{ role: "user", content: recipePrompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const recipe = JSON.parse(text.slice(start, end + 1));
      return NextResponse.json({ recipe });
    }

    const sym = country === "CA" ? "CA$" : "$";
    const ingredientNote = ingredients?.length > 0
      ? `The user already has: ${ingredients.join(", ")}. Prioritize using these first.`
      : "";

    const familyNote = familyProfiles?.length > 0
      ? `IMPORTANT - Family restrictions (MUST follow for ALL meals):
${familyProfiles.map((m: any) => `- ${m.name}: ${[...m.diets, ...m.allergies].join(", ") || "No restrictions"}`).join("\n")}`
      : "";

    const prompt = `You are GoEat AI. Generate a 7-day meal plan.
Family: ${family} people | Budget: ${sym}${budget} | Store: ${store} | Diet: ${diet} | Cuisine: ${cuisine}
${ingredientNote}
${familyNote}

Return ONLY valid JSON:
{
  "totalCost": 110.50,
  "savings": 34.50,
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
Rules: All 7 days Mon-Sun. totalCost under ${sym}${budget}. Prices realistic for ${store}. Follow ${diet} diet.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const result = JSON.parse(text.slice(start, end + 1));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
