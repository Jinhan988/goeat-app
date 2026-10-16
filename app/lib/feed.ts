// Curated dishes for the Home discovery feed.
// `minutes` is an approximate typical cooking time (shown as "~25 min").
// Nutrition and cost are NOT stored here — they come from the AI recipe and
// are labeled as estimates in the UI.

export type MealType = "Breakfast" | "Lunch" | "Dinner";
export type DishTag = "highProtein" | "budget" | "vegetarian" | "soup" | "salad" | "snack" | "lunchbox" | "airFryer";

// Tags that are their own filter chip on Home.
export const TAG_FILTERS: DishTag[] = ["highProtein", "budget", "vegetarian", "soup", "salad", "lunchbox", "airFryer", "snack"];

export type FeedDish = {
  name: string;
  cuisine: string;
  meal: MealType;
  minutes: number;
  tags: DishTag[];
  query: string; // short photo search phrase
  photo: string; // Unsplash photo id path (free Unsplash License, hotlinked from images.unsplash.com)
  by: [string, string]; // photographer name, Unsplash username
  video?: FeedVideo;
  // Desserts, snacks and sides aren't a meal slot: the card saves them instead
  // of adding them to My Week, and the AI plan doesn't use them.
  noPlan?: boolean;
};

// Short cooking clips from Pexels (free for commercial use under the Pexels
// License). Files and posters are hotlinked from Pexels' CDN.
export type FeedVideo = {
  id: string;          // Pexels video id
  file: string;        // path after videos.pexels.com/video-files/
  poster: string;      // path after images.pexels.com/videos/
  by: [string, string]; // creator name, Pexels profile slug (after /@)
};

export function feedVideoSrc(v: FeedVideo): string {
  return `https://videos.pexels.com/video-files/${v.id}/${v.file}`;
}
export function feedVideoPoster(v: FeedVideo): string {
  return `https://images.pexels.com/videos/${v.id}/${v.poster}?auto=compress&cs=tinysrgb&w=500`;
}

export function feedPhotoUrl(d: FeedDish): string {
  return `https://images.unsplash.com/${d.photo}?auto=format&fit=crop&q=75&w=500`;
}

export function feedPhotoCredit(d: FeedDish): { name: string; link: string } {
  return { name: d.by[0], link: `https://unsplash.com/@${d.by[1]}` };
}

export const QUICK_MINUTES = 20;

// Category chips. `thumb` is the dish whose photo appears on the chip.
export const FEED_FILTERS: { id: string; label: string; thumb?: string; tint: string }[] = [
  { id: "forYou", label: "For You", tint: "#E8F5E9" },
  { id: "quick", label: "Quick & Easy", thumb: "Avocado Toast with Eggs", tint: "#FFF3D6" },
  { id: "highProtein", label: "High Protein", thumb: "Garlic Butter Salmon with Asparagus", tint: "#FDE2E4" },
  { id: "budget", label: "Budget Friendly", thumb: "Chickpea Curry", tint: "#E3F2FD" },
  { id: "vegetarian", label: "Vegetarian", thumb: "Caprese Sandwich", tint: "#E8F5E9" },
  { id: "soup", label: "Soups", thumb: "French Onion Soup", tint: "#FFF3D6" },
  { id: "salad", label: "Salads", thumb: "Caprese Salad", tint: "#E3F1DA" },
  { id: "lunchbox", label: "Lunchbox", thumb: "Chicken Bento Box", tint: "#E3F2FD" },
  { id: "airFryer", label: "Air Fryer", thumb: "Air Fryer Buffalo Wings", tint: "#FDE2E4" },
  { id: "snack", label: "Snacks & Desserts", thumb: "Fudgy Brownies", tint: "#F3E5F5" },
  { id: "Korean", label: "Korean", thumb: "Bulgogi Rice Bowl", tint: "#F3E5F5" },
  { id: "Japanese", label: "Japanese", thumb: "Miso Ramen with Soft Egg", tint: "#FFF3D6" },
  { id: "Chinese", label: "Chinese", thumb: "Mapo Tofu", tint: "#FDE2E4" },
  { id: "Italian", label: "Italian", thumb: "Spaghetti Bolognese", tint: "#E3F2FD" },
  { id: "Mexican", label: "Mexican", thumb: "Beef Tacos", tint: "#F3E5F5" },
  { id: "Indian", label: "Indian", thumb: "Butter Chicken", tint: "#FFF3D6" },
  { id: "Mediterranean", label: "Mediterranean", thumb: "Falafel Pita with Hummus", tint: "#E8F5E9" },
  { id: "Thai", label: "Thai", thumb: "Pad Thai", tint: "#E3F1DA" },
  { id: "Vietnamese", label: "Vietnamese", thumb: "Fresh Spring Rolls", tint: "#FFF3D6" },
  { id: "American", label: "American", thumb: "Banana Oat Pancakes", tint: "#FDE2E4" },
];

export const FEED: FeedDish[] = [
  { name: "Bulgogi Rice Bowl", cuisine: "Korean", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "bulgogi rice bowl" , photo: "photo-1583032353423-04fd96ef221c", by: ["GoodEats YQR", "goodeats_yqr"] },
  { name: "Garlic Butter Salmon with Asparagus", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "salmon asparagus" , photo: "photo-1758384077234-f91a311dcc12", by: ["Bundo Kim", "bundo"] },
  { name: "Avocado Toast with Eggs", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian"], query: "avocado toast egg" , photo: "photo-1719520670204-dbe1903a789f", by: ["Andrew Spencer", "iam_aspencer"] },
  { name: "Chicken Veggie Stir-Fry", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "chicken stir fry vegetables" , photo: "photo-1783196736260-dd788dff4132", by: ["Alexandra Dobrin", "_3puncte_"] },
  { name: "Kimchi Fried Rice with Egg", cuisine: "Korean", meal: "Lunch", minutes: 15, tags: ["budget", "lunchbox"], query: "kimchi fried rice egg" , photo: "photo-1600688654899-379ec76aca42", by: ["Emanuel Ekström", "emanuelekstrom"] },
  { name: "Creamy Tomato Pasta", cuisine: "Italian", meal: "Dinner", minutes: 25, tags: ["vegetarian", "budget"], query: "creamy tomato pasta" , photo: "photo-1608897013039-887f21d8c804", by: ["Aleksandra Tanasiienko", "tasikola_pl"] },
  { name: "Bibimbap", cuisine: "Korean", meal: "Lunch", minutes: 25, tags: [], query: "bibimbap", photo: "photo-1741295017668-c8132acd6fc0", by: ["Dmitry Pavlovsky", "vectorburn"] },
  { name: "French Onion Soup", cuisine: "French", meal: "Dinner", minutes: 60, tags: ["vegetarian", "soup"], query: "french onion soup", photo: "photo-1741318714411-fad939b8580a", by: ["Meg von Haartman", "traveleroohlala"] },
  { name: "Homemade Sushi Rolls", cuisine: "Japanese", meal: "Lunch", minutes: 40, tags: ["lunchbox"], query: "sushi rolls", photo: "photo-1608731002248-747dee753517", by: ["Devi Puspita Amartha Yahya", "deviyahya"] },
  { name: "Caprese Salad", cuisine: "Italian", meal: "Lunch", minutes: 10, tags: ["vegetarian", "salad"], query: "caprese salad", photo: "photo-1769458313937-b5ad8f84942e", by: ["Brelyn Bashrum", "brelynkk"] },
  { name: "Beef Tacos", cuisine: "Mexican", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "beef tacos" , photo: "photo-1599974579688-8dbdd335c77f", by: ["Jeswin Thomas", "jeswinthomas"], video: { id: "37346941", file: "15819062_1080_1920_30fps.mp4", poster: "pexels-photo-37346941.jpeg", by: ["Kuiyibo Campos", "kuiyibo"] } },
  { name: "Banana Bread", cuisine: "American", meal: "Breakfast", minutes: 60, tags: ["vegetarian", "snack"], query: "banana bread", photo: "photo-1767065887793-f68f736ea9d6", by: ["Diego Arenas de Rodrigo", "diegoarenasderodrigo"] },
  { name: "Kung Pao Chicken", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "kung pao chicken", photo: "photo-1605704922285-e82455dba38b", by: ["Karolina Kołodziejczak", "rabbit_in_blue"] },
  { name: "Chicken Bento Box", cuisine: "Japanese", meal: "Lunch", minutes: 25, tags: ["highProtein", "lunchbox"], query: "bento lunch box", photo: "photo-1616645297079-dfaf44a6f977", by: ["Ferks Guare", "ferksguare"] },
  { name: "Margherita Pizza", cuisine: "Italian", meal: "Dinner", minutes: 30, tags: ["vegetarian"], query: "margherita pizza", photo: "photo-1769733338940-c406b721583f", by: ["tommao wang", "tommaomaoer"] },
  { name: "Egg Salad Sandwich", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget", "lunchbox"], query: "egg sandwich", photo: "photo-1482049016688-2d3e1b311543", by: ["Joseph Gonzalez", "miracletwentyone"] },
  { name: "Greek Yogurt Berry Bowl", cuisine: "Mediterranean", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "highProtein"], query: "yogurt bowl berries" , photo: "photo-1670843839025-d50924a51f31", by: ["Joanna Stołowicz", "joanna_stolowicz"] },
  { name: "Italian Sub Sandwich", cuisine: "Italian", meal: "Lunch", minutes: 10, tags: ["lunchbox"], query: "sub sandwich", photo: "photo-1676300187140-00828e014d2a", by: ["Orkun Orcan", "orkunorcan"] },
  { name: "Shrimp Tacos", cuisine: "Mexican", meal: "Dinner", minutes: 20, tags: ["highProtein"], query: "shrimp tacos", photo: "photo-1564976704241-79e265ed90fc", by: ["Nate Johnston", "natejohnston"] },
  { name: "Korean Dosirak Lunch Box", cuisine: "Korean", meal: "Lunch", minutes: 30, tags: ["lunchbox"], query: "korean lunch box", photo: "photo-1708585869478-e53fa19a1a63", by: ["Im euisook", "sooki"] },
  { name: "Chicken Tikka Masala", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "chicken curry rice", photo: "photo-1708782344490-9026aaa5eec7", by: ["Rimsha Noor", "rimshaj123"] },
  { name: "Vegetable Fried Rice", cuisine: "Chinese", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget", "lunchbox"], query: "fried rice peas carrots", photo: "photo-1603133872878-684f208fb84b", by: ["Christopher Alvarenga", "krizphoto"] },
  { name: "Chickpea Curry", cuisine: "Indian", meal: "Dinner", minutes: 30, tags: ["vegetarian", "budget"], query: "chickpea curry" , photo: "photo-1788602564560-9bcbf0f9acb6", by: ["Zoshua Colah", "zoshuacolah"], video: { id: "30044755", file: "12888245_1080_1920_30fps.mp4", poster: "art-of-cooking-colorful-vegetables-cooking-cooking-area-30044755.jpeg", by: ["Deep Pandey", "deep-pandey-807839685"] } },
  { name: "Croissant Sandwich", cuisine: "French", meal: "Lunch", minutes: 10, tags: ["lunchbox"], query: "croissant sandwich", photo: "photo-1639667852145-466e29aa49fd", by: ["Luis Covarrubias", "eledeluis"] },
  { name: "Shakshuka", cuisine: "Mediterranean", meal: "Breakfast", minutes: 25, tags: ["vegetarian", "budget"], query: "shakshuka eggs", photo: "photo-1682622110419-b671026a4536", by: ["Alex Bayev", "alexbayev"] },
  { name: "Burger and Poutine Night", cuisine: "Canadian", meal: "Dinner", minutes: 30, tags: [], query: "burger poutine", photo: "photo-1780030904692-0dbf3f4d4b25", by: ["Allen Y", "yanahd"] },
  { name: "Quinoa Tofu Avocado Bowl", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["vegetarian", "highProtein", "lunchbox"], query: "quinoa tofu bowl", photo: "photo-1763000215238-38350d3e41ac", by: ["David Magalhães", "speeddragon35"] },
  { name: "Fish and Chips", cuisine: "British", meal: "Dinner", minutes: 35, tags: ["highProtein"], query: "fish and chips", photo: "photo-1697748836791-9ddf7e616ece", by: ["Winston Tjia", "winstontjia"] },
  { name: "Teriyaki Chicken Rice Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 25, tags: ["highProtein", "lunchbox"], query: "teriyaki chicken rice" , photo: "photo-1684815595429-cf46bff6294f", by: ["Michael Kahn", "mklibrary"] },
  { name: "Souvlaki Plate with Pita", cuisine: "Mediterranean", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "souvlaki pita", photo: "photo-1603360946369-dc9bb6258143", by: ["Markus Winkler", "markuswinkler"] },
  { name: "Pad Thai", cuisine: "Thai", meal: "Dinner", minutes: 25, tags: [], query: "pad thai", photo: "photo-1707546944460-dda9069b9c1e", by: ["Hidden", "hidden_iye"] },
  { name: "Paneer Tikka Skewers", cuisine: "Indian", meal: "Dinner", minutes: 35, tags: ["vegetarian", "highProtein"], query: "paneer tikka", photo: "photo-1788843304145-bec146aa83c5", by: ["Ashwini Chaudhary(Monty)", "suicide_chewbacca"] },
  { name: "Beef Pho", cuisine: "Vietnamese", meal: "Dinner", minutes: 40, tags: ["soup"], query: "pho noodle soup", photo: "photo-1731460202531-bf8389d565f7", by: ["Nancy Ingersoll", "thecreativeresource"] },
  { name: "Vietnamese Vermicelli Bowl", cuisine: "Vietnamese", meal: "Lunch", minutes: 25, tags: [], query: "vermicelli bowl", photo: "photo-1583316175701-0bc5f25a0a44", by: ["Markus Winkler", "markuswinkler"] },
  { name: "Greek Salad with Grilled Chicken", cuisine: "Mediterranean", meal: "Lunch", minutes: 15, tags: ["highProtein", "salad"], query: "greek salad chicken" , photo: "photo-1690573313202-4493a7d02e9c", by: ["Svitlana", "kekse_und_ich"] },
  { name: "Garlic Shrimp (Gambas al Ajillo)", cuisine: "Spanish", meal: "Dinner", minutes: 15, tags: ["highProtein"], query: "garlic shrimp pan", photo: "photo-1755157248953-904581b61a69", by: ["Nebular", "nebulargroup"] },
  { name: "Korean Fried Chicken", cuisine: "Korean", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "fried chicken", photo: "photo-1566918214014-a3b3e0132267", by: ["Huynh Quyet", "huynhquyet9682"] },
  { name: "Creamy Pumpkin Soup", cuisine: "American", meal: "Lunch", minutes: 35, tags: ["vegetarian", "budget", "soup"], query: "pumpkin soup", photo: "photo-1613844237701-8f3664fc2eff", by: ["Max Griss", "grissphoto"] },
  { name: "Chicken Katsu Curry", cuisine: "Japanese", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "katsu curry", photo: "photo-1569050467447-ce54b3bbc37d", by: ["Stefen Tan", "stefentan"] },
  { name: "Rainbow Veggie Salad Bowl", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget", "salad"], query: "veggie salad bowl", photo: "photo-1623428187969-5da2dcea5ebf", by: ["Sonny Mauricio", "northernstatemedia"] },
  { name: "Spaghetti Bolognese", cuisine: "Italian", meal: "Dinner", minutes: 35, tags: ["budget"], query: "spaghetti bolognese" , photo: "photo-1673442635965-34f1b36d8944", by: ["Sofia Ciravegna", "sociravegna"] },
  { name: "Blueberry Muffins", cuisine: "American", meal: "Breakfast", minutes: 30, tags: ["vegetarian", "snack"], query: "blueberry muffins", photo: "photo-1767634480773-37e4b962fa1d", by: ["L S", "theartsy_waterlily"] },
  { name: "Beef and Broccoli", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "beef broccoli", photo: "photo-1760504526069-ff0f8bf6e4ca", by: ["Davis Dai", "lingo4208"] },
  { name: "Cold Soba Noodles", cuisine: "Japanese", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget", "lunchbox"], query: "soba noodles", photo: "photo-1766634001888-5d632d62689a", by: ["Kouji Tsuru", "pafuxu"] },
  { name: "Classic Beef Lasagna", cuisine: "Italian", meal: "Dinner", minutes: 60, tags: [], query: "lasagna", photo: "photo-1709429790175-b02bb1b19207", by: ["Emanuel Ekström", "emanuelekstrom"] },
  { name: "BLT Sandwich", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["lunchbox"], query: "blt sandwich", photo: "photo-1722041220514-f6a26e286f2e", by: ["David Trinks", "dtrinksrph"] },
  { name: "Soft Tofu Stew (Sundubu Jjigae)", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["highProtein", "soup"], query: "sundubu jjigae tofu stew" , photo: "photo-1760228865341-675704c22a5b", by: ["rawkkim", "rawkkim"] },
  { name: "Penne with Tomato Basil Sauce", cuisine: "Italian", meal: "Dinner", minutes: 20, tags: ["vegetarian", "budget"], query: "penne tomato basil", photo: "photo-1788599760197-81e54ec9c36a", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Breakfast Burrito", cuisine: "Mexican", meal: "Breakfast", minutes: 20, tags: ["highProtein"], query: "breakfast burrito", photo: "photo-1574365361850-8e8aec561723", by: ["Bret Kavanaugh", "bretkavanaugh"] },
  { name: "Bibim Guksu (Spicy Cold Noodles)", cuisine: "Korean", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget", "lunchbox"], query: "spicy cold noodles", photo: "photo-1579576792017-054fe0e86b79", by: ["Dionysius Samuel", "samull"] },
  { name: "Yellow Lentil Dal", cuisine: "Indian", meal: "Dinner", minutes: 30, tags: ["vegetarian", "budget"], query: "lentil dal", photo: "photo-1755090154817-58d9d36ec988", by: ["Anil Sharma", "anil_sharma_india"] },
  { name: "Air Fryer Crispy Tofu", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["vegetarian", "highProtein", "budget", "airFryer"], query: "crispy tofu", photo: "photo-1762305194201-077e7e23ccf2", by: ["Lee Milo", "miloleetw"] },
  { name: "Shrimp Fried Rice", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["budget"], query: "shrimp fried rice" , photo: "photo-1551326844-4df70f78d0e9", by: ["Mae Mu", "picoftasty"] },
  { name: "Grilled Lamb Chops", cuisine: "Mediterranean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "lamb chops", photo: "photo-1766589152485-9aafd9812a19", by: ["Diego Arenas de Rodrigo", "diegoarenasderodrigo"] },
  { name: "Red Lentil Soup", cuisine: "Mediterranean", meal: "Lunch", minutes: 35, tags: ["vegetarian", "budget", "soup"], query: "lentil soup", photo: "photo-1648455320791-a667c8aab7e4", by: ["Elena Leya", "foodistika"] },
  { name: "Aloo Paratha", cuisine: "Indian", meal: "Breakfast", minutes: 40, tags: ["vegetarian", "budget"], query: "stuffed paratha", photo: "photo-1788538397295-41114c76044d", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Classic Cheeseburger", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "cheeseburger", photo: "photo-1607013251379-e6eecfffe234", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Tortilla Soup", cuisine: "Mexican", meal: "Lunch", minutes: 30, tags: ["soup"], query: "tortilla soup", photo: "photo-1730243338482-78d6ffd943df", by: ["Daniel Alejandro Jaime Ayala", "frame_photography_mx"] },
  { name: "Veggie Omelette", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "highProtein", "budget"], query: "vegetable omelette" , photo: "photo-1677844592730-ce9c936d8f1a", by: ["Bakd&Raw by Karolin Baitinger", "bakdandraw"] },
  { name: "Steak and Shrimp Avocado Salad", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein", "salad"], query: "steak shrimp salad", photo: "photo-1756521976703-253dbd46dadf", by: ["Hybrid Storytellers", "hybridstorytellers"] },
  { name: "Thai Green Curry", cuisine: "Thai", meal: "Dinner", minutes: 30, tags: [], query: "green curry", photo: "photo-1788016487976-26b8b15f0311", by: ["sofia inductgroup", "sofia_induct"] },
  { name: "Cinnamon Rolls", cuisine: "American", meal: "Breakfast", minutes: 90, tags: ["vegetarian", "snack"], query: "cinnamon rolls", photo: "photo-1694632288834-17d86b340745", by: ["Anisa Cakesandbakes", "anisacakesandbakes"] },
  { name: "Banh Mi Sandwich", cuisine: "Vietnamese", meal: "Lunch", minutes: 20, tags: ["lunchbox"], query: "banh mi", photo: "photo-1710532774170-9844f837ae54", by: ["Luke Tokaryk", "lukelukeluke"] },
  { name: "Salmon Rice Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 20, tags: ["highProtein", "lunchbox"], query: "salmon rice bowl", photo: "photo-1638502182261-7be714a565ce", by: ["Huyen Bui", "huyenbui30"] },
  { name: "Black Bean Burrito Bowl", cuisine: "Mexican", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget", "lunchbox"], query: "burrito bowl" , photo: "photo-1716392976013-66d90cac4411", by: ["AnaCristina Smith", "anacristinacanana"] },
  { name: "Chicken Salad Sandwich", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["highProtein", "lunchbox"], query: "chicken salad sandwich", photo: "photo-1754652327450-23700a7a6bb4", by: ["Dillon Lobo", "dillon_lobo"] },
  { name: "Tteokbokki (Spicy Rice Cakes)", cuisine: "Korean", meal: "Lunch", minutes: 25, tags: ["budget"], query: "tteokbokki", photo: "photo-1747228469541-f0e7f56e7ec7", by: ["lee seunghyub", "sobalc"] },
  { name: "Pepperoni Pizza", cuisine: "Italian", meal: "Dinner", minutes: 30, tags: [], query: "pepperoni pizza", photo: "photo-1534308983496-4fabb1a015ee", by: ["Alan Hardman", "alanaktion"] },
  { name: "Gyudon Beef Rice Bowl", cuisine: "Japanese", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "beef rice bowl egg", photo: "photo-1761064864532-1794a1f8f784", by: ["Nicholas Ng", "nicsandman20"] },
  { name: "Hong Kong BBQ Pork and Duck Rice", cuisine: "Chinese", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "roast meat rice", photo: "photo-1785899578127-f3883106c735", by: ["Zion C", "jcs_chen"] },
  { name: "Miso Ramen with Soft Egg", cuisine: "Japanese", meal: "Dinner", minutes: 25, tags: ["soup"], query: "ramen egg" , photo: "photo-1612927601601-6638404737ce", by: ["ikhsan baihaqi", "his_and"], video: { id: "31387237", file: "13393202_1920_1080_30fps.mp4", poster: "authentic-japanese-historic-japan-japanese-japon-31387237.jpeg", by: ["Ali Alcántara", "alialcantara"] } },
  { name: "Beef Shawarma", cuisine: "Mediterranean", meal: "Lunch", minutes: 30, tags: ["highProtein"], query: "beef shawarma", photo: "photo-1529006557810-274b9b2fc783", by: ["Alexander Mils", "alexandermils"] },
  { name: "Pork Dumplings", cuisine: "Chinese", meal: "Lunch", minutes: 20, tags: ["budget", "lunchbox"], query: "dumplings", photo: "photo-1534422298391-e4f8c172dddb", by: ["Abhishek Sanwa Limbu", "abhishek_sanwa"] },
  { name: "Tandoori Chicken Skewers", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "chicken skewers grill", photo: "photo-1705359573325-f2006d5e459f", by: ["Mihir Sabnis", "wkndbassist"] },
  { name: "Grilled Chicken Pasta Primavera", cuisine: "Italian", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "chicken pasta vegetables", photo: "photo-1773756606644-bbbb1bd16b87", by: ["You Le", "le_y0u"] },
  { name: "Bubbling Korean Jjigae", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["soup", "budget"], query: "korean stew", photo: "photo-1746718547557-1a0e05bed94b", by: ["lee seunghyub", "sobalc"] },
  { name: "Butter Chicken", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "butter chicken curry" , photo: "photo-1603894584373-5ac82b2ae398", by: ["Raman", "potofgold07"] },
  { name: "Tabbouleh", cuisine: "Mediterranean", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget", "salad"], query: "tabbouleh", photo: "photo-1786174044919-c2119725afa1", by: ["Chez Le Libanais", "chezlelibanais"] },
  { name: "Chicken Fajitas", cuisine: "Mexican", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "chicken fajitas", photo: "photo-1689773976415-293dd893f77e", by: ["Thomas Park", "thomascpark"] },
  { name: "Chocolate Chip Cookies", cuisine: "American", meal: "Lunch", minutes: 25, tags: ["vegetarian", "snack"], query: "chocolate chip cookies", photo: "photo-1634188023615-7e08901193b6", by: ["Girl with red hat", "girlwithredhat"], noPlan: true },
  { name: "Chicken Biryani", cuisine: "Indian", meal: "Dinner", minutes: 60, tags: [], query: "chicken biryani", photo: "photo-1631515243349-e0cb75fb8d3a", by: ["Mario Raj", "chefmariii"] },
  { name: "Okonomiyaki", cuisine: "Japanese", meal: "Dinner", minutes: 30, tags: [], query: "okonomiyaki", photo: "photo-1764520406362-b1673b2213bf", by: ["Yosuke Ota", "yosuke_ota"] },
  { name: "Banana Oat Pancakes", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["vegetarian", "budget"], query: "banana pancakes" , photo: "photo-1528207776546-365bb710ee93", by: ["nikldn", "nikldn"], video: { id: "16010284", file: "16010284-hd_1080_1920_60fps.mp4", poster: "pexels-photo-16010284.jpeg", by: ["Anna Zviahina", "anna-zviahina-431214732"] } },
  { name: "Air Fryer Buffalo Wings", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein", "airFryer"], query: "buffalo wings", photo: "photo-1567620832903-9fc6debc209f", by: ["Chad Montano", "briewilly"] },
  { name: "Roasted Whole Fish with Lemon", cuisine: "Mediterranean", meal: "Dinner", minutes: 35, tags: ["highProtein"], query: "roasted fish lemon", photo: "photo-1773417461034-75e751de40ba", by: ["Neil Marshall", "smuggrin"] },
  { name: "Vegetable Lo Mein", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["vegetarian", "budget"], query: "lo mein noodles", photo: "photo-1585032226651-759b368d7246", by: ["Orijit Chatterjee", "orijit57"] },
  { name: "BBQ Pulled Pork Sandwich", cuisine: "American", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "pulled pork sandwich", photo: "photo-1761712826051-b873907fb5d3", by: ["nobleseed nobleseed", "nobleseed"] },
  { name: "Zucchini Noodles with Pine Nuts", cuisine: "Mediterranean", meal: "Lunch", minutes: 15, tags: ["vegetarian"], query: "zucchini noodles", photo: "photo-1788538121927-765593daccb2", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Lemon Herb Roast Chicken", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: ["highProtein"], query: "roast chicken lemon" , photo: "photo-1617636423451-0db0119c14cd", by: ["Tofan Teodor", "tofanteo"] },
  { name: "Fish Curry with Rice", cuisine: "Indian", meal: "Dinner", minutes: 35, tags: ["highProtein"], query: "fish curry rice", photo: "photo-1761314036779-84078bec535c", by: ["Diego Arenas de Rodrigo", "diegoarenasderodrigo"] },
  { name: "Tom Yum Shrimp Soup", cuisine: "Thai", meal: "Lunch", minutes: 25, tags: ["highProtein", "soup"], query: "tom yum shrimp", photo: "photo-1777828827870-92e3069424bd", by: ["Jamie Trinh", "jtrinh_artwork"] },
  { name: "Creamy Mushroom Soup", cuisine: "American", meal: "Lunch", minutes: 30, tags: ["vegetarian", "soup"], query: "mushroom soup", photo: "photo-1771089278772-7ad0d9c03f2f", by: ["David Todd McCarty", "davidtoddmccarty"] },
  { name: "Fresh Spring Rolls", cuisine: "Vietnamese", meal: "Lunch", minutes: 25, tags: ["vegetarian", "lunchbox"], query: "spring rolls", photo: "photo-1761315413785-0bf98364ceab", by: ["Diego Arenas de Rodrigo", "diegoarenasderodrigo"] },
  { name: "Strawberry Spinach Salad", cuisine: "American", meal: "Lunch", minutes: 10, tags: ["vegetarian", "salad"], query: "strawberry salad", photo: "photo-1570197571499-166b36435e9f", by: ["Dovile Ramoskaite", "dovilerm"] },
  { name: "Salmon Poke Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 15, tags: ["highProtein", "lunchbox"], query: "salmon poke bowl" , photo: "photo-1771154141872-e5ad3905a385", by: ["Haim Charbit", "haim_charbit18"] },
  { name: "Fudgy Brownies", cuisine: "American", meal: "Lunch", minutes: 40, tags: ["vegetarian", "snack"], query: "brownies", photo: "photo-1636743715220-d8f8dd900b87", by: ["Anna Przepiorka", "myphotoland"], noPlan: true },
  { name: "Korean BBQ at Home", cuisine: "Korean", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "korean bbq grill", photo: "photo-1548150914-c9f19106dbf6", by: ["Clint Bustrillos", "clintbustrillos"] },
  { name: "Chicken Karaage", cuisine: "Japanese", meal: "Dinner", minutes: 30, tags: ["highProtein", "lunchbox"], query: "karaage", photo: "photo-1788931285595-d54b16c88cf4", by: ["Kouji Tsuru", "pafuxu"] },
  { name: "Udon Noodle Soup", cuisine: "Japanese", meal: "Lunch", minutes: 20, tags: ["budget", "soup"], query: "udon noodle soup", photo: "photo-1761984336917-615bc6f7d4fa", by: ["Kouji Tsuru", "pafuxu"] },
  { name: "Air Fryer Chicken Tenders", cuisine: "American", meal: "Dinner", minutes: 20, tags: ["highProtein", "airFryer", "lunchbox"], query: "chicken tenders", photo: "photo-1605291581926-df4bf7ee3e89", by: ["logan jeffrey", "foodjetsexpress"] },
  { name: "Honey Garlic Chicken Thighs", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein", "budget"], query: "honey garlic chicken" , photo: "photo-1724441980118-741eaf55b0f8", by: ["Mayte Baque", "mtbaque"] },
  { name: "Steamed Dim Sum Dumplings", cuisine: "Chinese", meal: "Lunch", minutes: 30, tags: [], query: "dim sum steamer", photo: "photo-1523905330026-b8bd1f5f320e", by: ["Pooja Chaudhary", "threepointswheretwolinesmeet"] },
  { name: "Sweet and Sour Chicken", cuisine: "Chinese", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "sweet sour chicken", photo: "photo-1537516803400-bf9d09ae3d2f", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Grilled Shrimp Skewers", cuisine: "Mediterranean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "shrimp skewers", photo: "photo-1788603970138-4edbdaf80cc4", by: ["Zayed Ahmed Zadu", "zayed_ahmed_zadu"] },
  { name: "Pesto Pasta with Tomatoes", cuisine: "Italian", meal: "Dinner", minutes: 20, tags: ["vegetarian", "budget"], query: "pesto pasta", photo: "photo-1473093295043-cdd812d0e601", by: ["Eaters Collective", "eaterscollective"] },
  { name: "Borscht (Beet Soup)", cuisine: "Ukrainian", meal: "Dinner", minutes: 60, tags: ["soup", "budget"], query: "borscht", photo: "photo-1780814303735-686588637714", by: ["Catherine", "icath"] },
  { name: "Caprese Sandwich", cuisine: "Italian", meal: "Lunch", minutes: 10, tags: ["vegetarian", "lunchbox"], query: "caprese sandwich" , photo: "photo-1539252554453-80ab65ce3586", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Watermelon Feta Salad", cuisine: "Mediterranean", meal: "Lunch", minutes: 10, tags: ["vegetarian", "salad"], query: "watermelon feta salad", photo: "photo-1743799166469-e55ac1513057", by: ["Kristina Tochilko", "tochilko"] },
  { name: "Chicken Burrito", cuisine: "Mexican", meal: "Lunch", minutes: 20, tags: ["highProtein", "lunchbox"], query: "chicken burrito", photo: "photo-1719282431565-3b30bb7d2658", by: ["Bayuaji Abiyu", "bayuajiabiyu"] },
  { name: "Guacamole and Chips", cuisine: "Mexican", meal: "Lunch", minutes: 10, tags: ["vegetarian", "budget", "snack"], query: "guacamole chips", photo: "photo-1680992071073-cb1696ba8d3e", by: ["Zoshua Colah", "zoshuacolah"], noPlan: true },
  { name: "Masala Dosa", cuisine: "Indian", meal: "Breakfast", minutes: 30, tags: ["vegetarian"], query: "dosa chutney", photo: "photo-1694849789325-914b71ab4075", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Tonkatsu Pork Cutlet", cuisine: "Japanese", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "tonkatsu", photo: "photo-1770966666361-b448e634e163", by: ["Zhang Ziyu", "rs1497"] },
  { name: "Mapo Tofu", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "mapo tofu" , photo: "photo-1788603930622-636954e00065", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Air Fryer Popcorn Shrimp", cuisine: "American", meal: "Dinner", minutes: 20, tags: ["highProtein", "airFryer"], query: "fried shrimp", photo: "photo-1750680229991-726754d4d58b", by: ["Raphael Dalagnol", "raphaeldala"] },
  { name: "Grilled Kebab Platter", cuisine: "Mediterranean", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "grilled meat platter pita", photo: "photo-1777716003985-68fed08d0c7e", by: ["X F", "aizerd"] },
  { name: "Steamed Pork Bao Buns", cuisine: "Chinese", meal: "Lunch", minutes: 40, tags: [], query: "bao buns", photo: "photo-1763661195425-1e3cdd575eb3", by: ["Christine Zhang", "christineezhaang"] },
  { name: "Mac and Cheese", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["vegetarian", "budget"], query: "mac and cheese", photo: "photo-1667499989723-c4ab9549d63c", by: ["Leanna Myers", "myerslk88"] },
  { name: "Spicy Korean Ramen Stew", cuisine: "Korean", meal: "Dinner", minutes: 20, tags: ["soup", "budget"], query: "korean ramen stew tofu", photo: "photo-1777113310299-c3e41dec4e0f", by: ["note thanun", "notethanun"] },
  { name: "Chicken Quesadillas", cuisine: "Mexican", meal: "Lunch", minutes: 15, tags: ["highProtein", "budget", "lunchbox"], query: "chicken quesadilla" , photo: "photo-1673990349292-ed2dfa7988c9", by: ["Benjamin Guardia", "benjaminguardia"] },
  { name: "Asian Sesame Chicken Salad", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["highProtein", "salad"], query: "asian chicken salad", photo: "photo-1750049514875-5ba5c66d6f99", by: ["Kylie White", "nourishedclinic"] },
  { name: "Thai Basil Chicken with Fried Egg", cuisine: "Thai", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "basil chicken rice egg", photo: "photo-1562565651-7d4948f339eb", by: ["Jerome Jome", "jomemui"] },
  { name: "Tiramisu", cuisine: "Italian", meal: "Lunch", minutes: 30, tags: ["vegetarian", "snack"], query: "tiramisu", photo: "photo-1571877227200-a0d98ea607e9", by: ["Marianna OLE", "marianna_ole"], noPlan: true },
  { name: "Spicy Korean Pork Stir-Fry", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "spicy pork stir fry", photo: "photo-1777598405371-e657109ddd50", by: ["Junel Mujar", "junelmujar"] },
  { name: "Japanese Breakfast Set", cuisine: "Japanese", meal: "Breakfast", minutes: 20, tags: [], query: "japanese breakfast", photo: "photo-1642821199328-a3bcdc821552", by: ["Takafumi Yamashita", "yamashita0129"] },
  { name: "Overnight Oats with Berries", cuisine: "American", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "budget"], query: "overnight oats berries" , photo: "photo-1490371475955-4cb3bfc72f71", by: ["Alisha Hieb", "wildandinlove"] },
  { name: "Air Fryer Loaded Baked Potato", cuisine: "American", meal: "Dinner", minutes: 45, tags: ["airFryer", "budget"], query: "loaded baked potato", photo: "photo-1761712826074-5f1bab2b2f32", by: ["nobleseed nobleseed", "nobleseed"] },
  { name: "Yakisoba Stir-Fried Noodles", cuisine: "Japanese", meal: "Lunch", minutes: 20, tags: ["budget"], query: "yakisoba noodles", photo: "photo-1674516585624-422828b423f1", by: ["Kawê Rodrigues", "kawerodriguess"] },
  { name: "Spicy Hot Pot", cuisine: "Chinese", meal: "Dinner", minutes: 40, tags: ["soup"], query: "hot pot", photo: "photo-1784429611794-aecb6ebaef48", by: ["Leongsan", "leongsan"] },
  { name: "Wonton Noodle Soup", cuisine: "Chinese", meal: "Lunch", minutes: 25, tags: ["soup"], query: "wonton soup", photo: "photo-1763994685090-c0927ff195d1", by: ["Fenghua", "fenghua1975"] },
  { name: "Chana Chaat (Chickpea Salad)", cuisine: "Indian", meal: "Lunch", minutes: 10, tags: ["vegetarian", "budget", "salad"], query: "chickpea salad", photo: "photo-1697155836261-f7afd5353e64", by: ["Rashpal Singh", "rashpalsingh"] },
  { name: "Japchae Glass Noodles", cuisine: "Korean", meal: "Lunch", minutes: 30, tags: ["lunchbox"], query: "japchae noodles" , photo: "photo-1774717530911-2ceb99449f7a", by: ["Andrii Solok", "getslower"] },
  { name: "Strawberry Bingsu", cuisine: "Korean", meal: "Lunch", minutes: 10, tags: ["vegetarian", "snack"], query: "bingsu shaved ice", photo: "photo-1771209802058-3b40ce534905", by: ["Seungmin Yoon", "yoonlog"], noPlan: true },
  { name: "Minestrone Soup", cuisine: "Italian", meal: "Lunch", minutes: 35, tags: ["vegetarian", "budget", "soup"], query: "minestrone soup", photo: "photo-1672667509947-865215fa66db", by: ["Babs Gorniak", "babs_gorniak"] },
  { name: "Sashimi Rice Bowl with Miso Soup", cuisine: "Japanese", meal: "Dinner", minutes: 20, tags: ["highProtein"], query: "sashimi bowl", photo: "photo-1724365956437-1b7e1ade4cf7", by: ["Tadahiro Higuchi", "tad_higuchi"] },
  { name: "Hummus Plate with Pita", cuisine: "Mediterranean", meal: "Lunch", minutes: 10, tags: ["vegetarian", "budget"], query: "hummus pita", photo: "photo-1687244433510-747e3fd97afe", by: ["Cosmin Ursea", "cosminursea"] },
  { name: "Sticky Sesame Pork Ribs", cuisine: "American", meal: "Dinner", minutes: 60, tags: ["highProtein"], query: "glazed pork ribs", photo: "photo-1790900618012-96f454e2d112", by: ["Myron Mott", "s2killa"] },
  { name: "Mushroom Risotto", cuisine: "Italian", meal: "Dinner", minutes: 40, tags: ["vegetarian"], query: "mushroom risotto" , photo: "photo-1791409287840-f56f8611bc84", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Black Bean Soup", cuisine: "Mexican", meal: "Lunch", minutes: 40, tags: ["vegetarian", "budget", "soup"], query: "black bean soup", photo: "photo-1647545401750-6dd5539879ac", by: ["Mikey Frost", "frostyfilmsandphoto"] },
  { name: "Chicken Noodle Soup", cuisine: "American", meal: "Lunch", minutes: 35, tags: ["highProtein", "budget", "soup"], query: "chicken noodle soup", photo: "photo-1584003397078-45ef96d6174d", by: ["Melissa Walker Horn", "sugercoatit"] },
  { name: "Cucumber Onion Salad", cuisine: "American", meal: "Lunch", minutes: 10, tags: ["vegetarian", "budget", "salad"], query: "cucumber salad", photo: "photo-1679735107918-15112296e28d", by: ["Alex Bayev", "alexbayev"] },
  { name: "Chicken Satay with Peanut Sauce", cuisine: "Thai", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "chicken satay", photo: "photo-1772855386828-a18ff9a12584", by: ["likesilkto", "likesilkto"] },
  { name: "Churros", cuisine: "Mexican", meal: "Lunch", minutes: 30, tags: ["vegetarian", "snack"], query: "churros", photo: "photo-1767489386700-cb3dbcbab13d", by: ["Kay Si Ying", "kaysiying"], noPlan: true },
  { name: "Turkey Chili", cuisine: "American", meal: "Dinner", minutes: 40, tags: ["highProtein", "budget", "soup"], query: "turkey chili bowl" , photo: "photo-1790701909034-6c7b45c7b58a", by: ["Chad Montano", "briewilly"] },
  { name: "Homemade Meatloaf", cuisine: "American", meal: "Dinner", minutes: 60, tags: ["highProtein", "budget"], query: "meatloaf", photo: "photo-1705945021699-7374c3fd34cb", by: ["Martinet Sinan", "foodfusionfrenzy"] },
  { name: "Miso Soup with Tofu", cuisine: "Japanese", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "budget", "soup"], query: "miso soup tofu", photo: "photo-1763470260582-894ae15f43bb", by: ["note thanun", "notethanun"] },
  { name: "Creamy Potato Soup", cuisine: "American", meal: "Lunch", minutes: 40, tags: ["vegetarian", "budget", "soup"], query: "potato soup", photo: "photo-1642463002619-f6e168821c56", by: ["Thembi Johnson", "tastytin"] },
  { name: "Shrimp Congee", cuisine: "Chinese", meal: "Breakfast", minutes: 30, tags: ["budget"], query: "congee", photo: "photo-1766761562530-c8dd12c96d9a", by: ["Dean Zhang", "startdig"] },
  { name: "Samosas", cuisine: "Indian", meal: "Lunch", minutes: 45, tags: ["vegetarian", "snack"], query: "samosas", photo: "photo-1601050690597-df0568f70950", by: ["kabir cheema", "kabircheema"], noPlan: true },
  { name: "Falafel Pita with Hummus", cuisine: "Mediterranean", meal: "Lunch", minutes: 25, tags: ["vegetarian", "lunchbox"], query: "falafel pita" , photo: "photo-1788795567489-22430aa94402", by: ["Wera Durakova", "wera"] },
  { name: "BBQ Ribs", cuisine: "American", meal: "Dinner", minutes: 90, tags: ["highProtein"], query: "bbq ribs", photo: "photo-1761712826171-609bcf1d02af", by: ["nobleseed nobleseed", "nobleseed"] },
  { name: "Garlic Shrimp Pasta", cuisine: "Italian", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "shrimp pasta", photo: "photo-1677681483419-e18aa1376db7", by: ["Ellie Ellien", "ellienelie"] },
  { name: "Beef and Bean Chili", cuisine: "American", meal: "Dinner", minutes: 45, tags: ["highProtein", "budget", "soup"], query: "chili bowl", photo: "photo-1729450412050-6c00ec592e34", by: ["Maria Klichik", "switchinglanes"] },
  { name: "Stuffed Bell Peppers", cuisine: "Mediterranean", meal: "Dinner", minutes: 45, tags: ["highProtein"], query: "stuffed peppers", photo: "photo-1673646960062-9aeb2188335f", by: ["Natalia Gusakova", "nataliaraylenegusakova"] },
  { name: "Tomato Bruschetta", cuisine: "Italian", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget", "snack"], query: "bruschetta", photo: "photo-1594978583693-8dfdfc93f052", by: ["Mike van den Bos", "mike_van_den_bos"], noPlan: true },
  { name: "Egg Fried Noodles", cuisine: "Chinese", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget"], query: "fried noodles egg" , photo: "photo-1789999964582-b1c9b78c8488", by: ["Zoshua Colah", "zoshuacolah"], video: { id: "34711974", file: "14713479_1080_1920_30fps.mp4", poster: "pexels-photo-34711974.jpeg", by: ["Hi Nana Shop", "hi-nana-shop-1032285012"] } },
  { name: "Bacon and Eggs with Toast", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["highProtein"], query: "bacon eggs toast", photo: "photo-1734770205674-d117e4ba7926", by: ["Snappr", "snappr"] },
  { name: "Grilled Cheese and Tomato Soup", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget", "soup"], query: "grilled cheese tomato soup", photo: "photo-1762647420988-5080acf33988", by: ["David Trinks", "dtrinksrph"] },
  { name: "Kalguksu (Knife-Cut Noodle Soup)", cuisine: "Korean", meal: "Lunch", minutes: 30, tags: ["soup", "budget"], query: "kalguksu", photo: "photo-1775883374700-bddbb6c80fcb", by: ["note thanun", "notethanun"] },
  { name: "Sizzling Tofu and Vegetables", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["vegetarian", "highProtein", "budget"], query: "tofu vegetables skillet", photo: "photo-1787732089211-69941bf91603", by: ["Kuali Nenek", "kualinenekjkt"] },
  { name: "Blueberry Cheesecake", cuisine: "American", meal: "Lunch", minutes: 60, tags: ["vegetarian", "snack"], query: "cheesecake", photo: "photo-1702925614886-50ad13c88d3f", by: ["A Studios", "an78725"], noPlan: true },
  { name: "Palak Paneer", cuisine: "Indian", meal: "Dinner", minutes: 35, tags: ["vegetarian", "highProtein"], query: "palak paneer" , photo: "photo-1767114915936-745dd372f1d8", by: ["Chetanya Sharma", "chetanya_designs"] },
  { name: "Greek Yogurt Granola Parfait", cuisine: "American", meal: "Breakfast", minutes: 5, tags: ["vegetarian"], query: "yogurt granola parfait", photo: "photo-1763825613390-287a9db0803d", by: ["Nikita Khowala", "nikitakhowala"] },
  { name: "Spaghetti Carbonara", cuisine: "Italian", meal: "Dinner", minutes: 20, tags: [], query: "spaghetti carbonara", photo: "photo-1633337474564-1d9478ca4e2e", by: ["Rob Wicks", "robwicks"] },
  { name: "Korean Beef Soup", cuisine: "Korean", meal: "Dinner", minutes: 45, tags: ["soup", "highProtein"], query: "korean beef soup", photo: "photo-1618351708186-5ba8a9da1933", by: ["Choi sungwoo", "beancurd"] },
  { name: "Seafood Paella", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: [], query: "seafood paella", photo: "photo-1694685367640-05d6624e57f1", by: ["Rook of Arts", "rookofartsphotography"] },
  { name: "Takoyaki", cuisine: "Japanese", meal: "Lunch", minutes: 30, tags: ["snack"], query: "takoyaki", photo: "photo-1742633882704-41ec3a57dbb7", by: ["Allen Y", "yanahd"], noPlan: true },
  { name: "French Toast with Berries", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["vegetarian"], query: "french toast berries", photo: "photo-1639108094328-2b94a49b1c2e", by: ["Dorrell Tibbs", "whatuprell"] },
  { name: "Cheesy Vegetable Egg Bake", cuisine: "American", meal: "Breakfast", minutes: 35, tags: ["vegetarian", "highProtein"], query: "egg bake casserole", photo: "photo-1673960729830-76830e8b3db4", by: ["Sandie Clarke", "honeypoppet"] },
  { name: "Skillet Meatballs in Tomato Sauce", cuisine: "Italian", meal: "Dinner", minutes: 35, tags: ["highProtein"], query: "meatballs tomato sauce", photo: "photo-1787261534727-b9c89aa2bb11", by: ["Caroline Badran", "___atmos"] },
  { name: "Shoyu Pork Ramen", cuisine: "Japanese", meal: "Dinner", minutes: 30, tags: ["soup"], query: "pork ramen", photo: "photo-1638866281450-3933540af86a", by: ["Huyen Bui", "huyenbui30"] },
  { name: "Ratatouille", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: ["vegetarian", "budget"], query: "ratatouille", photo: "photo-1785703285213-c15cbb8a286e", by: ["Mario Gogh", "mariogogh"] },
  { name: "Raspberry Oat Bars", cuisine: "American", meal: "Lunch", minutes: 40, tags: ["vegetarian", "snack"], query: "oat bars", photo: "photo-1763080348919-0a4969e31afc", by: ["sheri silver", "sheri_silver"], noPlan: true },
  { name: "Chopped Salad with Eggs", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["highProtein", "salad"], query: "salad boiled eggs", photo: "photo-1649531794752-5833ee051fb6", by: ["Tricia Timney", "triciatimney"] },
  { name: "Scrambled Eggs on Toast", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "budget"], query: "scrambled eggs toast", photo: "photo-1733105666420-729679827ba1", by: ["Tadahiro Higuchi", "tad_higuchi"] },
  { name: "Chicken Gyro with Fries", cuisine: "Mediterranean", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "gyro pita", photo: "photo-1745126009946-1b35b1a16fec", by: ["Nick Nice", "nicknice"] },
  { name: "Garden Vegetable Soup", cuisine: "American", meal: "Lunch", minutes: 35, tags: ["vegetarian", "budget", "soup"], query: "vegetable soup", photo: "photo-1612108438004-257c47560118", by: ["Jametlene Reskp", "reskp"] },
  { name: "Acai Smoothie Bowl", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian"], query: "acai bowl", photo: "photo-1627308594190-a057cd4bfac8", by: ["Vicky Ng", "vickyng"] },
  { name: "Apple Pie", cuisine: "American", meal: "Lunch", minutes: 90, tags: ["vegetarian", "snack"], query: "apple pie", photo: "photo-1535920527002-b35e96722eb9", by: ["Hugo Aitken", "hugoaitken"], noPlan: true },
  { name: "Bagel with Smoked Salmon", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["highProtein"], query: "bagel smoked salmon", photo: "photo-1790701853579-c4fcb5713a00", by: ["Chad Montano", "briewilly"] },
  { name: "Creamy Garlic Chicken", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "creamy chicken", photo: "photo-1748012199672-2a94ab9cbb19", by: ["Sanket Deorukhkar", "visualcaches"] },
  { name: "Sheet Pan Roasted Vegetables", cuisine: "American", meal: "Dinner", minutes: 35, tags: ["vegetarian", "budget"], query: "roasted vegetables", photo: "photo-1766701753139-352e46e51c01", by: ["Barnaby Woodrow", "cranky_bear"] },
  { name: "Chocolate Cake", cuisine: "American", meal: "Lunch", minutes: 60, tags: ["vegetarian", "snack"], query: "chocolate cake", photo: "photo-1700448293876-07dca826c161", by: ["yiseul han", "hanyiseul"], noPlan: true },
  { name: "Chicken Caesar Salad", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["highProtein", "salad"], query: "chicken caesar salad", photo: "photo-1782839577893-da9383e55c96", by: ["R. G", "bored_mongoose"] },
  { name: "Lobster Roll", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["highProtein"], query: "lobster roll", photo: "photo-1751298467221-bb1b0d298101", by: ["Crunch", "crunch_london"] },
  { name: "Steak and Potatoes", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "steak potatoes", photo: "photo-1678684279246-96e6afb970f2", by: ["Natalia Gusakova", "nataliaraylenegusakova"] },
  { name: "Stovetop Popcorn", cuisine: "American", meal: "Lunch", minutes: 10, tags: ["vegetarian", "budget", "snack"], query: "popcorn", photo: "photo-1505686994434-e3cc5abf1330", by: ["Georgia Vagim", "georgiavagim"], noPlan: true },
  { name: "Strawberry Waffles", cuisine: "American", meal: "Breakfast", minutes: 20, tags: ["vegetarian"], query: "waffles strawberries", photo: "photo-1594627882045-57465104050f", by: ["Svitlana", "kekse_und_ich"] },
  { name: "Crispy Chicken Sandwich", cuisine: "American", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "chicken sandwich", photo: "photo-1700768400970-428c50bffc11", by: ["Crunch", "crunch_london"] },
  { name: "Egg and Tomato Toast", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "budget"], query: "egg toast tomato", photo: "photo-1533089860892-a7c6f0a88666", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Pumpkin Pie", cuisine: "American", meal: "Lunch", minutes: 90, tags: ["vegetarian", "snack"], query: "pumpkin pie", photo: "photo-1509461399763-ae67a981b254", by: ["Element5 Digital", "element5digital"], noPlan: true },
  { name: "Chicken Pot Pie", cuisine: "American", meal: "Dinner", minutes: 50, tags: [], query: "chicken pot pie", photo: "photo-1581986675622-41eccf27129d", by: ["David Foodphototasty", "phototastyfood"] },
  { name: "Sheet Pan Salmon and Vegetables", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "baked salmon vegetables", photo: "photo-1565569753899-bce952b68958", by: ["Lazar Gugleta", "lazargugleta"] },
  { name: "Turkey Sandwich", cuisine: "American", meal: "Lunch", minutes: 10, tags: ["highProtein", "budget", "lunchbox"], query: "turkey sandwich", photo: "photo-1608330557791-8dff6a434bbf", by: ["James Kern", "jamesrkern"] },
  { name: "Vanilla Berry Ice Cream", cuisine: "American", meal: "Lunch", minutes: 10, tags: ["vegetarian", "snack"], query: "ice cream", photo: "photo-1597249536924-b226b1a1259d", by: ["Kelsey Curtis", "kelseycurtis"], noPlan: true },
  { name: "Roast Turkey Dinner", cuisine: "American", meal: "Dinner", minutes: 180, tags: ["highProtein"], query: "roast turkey", photo: "photo-1763689454945-4b0f3b151969", by: ["Prchi Palwe", "prachipalwe"] },
  { name: "Crispy Spring Rolls", cuisine: "Chinese", meal: "Lunch", minutes: 30, tags: ["vegetarian", "snack", "airFryer"], query: "fried spring rolls", photo: "photo-1787273670681-b1886c2807a3", by: ["tommao wang", "tommaomaoer"], noPlan: true },
  { name: "Grill Pan Steak Bites", cuisine: "American", meal: "Dinner", minutes: 20, tags: ["highProtein"], query: "steak bites", photo: "photo-1763343146204-50aec9ab91ef", by: ["Oleksandra Nadtocha", "nadtochiyphotography"] },
  { name: "Green Smoothie", cuisine: "American", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "snack"], query: "green smoothie", photo: "photo-1584587727565-a486d45d58b4", by: ["LyfeFuel", "lyfefuel"] },
  { name: "Air Fryer French Fries", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget", "airFryer", "snack"], query: "french fries", photo: "photo-1606755456206-b25206cde27e", by: ["Eiliv Aceron", "shootdelicious"], noPlan: true },
  { name: "Air Fryer Sweet Potato Fries", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget", "airFryer", "snack"], query: "sweet potato fries", photo: "photo-1745792714512-77cffdb16020", by: ["Edward Hagenauer", "kmrlgvnrwlnwl"], noPlan: true },
  { name: "Air Fryer Brussels Sprouts", cuisine: "American", meal: "Dinner", minutes: 15, tags: ["vegetarian", "budget", "airFryer", "snack"], query: "brussels sprouts", photo: "photo-1771285119403-6b86b7e643be", by: ["Gang Hao", "haogang"], noPlan: true },
];

export function dishMatches(d: FeedDish, filter: string): boolean {
  if (filter === "forYou") return true;
  if (filter === "quick") return d.minutes <= QUICK_MINUTES;
  if ((TAG_FILTERS as string[]).includes(filter)) return d.tags.includes(filter as DishTag);
  return d.cuisine === filter;
}

export function findFeedDish(name: string): FeedDish | undefined {
  const n = name.trim().toLowerCase();
  return FEED.find(d => d.name.toLowerCase() === n);
}

// Korean (and a few English) search words → English words used in dish
// names, tags and meals, so "김치찌개" or "아침" still finds feed dishes.
const SEARCH_ALIASES: Record<string, string[]> = {
  "김치": ["kimchi"], "불고기": ["bulgogi"], "비빔밥": ["bibimbap"], "떡볶이": ["tteokbokki"], "라면": ["ramen", "ramyeon"], "라멘": ["ramen"],
  "찌개": ["jjigae", "stew"], "전골": ["hot pot", "stew"], "국밥": ["soup"], "국": ["soup"], "탕": ["soup", "stew"], "수프": ["soup"], "스프": ["soup"],
  "국수": ["noodle", "guksu"], "냉면": ["cold noodle"], "칼국수": ["kalguksu"], "잡채": ["japchae"], "만두": ["dumpling"], "김밥": ["kimbap", "sushi roll"],
  "도시락": ["lunch box", "bento", "lunchbox"], "치킨": ["chicken"], "닭": ["chicken"], "소고기": ["beef"], "쇠고기": ["beef"], "돼지": ["pork"], "삼겹살": ["korean bbq", "pork"],
  "갈비": ["korean bbq", "ribs"], "연어": ["salmon"], "새우": ["shrimp"], "생선": ["fish"], "두부": ["tofu"], "계란": ["egg"], "달걀": ["egg"],
  "샐러드": ["salad"], "파스타": ["pasta", "spaghetti", "penne"], "피자": ["pizza"], "카레": ["curry"], "커리": ["curry"], "타코": ["taco"],
  "햄버거": ["burger"], "버거": ["burger"], "샌드위치": ["sandwich"], "볶음밥": ["fried rice"], "덮밥": ["rice bowl", "don"], "죽": ["congee", "porridge"],
  "우동": ["udon"], "소바": ["soba"], "돈가스": ["tonkatsu"], "돈까스": ["tonkatsu"], "초밥": ["sushi", "sashimi"], "회": ["sashimi"], "쌀국수": ["pho"],
  "팟타이": ["pad thai"], "스테이크": ["steak"], "감자": ["potato"], "고구마": ["sweet potato"], "브라우니": ["brownie"], "케이크": ["cake"],
  "빵": ["bread", "toast"], "팬케이크": ["pancake"], "와플": ["waffle"], "오믈렛": ["omelette"], "빙수": ["bingsu"], "디저트": ["snack"], "간식": ["snack"],
  "아침": ["breakfast"], "점심": ["lunch"], "저녁": ["dinner"], "채식": ["vegetarian"], "에어프라이어": ["air fryer", "airfryer"],
  "한식": ["korean"], "한국": ["korean"], "일본": ["japanese"], "중국": ["chinese"], "이탈리아": ["italian"], "미국": ["american"], "캐나다": ["canadian"], "일식": ["japanese"], "중식": ["chinese"], "양식": ["american", "italian"], "멕시코": ["mexican"], "인도": ["indian"], "태국": ["thai"], "베트남": ["vietnamese"],
  // Loanwords people type in Korean
  "스시": ["sushi", "sashimi", "poke"], "사시미": ["sashimi"], "포케": ["poke"], "롤": ["roll"], "참치": ["tuna"],
  "부리또": ["burrito"], "브리또": ["burrito"], "퀘사디아": ["quesadilla"], "나초": ["nacho"], "엔칠라다": ["enchilada"], "파히타": ["fajita"], "츄러스": ["churro"], "추로스": ["churro"], "과카몰리": ["guacamole"],
  "누들": ["noodle"], "짬뽕": ["noodle", "soup"], "짜장": ["noodle"], "탕수육": ["sweet and sour"], "마파두부": ["mapo tofu"], "딤섬": ["dim sum", "dumpling"], "덤플링": ["dumpling"], "바오": ["bao"], "훠궈": ["hot pot"], "콘지": ["congee"],
  "반미": ["banh mi"], "똠얌": ["tom yum"], "그린커리": ["green curry"], "사테": ["satay"], "월남쌈": ["spring roll"], "스프링롤": ["spring roll"],
  "규동": ["gyudon", "beef rice bowl"], "오야코동": ["chicken and egg", "rice bowl"], "돈부리": ["rice bowl"], "카츠": ["katsu", "tonkatsu"], "가라아게": ["karaage"], "미소": ["miso"],
  "오코노미야키": ["okonomiyaki"], "타코야키": ["takoyaki"], "벤또": ["bento"], "벤토": ["bento"], "야끼소바": ["yakisoba"], "야키소바": ["yakisoba"],
  "라자냐": ["lasagna"], "리조또": ["risotto"], "뇨끼": ["gnocchi"], "까르보나라": ["carbonara"], "카르보나라": ["carbonara"], "볼로네제": ["bolognese"], "미트볼": ["meatball"], "티라미수": ["tiramisu"], "브루스케타": ["bruschetta"], "카프레제": ["caprese"], "페스토": ["pesto"], "미네스트로네": ["minestrone"],
  "후무스": ["hummus"], "팔라펠": ["falafel"], "기로스": ["gyro"], "자이로": ["gyro"], "수블라키": ["souvlaki"], "케밥": ["kebab"], "샤와르마": ["shawarma"], "샥슈카": ["shakshuka"], "타불레": ["tabbouleh"], "파에야": ["paella"], "라따뚜이": ["ratatouille"], "감바스": ["gambas", "garlic shrimp"],
  "버터치킨": ["butter chicken"], "탄두리": ["tandoori"], "비리야니": ["biryani"], "달": ["dal"], "파니르": ["paneer"], "사모사": ["samosa"], "도사": ["dosa"], "난": ["naan"], "티카": ["tikka"],
  "립": ["ribs"], "바베큐": ["bbq"], "바비큐": ["bbq"], "미트로프": ["meatloaf"], "푸틴": ["poutine"], "피시앤칩스": ["fish and chips"], "랍스터": ["lobster"], "치킨윙": ["wings"], "윙": ["wings"], "텐더": ["tenders"], "감자튀김": ["fries"], "고구마튀김": ["sweet potato fries"], "칠리": ["chili"],
  "토스트": ["toast"], "프렌치토스트": ["french toast"], "베이글": ["bagel"], "머핀": ["muffin"], "쿠키": ["cookie"], "치즈케이크": ["cheesecake"], "파이": ["pie"], "아이스크림": ["ice cream"], "스무디": ["smoothie"], "아사이": ["acai"], "그래놀라": ["granola"], "요거트": ["yogurt"], "요구르트": ["yogurt"], "오트밀": ["oat"], "크레페": ["crepe"], "시나몬롤": ["cinnamon roll"], "바나나빵": ["banana bread"], "팝콘": ["popcorn"],
  "치즈": ["cheese"], "버섯": ["mushroom"], "호박": ["pumpkin", "squash"], "토마토": ["tomato"], "아보카도": ["avocado"], "브로콜리": ["broccoli"], "콩": ["bean", "chickpea", "lentil"], "병아리콩": ["chickpea"], "렌틸": ["lentil"], "양고기": ["lamb"], "칠면조": ["turkey"], "오리": ["duck"], "오징어": ["squid"], "조개": ["clam"], "굴": ["oyster"],
  "볶음": ["stir-fry", "stir fry", "fried"], "구이": ["grilled", "roast"], "찜": ["steamed", "braised"], "튀김": ["fried", "crispy"], "면": ["noodle", "pasta"], "밥": ["rice"],
  "dessert": ["snack"], "desserts": ["snack"], "snacks": ["snack"], "soups": ["soup"], "salads": ["salad"], "noodles": ["noodle"],
};

export function searchTerms(q: string): string[] {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const terms = new Set<string>([query]);
  // Each word on its own too ("kimchi stew" → kimchi, stew), skipping filler words.
  const STOP = new Set(["and", "with", "the", "for", "recipe", "easy", "best", "of"]);
  query.split(/\s+/).filter(w => w.length >= 3 && !STOP.has(w)).forEach(w => terms.add(w.replace(/s$/, "")));
  const tokens = query.split(/\s+/);
  for (const [k, vs] of Object.entries(SEARCH_ALIASES)) {
    // One-letter words (밥, 국, 면, 회, 죽, 탕, 달, 난, 굴, 콩, 찜, 롤, 윙, 립) only count as a whole word,
    // so "초밥" isn't read as "rice" and "한국" isn't read as "soup".
    const hit = k.length === 1 ? tokens.includes(k) : query.includes(k);
    if (hit) vs.forEach(v => terms.add(v));
  }
  return Array.from(terms);
}

// How many search terms a dish matches (0 = not a match). Used to rank results.
export function dishSearchScore(d: FeedDish, terms: string[]): number {
  const hay = `${d.name} ${d.cuisine} ${d.meal} ${d.tags.join(" ")} ${d.tags.includes("airFryer") ? "air fryer" : ""}`.toLowerCase();
  return terms.filter(t => hay.includes(t)).length;
}
