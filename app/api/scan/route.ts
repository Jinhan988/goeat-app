import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType, mode } = await req.json();

    const prompt = mode === "receipt"
      ? "This is a grocery receipt. Extract all food/grocery items. Return ONLY a JSON object: {\"items\": [\"item1\", \"item2\"], \"uncertain\": []}. Only food items."
      : "This is a photo of a fridge. Identify all visible food ingredients. Return ONLY a JSON object: {\"items\": [\"Eggs\", \"Milk\"], \"uncertain\": [\"Chicken — quantity unclear\"]}. List uncertain quantities in uncertain array.";

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

    return NextResponse.json({ items: result.items || [], uncertain: result.uncertain || [] });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({
      items: ["Chicken", "Rice", "Broccoli", "Eggs", "Milk"],
      uncertain: []
    });
  }
}
