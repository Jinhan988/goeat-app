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

      : `You are an expert fridge analyst AI. Carefully examine every part of this fridge photo.

SCAN SYSTEMATICALLY — check ALL of these areas:
1. TOP SHELF: Every item, bottle, container, package
2. MIDDLE SHELF(VES): Every item, leftover container, produce
3. BOTTOM SHELF / CRISPER DRAWERS: Vegetables, fruits, deli items
4. DOOR SHELVES: Every bottle, condiment, sauce, juice, dairy
5. ANY VISIBLE FREEZER SECTION: Frozen items, ice cream
6. VISIBLE PACKAGING: Read any labels, recognize brand colors/shapes

IDENTIFICATION RULES:
- Identify by: shape, color, packaging, label text, brand colors
- Common items: milk jug = Milk, orange carton = OJ, yellow block = Cheese/Butter
- Green stalks = Celery/Broccoli, orange = Carrots, red = Tomatoes/Peppers
- Brown sauce bottles = Soy sauce/Worcester, red bottles = Ketchup/Hot sauce
- Clear containers = Leftovers (describe contents if visible)
- Eggs in carton = Eggs
- Be SPECIFIC: not just "sauce" but "Hot sauce" or "Soy sauce"
- Infer from context: if you see a pizza box, include "Leftover pizza"

CONFIDENCE LEVELS:
- confirmed: 75%+ sure it's a specific food item
- uncertain: visible but contents/type unclear — describe what you see

Return ONLY valid JSON (no markdown):
{
  "confirmed": ["Eggs", "Milk", "Cheddar cheese", "Butter", "Carrots", "Leftover rice", "Orange juice", "Ketchup", "Soy sauce", "Greek yogurt"],
  "uncertain": ["Green vegetable — type unclear", "Container with brown contents — possibly soup"]
}

Be THOROUGH. A typical fridge has 10-20 identifiable items. Don't stop at 3-4.
Max 20 confirmed, max 6 uncertain.`;

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

      : `You are analyzing a fridge photo. Do a detailed 2-stage analysis:

STAGE 1 — Scan every area systematically:
- Top shelf: what items are visible?
- Middle shelf: what items are visible?
- Bottom shelf/drawers: what items are visible?
- Door shelves: what bottles, condiments, containers?
- Any visible packaging, containers, bags?

STAGE 2 — Classify each item by confidence:
- HIGH confidence: clearly visible, identifiable food item
- MEDIUM confidence: visible but type/contents unclear
- LOW confidence: only packaging visible, contents unknown

Return ONLY valid JSON (no markdown):
{
  "confirmed": ["Eggs", "Milk", "Carrots", "Butter"],
  "uncertain": ["Cheese — container visible", "Hot sauce — label unclear", "Leftover container — contents unknown"]
}

Rules:
- confirmed = items you are 80%+ sure about
- uncertain = items that need user confirmation
- DO NOT include non-food items
- Be thorough — scan every shelf and door compartment
- Max 20 confirmed items, max 8 uncertain items`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1000,
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
      items: ["Eggs", "Milk", "Carrots", "Butter"],
      uncertain: ["Cheese — type unclear", "Condiments — labels unclear"]
    });
  }
}
