// Picture library for recipe ingredients (/public/ing/<slug>.webp).
// Matching is deliberately strict: a wrong picture is worse than none, so
// anything that only looks similar by name (broth, powder, paste...) gets no picture.

type Rule = { slug: string; label: string; any: RegExp; not?: RegExp };

const RULES: Rule[] = [
  { slug: "chicken-breast", label: "Chicken", any: /\bchicken\b/i, not: /\b(broth|stock|bouillon|powder|seasoning|skin|bones?|wings?|drumsticks?)\b/i },
  { slug: "ground-beef", label: "Ground beef", any: /\b(ground|minced?)\s+(lean\s+)?beef\b|\bbeef\s+mince\b|\bhamburger meat\b/i },
  { slug: "salmon", label: "Salmon", any: /\bsalmon\b/i, not: /\b(smoked|canned|tinned|lox)\b/i },
  { slug: "eggs", label: "Eggs", any: /\beggs?\b/i, not: /\b(eggplants?|noodles?|whites? only|roll wrappers?)\b/i },
  { slug: "rice", label: "Rice", any: /\brice\b/i, not: /\b(vinegar|wine|noodles?|paper|cakes?|flour|syrup|krispies)\b/i },
  { slug: "pasta", label: "Pasta", any: /\b(pasta|penne|rigatoni|fusilli|rotini|macaroni|ziti|farfalle)\b/i, not: /\bsauce\b/i },
  { slug: "potatoes", label: "Potatoes", any: /\bpotato(es)?\b/i, not: /\b(sweet|starch|chips|flakes)\b/i },
  { slug: "onion", label: "Onion", any: /\bonions?\b/i, not: /\b(green|spring|powder|flakes|salt)\b|\bscallions?\b/i },
  { slug: "garlic", label: "Garlic", any: /\bgarlic\b/i, not: /\b(powder|salt|sauce|granulated|chili garlic)\b/i },
  { slug: "carrots", label: "Carrots", any: /\bcarrots?\b/i, not: /\bcake\b/i },
  { slug: "broccoli", label: "Broccoli", any: /\bbroccoli\b/i, not: /\brabe\b/i },
  { slug: "tomatoes", label: "Tomatoes", any: /\btomato(es)?\b/i, not: /\b(paste|sauce|puree|purée|ketchup|crushed|canned|diced canned|sun-?dried|juice|soup|bouillon)\b/i },
  { slug: "bell-pepper", label: "Bell pepper", any: /\bbell peppers?\b|\b(red|green|yellow|orange) peppers?\b|\bcapsicum\b/i, not: /\b(flakes|crushed|chil(i|e)|jalape|black|white|cayenne)\b/i },
  { slug: "spinach", label: "Spinach", any: /\bspinach\b/i },
  { slug: "cheese", label: "Cheese", any: /\b(cheddar|cheese)\b/i, not: /\b(cream cheese|cottage|ricotta|feta|parmesan|parmigiano|mozzarella|paneer|halloumi|goat|blue)\b/i },
  { slug: "butter", label: "Butter", any: /\bbutter\b/i, not: /\b(peanut|almond|nut|buttermilk|cashew|apple|cocoa|bean)\b/i },
];

export function ingredientPhoto(name: string): string | undefined {
  for (const r of RULES) {
    if (r.any.test(name) && !(r.not && r.not.test(name))) return `/ing/${r.slug}.webp`;
  }
  return undefined;
}

export const INGREDIENT_SLUGS = RULES.map(r => r.slug);

// "15 minutes", "10-12 min", "1 hour" → seconds, for a step timer.
export function stepTimerSeconds(step: string): number | undefined {
  const m = step.match(/(\d+)(?:\s*(?:-|–|to)\s*(\d+))?\s*(minutes?|mins?|hours?|hrs?)\b/i);
  if (!m) return undefined;
  const n = Number(m[2] || m[1]);
  const secs = /^h/i.test(m[3]) ? n * 3600 : n * 60;
  return secs > 0 && secs <= 6 * 3600 ? secs : undefined;
}
