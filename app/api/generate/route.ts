import { NextRequest, NextResponse } from "next/server";
import { FEED } from "../../lib/feed";

// Dishes that have a fixed photo in the app. Using these names in a plan
// means those meals always show a real photo.
const PLAN_DISHES = FEED.filter(d => !d.noPlan).map(d => `${d.name} (${d.meal}${d.tags.includes("vegetarian") ? ", vegetarian" : ""})`);

// A different random handful each time, so plans don't keep landing on the
// same photo dishes.
function photoDishSample(n: number): string {
  const a = [...PLAN_DISHES];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a.slice(0, n).join("; ");
}

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

async function callClaudeText(prompt: string, maxTokens: number): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await response.json();
  return data.content?.[0]?.text || "";
}

const CATEGORY_EMOJI: Record<string, string> = {
  "Meat & Protein": "🥩", "Produce": "🥦", "Dairy & Eggs": "🧀", "Pantry": "🥫", "Grains": "🍞", "Condiments": "🧂", "Frozen": "🧊", "Bakery": "🥖", "Other": "🛒",
};

// Compact list format (much shorter than JSON, so it comes back faster):
// "Category | Item | Qty | Price" per line.
function parseShoppingLines(text: string): ShoppingCategory[] {
  const cats = new Map<string, ShoppingCategory>();
  for (const raw of text.split("\n")) {
    const parts = raw.replace(/^[-*•\s]+/, "").split("|").map(x => x.trim());
    if (parts.length < 4) continue;
    const [catRaw, name, qty, priceRaw] = parts;
    const price = Number(priceRaw.replace(/[^0-9.]/g, ""));
    if (!name || !(price > 0) || /^item$/i.test(name)) continue;
    const category = Object.keys(CATEGORY_EMOJI).find(c => c.toLowerCase() === catRaw.toLowerCase()) || "Other";
    if (!cats.has(category)) cats.set(category, { category, emoji: CATEGORY_EMOJI[category], items: [] });
    cats.get(category)!.items.push({ name, qty, price });
  }
  return Array.from(cats.values());
}

type ShoppingCategory = { category?: string; emoji?: string; items: { name?: string; qty?: string; price?: unknown }[] };

// Sum the shopping list in code (not by the AI). Drops unpriced items and duplicates.
function sumList(r: { shoppingList?: unknown }): number {
  const list = (Array.isArray(r.shoppingList) ? r.shoppingList : []) as ShoppingCategory[];
  let total = 0;
  for (const cat of list) {
    if (!Array.isArray(cat.items)) cat.items = [];
    const seen = new Set<string>();
    cat.items = cat.items.filter((item) => {
      const price = Number(String(item.price ?? "").replace(/[^0-9.]/g, "")) || 0;
      item.price = Math.round(price * 100) / 100;
      const key = String(item.name || "").trim().toLowerCase();
      if ((item.price as number) <= 0 || !key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    for (const item of cat.items) total += item.price as number;
  }
  r.shoppingList = list;
  return Math.round(total * 100) / 100;
}

// If the list is over budget, ask the model once to trim it. Returns the new total.
async function trimToBudget(r: { shoppingList?: unknown }, total: number, budgetNum: number, sym: string, store: string): Promise<number> {
  if (!(budgetNum > 0 && total > budgetNum)) return total;
  const trimPrompt = `This shopping list totals ${sym}${total}, which is over the ${sym}${budgetNum} budget.
Shopping list JSON: ${JSON.stringify(r.shoppingList)}

Return ONLY the corrected "shoppingList" as valid JSON (same shape, no markdown), edited so the sum of all prices is at or under ${sym}${budgetNum}. Reduce quantities, remove the least essential items, or substitute cheaper alternatives. Keep it realistic for ${store}.
{ "shoppingList": [ ... ] }`;
  try {
    const trimmed = await callClaude(trimPrompt, 3000);
    if (Array.isArray(trimmed.shoppingList)) {
      r.shoppingList = trimmed.shoppingList;
      return sumList(r);
    }
  } catch {
    // Keep the original list if the trim call fails.
  }
  return total;
}

const SHOPPING_SHAPE = `"shoppingList": [
    { "category": "Meat & Protein", "emoji": "🥩", "items": [{ "name": "Chicken breast", "qty": "2 kg", "price": 12.99 }] },
    { "category": "Produce", "emoji": "🥦", "items": [] },
    { "category": "Dairy & Eggs", "emoji": "🧀", "items": [] },
    { "category": "Pantry", "emoji": "🥫", "items": [] },
    { "category": "Grains", "emoji": "🍞", "items": [] },
    { "category": "Condiments", "emoji": "🧂", "items": [] }
  ]`;

// Budget-first planning: the meal plan itself must fit the grocery budget,
// not just the shopping list afterwards.
function budgetRules(budget: unknown, family: unknown, sym: string, store: string, strict: boolean) {
  const b = Number(budget) || 0;
  const people = Math.max(1, Number(family) || 1);
  if (!(b > 0)) return "";
  const perServing = b / (people * 21);
  const tight = strict || perServing < 3.5;
  const bulk = /costco|sam'?s|bj'?s/i.test(store);
  return `BUDGET FIRST (most important rule): every ingredient for all 21 meals must be buyable for ${sym}${b} total at ${store} for ${people} people.
That is about ${sym}${perServing.toFixed(2)} per person per meal${tight ? ", which is a TIGHT budget" : ""}. Plan the meals so the grocery list fits it:
- Build the whole week from a small shared base: ${tight ? "2-3" : "3-4"} main proteins bought in family packs and used across several dishes in different styles, plus a few versatile vegetables and one or two starches (rice, pasta, potatoes, tortillas, bread).
- Breakfasts: rotate ${tight ? "2-3" : "3-4"} cheap options (eggs, oats, toast, yogurt, pancakes); repeating a breakfast is fine.
- Lunches: mostly leftovers from the night before, turned into a different dish (stir-fry → fried rice, roast chicken → wraps).
${tight ? `- Favor cheap protein: eggs, beans, lentils, tofu, chicken thighs, ground meat, canned fish. Skip pricey items (steak, salmon, shrimp, lamb, nuts, specialty sauces, fresh herbs used once).
` : `- Use pricier items (salmon, steak, shrimp) at most once or twice a week.
`}${bulk ? `- ${store} sells big packs: plan meals that use up each pack across the week instead of buying many different packs.
` : ""}- Variety still matters, but never at the cost of the budget.`;
}

function pricingRules(country: string, store: string) {
  return `PER-ITEM PRICING (for accuracy and consistency):
- Reference prices for this country, to keep pricing realistic and consistent across different plans (adjust up/down for ${store} specifically, and for the exact quantity you list): ${PRICE_ANCHORS[country] || PRICE_ANCHORS.US}
- Price every item as if you were reading real shelf tags at ${store}. Use realistic package sizes actually sold there (e.g. "2 kg", "1 dozen", "454 g") rather than odd amounts.
- Prices should look like real prices (e.g. 6.49, 11.29) — avoid suspiciously flat numbers like 5.00, 10.00, 20.00 for everything.
- Every item price must be greater than 0.`;
}

export async function POST(req: NextRequest) {
  try {
    const { family, budget, store, diet, cuisine, country, ingredients, recipeOnly, recipeName, familyProfiles,
      pinnedMeals, includeMeals, swapMeal, avoidMeals, shoppingFromPlan, mealsOnly, previousPlanMeals, trimList, strictBudget } = await req.json();

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

    const sym = country === "CA" ? "CA$" : "$";
    const familyRules = Array.isArray(familyProfiles) && familyProfiles.length > 0
      ? `IMPORTANT - Family restrictions (MUST follow):
${familyProfiles.map((m: any) => `- ${m.name}: ${[...(m.diets || []), ...(m.allergies || [])].join(", ") || "No restrictions"}`).join("\n")}`
      : "";

    // ---------- Swap one meal ----------
    if (swapMeal && swapMeal.day && swapMeal.type) {
      const avoid = Array.isArray(avoidMeals) ? avoidMeals.slice(0, 40).join(", ") : "";
      const swapPrompt = `Suggest ONE replacement ${swapMeal.type} for ${swapMeal.day} in a weekly meal plan.
Current meal to replace: "${swapMeal.name || ""}" — the new meal must be clearly different.
Family: ${family} people | Diet: ${diet} | Cuisine: ${cuisine}
${familyRules}
Do NOT repeat any of these meals already in the plan: ${avoid}
Return ONLY valid JSON (no markdown):
{ "meal": { "type": "${swapMeal.type}", "name": "Beef Stir-Fry with Rice", "photoQuery": "beef stir fry rice", "calories": "620 kcal", "tip": "Use leftover rice tomorrow" } }
"photoQuery": 2-4 plain English words naming what is visibly on the plate. "calories" is an estimate per serving.`;
      const out = await callClaude(swapPrompt, 400);
      const meal = out?.meal;
      if (!meal || typeof meal.name !== "string" || !meal.name.trim()) {
        return NextResponse.json({ error: "No replacement meal returned" }, { status: 502 });
      }
      meal.type = swapMeal.type;
      return NextResponse.json({ meal });
    }

    // ---------- Trim an existing list to the budget (on request) ----------
    if (Array.isArray(trimList) && trimList.length > 0) {
      const shop: { shoppingList?: unknown } = { shoppingList: trimList };
      let total = sumList(shop);
      const budgetNum = Number(budget) || 0;
      total = await trimToBudget(shop, total, budgetNum, sym, store);
      return NextResponse.json({
        shoppingList: shop.shoppingList,
        totalCost: total,
        savings: Math.max(0, Math.round((budgetNum - total) * 100) / 100),
      });
    }

    // ---------- Rebuild the shopping list from a final plan ----------
    if (Array.isArray(shoppingFromPlan) && shoppingFromPlan.length > 0) {
      const planText = shoppingFromPlan
        .map((d: any) => `${d.day}: ${(d.meals || []).map((m: any) => `${m.type} - ${m.name}`).join("; ")}`)
        .join("\n");
      const haveNote = Array.isArray(ingredients) && ingredients.length > 0
        ? `The user already has: ${ingredients.join(", ")}. Do NOT put these in the list.`
        : "";
      const budgetNum = Number(budget) || 0;
      const shopPrompt = `Build ONE consolidated grocery list for this exact 7-day meal plan.
Family: ${family} people | Budget: ${sym}${budget} | Store: ${store}
${haveNote}

Meal plan:
${planText}

Output ONLY lines in this exact format, one item per line, nothing else:
Category | Item | Qty | Price
Category must be one of: Meat & Protein, Produce, Dairy & Eggs, Pantry, Grains, Condiments, Frozen, Bakery.
Price is a number in ${sym} with no currency sign (e.g. 6.49).
Example:
Meat & Protein | Chicken thighs | 2 kg | 13.99
Produce | Broccoli | 2 heads | 4.49

Rules:
- Include what's needed to cook the meals above, combined across meals (no duplicates). Pantry staples most kitchens have (salt, pepper, cooking oil, basic dried spices) can be skipped.
- Buy the fewest packages that cover the week: one pack used by several meals, not a separate pack per meal. Quantities should match what ${family} people eat in 7 days, not more.
- Keep the total around 85-95% of ${sym}${budget}, and NEVER above ${sym}${budget}: add up the prices as you go and pick smaller packs or cheaper staples if needed.
${pricingRules(country, store)}`;
      const shop: { shoppingList?: unknown } = { shoppingList: parseShoppingLines(await callClaudeText(shopPrompt, 1800)) };
      if (!Array.isArray(shop.shoppingList) || shop.shoppingList.length === 0) {
        return NextResponse.json({ error: "No shopping list returned" }, { status: 502 });
      }
      // One fast call only. If it's still over budget the app says so and
      // offers "Trim to budget" instead of making everyone wait for a 2nd call.
      const total = sumList(shop);
      return NextResponse.json({
        shoppingList: shop.shoppingList,
        totalCost: total,
        savings: Math.max(0, Math.round((budgetNum - total) * 100) / 100),
      });
    }

    // ---------- Meal plan mode ----------

    const ingredientNote = ingredients?.length > 0
      ? `The user already has: ${ingredients.join(", ")}. Build meals around these first, and do NOT put them in the shopping list (the user does not need to buy them).`
      : "";

    const familyNote = familyProfiles?.length > 0
      ? `IMPORTANT - Family restrictions (MUST follow for ALL meals):
${familyProfiles.map((m: any) => `- ${m.name}: ${[...(m.diets || []), ...(m.allergies || [])].join(", ") || "No restrictions"}`).join("\n")}`
      : "";

    const pins: { day: string; type: string; name: string }[] = Array.isArray(pinnedMeals)
      ? pinnedMeals.filter((p: any) => p && p.day && p.type && p.name).slice(0, 21)
      : [];
    const includes: string[] = Array.isArray(includeMeals)
      ? includeMeals.filter((n: any) => typeof n === "string" && n.trim()).slice(0, 14)
      : [];
    const pinNote = pins.length > 0
      ? `The user chose these meals. Put each one EXACTLY in this slot, with this exact name:
${pins.map(p => `- ${p.day} ${p.type}: ${p.name}`).join("\n")}
Build the other meals around them${mealsOnly ? "" : ", and include their ingredients in the shopping list"}.`
      : "";
    const includeNote = includes.length > 0
      ? `The user saved these dishes and wants them this week. Include each one once, with this exact name, in a sensible day and meal: ${includes.join(", ")}.`
      : "";

    const previousMeals = Array.isArray(previousPlanMeals)
      ? previousPlanMeals.filter((n: unknown) => typeof n === "string").slice(0, 21).join(", ")
      : "";

    // Fast path: meals only. The app shows the plan right away and builds the
    // shopping list in the background with the shoppingFromPlan mode above.
    const mealsPrompt = `You are GoEat AI. Generate a 7-day meal plan.
Family: ${family} people | Budget: ${sym}${budget} for the week's groceries | Store: ${store} | Diet: ${diet} | Cuisine: ${cuisine}
${ingredients?.length > 0 ? `The user already has: ${ingredients.join(", ")}. Build meals around these first.` : ""}
${familyNote}
${pinNote}
${includeNote}

Return ONLY valid JSON (no markdown):
{
  "mealPlan": [
    { "day": "Monday", "meals": [
      { "type": "Breakfast", "name": "Oatmeal with Banana", "photoQuery": "oatmeal banana bowl", "calories": "340 kcal", "tip": "Quick 5-min breakfast" },
      { "type": "Lunch", "name": "Chicken Caesar Wrap", "photoQuery": "chicken caesar wrap", "calories": "480 kcal", "tip": "Great for lunchboxes" },
      { "type": "Dinner", "name": "Beef Stir-Fry with Rice", "photoQuery": "beef stir fry rice", "calories": "620 kcal", "tip": "Use leftover rice tomorrow" }
    ]}
  ],
  "wasteReduction": {
    "mealsFromLeftovers": <count of meals in THIS plan that reuse leftovers from an earlier meal>
  }
}
Rules:
- All 7 days Mon-Sun, 3 meals each.
- Follow ${diet} diet.
${budgetRules(budget, family, sym, store, !!strictBudget)}
VARIETY (within the budget):
- Lunches and dinners should feel different every day: change the dish and cooking style (stir-fry, soup/stew, roasted/baked, grilled, salad/bowl, pasta/noodles) even when the ingredients are shared. Don't serve near-duplicates (e.g. two chicken stir-fries).
- Unless the user picked a cuisine, mix 3-5 cuisines across the week, using the same shared ingredients.
- Don't use the same main protein for two dinners in a row.
${previousMeals ? `- Last time this user got: ${previousMeals}. Make this week feel different: don't reuse those dishes (dishes the user chose above are the exception).` : ""}
- Some dishes have photos in the app: ${photoDishSample(40)}. You MAY use a few of these (exact name) when they fit, but variety comes first; any good home-cooked dish is welcome.
- "tip": under 8 words. "calories": an estimate per serving.
- "photoQuery": 2-4 plain English words naming what is visibly on the plate, most distinctive item first. No cuisine labels or adjectives.`;

    const prompt = `You are GoEat AI. Generate a 7-day meal plan.
Family: ${family} people | Budget: ${sym}${budget} | Store: ${store} | Diet: ${diet} | Cuisine: ${cuisine}
${ingredientNote}
${familyNote}
${pinNote}
${includeNote}

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
    "mealsFromLeftovers": <count of meals in THIS plan that reuse leftovers from an earlier meal>,
    "estimatedWasteReduced": "<your rough estimate for THIS plan, e.g. '1.2 kg'>",
    "co2Saved": "<your rough estimate for THIS plan>",
    "moneySavedFromWaste": <your rough estimate in ${sym} for THIS plan, a number>
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

${pricingRules(country, store)}`;

    let result = await callClaude(mealsOnly ? mealsPrompt : prompt, mealsOnly ? 2500 : 4500);
    if (!Array.isArray(result.mealPlan) || result.mealPlan.length === 0) {
      return NextResponse.json({ error: "No meal plan returned" }, { status: 502 });
    }

    // ---------- Enforce the user's chosen slots ----------
    if (pins.length > 0 && Array.isArray(result.mealPlan)) {
      for (const p of pins) {
        const day = result.mealPlan.find((d: any) => String(d.day).toLowerCase() === p.day.toLowerCase());
        if (!day || !Array.isArray(day.meals)) continue;
        const slot = day.meals.find((m: any) => m.type === p.type);
        if (slot && slot.name !== p.name) {
          Object.assign(slot, { name: p.name, photoQuery: undefined, calories: undefined, tip: undefined });
        } else if (!slot) {
          day.meals.push({ type: p.type, name: p.name });
        }
      }
    }

    if (mealsOnly) {
      return NextResponse.json({ mealPlan: result.mealPlan, wasteReduction: result.wasteReduction });
    }

    // ---------- Compute totals in code (not by the AI) ----------
    let total = sumList(result);
    total = await trimToBudget(result, total, Number(budget) || 0, sym, store);

    result.totalCost = total;

    const budgetForSavings = Number(budget) || 0;
    result.savings = Math.max(0, Math.round((budgetForSavings - result.totalCost) * 100) / 100);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Failed to generate" }, { status: 500 });
  }
}
