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
  video?: FeedVideo;
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
  { name: "Kimchi Fried Rice with Egg", cuisine: "Korean", meal: "Lunch", minutes: 15, tags: ["budget"], query: "kimchi fried rice egg" , photo: "photo-1600688654899-379ec76aca42", by: ["Emanuel Ekström", "emanuelekstrom"] },
  { name: "Creamy Tomato Pasta", cuisine: "Italian", meal: "Dinner", minutes: 25, tags: ["vegetarian", "budget"], query: "creamy tomato pasta" , photo: "photo-1608897013039-887f21d8c804", by: ["Aleksandra Tanasiienko", "tasikola_pl"] },
  { name: "Bibimbap", cuisine: "Korean", meal: "Lunch", minutes: 25, tags: [], query: "bibimbap", photo: "photo-1741295017668-c8132acd6fc0", by: ["Dmitry Pavlovsky", "vectorburn"] },
  { name: "Homemade Sushi Rolls", cuisine: "Japanese", meal: "Lunch", minutes: 40, tags: [], query: "sushi rolls", photo: "photo-1608731002248-747dee753517", by: ["Devi Puspita Amartha Yahya", "deviyahya"] },
  { name: "Beef Tacos", cuisine: "Mexican", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "beef tacos" , photo: "photo-1599974579688-8dbdd335c77f", by: ["Jeswin Thomas", "jeswinthomas"], video: { id: "37346941", file: "15819062_1080_1920_30fps.mp4", poster: "pexels-photo-37346941.jpeg", by: ["Kuiyibo Campos", "kuiyibo"] } },
  { name: "Kung Pao Chicken", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "kung pao chicken", photo: "photo-1605704922285-e82455dba38b", by: ["Karolina Kołodziejczak", "rabbit_in_blue"] },
  { name: "Margherita Pizza", cuisine: "Italian", meal: "Dinner", minutes: 30, tags: ["vegetarian"], query: "margherita pizza", photo: "photo-1769733338940-c406b721583f", by: ["tommao wang", "tommaomaoer"] },
  { name: "Greek Yogurt Berry Bowl", cuisine: "Mediterranean", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "highProtein"], query: "yogurt bowl berries" , photo: "photo-1670843839025-d50924a51f31", by: ["Joanna Stołowicz", "joanna_stolowicz"] },
  { name: "Shrimp Tacos", cuisine: "Mexican", meal: "Dinner", minutes: 20, tags: ["highProtein"], query: "shrimp tacos", photo: "photo-1564976704241-79e265ed90fc", by: ["Nate Johnston", "natejohnston"] },
  { name: "Chicken Tikka Masala", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "chicken curry rice", photo: "photo-1708782344490-9026aaa5eec7", by: ["Rimsha Noor", "rimshaj123"] },
  { name: "Chickpea Curry", cuisine: "Indian", meal: "Dinner", minutes: 30, tags: ["vegetarian", "budget"], query: "chickpea curry" , photo: "photo-1788602564560-9bcbf0f9acb6", by: ["Zoshua Colah", "zoshuacolah"], video: { id: "30044755", file: "12888245_1080_1920_30fps.mp4", poster: "art-of-cooking-colorful-vegetables-cooking-cooking-area-30044755.jpeg", by: ["Deep Pandey", "deep-pandey-807839685"] } },
  { name: "Shakshuka", cuisine: "Mediterranean", meal: "Breakfast", minutes: 25, tags: ["vegetarian", "budget"], query: "shakshuka eggs", photo: "photo-1682622110419-b671026a4536", by: ["Alex Bayev", "alexbayev"] },
  { name: "Quinoa Tofu Avocado Bowl", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["vegetarian", "highProtein"], query: "quinoa tofu bowl", photo: "photo-1763000215238-38350d3e41ac", by: ["David Magalhães", "speeddragon35"] },
  { name: "Teriyaki Chicken Rice Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "teriyaki chicken rice" , photo: "photo-1684815595429-cf46bff6294f", by: ["Michael Kahn", "mklibrary"] },
  { name: "Pad Thai", cuisine: "Thai", meal: "Dinner", minutes: 25, tags: [], query: "pad thai", photo: "photo-1707546944460-dda9069b9c1e", by: ["Hidden", "hidden_iye"] },
  { name: "Beef Pho", cuisine: "Vietnamese", meal: "Dinner", minutes: 40, tags: [], query: "pho noodle soup", photo: "photo-1731460202531-bf8389d565f7", by: ["Nancy Ingersoll", "thecreativeresource"] },
  { name: "Greek Salad with Grilled Chicken", cuisine: "Mediterranean", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "greek salad chicken" , photo: "photo-1690573313202-4493a7d02e9c", by: ["Svitlana", "kekse_und_ich"] },
  { name: "Korean Fried Chicken", cuisine: "Korean", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "fried chicken", photo: "photo-1566918214014-a3b3e0132267", by: ["Huynh Quyet", "huynhquyet9682"] },
  { name: "Chicken Katsu Curry", cuisine: "Japanese", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "katsu curry", photo: "photo-1569050467447-ce54b3bbc37d", by: ["Stefen Tan", "stefentan"] },
  { name: "Spaghetti Bolognese", cuisine: "Italian", meal: "Dinner", minutes: 35, tags: ["budget"], query: "spaghetti bolognese" , photo: "photo-1673442635965-34f1b36d8944", by: ["Sofia Ciravegna", "sociravegna"] },
  { name: "Beef and Broccoli", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "beef broccoli", photo: "photo-1760504526069-ff0f8bf6e4ca", by: ["Davis Dai", "lingo4208"] },
  { name: "Classic Beef Lasagna", cuisine: "Italian", meal: "Dinner", minutes: 60, tags: [], query: "lasagna", photo: "photo-1709429790175-b02bb1b19207", by: ["Emanuel Ekström", "emanuelekstrom"] },
  { name: "Soft Tofu Stew (Sundubu Jjigae)", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "sundubu jjigae tofu stew" , photo: "photo-1760228865341-675704c22a5b", by: ["rawkkim", "rawkkim"] },
  { name: "Breakfast Burrito", cuisine: "Mexican", meal: "Breakfast", minutes: 20, tags: ["highProtein"], query: "breakfast burrito", photo: "photo-1574365361850-8e8aec561723", by: ["Bret Kavanaugh", "bretkavanaugh"] },
  { name: "Yellow Lentil Dal", cuisine: "Indian", meal: "Dinner", minutes: 30, tags: ["vegetarian", "budget"], query: "lentil dal", photo: "photo-1755090154817-58d9d36ec988", by: ["Anil Sharma", "anil_sharma_india"] },
  { name: "Shrimp Fried Rice", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["budget"], query: "shrimp fried rice" , photo: "photo-1551326844-4df70f78d0e9", by: ["Mae Mu", "picoftasty"] },
  { name: "Red Lentil Soup", cuisine: "Mediterranean", meal: "Lunch", minutes: 35, tags: ["vegetarian", "budget"], query: "lentil soup", photo: "photo-1648455320791-a667c8aab7e4", by: ["Elena Leya", "foodistika"] },
  { name: "Classic Cheeseburger", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "cheeseburger", photo: "photo-1607013251379-e6eecfffe234", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Veggie Omelette", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "highProtein", "budget"], query: "vegetable omelette" , photo: "photo-1677844592730-ce9c936d8f1a", by: ["Bakd&Raw by Karolin Baitinger", "bakdandraw"] },
  { name: "Thai Green Curry", cuisine: "Thai", meal: "Dinner", minutes: 30, tags: [], query: "green curry", photo: "photo-1788016487976-26b8b15f0311", by: ["sofia inductgroup", "sofia_induct"] },
  { name: "Banh Mi Sandwich", cuisine: "Vietnamese", meal: "Lunch", minutes: 20, tags: [], query: "banh mi", photo: "photo-1710532774170-9844f837ae54", by: ["Luke Tokaryk", "lukelukeluke"] },
  { name: "Black Bean Burrito Bowl", cuisine: "Mexican", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget"], query: "burrito bowl" , photo: "photo-1716392976013-66d90cac4411", by: ["AnaCristina Smith", "anacristinacanana"] },
  { name: "Tteokbokki (Spicy Rice Cakes)", cuisine: "Korean", meal: "Lunch", minutes: 25, tags: ["budget"], query: "tteokbokki", photo: "photo-1747228469541-f0e7f56e7ec7", by: ["lee seunghyub", "sobalc"] },
  { name: "Gyudon Beef Rice Bowl", cuisine: "Japanese", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "beef rice bowl egg", photo: "photo-1761064864532-1794a1f8f784", by: ["Nicholas Ng", "nicsandman20"] },
  { name: "Miso Ramen with Soft Egg", cuisine: "Japanese", meal: "Dinner", minutes: 25, tags: [], query: "ramen egg" , photo: "photo-1612927601601-6638404737ce", by: ["ikhsan baihaqi", "his_and"], video: { id: "31387237", file: "13393202_1920_1080_30fps.mp4", poster: "authentic-japanese-historic-japan-japanese-japon-31387237.jpeg", by: ["Ali Alcántara", "alialcantara"] } },
  { name: "Pork Dumplings", cuisine: "Chinese", meal: "Lunch", minutes: 20, tags: ["budget"], query: "dumplings", photo: "photo-1534422298391-e4f8c172dddb", by: ["Abhishek Sanwa Limbu", "abhishek_sanwa"] },
  { name: "Grilled Chicken Pasta Primavera", cuisine: "Italian", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "chicken pasta vegetables", photo: "photo-1773756606644-bbbb1bd16b87", by: ["You Le", "le_y0u"] },
  { name: "Butter Chicken", cuisine: "Indian", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "butter chicken curry" , photo: "photo-1603894584373-5ac82b2ae398", by: ["Raman", "potofgold07"] },
  { name: "Chicken Fajitas", cuisine: "Mexican", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "chicken fajitas", photo: "photo-1689773976415-293dd893f77e", by: ["Thomas Park", "thomascpark"] },
  { name: "Chicken Biryani", cuisine: "Indian", meal: "Dinner", minutes: 60, tags: [], query: "chicken biryani", photo: "photo-1631515243349-e0cb75fb8d3a", by: ["Mario Raj", "chefmariii"] },
  { name: "Banana Oat Pancakes", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["vegetarian", "budget"], query: "banana pancakes" , photo: "photo-1528207776546-365bb710ee93", by: ["nikldn", "nikldn"], video: { id: "16010284", file: "16010284-hd_1080_1920_60fps.mp4", poster: "pexels-photo-16010284.jpeg", by: ["Anna Zviahina", "anna-zviahina-431214732"] } },
  { name: "Roasted Whole Fish with Lemon", cuisine: "Mediterranean", meal: "Dinner", minutes: 35, tags: ["highProtein"], query: "roasted fish lemon", photo: "photo-1773417461034-75e751de40ba", by: ["Neil Marshall", "smuggrin"] },
  { name: "BBQ Pulled Pork Sandwich", cuisine: "American", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "pulled pork sandwich", photo: "photo-1761712826051-b873907fb5d3", by: ["nobleseed nobleseed", "nobleseed"] },
  { name: "Lemon Herb Roast Chicken", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: ["highProtein"], query: "roast chicken lemon" , photo: "photo-1617636423451-0db0119c14cd", by: ["Tofan Teodor", "tofanteo"] },
  { name: "Tom Yum Shrimp Soup", cuisine: "Thai", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "tom yum shrimp", photo: "photo-1777828827870-92e3069424bd", by: ["Jamie Trinh", "jtrinh_artwork"] },
  { name: "Fresh Spring Rolls", cuisine: "Vietnamese", meal: "Lunch", minutes: 25, tags: ["vegetarian"], query: "spring rolls", photo: "photo-1761315413785-0bf98364ceab", by: ["Diego Arenas de Rodrigo", "diegoarenasderodrigo"] },
  { name: "Salmon Poke Bowl", cuisine: "Japanese", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "salmon poke bowl" , photo: "photo-1771154141872-e5ad3905a385", by: ["Haim Charbit", "haim_charbit18"] },
  { name: "Korean BBQ at Home", cuisine: "Korean", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "korean bbq grill", photo: "photo-1548150914-c9f19106dbf6", by: ["Clint Bustrillos", "clintbustrillos"] },
  { name: "Udon Noodle Soup", cuisine: "Japanese", meal: "Lunch", minutes: 20, tags: ["budget"], query: "udon noodle soup", photo: "photo-1761984336917-615bc6f7d4fa", by: ["Kouji Tsuru", "pafuxu"] },
  { name: "Honey Garlic Chicken Thighs", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein", "budget"], query: "honey garlic chicken" , photo: "photo-1724441980118-741eaf55b0f8", by: ["Mayte Baque", "mtbaque"] },
  { name: "Sweet and Sour Chicken", cuisine: "Chinese", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "sweet sour chicken", photo: "photo-1537516803400-bf9d09ae3d2f", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Pesto Pasta with Tomatoes", cuisine: "Italian", meal: "Dinner", minutes: 20, tags: ["vegetarian", "budget"], query: "pesto pasta", photo: "photo-1473093295043-cdd812d0e601", by: ["Eaters Collective", "eaterscollective"] },
  { name: "Caprese Sandwich", cuisine: "Italian", meal: "Lunch", minutes: 10, tags: ["vegetarian"], query: "caprese sandwich" , photo: "photo-1539252554453-80ab65ce3586", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Chicken Burrito", cuisine: "Mexican", meal: "Lunch", minutes: 20, tags: ["highProtein"], query: "chicken burrito", photo: "photo-1719282431565-3b30bb7d2658", by: ["Bayuaji Abiyu", "bayuajiabiyu"] },
  { name: "Masala Dosa", cuisine: "Indian", meal: "Breakfast", minutes: 30, tags: ["vegetarian"], query: "dosa chutney", photo: "photo-1694849789325-914b71ab4075", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Mapo Tofu", cuisine: "Chinese", meal: "Dinner", minutes: 25, tags: ["highProtein", "budget"], query: "mapo tofu" , photo: "photo-1788603930622-636954e00065", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Grilled Kebab Platter", cuisine: "Mediterranean", meal: "Dinner", minutes: 40, tags: ["highProtein"], query: "grilled meat platter pita", photo: "photo-1777716003985-68fed08d0c7e", by: ["X F", "aizerd"] },
  { name: "Mac and Cheese", cuisine: "American", meal: "Dinner", minutes: 25, tags: ["vegetarian", "budget"], query: "mac and cheese", photo: "photo-1667499989723-c4ab9549d63c", by: ["Leanna Myers", "myerslk88"] },
  { name: "Chicken Quesadillas", cuisine: "Mexican", meal: "Lunch", minutes: 15, tags: ["highProtein", "budget"], query: "chicken quesadilla" , photo: "photo-1673990349292-ed2dfa7988c9", by: ["Benjamin Guardia", "benjaminguardia"] },
  { name: "Thai Basil Chicken with Fried Egg", cuisine: "Thai", meal: "Dinner", minutes: 20, tags: ["highProtein", "budget"], query: "basil chicken rice egg", photo: "photo-1562565651-7d4948f339eb", by: ["Jerome Jome", "jomemui"] },
  { name: "Spicy Korean Pork Stir-Fry", cuisine: "Korean", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "spicy pork stir fry", photo: "photo-1777598405371-e657109ddd50", by: ["Junel Mujar", "junelmujar"] },
  { name: "Overnight Oats with Berries", cuisine: "American", meal: "Breakfast", minutes: 5, tags: ["vegetarian", "budget"], query: "overnight oats berries" , photo: "photo-1490371475955-4cb3bfc72f71", by: ["Alisha Hieb", "wildandinlove"] },
  { name: "Yakisoba Stir-Fried Noodles", cuisine: "Japanese", meal: "Lunch", minutes: 20, tags: ["budget"], query: "yakisoba noodles", photo: "photo-1674516585624-422828b423f1", by: ["Kawê Rodrigues", "kawerodriguess"] },
  { name: "Wonton Noodle Soup", cuisine: "Chinese", meal: "Lunch", minutes: 25, tags: [], query: "wonton soup", photo: "photo-1763994685090-c0927ff195d1", by: ["Fenghua", "fenghua1975"] },
  { name: "Japchae Glass Noodles", cuisine: "Korean", meal: "Lunch", minutes: 30, tags: [], query: "japchae noodles" , photo: "photo-1774717530911-2ceb99449f7a", by: ["Andrii Solok", "getslower"] },
  { name: "Minestrone Soup", cuisine: "Italian", meal: "Lunch", minutes: 35, tags: ["vegetarian", "budget"], query: "minestrone soup", photo: "photo-1672667509947-865215fa66db", by: ["Babs Gorniak", "babs_gorniak"] },
  { name: "Hummus Plate with Pita", cuisine: "Mediterranean", meal: "Lunch", minutes: 10, tags: ["vegetarian", "budget"], query: "hummus pita", photo: "photo-1687244433510-747e3fd97afe", by: ["Cosmin Ursea", "cosminursea"] },
  { name: "Mushroom Risotto", cuisine: "Italian", meal: "Dinner", minutes: 40, tags: ["vegetarian"], query: "mushroom risotto" , photo: "photo-1791409287840-f56f8611bc84", by: ["Zoshua Colah", "zoshuacolah"] },
  { name: "Chicken Noodle Soup", cuisine: "American", meal: "Lunch", minutes: 35, tags: ["highProtein", "budget"], query: "chicken noodle soup", photo: "photo-1584003397078-45ef96d6174d", by: ["Melissa Walker Horn", "sugercoatit"] },
  { name: "Chicken Satay with Peanut Sauce", cuisine: "Thai", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "chicken satay", photo: "photo-1772855386828-a18ff9a12584", by: ["likesilkto", "likesilkto"] },
  { name: "Turkey Chili", cuisine: "American", meal: "Dinner", minutes: 40, tags: ["highProtein", "budget"], query: "turkey chili bowl" , photo: "photo-1790701909034-6c7b45c7b58a", by: ["Chad Montano", "briewilly"] },
  { name: "Miso Soup with Tofu", cuisine: "Japanese", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "budget"], query: "miso soup tofu", photo: "photo-1763470260582-894ae15f43bb", by: ["note thanun", "notethanun"] },
  { name: "Shrimp Congee", cuisine: "Chinese", meal: "Breakfast", minutes: 30, tags: ["budget"], query: "congee", photo: "photo-1766761562530-c8dd12c96d9a", by: ["Dean Zhang", "startdig"] },
  { name: "Falafel Pita with Hummus", cuisine: "Mediterranean", meal: "Lunch", minutes: 25, tags: ["vegetarian"], query: "falafel pita" , photo: "photo-1788795567489-22430aa94402", by: ["Wera Durakova", "wera"] },
  { name: "Garlic Shrimp Pasta", cuisine: "Italian", meal: "Dinner", minutes: 25, tags: ["highProtein"], query: "shrimp pasta", photo: "photo-1677681483419-e18aa1376db7", by: ["Ellie Ellien", "ellienelie"] },
  { name: "Stuffed Bell Peppers", cuisine: "Mediterranean", meal: "Dinner", minutes: 45, tags: ["highProtein"], query: "stuffed peppers", photo: "photo-1673646960062-9aeb2188335f", by: ["Natalia Gusakova", "nataliaraylenegusakova"] },
  { name: "Egg Fried Noodles", cuisine: "Chinese", meal: "Lunch", minutes: 15, tags: ["vegetarian", "budget"], query: "fried noodles egg" , photo: "photo-1789999964582-b1c9b78c8488", by: ["Zoshua Colah", "zoshuacolah"], video: { id: "34711974", file: "14713479_1080_1920_30fps.mp4", poster: "pexels-photo-34711974.jpeg", by: ["Hi Nana Shop", "hi-nana-shop-1032285012"] } },
  { name: "Grilled Cheese and Tomato Soup", cuisine: "American", meal: "Lunch", minutes: 20, tags: ["vegetarian", "budget"], query: "grilled cheese tomato soup", photo: "photo-1762647420988-5080acf33988", by: ["David Trinks", "dtrinksrph"] },
  { name: "Sizzling Tofu and Vegetables", cuisine: "Chinese", meal: "Dinner", minutes: 20, tags: ["vegetarian", "highProtein", "budget"], query: "tofu vegetables skillet", photo: "photo-1787732089211-69941bf91603", by: ["Kuali Nenek", "kualinenekjkt"] },
  { name: "Palak Paneer", cuisine: "Indian", meal: "Dinner", minutes: 35, tags: ["vegetarian", "highProtein"], query: "palak paneer" , photo: "photo-1767114915936-745dd372f1d8", by: ["Chetanya Sharma", "chetanya_designs"] },
  { name: "Spaghetti Carbonara", cuisine: "Italian", meal: "Dinner", minutes: 20, tags: [], query: "spaghetti carbonara", photo: "photo-1633337474564-1d9478ca4e2e", by: ["Rob Wicks", "robwicks"] },
  { name: "Seafood Paella", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: [], query: "seafood paella", photo: "photo-1694685367640-05d6624e57f1", by: ["Rook of Arts", "rookofartsphotography"] },
  { name: "French Toast with Berries", cuisine: "American", meal: "Breakfast", minutes: 15, tags: ["vegetarian"], query: "french toast berries", photo: "photo-1639108094328-2b94a49b1c2e", by: ["Dorrell Tibbs", "whatuprell"] },
  { name: "Skillet Meatballs in Tomato Sauce", cuisine: "Italian", meal: "Dinner", minutes: 35, tags: ["highProtein"], query: "meatballs tomato sauce", photo: "photo-1787261534727-b9c89aa2bb11", by: ["Caroline Badran", "___atmos"] },
  { name: "Ratatouille", cuisine: "Mediterranean", meal: "Dinner", minutes: 50, tags: ["vegetarian", "budget"], query: "ratatouille", photo: "photo-1785703285213-c15cbb8a286e", by: ["Mario Gogh", "mariogogh"] },
  { name: "Chopped Salad with Eggs", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "salad boiled eggs", photo: "photo-1649531794752-5833ee051fb6", by: ["Tricia Timney", "triciatimney"] },
  { name: "Chicken Gyro with Fries", cuisine: "Mediterranean", meal: "Lunch", minutes: 25, tags: ["highProtein"], query: "gyro pita", photo: "photo-1745126009946-1b35b1a16fec", by: ["Nick Nice", "nicknice"] },
  { name: "Acai Smoothie Bowl", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian"], query: "acai bowl", photo: "photo-1627308594190-a057cd4bfac8", by: ["Vicky Ng", "vickyng"] },
  { name: "Bagel with Smoked Salmon", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["highProtein"], query: "bagel smoked salmon", photo: "photo-1790701853579-c4fcb5713a00", by: ["Chad Montano", "briewilly"] },
  { name: "Sheet Pan Roasted Vegetables", cuisine: "American", meal: "Dinner", minutes: 35, tags: ["vegetarian", "budget"], query: "roasted vegetables", photo: "photo-1766701753139-352e46e51c01", by: ["Barnaby Woodrow", "cranky_bear"] },
  { name: "Chicken Caesar Salad", cuisine: "American", meal: "Lunch", minutes: 15, tags: ["highProtein"], query: "chicken caesar salad", photo: "photo-1782839577893-da9383e55c96", by: ["R. G", "bored_mongoose"] },
  { name: "Steak and Potatoes", cuisine: "American", meal: "Dinner", minutes: 30, tags: ["highProtein"], query: "steak potatoes", photo: "photo-1678684279246-96e6afb970f2", by: ["Natalia Gusakova", "nataliaraylenegusakova"] },
  { name: "Strawberry Waffles", cuisine: "American", meal: "Breakfast", minutes: 20, tags: ["vegetarian"], query: "waffles strawberries", photo: "photo-1594627882045-57465104050f", by: ["Svitlana", "kekse_und_ich"] },
  { name: "Egg and Tomato Toast", cuisine: "American", meal: "Breakfast", minutes: 10, tags: ["vegetarian", "budget"], query: "egg toast tomato", photo: "photo-1533089860892-a7c6f0a88666", by: ["Eiliv Aceron", "shootdelicious"] },
  { name: "Chicken Pot Pie", cuisine: "American", meal: "Dinner", minutes: 50, tags: [], query: "chicken pot pie", photo: "photo-1581986675622-41eccf27129d", by: ["David Foodphototasty", "phototastyfood"] },
  { name: "Turkey Sandwich", cuisine: "American", meal: "Lunch", minutes: 10, tags: ["highProtein", "budget"], query: "turkey sandwich", photo: "photo-1608330557791-8dff6a434bbf", by: ["James Kern", "jamesrkern"] },
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
