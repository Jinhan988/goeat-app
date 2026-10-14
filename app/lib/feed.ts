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
  photo: string; // Unsplash photo id path (free Unsplash License, hotlinked from images.unsplash.com)
  by: [string, string]; // photographer name, Unsplash username
};

export function feedPhotoUrl(d: FeedDish): string {
  return `https://images.unsplash.com/${d.photo}?auto=format&fit=crop&q=75&w=500`;
}

export function feedPhotoCredit(d: FeedDish): { name: string; link: string } {
  return { name: d.by[0], link: `https://unsplash.com/@${d.by[1]}` };
}

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
  { name: "Garlic Butter Salmon with Asparagus", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "salmon asparagus" , photo: "photo-1758384077234-f91a311dcc12", by: ["Bundo Kim", "bundo"] },
  { name: "Bulgogi Rice Bowl", cuisine: "Korean", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "bulgogi rice bowl" , photo: "photo-1583032353423-04fd96ef221c", by: ["GoodEats YQR", "goodeats_yqr"] },
  { name: "Avocado Toast with Eggs", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian"], query: "avocado toast egg" , photo: "photo-1719520670204-dbe1903a789f", by: ["Andrew Spencer", "iam_aspencer"] },
  { name: "Chicken Veggie Stir-Fry", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "chicken stir fry vegetables" , photo: "photo-1783196736260-dd788dff4132", by: ["Alexandra Dobrin", "_3puncte_"] },
  { name: "Kimchi Fried Rice with Egg", cuisine: "Korean", meal: "Lunch", minutes: 15, tags: ["budget"], query: "kimchi fried rice egg" , photo: "photo-1600688654899-379ec76aca42", by: ["Emanuel Ekström", "emanuelekstrom"] },
  { name: "Creamy Tomato Pasta", cuisine: "Italian", meal: "Dinner", minutes: 25, tags: ["vegetarian", "budget"], query: "creamy tomato pasta" , photo: "photo-1608897013039-887f21d8c804", by: ["Aleksandra Tanasiienko", "tasikola_pl"] },
  { name: "Beef Tacos", cuisine: "Mexican", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "beef tacos" , photo: "photo-1599974579688-8dbdd335c77f", by: ["Jeswin Thomas", "jeswinthomas"] },
  { name: "Greek Yogurt Berry Bowl", cuisine: "Mediterranean", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "highProtein"], query: "yogurt bowl berries" , photo: "photo-1670843839025-d50924a51f31", by: ["Joanna Stołowicz", "joanna_stolowicz"] },
  { name: "Chickpea Curry", cuisine: "Indian", meal: "Dinner", minutes: 30, tags: ["vegetarian", "budget"], query: "chickpea curry" , photo: "photo-1788602564560-9bcbf0f9acb6", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Teriyaki Chicken Rice Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "teriyaki chicken rice" , photo: "photo-1684815595429-cf46bff6294f", by: ["Michael Kahn", "mklibrary"] },
  { name: "Greek Salad with Grilled Chicken", cuisine: "Mediterranean", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "greek salad chicken" , photo: "photo-1690573313202-4493a7d02e9c", by: ["Svitlana", "kekse_und_ich"] },
  { name: "Spaghetti Bolognese", cuisine: "Italian", meal: "Dinner", minutes: 35, tags: ["budget"], query: "spaghetti bolognese" , photo: "photo-1673442635965-34f1b36d8944", by: ["Sofia Ciravegna", "sociravegna"] },
  { name: "Soft Tofu Stew (Sundubu Jjigae)", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "sundubu jjigae tofu stew" , photo: "photo-1760228865341-675704c22a5b", by: ["rawkkim", "rawkkim"] },
  { name: "Shrimp Fried Rice", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["budget"], query: "shrimp fried rice" , photo: "photo-1551326844-4df70f78d0e9", by: ["Mae Mu", "picoftasty"] },
  { name: "Veggie Omelette", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "highProtein", "budget"], query: "vegetable omelette" , photo: "photo-1677844592730-ce9c936d8f1a", by: ["Bakd&Raw by Karolin Baitinger", "bakdandraw"] },
  { name: "Black Bean Burrito Bowl", cuisine: "Mexican", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget"], query: "burrito bowl" , photo: "photo-1716392976013-66d90cac4411", by: ["AnaCristina Smith", "anacristinacanana"] },
  { name: "Miso Ramen with Soft Egg", cuisine: "Japanese", meal: "Dinner", minutes: 25, tags: [], query: "ramen egg" , photo: "photo-1612927601601-6638404737ce", by: ["ikhsan baihaqi", "his_and"] },
  { name: "Butter Chicken", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "butter chicken curry" , photo: "photo-1603894584373-5ac82b2ae398", by: ["Raman", "potofgold07"] },
  { name: "Banana Oat Pancakes", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["vegetarian", "budget"], query: "banana pancakes" , photo: "photo-1528207776546-365bb710ee93", by: ["nikldn", "nikldn"] },
  { name: "Lemon Herb Roast Chicken", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: ["highProtein"], query: "roast chicken lemon" , photo: "photo-1617636423451-0db0119c14cd", by: ["Tofan Teodor", "tofanteo"] },
  { name: "Salmon Poke Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "salmon poke bowl" , photo: "photo-1771154141872-e5ad3905a385", by: ["Haim Charbit", "haim_charbit18"] },
  { name: "Honey Garlic Chicken Thighs", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein", "budget"], query: "honey garlic chicken" , photo: "photo-1724441980118-741eaf55b0f8", by: ["Mayte Baque", "mtbaque"] },
  { name: "Caprese Sandwich", cuisine: "Italian", meal: "Lunch", minutes: 10, tags: ["vegetarian"], query: "caprese sandwich" , photo: "photo-1539252554453-80ab65ce3586", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Mapo Tofu", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "mapo tofu" , photo: "photo-1788603930622-636954e00065", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Chicken Quesadillas", cuisine: "Mexican", meal: "Lunch", minutes: 15, tags: ["highProtein", "budget"], query: "chicken quesadilla" , photo: "photo-1673990349292-ed2dfa7988c9", by: ["Benjamin Guardia", "benjaminguardia"] },
  { name: "Overnight Oats with Berries", cuisine: "American", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "budget"], query: "overnight oats berries" , photo: "photo-1490371475955-4cb3bfc72f71", by: ["Alisha Hieb", "wildandinlove"] },
  { name: "Japchae Glass Noodles", cuisine: "Korean", meal: "Lunch", minutes: 30, tags: [], query: "japchae noodles" , photo: "photo-1774717530911-2ceb99449f7a", by: ["Andrii Solok", "getslower"] },
  { name: "Mushroom Risotto", cuisine: "Italian", meal: "Dinner", minutes: 40, tags: ["vegetarian"], query: "mushroom risotto" , photo: "photo-1791409287840-f56f8611bc84", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Turkey Chili", cuisine: "American", meal: "Dinner", minutes: 40, tags: ["highProtein", "budget"], query: "turkey chili bowl" , photo: "photo-1790701909034-6c7b45c7b58a", by: ["Chad Montano", "briewilly"] },
  { name: "Falafel Pita with Hummus", cuisine: "Mediterranean", meal: "Lunch", minutes: 25, tags: ["vegetarian"], query: "falafel pita" , photo: "photo-1788795567489-22430aa94402", by: ["Wera Durakova", "wera"] },
  { name: "Egg Fried Noodles", cuisine: "Chinese", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget"], query: "fried noodles egg" , photo: "photo-1789999964582-b1c9b78c8488", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Palak Paneer", cuisine: "Indian", meal: "Dinner", minutes: 35, tags: ["vegetarian", "highProtein"], query: "palak paneer" , photo: "photo-1767114915936-745dd372f1d8", by: ["Chetanya Sharma", "chetanya_designs"] },
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
