// A ready-made example week so first-time visitors can see a full plan
// instantly, with no setup and no AI call. Every dish is in the feed, so
// every meal has a photo. There are deliberately NO prices here: an example
// list can't know the visitor's store, so cost only appears in a real plan.

import type { MealType } from "./feed";

export const SAMPLE_INFO = { family: 4, store: "Costco" };

export const SAMPLE_WEEK: { day: string; meals: { type: MealType; name: string }[] }[] = [
  { day: "Monday", meals: [{ type: "Breakfast", name: "Overnight Oats with Berries" }, { type: "Lunch", name: "Greek Salad with Grilled Chicken" }, { type: "Dinner", name: "Bulgogi Rice Bowl" }] },
  { day: "Tuesday", meals: [{ type: "Breakfast", name: "Veggie Omelette" }, { type: "Lunch", name: "Kimchi Fried Rice with Egg" }, { type: "Dinner", name: "Chicken Veggie Stir-Fry" }] },
  { day: "Wednesday", meals: [{ type: "Breakfast", name: "Greek Yogurt Berry Bowl" }, { type: "Lunch", name: "Chicken Quesadillas" }, { type: "Dinner", name: "Spaghetti Bolognese" }] },
  { day: "Thursday", meals: [{ type: "Breakfast", name: "Banana Oat Pancakes" }, { type: "Lunch", name: "Black Bean Burrito Bowl" }, { type: "Dinner", name: "Garlic Butter Salmon with Asparagus" }] },
  { day: "Friday", meals: [{ type: "Breakfast", name: "Avocado Toast with Eggs" }, { type: "Lunch", name: "Teriyaki Chicken Rice Bowl" }, { type: "Dinner", name: "Beef Tacos" }] },
  { day: "Saturday", meals: [{ type: "Breakfast", name: "French Toast with Berries" }, { type: "Lunch", name: "Caprese Sandwich" }, { type: "Dinner", name: "Butter Chicken" }] },
  { day: "Sunday", meals: [{ type: "Breakfast", name: "Shakshuka" }, { type: "Lunch", name: "Chicken Noodle Soup" }, { type: "Dinner", name: "Lemon Herb Roast Chicken" }] },
];

// One combined list for the week above (rough quantities for 4 people).
export const SAMPLE_SHOPPING: { category: string; emoji: string; items: string[] }[] = [
  { category: "Meat & Protein", emoji: "🥩", items: ["Chicken breasts & thighs (about 3 kg)", "Whole chicken", "Thin-sliced beef for bulgogi (1 kg)", "Lean ground beef (1.5 kg)", "Salmon fillets (4)", "Eggs (2 dozen)"] },
  { category: "Produce", emoji: "🥦", items: ["Mixed berries", "Bananas", "Avocados", "Asparagus", "Broccoli", "Bell peppers", "Onions", "Garlic", "Tomatoes", "Cucumbers", "Romaine lettuce", "Spinach", "Carrots", "Green onions", "Lemons", "Fresh basil"] },
  { category: "Dairy", emoji: "🧀", items: ["Greek yogurt", "Milk", "Butter", "Shredded cheese", "Fresh mozzarella", "Feta", "Heavy cream"] },
  { category: "Grains & Bread", emoji: "🍞", items: ["Rolled oats", "Rice", "Spaghetti", "Egg noodles", "Sandwich bread", "Flour tortillas"] },
  { category: "Pantry", emoji: "🥫", items: ["Canned black beans", "Crushed tomatoes", "Kimchi", "Soy sauce", "Teriyaki sauce", "Salsa", "Curry spices (garam masala)", "Olive oil", "Maple syrup"] },
];
