// Parses the compact plain-text recipe format used by /api/recipe.

export type Recipe = {
  prepTime?: string; cookTime?: string; servings?: number | string; difficulty?: string; calories?: string;
  ingredients: { name: string; qty?: string }[]; steps: string[]; tip?: string;
};

// Compact text format (shorter than JSON, so it comes back faster).
export function parseRecipe(text: string): Recipe {
  const r: Recipe = { ingredients: [], steps: [] };
  let section: "" | "ing" | "steps" = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const kv = line.match(/^(PREP|COOK|SERVINGS|DIFFICULTY|CALORIES|TIP)\s*:\s*(.+)$/i);
    if (kv) {
      const v = kv[2].trim();
      const k = kv[1].toUpperCase();
      if (k === "PREP") r.prepTime = v;
      else if (k === "COOK") r.cookTime = v;
      else if (k === "SERVINGS") r.servings = v;
      else if (k === "DIFFICULTY") r.difficulty = v;
      else if (k === "CALORIES") r.calories = v;
      else r.tip = v;
      section = "";
      continue;
    }
    if (/^INGREDIENTS\s*:?$/i.test(line)) { section = "ing"; continue; }
    if (/^STEPS\s*:?$/i.test(line)) { section = "steps"; continue; }
    if (section === "ing") {
      const t = line.replace(/^[-*•]\s*/, "");
      const [qty, name] = t.includes("|") ? t.split("|").map(x => x.trim()) : ["", t];
      if (name) r.ingredients.push({ name, qty });
    } else if (section === "steps") {
      const t = line.replace(/^\d+[.)]\s*/, "");
      if (t) r.steps.push(t);
    }
  }
  return r;
}

