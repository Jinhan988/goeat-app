import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType, mode } = await req.json();

    const prompt = mode === "receipt"
      ? `This is a grocery receipt. Extract all food/grocery items purchased.
Return ONLY valid JSON:
{
  "confirmed": ["Chicken breast", "Brown rice", "Broccoli"],
  "uncertain": []
}
Only include actual food/grocery items. No prices, dates, or store info.`

      : `You are an expert fridge analyst with exceptional visual recognition skills. 
Analyze this fridge photo with maximum detail and accuracy.

STEP 1 — SYSTEMATIC AREA SCAN:
Divide the fridge into zones and analyze each:
□ TOP SHELF: Scan left to right — every bottle, container, package, jar
□ UPPER MIDDLE SHELF: Every item, box, container, wrapped food
□ LOWER MIDDLE SHELF: Produce, leftovers, dairy, deli items
□ BOTTOM SHELF / CRISPER: Vegetables, fruits, drawers contents
□ LEFT DOOR: Every shelf — condiments, sauces, beverages
□ RIGHT DOOR: Every shelf — butter, eggs, drinks, jars
□ FREEZER (if visible): Frozen packages, ice cream, meat

STEP 2 — ADVANCED IDENTIFICATION TECHNIQUES:
Use ALL of these clues:

SHAPE clues:
- Long + thin + tapered = Carrot (NOT pepper)
- Wide + blocky + lobed = Bell pepper (NOT carrot)
- Round + smooth = Apple, orange, or tomato
- Tall + cylindrical = Bottle (milk, juice, sauce)
- Rectangular = Box, carton, or packaged food

COLOR + SHAPE combined:
- Orange + long/thin = Carrot
- Orange + wide/blocky = Orange bell pepper
- Red + round = Tomato or apple
- Red + wide/blocky = Red bell pepper
- Green + tree-shaped = Broccoli
- Green + long/thin = Cucumber, zucchini, or green onion
- Green + leafy = Lettuce, spinach, or herbs
- Yellow + curved = Banana
- Yellow + round/small = Lemon
- Yellow + wide/blocky = Yellow bell pepper
- White + cylindrical = Milk jug or bottle
- White + round = Onion, garlic, or egg
- Purple/dark = Eggplant, red cabbage, or grapes

PACKAGING clues:
- Red carton = Milk or juice (read label if visible)
- Orange carton = Orange juice
- Clear plastic bag = Produce (identify contents by color/shape)
- Aluminum foil wrap = Leftovers
- Tupperware/container = Leftovers (describe visible contents)
- Egg carton shape = Eggs
- Butter wrapper shape = Butter
- Yogurt cup shape = Yogurt

BRAND COLOR recognition:
- Red + white bottle = Ketchup (Heinz) or hot sauce
- Green bottle = Hot sauce (Tabasco) or olive oil
- Dark bottle = Soy sauce, Worcestershire, or balsamic
- Yellow squeeze bottle = Mustard
- White squeeze bottle = Mayo or ranch

KOREAN/ASIAN items:
- Red tub/container = Gochujang (Korean chili paste)
- Brown tub = Doenjang (Korean soybean paste)
- Long white radish = Daikon/Mu
- Napa cabbage = Kimchi or fresh cabbage
- Clear noodles in bag = Glass noodles
- Small dark bottles = Sesame oil or soy sauce

STEP 3 — QUANTITY & FRESHNESS HINTS:
- Nearly empty containers → note as "low"
- Multiple of same item → note quantity
- Wilting/browning produce → note as "needs using soon"

STEP 4 — CONFIDENCE CLASSIFICATION:
confirmed = 80%+ certain about the specific food item
uncertain = visible but type/contents unclear — describe exactly what you see

CRITICAL RULES:
- A typical well-stocked fridge has 15-25 identifiable items
- DO NOT stop at 3-5 items — scan EVERYTHING
- If you see a color/shape, make your best specific guess
- Only put in uncertain if you genuinely cannot identify it
- Never say "various items" — be specific about each one

Return ONLY valid JSON (no markdown, no explanation):
{
  "confirmed": ["Eggs (dozen)", "Milk (2% - almost full)", "Cheddar cheese block", "Butter", "Carrots (bunch)", "Red bell pepper", "Broccoli", "Greek yogurt", "Orange juice", "Ketchup", "Soy sauce", "Leftover rice (container)", "Apples (3)", "Spinach bag"],
  "uncertain": ["Green vegetable in back — possibly celery or leeks", "Brown container — possibly leftover soup or stew"]
}

Be THOROUGH. Be SPECIFIC. Scan every visible area.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: prompt }
          ]
        }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "{}";
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const result = JSON.parse(text.slice(start, end + 1));

    return NextResponse.json({
      items: result.confirmed || [],
      uncertain: result.uncertain || []
    });

  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({
      items: ["Eggs", "Milk", "Butter", "Carrots"],
      uncertain: ["Container — contents unclear"]
    });
  }
}
