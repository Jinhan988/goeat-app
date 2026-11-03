// Themed sets of photo-feed dishes, shown like the "A + B + C = meal" posts
// people save on Instagram. Every name must exist in FEED (checked by tests).
// The three items are each dish's main ingredients for a quick read; the full
// ingredient list lives in the recipe.

export type CollectionDish = { name: string; ing: [string, string][] };
export type Collection = {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  dishes: CollectionDish[];
};

const d = (name: string, ...ing: [string, string][]): CollectionDish => ({ name, ing });

export const COLLECTIONS: Collection[] = [
  {
    id: "protein-lunches",
    emoji: "🍱",
    title: "High-Protein Work Lunches",
    subtitle: "Meal-prep friendly · pack the night before",
    dishes: [
      d("Teriyaki Chicken Rice Bowl", ["🍗", "Chicken"], ["🍚", "Rice"], ["🫙", "Teriyaki sauce"]),
      d("Gyudon Beef Rice Bowl", ["🥩", "Sliced beef"], ["🧅", "Onion"], ["🍚", "Rice"]),
      d("Grilled Chicken Pasta Primavera", ["🍝", "Pasta"], ["🍗", "Chicken"], ["🥦", "Veggies"]),
      d("Salmon Rice Bowl", ["🐟", "Salmon"], ["🍚", "Rice"], ["🥑", "Avocado"]),
      d("Chicken Bento Box", ["🍗", "Chicken"], ["🍚", "Rice"], ["🥚", "Egg"]),
      d("Chicken Burrito", ["🫓", "Tortilla"], ["🍗", "Chicken"], ["🫘", "Beans"]),
      d("Greek Salad with Grilled Chicken", ["🍗", "Chicken"], ["🥒", "Cucumber"], ["🧀", "Feta"]),
      d("Chicken Quesadillas", ["🫓", "Tortillas"], ["🍗", "Chicken"], ["🧀", "Cheese"]),
      d("Salmon Poke Bowl", ["🐟", "Salmon"], ["🍚", "Rice"], ["🥒", "Cucumber"]),
      d("Chicken Salad Sandwich", ["🍞", "Bread"], ["🍗", "Chicken"], ["🥬", "Lettuce"]),
      d("Turkey Sandwich", ["🍞", "Bread"], ["🦃", "Turkey"], ["🧀", "Cheese"]),
    ],
  },
  {
    id: "budget-dinners",
    emoji: "💵",
    title: "Budget Family Dinners",
    subtitle: "Cheap staples · big portions",
    dishes: [
      d("Chicken Veggie Stir-Fry", ["🍗", "Chicken"], ["🥦", "Veggies"], ["🍚", "Rice"]),
      d("Spaghetti Bolognese", ["🍝", "Spaghetti"], ["🥩", "Ground beef"], ["🍅", "Tomato sauce"]),
      d("Beef Tacos", ["🥩", "Ground beef"], ["🌮", "Taco shells"], ["🧀", "Cheese"]),
      d("Honey Garlic Chicken Thighs", ["🍗", "Chicken thighs"], ["🍯", "Honey"], ["🧄", "Garlic"]),
      d("Chickpea Curry", ["🫘", "Chickpeas"], ["🍅", "Tomatoes"], ["🍚", "Rice"]),
      d("Turkey Chili", ["🦃", "Ground turkey"], ["🫘", "Beans"], ["🍅", "Tomatoes"]),
      d("Thai Basil Chicken with Fried Egg", ["🍗", "Chicken"], ["🌿", "Basil"], ["🍳", "Egg"]),
      d("Shrimp Fried Rice", ["🦐", "Shrimp"], ["🍚", "Rice"], ["🥚", "Egg"]),
      d("Yellow Lentil Dal", ["🫘", "Lentils"], ["🧅", "Onion"], ["🍚", "Rice"]),
      d("Homemade Meatloaf", ["🥩", "Ground beef"], ["🥚", "Egg"], ["🍞", "Breadcrumbs"]),
      d("Mac and Cheese", ["🍝", "Macaroni"], ["🧀", "Cheese"], ["🥛", "Milk"]),
    ],
  },
  {
    id: "quick-15",
    emoji: "⏱️",
    title: "15-Minute Meals",
    subtitle: "For nights you don't feel like cooking",
    dishes: [
      d("Kimchi Fried Rice with Egg", ["🥬", "Kimchi"], ["🍚", "Rice"], ["🍳", "Egg"]),
      d("Garlic Shrimp (Gambas al Ajillo)", ["🦐", "Shrimp"], ["🧄", "Garlic"], ["🫒", "Olive oil"]),
      d("Vegetable Fried Rice", ["🍚", "Rice"], ["🥕", "Veggies"], ["🥚", "Egg"]),
      d("Egg Fried Noodles", ["🍜", "Noodles"], ["🥚", "Egg"], ["🧅", "Green onion"]),
      d("Chicken Caesar Salad", ["🍗", "Chicken"], ["🥬", "Romaine"], ["🧀", "Parmesan"]),
      d("Egg Salad Sandwich", ["🥚", "Eggs"], ["🍞", "Bread"], ["🥬", "Lettuce"]),
      d("Cold Soba Noodles", ["🍜", "Soba"], ["🥒", "Cucumber"], ["🫙", "Soy sauce"]),
      d("Bibim Guksu (Spicy Cold Noodles)", ["🍜", "Noodles"], ["🌶️", "Gochujang"], ["🥒", "Cucumber"]),
      d("Hummus Plate with Pita", ["🫓", "Pita"], ["🫘", "Hummus"], ["🥒", "Cucumber"]),
    ],
  },
  {
    id: "easy-breakfasts",
    emoji: "🍳",
    title: "Easy Breakfasts",
    subtitle: "Five minutes to fifteen",
    dishes: [
      d("Overnight Oats with Berries", ["🌾", "Oats"], ["🫐", "Berries"], ["🥛", "Milk"]),
      d("Banana Oat Pancakes", ["🍌", "Banana"], ["🌾", "Oats"], ["🥚", "Egg"]),
      d("Avocado Toast with Eggs", ["🍞", "Bread"], ["🥑", "Avocado"], ["🍳", "Egg"]),
      d("Veggie Omelette", ["🥚", "Eggs"], ["🫑", "Peppers"], ["🧀", "Cheese"]),
      d("Greek Yogurt Berry Bowl", ["🥛", "Yogurt"], ["🫐", "Berries"], ["🍯", "Honey"]),
      d("Shakshuka", ["🍅", "Tomatoes"], ["🥚", "Eggs"], ["🫑", "Peppers"]),
      d("Bacon and Eggs with Toast", ["🥓", "Bacon"], ["🍳", "Eggs"], ["🍞", "Toast"]),
      d("Breakfast Burrito", ["🫓", "Tortilla"], ["🥚", "Eggs"], ["🧀", "Cheese"]),
      d("French Toast with Berries", ["🍞", "Bread"], ["🥚", "Eggs"], ["🫐", "Berries"]),
    ],
  },
  {
    id: "korean",
    emoji: "🇰🇷",
    title: "Korean Favorites",
    subtitle: "Bold, cozy, easy to batch",
    dishes: [
      d("Bulgogi Rice Bowl", ["🥩", "Sliced beef"], ["🫙", "Soy marinade"], ["🍚", "Rice"]),
      d("Bibimbap", ["🍚", "Rice"], ["🥬", "Veggies"], ["🍳", "Egg"]),
      d("Kimchi Fried Rice with Egg", ["🥬", "Kimchi"], ["🍚", "Rice"], ["🍳", "Egg"]),
      d("Korean Fried Chicken", ["🍗", "Chicken"], ["🌶️", "Gochujang"], ["🍯", "Honey"]),
      d("Spicy Korean Pork Stir-Fry", ["🥓", "Pork"], ["🌶️", "Gochujang"], ["🧅", "Onion"]),
      d("Japchae Glass Noodles", ["🍜", "Glass noodles"], ["🥩", "Beef"], ["🥬", "Spinach"]),
      d("Tteokbokki (Spicy Rice Cakes)", ["🍡", "Rice cakes"], ["🌶️", "Gochujang"], ["🥚", "Egg"]),
      d("Korean BBQ at Home", ["🥩", "Beef"], ["🥬", "Lettuce"], ["🧄", "Garlic"]),
    ],
  },
];

export function findCollection(id: string | null | undefined): Collection | undefined {
  if (!id) return undefined;
  const key = id.toLowerCase().trim();
  return COLLECTIONS.find(c => c.id === key);
}
