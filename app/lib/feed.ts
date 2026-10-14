// Curated dishes for the Home discovery feed.
// `minutes` is an approximate typical cooking time (shown as "~25 min").
// Nutrition and cost are NOT stored here — they come from the AI recipe and
// are labeled as estimates in the UI.

export type MealType = "Breakfast" | "Lunch" | "Dinner";
export type DishTag = "highProtein" | "budget" | "vegetarian";

export type FeedDish = {
  name: string;
  cuisine: string;
  meal: MealType;
  minutes: number;
  tags: DishTag[];
  query: string; // short photo search phrase
};

export const QUICK_MINUTES = 20;

export const FEED_FILTERS: { id: string; label: string }[] = [
  { id: "forYou", label: "For You" },
  { id: "quick", label: "Quick & Easy" },
  { id: "highProtein", label: "High Protein" },
  { id: "budget", label: "Budget Friendly" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "Korean", label: "Korean" },
  { id: "Japanese", label: "Japanese" },
  { id: "Chinese", label: "Chinese" },
  { id: "Italian", label: "Italian" },
  { id: "Mexican", label: "Mexican" },
  { id: "Indian", label: "Indian" },
  { id: "Mediterranean", label: "Mediterranean" },
  { id: "American", label: "American" },
];

export const FEED: FeedDish[] = [
  { name: "Garlic Butter Salmon with Asparagus", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "salmon asparagus" },
  { name: "Bulgogi Rice Bowl", cuisine: "Korean", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "bulgogi rice bowl" },
  { name: "Avocado Toast with Eggs", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian"], query: "avocado toast egg" },
  { name: "Chicken Veggie Stir-Fry", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "chicken stir fry vegetables" },
  { name: "Kimchi Fried Rice with Egg", cuisine: "Korean", meal: "Lunch", minutes: 15, tags: ["budget"], query: "kimchi fried rice egg" },
  { name: "Creamy Tomato Pasta", cuisine: "Italian", meal: "Dinner", minutes: 25, tags: ["vegetarian", "budget"], query: "creamy tomato pasta" },
  { name: "Beef Tacos", cuisine: "Mexican", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "beef tacos" },
  { name: "Greek Yogurt Berry Bowl", cuisine: "Mediterranean", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "highProtein"], query: "yogurt bowl berries" },
  { name: "Chickpea Curry", cuisine: "Indian", meal: "Dinner", minutes: 30, tags: ["vegetarian", "budget"], query: "chickpea curry" },
  { name: "Teriyaki Chicken Rice Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "teriyaki chicken rice" },
  { name: "Greek Salad with Grilled Chicken", cuisine: "Mediterranean", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "greek salad chicken" },
  { name: "Spaghetti Bolognese", cuisine: "Italian", meal: "Dinner", minutes: 35, tags: ["budget"], query: "spaghetti bolognese" },
  { name: "Soft Tofu Stew (Sundubu Jjigae)", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "sundubu jjigae tofu stew" },
  { name: "Shrimp Fried Rice", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["budget"], query: "shrimp fried rice" },
  { name: "Veggie Omelette", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "highProtein", "budget"], query: "vegetable omelette" },
  { name: "Black Bean Burrito Bowl", cuisine: "Mexican", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget"], query: "burrito bowl" },
  { name: "Miso Ramen with Soft Egg", cuisine: "Japanese", meal: "Dinner", minutes: 25, tags: [], query: "ramen egg" },
  { name: "Butter Chicken", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "butter chicken curry" },
  { name: "Banana Oat Pancakes", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["vegetarian", "budget"], query: "banana pancakes" },
  { name: "Lemon Herb Roast Chicken", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: ["highProtein"], query: "roast chicken lemon" },
  { name: "Salmon Poke Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "salmon poke bowl" },
  { name: "Honey Garlic Chicken Thighs", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein", "budget"], query: "honey garlic chicken" },
  { name: "Caprese Sandwich", cuisine: "Italian", meal: "Lunch", minutes: 10, tags: ["vegetarian"], query: "caprese sandwich" },
  { name: "Mapo Tofu", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "mapo tofu" },
  { name: "Chicken Quesadillas", cuisine: "Mexican", meal: "Lunch", minutes: 15, tags: ["highProtein", "budget"], query: "chicken quesadilla" },
  { name: "Overnight Oats with Berries", cuisine: "American", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "budget"], query: "overnight oats berries" },
  { name: "Japchae Glass Noodles", cuisine: "Korean", meal: "Lunch", minutes: 30, tags: [], query: "japchae noodles" },
  { name: "Mushroom Risotto", cuisine: "Italian", meal: "Dinner", minutes: 40, tags: ["vegetarian"], query: "mushroom risotto" },
  { name: "Turkey Chili", cuisine: "American", meal: "Dinner", minutes: 40, tags: ["highProtein", "budget"], query: "turkey chili bowl" },
  { name: "Falafel Pita with Hummus", cuisine: "Mediterranean", meal: "Lunch", minutes: 25, tags: ["vegetarian"], query: "falafel pita" },
  { name: "Egg Fried Noodles", cuisine: "Chinese", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget"], query: "fried noodles egg" },
  { name: "Palak Paneer", cuisine: "Indian", meal: "Dinner", minutes: 35, tags: ["vegetarian", "highProtein"], query: "palak paneer" },
];

export function dishMatches(d: FeedDish, filter: string): boolean {
  if (filter === "forYou") return true;
  if (filter === "quick") return d.minutes <= QUICK_MINUTES;
  if (filter === "highProtein" || filter === "budget" || filter === "vegetarian") return d.tags.includes(filter);
  return d.cuisine === filter;
}

export function findFeedDish(name: string): FeedDish | undefined {
  const n = name.trim().toLowerCase();
  return FEED.find(d => d.name.toLowerCase() === n);
}
