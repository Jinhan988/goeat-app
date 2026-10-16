"use client";
import { useState, useRef, useEffect } from "react";
import { FEED, FEED_FILTERS, dishMatches, searchTerms, dishSearchScore, findFeedDish, feedPhotoUrl, feedPhotoCredit, feedVideoSrc, feedVideoPoster, type FeedDish, type MealType } from "./lib/feed";
import FeedVideo from "./components/FeedVideo";
import SampleWeek from "./components/SampleWeek";
import { SAMPLE_WEEK } from "./lib/sample";
import { DAYS, KEYS, readJSON, writeJSON, type SavedRecipe, type WeekPick, type ExtraItem } from "./lib/storage";
import RecipeSheet, { type RecipeData, type SheetDish } from "./components/RecipeSheet";
import BottomNav, { type View } from "./components/BottomNav";
import { track as vercelTrack } from "@vercel/analytics";

// Sends each event to Vercel and Google Analytics (GA4)
function track(name: string, props?: Record<string, any>) {
  try { vercelTrack(name, props); } catch {}
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", name, props || {});
  }
}

const CA_STORES = ["Costco","No Frills","Loblaws","Sobeys","Metro","FreshCo","Food Basics","Walmart Canada","T&T Supermarket"];
const US_STORES = ["Costco","Walmart","Kroger","Whole Foods","Trader Joe's","Aldi","Target","Safeway","Publix","H-E-B","Meijer","Sprouts","Wegmans"];

const DIETS = [
  {id:"No Restriction",icon:"🍽️"},{id:"High Protein",icon:"💪"},
  {id:"Vegetarian",icon:"🥗"},{id:"Vegan",icon:"🌱"},
  {id:"Keto",icon:"🥩"},{id:"Gluten-Free",icon:"🌾"},
  {id:"Halal",icon:"🌙"},{id:"Paleo",icon:"🦴"},
  {id:"Dairy-Free",icon:"🥛"},{id:"Low Carb",icon:"🥦"},
  {id:"Mediterranean",icon:"🫒"},{id:"Kosher",icon:"✡️"},
];

const CUISINES = [
  {id:"Any Cuisine",icon:"🌐"},{id:"Korean",icon:"🇰🇷"},
  {id:"Japanese",icon:"🇯🇵"},{id:"Chinese",icon:"🇨🇳"},
  {id:"Italian",icon:"🇮🇹"},{id:"Mexican",icon:"🇲🇽"},
  {id:"Indian",icon:"🇮🇳"},{id:"Thai",icon:"🇹🇭"},
  {id:"Vietnamese",icon:"🇻🇳"},{id:"Western",icon:"🍔"},
  {id:"Mediterranean",icon:"🫒"},{id:"Middle Eastern",icon:"🧆"},
];


export default function GoEatApp() {
  const [screen, setScreen] = useState<"setup"|"loading"|"results">("setup");
  const [country, setCountry] = useState("CA");
  const [family, setFamily] = useState(4);
  const [budget, setBudget] = useState("");
  const [store, setStore] = useState("Costco");
  const [diets, setDiets] = useState<string[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [prefTab, setPrefTab] = useState("diet");
  const [showManual, setShowManual] = useState(false);
  const [scanMode, setScanMode] = useState<"fridge"|"receipt"|null>(null);
  const [scanImage, setScanImage] = useState<string|null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [uncertainItems, setUncertainItems] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState("plan");
  const [openDays, setOpenDays] = useState<Record<string,boolean>>({"Monday":true});
  const [planDay, setPlanDay] = useState("Monday");
  const [checked, setChecked] = useState<Record<string,boolean>>({});
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState("");
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savePlanName, setSavePlanName] = useState("");
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  // Feed photos are fixed Unsplash images, so they show instantly without any API call.
  const [mealPhotos, setMealPhotos] = useState<Record<string,string>>(() => Object.fromEntries(FEED.map(d => [d.name, feedPhotoUrl(d)])));
  const [mealCredits, setMealCredits] = useState<Record<string,{ name: string; link: string }>>(() => Object.fromEntries(FEED.map(d => [d.name, feedPhotoCredit(d)])));
  // GoEat 2.0 — discovery, saved recipes, week picks
  const [view, setView] = useState<View>("home");
  const [feedFilter, setFeedFilter] = useState("forYou");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<SheetDish | null>(null);
  const [recipeCache, setRecipeCache] = useState<Record<string, RecipeData>>({});
  const [recipeStatus, setRecipeStatus] = useState<Record<string, "loading" | "failed">>({});
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [weekPicks, setWeekPicks] = useState<WeekPick[]>([]);
  const [includeMeals, setIncludeMeals] = useState<string[]>([]);
  const [extraItems, setExtraItems] = useState<ExtraItem[]>([]);
  const [shoppingStale, setShoppingStale] = useState(false);
  const [shopUpdating, setShopUpdating] = useState(false);
  const [shopError, setShopError] = useState("");
  const [editSettings, setEditSettings] = useState(false);
  // Feed dishes whose photo failed to load are hidden rather than shown blank.
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [showSample, setShowSample] = useState(false);
  // Logo splash on entry (once per browser session). Home renders underneath,
  // so photos are already loading while the logo shows.
  const [splash, setSplash] = useState<"show" | "fading" | "done">("show");
  const [swapping, setSwapping] = useState<string | null>(null);
  const [swapError, setSwapError] = useState("");
  const [selectingSaved, setSelectingSaved] = useState(false);
  const [selectedSaved, setSelectedSaved] = useState<string[]>([]);
  const [scanError, setScanError] = useState("");
  const fridgeRef = useRef<HTMLInputElement>(null);
  const splashTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLInputElement>(null);
  const manualRef = useRef<HTMLDivElement>(null);
  const scanPreviewRef = useRef<HTMLDivElement>(null);

  const sym = country === "CA" ? "CA$" : "$";
  const stores = country === "CA" ? CA_STORES : US_STORES;

  // Short logo splash on first entry per session; the feed loads underneath.

  // Track app open once on mount
  useEffect(() => {
    track("app_view");
    let seen = false;
    try { seen = sessionStorage.getItem("goeatai_splash_seen") === "1"; sessionStorage.setItem("goeatai_splash_seen", "1"); } catch {}
    if (seen) setSplash("done");
    else {
      const t1 = setTimeout(() => setSplash("fading"), 1600);
      const t2 = setTimeout(() => setSplash("done"), 2000);
      splashTimers.current = [t1, t2];
    }
  }, []);

  // Load saved plans on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("goeatai_saved_plans");
      if (saved) setSavedPlans(JSON.parse(saved));

 
      const profiles = localStorage.getItem("goeatai_family_profiles");
      if (profiles) setFamilyProfiles(JSON.parse(profiles));
    } catch {}
    const st = readJSON<any>(KEYS.settings, null);
    if (st && (st.country === "CA" || st.country === "US")) {
      setCountry(st.country);
      if (typeof st.family === "number") setFamily(st.family);
      if (typeof st.budget === "string") setBudget(st.budget);
      if (typeof st.store === "string") setStore(st.store);
      if (Array.isArray(st.diets)) setDiets(st.diets);
      if (Array.isArray(st.cuisines)) setCuisines(st.cuisines);
    } else {
      // First visit: guess the country from the phone's time zone.
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const CA_TZ = ["Toronto", "Montreal", "Vancouver", "Edmonton", "Calgary", "Winnipeg", "Regina", "Halifax", "St_Johns", "Moncton", "Whitehorse", "Yellowknife", "Iqaluit", "Glace_Bay", "Goose_Bay", "Swift_Current", "Dawson_Creek", "Fort_Nelson", "Rankin_Inlet", "Cambridge_Bay", "Inuvik", "Atikokan", "Blanc-Sablon", "Creston", "Dawson", "Resolute", "Thunder_Bay", "Nipigon", "Rainy_River", "Pangnirtung"];
        const isCA = tz.startsWith("America/") && CA_TZ.some(c => tz.endsWith("/" + c));
        const isUS = !isCA && (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Juneau|Adak|Indiana|Kentucky|North_Dakota|Menominee|Nome|Sitka|Yakutat|Metlakatla)/.test(tz) || tz === "Pacific/Honolulu");
        if (isUS) { setCountry("US"); setStore(US_STORES[0]); }
      } catch {}
    }
    setSettingsReady(true);
    setSavedRecipes(readJSON<SavedRecipe[]>(KEYS.savedRecipes, []));
    setWeekPicks(readJSON<WeekPick[]>(KEYS.weekPicks, []));
    setExtraItems(readJSON<ExtraItem[]>(KEYS.extraItems, []));
    const last = readJSON<any>(KEYS.lastResult, null);
    if (last && Array.isArray(last.mealPlan)) {
      setResult(last);
      if (last.shoppingStale) setShoppingStale(true);
    }
  }, []);

  // Remember plan settings for next time
  useEffect(() => {
    // Only after the saved settings have been loaded (and rendered), so the
    // defaults never overwrite them.
    if (!settingsReady) return;
    writeJSON(KEYS.settings, { country, family, budget, store, diets, cuisines });
  }, [settingsReady, country, family, budget, store, diets, cuisines]);

  // Floating "back to top" once the user has scrolled far down the feed
  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 1500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Count how many people reach the end of the feed (once per page view)
  useEffect(() => {
    const el = feedEndRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !sent) { sent = true; track("feed_end_seen", { picks: weekPicks.length }); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, feedFilter, search]);

  // Keep the result tabs in sync with the bottom navigation
  useEffect(() => {
    if (view === "shop") setTab("shop");
    else if (view === "week") setTab(t => (t === "shop" ? "plan" : t));
  }, [view]);

  // One shopping_list_viewed event each time the user opens the Shopping view
  useEffect(() => {
    if (view === "shop") track("shopping_list_viewed", { hasPlan: !!result, extraCount: extraItems.length });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Auto-scroll to the scan preview as soon as a photo is picked,
  // so the user sees the scanned screen immediately without scrolling.
  useEffect(() => {
    if (scanImage) {
      setTimeout(() => scanPreviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [scanImage]);

  function savePlan(planResult: any, planName?: string) {
    const name = planName || `Plan ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    const newPlan = { ...planResult, savedName: name, savedAt: Date.now() };
    const updated = [newPlan, ...savedPlans].slice(0, 10); // max 10 saved
    setSavedPlans(updated);
    try {
      localStorage.setItem("goeatai_saved_plans", JSON.stringify(updated));
    } catch {}
  }

  function deleteSavedPlan(index: number) {
    const updated = savedPlans.filter((_, i) => i !== index);
    setSavedPlans(updated);
    try {
      localStorage.setItem("goeatai_saved_plans", JSON.stringify(updated));
    } catch {}
  }

  function loadSavedPlan(plan: any) {
    setResult(plan);
    setShoppingStale(!!plan.shoppingStale);
    persistResult(plan, !!plan.shoppingStale);
    setScreen("results");
    setView("week");
    setShowSaved(false);
    setTab("plan");
    setOpenDays({ Monday: true }); setPlanDay("Monday");
  }

  async function handleScan(file: File, mode: "fridge"|"receipt") {
    setScanMode(mode);
    setScanImage(null);
    setScannedItems([]);
    setUncertainItems([]);
    setScanLoading(true);
    setScanError("");
    setShowManual(true);
    track("scan_started", { mode });

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setScanImage(dataUrl);
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type || "image/jpeg";

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mediaType, mode })
        });
        if (!res.ok) throw new Error("scan failed");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setScannedItems(data.items || []);
        setUncertainItems(data.uncertain || []);
        if (!data.items?.length && !data.uncertain?.length) {
          setScanError("We couldn't spot any food in that photo. Try a clearer photo, or set up your plan manually.");
        }
        track("scan_completed", {
          mode,
          confirmedCount: data.items?.length || 0,
          uncertainCount: data.uncertain?.length || 0,
        });
      } catch {
        // Never show made-up ingredients when the scan fails.
        setScannedItems([]);
        setUncertainItems([]);
        setScanError("We couldn't read that photo. Try again, or set up your plan manually.");
        track("scan_failed", { mode });
      }
      setScanLoading(false);
    };
    reader.readAsDataURL(file);
  }

  function startEditItem(i: number, currentValue: string) {
    setEditingIndex(i);
    setEditValue(currentValue);
  }

  function commitEditItem(i: number) {
    setScannedItems(p => {
      const original = p[i];
      const next = editValue.trim() || original;
      if (next !== original) track("scan_item_corrected", { from: original, to: next });
      return p.map((x, j) => (j === i ? next : x));
    });
    setEditingIndex(null);
  }

  async function generate() {
    const eff = budget || "150";
    setError("");
    setScreen("loading");
    setLoadStep(0);
    track("plan_generate_started", {
      family,
      hasScannedItems: scannedItems.length > 0,
      scannedCount: scannedItems.length,
      country,
    });

    const steps = [
      setTimeout(() => setLoadStep(1), 800),
      setTimeout(() => setLoadStep(2), 2500),
      setTimeout(() => setLoadStep(3), 4000),
    ];

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family, budget: eff, store, diet: diets.length ? diets.join(" + ") : "No Restriction", cuisine: cuisines.length ? cuisines.join(" + ") : "Any Cuisine", country, ingredients: scannedItems, familyProfiles, pinnedMeals: weekPicks, includeMeals, mealsOnly: true,
          previousPlanMeals: (result?.mealPlan || readJSON<any>(KEYS.lastResult, null)?.mealPlan || []).flatMap((d: any) => (d.meals || []).map((m: any) => m.name)) })
      });

      steps.forEach(clearTimeout);
      setLoadStep(4);

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const finalResult = { ...data, family, budget: eff, store, diet: diets.join(" + ") || "No Restriction", cuisine: cuisines.join(" + ") || "Any Cuisine", country, sym, scannedCount: scannedItems.length, ingredients: scannedItems, pickedCount: weekPicks.length + includeMeals.length };
      setResult(finalResult);
      // Meals come back first; the shopping list is built right after in the background.
      setShoppingStale(true);
      setShopError("");
      setIncludeMeals([]);
      setSelectedSaved([]);
      setChecked({});
      setOpenDays({ Monday: true }); setPlanDay("Monday");
      setTab("plan");
      // Auto-save last result
      persistResult(finalResult, true);
      track("plan_generated", {
        family,
        store,
        country,
        usedScannedItems: scannedItems.length > 0,
        pinnedCount: weekPicks.length,
        includedCount: includeMeals.length,
      });
      setTimeout(() => { setScreen("results"); setView("week"); }, 300);
    } catch {
      steps.forEach(clearTimeout);
      setError("Failed to generate meal plan. Please try again.");
      setScreen("setup");
      track("plan_generate_failed");
    }
  }

  // ---------- Recipes (detail sheet) ----------
  async function loadRecipe(name: string) {
    if (recipeCache[name]) return;
    setRecipeStatus(p => ({ ...p, [name]: "loading" }));
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family: family || 4, budget: budget || "150", store,
          diet: diets.join(" + ") || "No Restriction",
          cuisine: cuisines.join(" + ") || "Any Cuisine",
          country, ingredients: [], recipeOnly: true, recipeName: name,
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (!data?.recipe) throw new Error("no recipe");
      setRecipeCache(p => ({ ...p, [name]: data.recipe }));
      setRecipeStatus(p => { const n = { ...p }; delete n[name]; return n; });
    } catch {
      // Show an error with "Try again" — never a made-up recipe.
      setRecipeStatus(p => ({ ...p, [name]: "failed" }));
    }
  }

  function openSheet(dish: SheetDish) {
    setSheet(dish);
    track("recipe_viewed", { source: dish.source, recipe: dish.name });
    loadRecipe(dish.name);
    if (!mealPhotos[dish.name]) fetchMealPhoto(dish.name, findFeedDish(dish.name)?.query);
  }

  function openFeedDish(d: FeedDish, source: SheetDish["source"] = "feed") {
    openSheet({ name: d.name, cuisine: d.cuisine, minutes: d.minutes, meal: d.meal, source });
  }

  function retryRecipe(name: string) {
    setRecipeStatus(p => { const n = { ...p }; delete n[name]; return n; });
    setRecipeCache(p => { const n = { ...p }; delete n[name]; return n; });
    loadRecipe(name);
  }

  // ---------- Saved recipes ----------
  const isSaved = (name: string) => savedRecipes.some(r => r.name === name);

  function toggleSave(dish: SheetDish) {
    const feed = findFeedDish(dish.name);
    let next: SavedRecipe[];
    if (isSaved(dish.name)) {
      next = savedRecipes.filter(r => r.name !== dish.name);
      track("recipe_unsaved", { source: dish.source, recipe: dish.name });
    } else {
      next = [{ name: dish.name, cuisine: dish.cuisine || feed?.cuisine, minutes: dish.minutes || feed?.minutes, tags: feed?.tags, query: feed?.query, savedAt: Date.now() }, ...savedRecipes];
      track("recipe_saved", { source: dish.source, recipe: dish.name });
    }
    setSavedRecipes(next);
    writeJSON(KEYS.savedRecipes, next);
  }

  // ---------- My Week ----------
  function persistResult(r: any, stale: boolean) {
    writeJSON(KEYS.lastResult, { ...r, shoppingStale: stale });
  }

  function addToWeek(name: string, day: string, type: MealType, source: SheetDish["source"]) {
    track("add_to_week_clicked", { source, day, meal: type, hasPlan: !!result });
    const picks = [...weekPicks.filter(p => !(p.day === day && p.type === type)), { name, day, type }];
    setWeekPicks(picks);
    writeJSON(KEYS.weekPicks, picks);
    // If a plan already exists, put the dish straight into that slot.
    if (result?.mealPlan) {
      const plan = result.mealPlan.map((d: any) => {
        if (d.day !== day) return d;
        const meals = Array.isArray(d.meals) ? [...d.meals] : [];
        const idx = meals.findIndex((m: any) => m.type === type);
        const meal = { type, name, photoQuery: findFeedDish(name)?.query };
        if (idx >= 0) meals[idx] = meal; else meals.push(meal);
        return { ...d, meals };
      });
      const next = { ...result, mealPlan: plan };
      setResult(next);
      setShoppingStale(true);
      setShopError("");
      persistResult(next, true);
    }
  }

  function removePick(p: WeekPick) {
    const picks = weekPicks.filter(x => !(x.day === p.day && x.type === p.type));
    setWeekPicks(picks);
    writeJSON(KEYS.weekPicks, picks);
  }

  // "＋" on a feed card: put the dish in the next open slot (dinners first), or take it out again.
  function quickAdd(d: FeedDish) {
    if (d.noPlan) return;
    const existing = weekPicks.find(p => p.name === d.name);
    if (existing) { removePick(existing); track("quick_add_removed", { recipe: d.name }); return; }
    const order: MealType[] = d.meal === "Breakfast" ? ["Breakfast", "Lunch", "Dinner"] : d.meal === "Lunch" ? ["Lunch", "Dinner", "Breakfast"] : ["Dinner", "Lunch", "Breakfast"];
    for (const type of order) {
      const day = DAYS.find(dy => !weekPicks.some(p => p.day === dy && p.type === type));
      if (day) { addToWeek(d.name, day, type, "feed"); return; }
    }
  }
  const isPicked = (name: string) => weekPicks.some(p => p.name === name);

  async function swapMeal(dayName: string, type: string, currentName: string) {
    if (!result?.mealPlan) return;
    const key = `${dayName}-${type}`;
    setSwapping(key);
    setSwapError("");
    try {
      const avoid = result.mealPlan.flatMap((d: any) => (d.meals || []).map((m: any) => m.name));
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family: result.family, budget: result.budget, store: result.store, diet: result.diet, cuisine: result.cuisine,
          country: result.country, familyProfiles, swapMeal: { day: dayName, type, name: currentName }, avoidMeals: avoid,
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (!data?.meal?.name) throw new Error("no meal");
      const plan = result.mealPlan.map((d: any) => d.day !== dayName ? d : {
        ...d, meals: (d.meals || []).map((m: any) => (m.type === type ? data.meal : m)),
      });
      const next = { ...result, mealPlan: plan };
      setResult(next);
      setShoppingStale(true);
      setShopError("");
      persistResult(next, true);
      fetchMealPhoto(data.meal.name, data.meal.photoQuery);
      track("meal_swapped", { day: dayName, meal: type });
    } catch {
      setSwapError("Couldn't swap that meal. Please try again.");
    }
    setSwapping(null);
  }

  async function updateShoppingList() {
    if (!result?.mealPlan) return;
    const planSent = result.mealPlan;
    setShopUpdating(true);
    setShopError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          family: result.family, budget: result.budget, store: result.store, country: result.country,
          ingredients: result.ingredients || [], shoppingFromPlan: result.mealPlan,
        }),
      });
      const data = res.ok ? await res.json() : null;
      if (!data || !Array.isArray(data.shoppingList)) throw new Error("no list");
      const cur = resultRef.current;
      // The plan was cleared or changed while we waited: drop this list.
      // (If it changed, it is still marked stale and gets rebuilt.)
      if (!cur || cur.mealPlan !== planSent) { setShopUpdating(false); return; }
      const next = { ...cur, shoppingList: data.shoppingList, totalCost: data.totalCost, savings: data.savings };
      setResult(next);
      setChecked({});
      setShoppingStale(false);
      persistResult(next, false);
    } catch {
      setShopError("Couldn't update the shopping list.");
    }
    setShopUpdating(false);
  }

  // Rebuild the shopping list automatically shortly after the plan changes.
  const resultRef = useRef<any>(null);
  resultRef.current = result;
  useEffect(() => {
    if (!shoppingStale || shopUpdating || shopError || !result?.mealPlan) return;
    const first = !result.shoppingList;
    const t = setTimeout(() => { track("shopping_list_auto_updated", { first }); updateShoppingList(); }, first ? 0 : 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoppingStale, shopUpdating, shopError, result]);

  // ---------- Sample week (instant, no AI call) ----------
  function openSample(from: string) {
    setShowSample(true);
    track("sample_week_opened", { from });
  }
  function sampleMakeMine() {
    track("sample_make_mine_clicked");
    setShowSample(false);
    setView("week");
    window.scrollTo(0, 0);
  }
  function sampleUse() {
    const picks: WeekPick[] = SAMPLE_WEEK.flatMap(d => d.meals.map(m => ({ name: m.name, day: d.day, type: m.type })));
    setWeekPicks(picks);
    writeJSON(KEYS.weekPicks, picks);
    track("sample_use_clicked", { picks: picks.length });
    setShowSample(false);
    setView("week");
    window.scrollTo(0, 0);
  }

  // ---------- Extra shopping items from recipes ----------
  function addIngredientsToList(name: string) {
    const data = recipeCache[name];
    if (!data?.ingredients?.length) return;
    const rest = extraItems.filter(x => x.recipe !== name);
    const next = [...rest, ...data.ingredients.map(i => ({ name: i.name, qty: i.qty || "", recipe: name }))];
    setExtraItems(next);
    writeJSON(KEYS.extraItems, next);
    track("ingredients_added_to_list", { recipe: name, count: data.ingredients.length });
  }

  function removeExtraRecipe(name: string) {
    const next = extraItems.filter(x => x.recipe !== name);
    setExtraItems(next);
    writeJSON(KEYS.extraItems, next);
  }

  // ---------- Feed ----------
  function feedList(): FeedDish[] {
    const terms = searchTerms(search);
    let list = FEED.filter(d => dishMatches(d, feedFilter) && !brokenPhotos[d.name]);
    if (terms.length) {
      // Search: best matches first (e.g. "kimchi stew" puts kimchi stews above other stews).
      const scored = list.map(d => ({ d, s: dishSearchScore(d, terms) })).filter(x => x.s > 0);
      return scored.sort((a, b) => b.s - a.s).map(x => x.d);
    }
    if (feedFilter === "forYou") {
      // Rank by overlap with what the user saved and their chosen cuisines.
      const likedCuisines = new Set([...savedRecipes.map(r => r.cuisine).filter(Boolean), ...cuisines]);
      const likedTags = new Set(savedRecipes.flatMap(r => r.tags || []));
      const score = (d: FeedDish) =>
        (likedCuisines.has(d.cuisine) ? 2 : 0) + d.tags.filter(t => likedTags.has(t)).length;
      list = [...list].sort((a, b) => score(b) - score(a));
    }
    return list;
  }

  async function fetchMealPhoto(mealName: string, photoQuery?: string): Promise<string> {
    if (mealPhotos[mealName]) return mealPhotos[mealName];
    // Same dish as one in the feed (any capitalization) → use its fixed photo, no API call.
    const feedDish = findFeedDish(mealName);
    if (feedDish) {
      const url = feedPhotoUrl(feedDish);
      setMealPhotos(p => ({ ...p, [mealName]: url }));
      setMealCredits(p => ({ ...p, [mealName]: feedPhotoCredit(feedDish) }));
      return url;
    }
    try {
      // Prefer the short AI-written search phrase; fall back to the meal name
      const query = encodeURIComponent((photoQuery || mealName) + " food");
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_KEY || "demo"}` } }
      );
      const data = await res.json();
      const first = data.results?.[0];
      const url = first?.urls?.small || "";
      if (url) setMealPhotos(p => ({ ...p, [mealName]: url }));
      if (first?.user?.name) setMealCredits(p => ({ ...p, [mealName]: { name: first.user.name, link: first.user.links?.html || "https://unsplash.com" } }));
      return url;
    } catch { return ""; }
  }

  // Unsplash URLs accept a width param — request sharper versions when needed
  function sizedPhoto(url: string, w: number) {
    if (!url) return url;
    return /[?&]w=\d+/.test(url) ? url.replace(/([?&])w=\d+/, `$1w=${w}`) : `${url}${url.includes("?") ? "&" : "?"}w=${w}`;
  }

  // Prefetch photos when result loads
  useEffect(() => {
    if (!result?.mealPlan) return;
    result.mealPlan.forEach((day: any) => {
      day.meals?.forEach((m: any) => {
        fetchMealPhoto(m.name, m.photoQuery);
      });
    });
  }, [result]);

  const totalItems = result?.shoppingList?.flatMap((c: any) => c.items).length || 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const mealColor = (type: string) => {
    if (type === "Breakfast") return { bg: "#FFF3CD", color: "#856404" };
    if (type === "Lunch") return { bg: "#D1ECF1", color: "#0C5460" };
    if (type === "Dinner") return { bg: "#E8F5E9", color: "#1A5C2E" };
    return { bg: "#F3F0FF", color: "#6B21A8" };
  };

  // Plan settings (country, family, budget, store, diet, cuisine, family profiles).
  // Shown on Home after a scan and in the My Week builder.
  const settingsPanel = (
            <div ref={manualRef} style={{ padding: "20px 22px 0", display: "flex", flexDirection: "column" as const, gap: 20 }}>
              {error && <div style={{ background: "#FFF0F0", border: "1.5px solid #FFCDD2", borderRadius: 24, padding: "12px 14px", fontSize: 14, color: "#e63946", fontWeight: 600 }}>⚠️ {error}</div>}

              {/* Country */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>🌍 Country</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["CA","🇨🇦","Canada"],["US","🇺🇸","United States"]].map(([code,flag,name]) => (
                    <div key={code} onClick={() => { setCountry(code); setStore(code === "CA" ? CA_STORES[0] : US_STORES[0]); }}
                      style={{ flex: 1, padding: "11px 8px", border: `1.5px solid ${country === code ? (code === "CA" ? "#C8102E" : "#2E7D32") : "#e5e0d8"}`, borderRadius: 24, background: country === code ? (code === "CA" ? "#FFF0F0" : "#E8F5E9") : "white", cursor: "pointer", textAlign: "center" as const }}>
                      <div style={{ fontSize: 22 }}>{flag}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4, color: country === code ? (code === "CA" ? "#C8102E" : "#1A5C2E") : "#999" }}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>👨‍👩‍👧‍👦 Family Size</div>
                <div style={{ display: "flex", gap: 7 }}>
                  {[1,2,3,4,5,6].map(n => (
                    <div key={n} onClick={() => setFamily(n)}
                      style={{ flex: 1, padding: "11px 4px", border: `1.5px solid ${family === n ? "#2E7D32" : "#e5e0d8"}`, borderRadius: 14, background: family === n ? "#E8F5E9" : "white", fontSize: 14, fontWeight: 700, color: family === n ? "#1A5C2E" : "#999", cursor: "pointer", textAlign: "center" as const }}>
                      {n}{n === 6 ? "+" : ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>💰 Weekly Budget ({sym})</div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "#2E7D32", pointerEvents: "none" }}>{sym}</span>
                  <input type="number" placeholder={country === "CA" ? "e.g. 180" : "e.g. 150"} value={budget} onChange={e => setBudget(e.target.value)}
                    style={{ width: "100%", padding: "13px 14px 13px 44px", border: "1.5px solid #E8F5E9", borderRadius: 24, fontSize: 14, fontWeight: 600, color: "#1A1A18", background: "white", outline: "none", fontFamily: "'Nunito', sans-serif" }} />
                </div>
                <div style={{ fontSize: 14, color: "#999", marginTop: 5 }}>Estimated prices — actual costs may vary by location.</div>
              </div>

              {/* Store */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>🏪 Grocery Store</div>
                <select value={store} onChange={e => setStore(e.target.value)}
                  style={{ width: "100%", padding: "13px 38px 13px 14px", border: "1.5px solid #E8F5E9", borderRadius: 24, fontSize: 14, fontWeight: 500, color: "#1A1A18", background: "white", outline: "none", cursor: "pointer", appearance: "none", fontFamily: "'Nunito', sans-serif" }}>
                  {stores.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Diet & Cuisine — Multi Select */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>
                  🥗 Diet & Cuisine
                  <span style={{ fontSize: 14, color: "#999", fontWeight: 500, marginLeft: 6 }}>Select multiple</span>
                </div>

                {/* Tab switcher */}
                <div style={{ display: "flex", gap: 0, border: "1.5px solid #E8F5E9", borderRadius: 14, overflow: "hidden", marginBottom: 10 }}>
                  {[["diet","🥗 Diet Goal"],["cuisine","🍜 Cuisine Style"]].map(([t,l]) => (
                    <button key={t} onClick={() => setPrefTab(t)}
                      style={{ flex: 1, padding: "9px 6px", border: "none", background: prefTab === t ? "#1A5C2E" : "white", color: prefTab === t ? "white" : "#999", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      {l} {prefTab === t && t === "diet" && diets.length > 0 ? `(${diets.length})` : ""}
                      {prefTab === t && t === "cuisine" && cuisines.length > 0 ? `(${cuisines.length})` : ""}
                    </button>
                  ))}
                </div>

                {/* Diet grid */}
                {prefTab === "diet" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {DIETS.map(item => {
                      const isOn = diets.includes(item.id);
                      return (
                        <div key={item.id} onClick={() => setDiets(prev => isOn ? prev.filter(d => d !== item.id) : [...prev, item.id])}
                          style={{ padding: "11px 6px", border: `1.5px solid ${isOn ? "#F97316" : "#e5e0d8"}`, borderRadius: 14, background: isOn ? "#FFF4F0" : "white", cursor: "pointer", textAlign: "center" as const, position: "relative" as const }}>
                          {isOn && <div style={{ position: "absolute" as const, top: 4, right: 6, fontSize: 14, color: "#F97316", fontWeight: 900 }}>✓</div>}
                          <div style={{ fontSize: 20, marginBottom: 3 }}>{item.icon}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isOn ? "#F97316" : "#999" }}>{item.id}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Cuisine grid */}
                {prefTab === "cuisine" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {CUISINES.map(item => {
                      const isOn = cuisines.includes(item.id);
                      return (
                        <div key={item.id} onClick={() => setCuisines(prev => isOn ? prev.filter(c => c !== item.id) : [...prev, item.id])}
                          style={{ padding: "11px 6px", border: `1.5px solid ${isOn ? "#2E7D32" : "#e5e0d8"}`, borderRadius: 14, background: isOn ? "#E8F5E9" : "white", cursor: "pointer", textAlign: "center" as const, position: "relative" as const }}>
                          {isOn && <div style={{ position: "absolute" as const, top: 4, right: 6, fontSize: 14, color: "#2E7D32", fontWeight: 900 }}>✓</div>}
                          <div style={{ fontSize: 20, marginBottom: 3 }}>{item.icon}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: isOn ? "#2E7D32" : "#999" }}>{item.id}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected tags summary */}
                {(diets.length > 0 || cuisines.length > 0) && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#F1F8E9", borderRadius: 14, border: "1px solid #C8E6C9" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#2E7D32", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Your selections:</div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                      {diets.map(d => {
                        const item = DIETS.find(x => x.id === d);
                        return (
                          <div key={d} style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFF4F0", border: "1px solid #F97316", color: "#F97316", fontSize: 14, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                            {item?.icon} {d}
                            <span style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => setDiets(prev => prev.filter(x => x !== d))}>×</span>
                          </div>
                        );
                      })}
                      {cuisines.map(c => {
                        const item = CUISINES.find(x => x.id === c);
                        return (
                          <div key={c} style={{ display: "flex", alignItems: "center", gap: 4, background: "#E8F5E9", border: "1px solid #2E7D32", color: "#1A5C2E", fontSize: 14, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                            {item?.icon} {c}
                            <span style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => setCuisines(prev => prev.filter(x => x !== c))}>×</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Family Profiles */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>👨‍👩‍👧‍👦 Family Profiles</span>
                  <span style={{ fontSize: 14, color: "#999", fontWeight: 500 }}>optional</span>
                </div>

                {familyProfiles.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: 8, marginBottom: 10 }}>
                    {familyProfiles.map((member, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#F1F8E9", border: "1.5px solid #e5f0e5", borderRadius: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 22 }}>{member.emoji}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1A5C2E" }}>{member.name}</div>
                            <div style={{ fontSize: 14, color: "#999", marginTop: 2 }}>
                              {[...member.diets, ...member.allergies].filter(Boolean).join(" · ") || "No restrictions"}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => setEditingMember({...member, index: i})} style={{ background: "#E8F5E9", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 14, cursor: "pointer", color: "#1A5C2E" }}>Edit</button>
                          <button onClick={() => { const u = familyProfiles.filter((_,j)=>j!==i); setFamilyProfiles(u); try{localStorage.setItem("goeatai_family_profiles",JSON.stringify(u));}catch{} }}
                            style={{ background: "#FFF0F0", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 14, cursor: "pointer", color: "#e63946" }}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={() => setEditingMember({ name: "", emoji: "👤", diets: [], allergies: [], index: -1 })}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px dashed #e5e0d8", borderRadius: 24, background: "white", fontSize: 14, fontWeight: 700, color: "#2E7D32", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                  + Add Family Member
                </button>

                {familyProfiles.length > 0 && (
                  <div style={{ marginTop: 8, padding: "8px 12px", background: "#E8F5E9", borderRadius: 8, fontSize: 14, color: "#1A5C2E", fontWeight: 600 }}>
                    ✅ GoEat AI will consider all {familyProfiles.length} member{familyProfiles.length > 1 ? "s" : ""}&apos; restrictions
                  </div>
                )}
              </div>

              {/* CTA */}
              <button onClick={generate}
                style={{ width: "100%", padding: 17, background: "linear-gradient(135deg,#F97316,#EA580C)", color: "white", border: "none", borderRadius: 22, fontWeight: 800, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(249,115,22,0.38)" }}>
                🍽️ Generate My Meal Plan
              </button>
              <div style={{ textAlign: "center", fontSize: 14, color: "#999", marginTop: -12, paddingBottom: 8 }}>Powered by Claude AI · Takes ~15 seconds</div>
            </div>
  );

  // Ingredients added from recipes (not priced — kept separate from the AI-priced list)
  const extrasList = (
    <div>
      <h3 style={{ margin: "8px 0 4px", fontWeight: 900, fontSize: 16, color: "#1A5C2E", fontFamily: "'Nunito', sans-serif" }}>Added from recipes</h3>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 10 }}>Not priced. Check what you already have before you buy.</div>
      {Array.from(new Set(extraItems.map(x => x.recipe))).map(rec => (
        <div key={rec} style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#2E7D32" }}>{rec}</div>
            <button onClick={() => removeExtraRecipe(rec)} aria-label={`Remove ${rec} ingredients`}
              style={{ minHeight: 32, padding: "0 10px", borderRadius: 99, border: "1px solid #EEE", background: "white", color: "#999", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Remove</button>
          </div>
          {extraItems.filter(x => x.recipe === rec).map((it, i) => {
            const k = `x-${rec}-${i}`;
            const on = !!checked[k];
            return (
              <div key={k} onClick={() => setChecked(p => ({ ...p, [k]: !p[k] }))}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1.5px solid #E8F5E9", borderRadius: 14, marginBottom: 6, cursor: "pointer", opacity: on ? 0.5 : 1 }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? "#2E7D32" : "#ddd"}`, background: on ? "#2E7D32" : "white", color: "white", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{on ? "✓" : ""}</div>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 600, textDecoration: on ? "line-through" : "none" }}>{it.name}</div>
                <div style={{ fontSize: 13, color: "#999" }}>{it.qty}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#FFFFFF", boxShadow: "0 0 40px rgba(0,0,0,0.08)", fontFamily: "'Nunito Sans', sans-serif", paddingBottom: 150 }}>
      {/* SPLASH */}
      {splash !== "done" && (
        <div role="presentation" onClick={() => { splashTimers.current?.forEach(clearTimeout); setSplash("fading"); setTimeout(() => setSplash("done"), 400); }}
          style={{ position: "fixed", inset: 0, background: "white", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            animation: splash === "fading" ? "splashFadeOut 0.4s ease forwards" : undefined }}>
          <img src="/logo.webp" alt="GoEat AI" style={{ width: 180, height: 180, objectFit: "contain", marginBottom: 16, animation: "popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }} />
          <div style={{ fontSize: 14, color: "#888", fontWeight: 600, marginTop: 8, fontFamily: "'Nunito Sans', sans-serif", animation: "fadeUp 0.6s ease 0.3s both" }}>Less thinking. Less waste. Better eating.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 48, animation: "fadeIn 0.6s ease 0.6s both" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "#C8E6C9", animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      )}

      {/* SAMPLE WEEK */}
      {showSample && (
        <SampleWeek
          photo={n => (mealPhotos[n] ? sizedPhoto(mealPhotos[n], 600) : undefined)}
          canUse={!result}
          onMakeMine={sampleMakeMine}
          onUse={sampleUse}
          onOpenDish={n => { const f = findFeedDish(n); if (f) openFeedDish(f, "sample"); }}
          onClose={() => { setShowSample(false); track("sample_week_closed"); }}
          track={track}
        />
      )}

      {/* RECIPE DETAIL */}
      {sheet && (
        <RecipeSheet
          dish={sheet}
          photo={mealPhotos[sheet.name] ? sizedPhoto(mealPhotos[sheet.name], 900) : undefined}
          credit={mealCredits[sheet.name]}
          data={recipeCache[sheet.name] || null}
          loading={recipeStatus[sheet.name] === "loading"}
          failed={recipeStatus[sheet.name] === "failed"}
          isSaved={isSaved(sheet.name)}
          ingredientsAdded={extraItems.some(x => x.recipe === sheet.name)}
          onRetry={() => retryRecipe(sheet.name)}
          onToggleSave={() => toggleSave(sheet)}
          canPlan={!findFeedDish(sheet.name)?.noPlan}
          onAddToWeek={(day, type) => addToWeek(sheet.name, day, type, sheet.source)}
          onAddIngredients={() => addIngredientsToList(sheet.name)}
          onClose={() => setSheet(null)}
        />
      )}

      {/* HEADER (Home uses its own compact search header) */}
      {view !== "home" && <div style={{ background: "white", padding: "14px 20px 12px", position: "sticky", top: 0, zIndex: 50, borderBottom: "2px solid #E8F5E9", boxShadow: "0 2px 12px rgba(26,92,46,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div onClick={() => setView("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <img src="/logo.webp" alt="GoEat AI" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "contain" }} />
            <div>
              <div style={{ fontWeight: 900, fontSize: 24, lineHeight: 1, fontFamily: "'Nunito', sans-serif" }}>
                <span style={{ color: "#1A5C2E" }}>Go</span><span style={{ color: "#F97316" }}>Eat</span>
                <span style={{ fontSize: 14, background: "#4CAF50", color: "white", fontWeight: 800, padding: "2px 7px", borderRadius: 8, marginLeft: 5, verticalAlign: "middle", fontFamily: "'Nunito', sans-serif" }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: "#999", fontWeight: 600, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>Smart meal plans. Smarter savings.</div>
            </div>
          </div>
          <button onClick={() => setView("saved")}
            style={{ background: "#E8F5E9", border: "2px solid #C8E6C9", borderRadius: 99, padding: "7px 14px", color: "#1A5C2E", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0, fontFamily: "'Nunito', sans-serif" }}>
            ♡ {savedRecipes.length + savedPlans.length > 0 ? `Saved (${savedRecipes.length + savedPlans.length})` : "Saved"}
          </button>
        </div>
      </div>}

      {/* FAMILY MEMBER MODAL */}
      {editingMember !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, display: "flex", alignItems: "flex-end" }} onClick={() => setEditingMember(null)}>
          <div style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 22px 40px", maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e5e0d8", borderRadius: 99, margin: "0 auto 18px" }} />
            <div style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Nunito', sans-serif", color: "#1A5C2E", marginBottom: 16 }}>
              {editingMember.index === -1 ? "Add Family Member" : "Edit Family Member"}
            </div>

            {/* Emoji picker */}
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>Choose Avatar</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" as const }}>
              {["👨","👩","🧒","👦","👧","👶","👴","👵","🧑"].map(e => (
                <div key={e} onClick={() => setEditingMember((p: any) => ({...p, emoji: e}))}
                  style={{ width: 44, height: 44, borderRadius: 24, border: `2px solid ${editingMember.emoji === e ? "#2E7D32" : "#e5e0d8"}`, background: editingMember.emoji === e ? "#E8F5E9" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, cursor: "pointer" }}>
                  {e}
                </div>
              ))}
            </div>

            {/* Name */}
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>Name</div>
            <input type="text" placeholder="e.g. Dad, Mom, Emma..." value={editingMember.name}
              onChange={e => setEditingMember((p: any) => ({...p, name: e.target.value}))}
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E8F5E9", borderRadius: 24, fontSize: 14, fontWeight: 600, color: "#1A1A18", background: "white", outline: "none", fontFamily: "'Nunito', sans-serif", marginBottom: 16 }} />

            {/* Diet restrictions */}
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>Diet / Goal</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
              {DIETS.filter(d => d.id !== "No Restriction").map(d => {
                const isOn = editingMember.diets?.includes(d.id);
                return (
                  <div key={d.id} onClick={() => setEditingMember((p: any) => ({...p, diets: isOn ? p.diets.filter((x: string)=>x!==d.id) : [...(p.diets||[]), d.id]}))}
                    style={{ padding: "10px 6px", border: `1.5px solid ${isOn ? "#F97316" : "#e5e0d8"}`, borderRadius: 14, background: isOn ? "#FFF4F0" : "white", cursor: "pointer", textAlign: "center" as const }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{d.icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: isOn ? "#F97316" : "#999" }}>{d.id}</div>
                  </div>
                );
              })}
            </div>

            {/* Allergies */}
            <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase" as const, color: "#1A5C2E", marginBottom: 8 }}>Allergies / Avoid</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {["No peanuts","No shellfish","No dairy","No gluten","No eggs","No soy","No tree nuts","No spicy"].map(a => {
                const isOn = editingMember.allergies?.includes(a);
                return (
                  <div key={a} onClick={() => setEditingMember((p: any) => ({...p, allergies: isOn ? p.allergies.filter((x: string)=>x!==a) : [...(p.allergies||[]), a]}))}
                    style={{ padding: "10px 12px", border: `1.5px solid ${isOn ? "#e63946" : "#e5e0d8"}`, borderRadius: 14, background: isOn ? "#FFF0F0" : "white", cursor: "pointer", fontSize: 14, fontWeight: 600, color: isOn ? "#e63946" : "#999", textAlign: "center" as const }}>
                    {isOn ? "✓ " : ""}{a}
                  </div>
                );
              })}
            </div>

            <button onClick={() => {
              if (!editingMember.name.trim()) return;
              const member = { name: editingMember.name, emoji: editingMember.emoji, diets: editingMember.diets || [], allergies: editingMember.allergies || [] };
              let updated;
              if (editingMember.index === -1) {
                updated = [...familyProfiles, member];
              } else {
                updated = familyProfiles.map((m, i) => i === editingMember.index ? member : m);
              }
              setFamilyProfiles(updated);
              try { localStorage.setItem("goeatai_family_profiles", JSON.stringify(updated)); } catch {}
              setEditingMember(null);
            }}
              style={{ width: "100%", padding: 15, background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", color: "white", border: "none", borderRadius: 22, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>
              ✅ {editingMember.index === -1 ? "Add Member" : "Save Changes"}
            </button>
            <button onClick={() => setEditingMember(null)}
              style={{ width: "100%", padding: 12, background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SAVE PLAN MODAL */}
      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }} onClick={() => setShowSaveModal(false)}>
          <div style={{ background: "white", borderRadius: 24, width: "100%", maxWidth: 380, padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Nunito', sans-serif", color: "#1A5C2E", marginBottom: 6 }}>📁 Save This Plan</div>
            <div style={{ fontSize: 14, color: "#999", marginBottom: 16 }}>Give your plan a name so you can find it later.</div>
            <input
              type="text"
              placeholder={`e.g. ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${result?.diet || "My Plan"}`}
              value={savePlanName}
              onChange={e => setSavePlanName(e.target.value)}
              autoFocus
              style={{ width: "100%", padding: "13px 14px", border: "1.5px solid #E8F5E9", borderRadius: 24, fontSize: 14, fontWeight: 600, color: "#1A1A18", background: "white", outline: "none", fontFamily: "'Nunito', sans-serif", marginBottom: 14 }}
            />
            <button onClick={() => {
              const name = savePlanName.trim() || `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} Plan`;
              savePlan(result, name);
              setShowSaveModal(false);
              setSavePlanName("");
            }}
              style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", color: "white", border: "none", borderRadius: 24, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif", marginBottom: 10 }}>
              ✅ Save Plan
            </button>
            <button onClick={() => setShowSaveModal(false)}
              style={{ width: "100%", padding: 12, background: "none", border: "none", color: "#999", fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* HOME — food discovery */}
      {screen !== "loading" && view === "home" && (
        <div>
          {/* Compact search header */}
          <div style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(255,255,255,0.97)", padding: "10px 12px 8px", display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.webp" alt="GoEat AI" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "contain", flexShrink: 0 }} />
            <div style={{ position: "relative", flex: 1 }}>
              <span aria-hidden="true" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#888" }}>🔎</span>
              <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search any dish — e.g. kimchi stew" aria-label="Search dishes"
                style={{ width: "100%", boxSizing: "border-box", minHeight: 46, padding: "0 14px 0 40px", borderRadius: 99, border: "2px solid #E3E3E3", background: "white", fontSize: 16, outline: "none", fontFamily: "'Nunito Sans', sans-serif" }} />
            </div>
          </div>

          {/* Main actions: plan, fridge scan, receipt scan */}
          <input ref={fridgeRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f, "fridge"); e.target.value = ""; }} />
          <input ref={receiptRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) handleScan(f, "receipt"); e.target.value = ""; }} />
          <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 8, padding: "2px 12px 12px" }}>
            {[
              { key: "plan", icon: "🗓", label: "Plan my week", sub: "7 days + groceries", bg: "linear-gradient(150deg,#F97316,#E8620A)", fg: "white", subFg: "rgba(255,255,255,0.9)",
                onClick: () => { track("build_plan_clicked", { from: "home_tile" }); setView("week"); } },
              { key: "fridge", icon: "📸", label: "Scan fridge", sub: "Use what you have", bg: "#E3F1DA", fg: "#1A5C2E", subFg: "#3F6B4B",
                onClick: () => { track("scan_clicked", { from: "home_tile" }); fridgeRef.current?.click(); } },
              { key: "receipt", icon: "🧾", label: "Scan receipt", sub: "After shopping", bg: "#FFF3D6", fg: "#7A4A00", subFg: "#8A6A30",
                onClick: () => { track("receipt_clicked", { from: "home_tile" }); receiptRef.current?.click(); } },
            ].map(t => (
              <button key={t.key} onClick={t.onClick} aria-label={t.label}
                style={{ minHeight: 78, borderRadius: 18, border: "none", background: t.bg, color: t.fg, padding: "10px 10px", textAlign: "left" as const, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: t.key === "plan" ? "0 6px 16px rgba(232,98,10,0.3)" : "none" }}>
                <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1 }}>{t.icon}</span>
                <span>
                  <span style={{ display: "block", fontWeight: 900, fontSize: 15, lineHeight: 1.15 }}>{t.label}</span>
                  <span style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: t.subFg, marginTop: 3, lineHeight: 1.25 }}>{t.sub}</span>
                </span>
              </button>
            ))}
          </div>
          <div style={{ padding: "0 14px 8px", fontSize: 13.5, color: "#555", fontWeight: 600 }}>
            Tap <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "#F97316", color: "white", fontWeight: 900, fontSize: 13 }}>＋</span> on dishes you like. We&apos;ll plan the rest.
          </div>
          <div style={{ padding: "0 12px 10px" }}>
            <button onClick={() => openSample("home")}
              style={{ width: "100%", minHeight: 46, borderRadius: 14, border: "1.5px dashed #F5B98A", background: "#FFF8F2", color: "#B4400A", fontWeight: 800, fontSize: 14.5, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              👀 See a sample week — no setup needed
            </button>
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" as const, gap: "4px 12px", marginTop: 8, fontSize: 12.5, color: "#4A6B50", fontWeight: 700 }}>
              <span>✓ Free</span><span>✓ No sign-up</span><span>✓ Your plans stay on this device</span>
            </div>
          </div>

          {/* Category chips with photos */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "2px 12px 10px", scrollbarWidth: "none" as const }}>
            {FEED_FILTERS.map(f => {
              const on = feedFilter === f.id;
              return (
                <button key={f.id} onClick={() => { setFeedFilter(f.id); track("feed_filter", { filter: f.id }); }} aria-pressed={on}
                  style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 0, height: 52, padding: 0, borderRadius: 14, overflow: "hidden", border: on ? "2px solid #1A5C2E" : "2px solid transparent", background: on ? "#1A5C2E" : f.tint, color: on ? "white" : "#222", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                  {f.thumb && mealPhotos[f.thumb] && (
                    <img src={sizedPhoto(mealPhotos[f.thumb], 120)} alt="" style={{ width: 52, height: 52, objectFit: "cover", display: "block" }} />
                  )}
                  <span style={{ padding: "0 14px" }}>{f.label}</span>
                </button>
              );
            })}
          </div>

          {scanError && (
            <div role="alert" style={{ margin: "12px 18px 0", padding: "12px 14px", borderRadius: 14, background: "#FFF4F0", border: "1.5px solid #FFCDB8", color: "#B4400A", fontSize: 14, fontWeight: 600 }}>
              {scanError}
            </div>
          )}

          {/* Scan preview */}
          {scanImage && (
            <div ref={scanPreviewRef} style={{ margin: "16px 22px 0" }}>
              <div style={{ borderRadius: 24, overflow: "hidden", border: "2px solid #388E3C", position: "relative" }}>
                <img src={scanImage} alt="scan" style={{ width: "100%", maxHeight: 220, objectFit: "cover", display: "block" }} />

                {/* Loading overlay */}
                {scanLoading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(26,92,46,0.80)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                    <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <div style={{ color: "white", fontSize: 14, fontWeight: 700 }}>Analyzing your {scanMode === "receipt" ? "receipt" : "fridge"}...</div>
                  </div>
                )}

                {/* Tag overlay on photo — like AI RepairBuddy style! */}
                {!scanLoading && scannedItems.length > 0 && (
                  <div style={{ position: "absolute", inset: 0, padding: 12 }}>
                    {scannedItems.slice(0, 8).map((item, i) => {
                      const positions = [
                        { top: "8%", left: "8%" },
                        { top: "8%", right: "8%" },
                        { top: "30%", left: "5%" },
                        { top: "30%", right: "5%" },
                        { top: "55%", left: "8%" },
                        { top: "55%", right: "8%" },
                        { top: "75%", left: "20%" },
                        { top: "75%", right: "20%" },
                      ];
                      const pos = positions[i] || { top: `${10 + i * 12}%`, left: "8%" };
                      return (
                        <div key={i} style={{
                          position: "absolute",
                          ...pos,
                          background: "#1A5C2E",
                          color: "white",
                          fontSize: 12,
                          fontWeight: 800,
                          padding: "4px 10px",
                          borderRadius: 99,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          animation: `popIn 0.3s ease ${i * 0.1}s both`,
                          whiteSpace: "nowrap" as const,
                          display: "flex",
                          alignItems: "center",
                          gap: 4
                        }}>
                          ✓ {item}
                        </div>
                      );
                    })}
                    {/* Count badge */}
                    <div style={{
                      position: "absolute", bottom: 10, right: 10,
                      background: "#F97316", color: "white",
                      fontSize: 12, fontWeight: 800,
                      padding: "4px 10px", borderRadius: 99,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}>
                      {scannedItems.length} found ✓
                    </div>
                  </div>
                )}
              </div>

              {/* Use What You Have */}
              {!scanLoading && scannedItems.length > 0 && (
                <div style={{ background: "white", border: "1.5px solid #E8F5E9", borderRadius: 24, padding: 14, marginTop: 10 }}>
                  {/* Header */}
                  <div style={{ background: "#E8F5E9", borderRadius: 14, padding: "10px 14px", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#1A5C2E" }}>
                      ✅ We found {scannedItems.length} ingredients you already have.
                    </div>
                    <div style={{ fontSize: 14, color: "#2E7D32", marginTop: 3 }}>
                      Let&apos;s use them before they go to waste. 🌱
                    </div>
                  </div>

                  {/* Confirmed items */}
                  <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#1A5C2E", marginBottom: 8 }}>
                    ✅ Confirmed ({scannedItems.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 12 }}>
                    {scannedItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#E8F5E9", color: "#1A5C2E", fontSize: 14, fontWeight: 700, padding: "5px 12px", borderRadius: 99, border: "1.5px solid #C8E6C9" }}>
                        {editingIndex === i ? (
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") commitEditItem(i);
                              if (e.key === "Escape") setEditingIndex(null);
                            }}
                            onBlur={() => commitEditItem(i)}
                            style={{ border: "none", outline: "none", background: "white", borderRadius: 8, padding: "2px 6px", fontSize: 14, fontWeight: 700, color: "#1A5C2E", width: Math.max(70, editValue.length * 9), fontFamily: "'Nunito', sans-serif" }}
                          />
                        ) : (
                          <span style={{ cursor: "pointer" }} onClick={() => startEditItem(i, item)}>{item}</span>
                        )}
                        <span style={{ cursor: "pointer", opacity: 0.55, fontSize: 12 }} onClick={() => startEditItem(i, item)} title="Edit">✏️</span>
                        <span style={{ cursor: "pointer", opacity: 0.6 }} onClick={() => setScannedItems(p => p.filter((_, j) => j !== i))}>×</span>
                      </div>
                    ))}
                  </div>

                  {/* Uncertain items — tap to add */}
                  {uncertainItems.length > 0 && (
                    <div style={{ background: "#FFFBF0", border: "1.5px solid #F5C842", borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#856404", marginBottom: 8 }}>
                        ⚠️ {uncertainItems.length} items need confirmation
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                        {uncertainItems.map((item, i) => {
                          const name = item.split(" —")[0];
                          const isAdded = scannedItems.includes(name);
                          return (
                            <div key={i} onClick={() => {
                              if (!isAdded) setScannedItems(p => [...p, name]);
                              else setScannedItems(p => p.filter(x => x !== name));
                            }}
                              style={{ display: "flex", alignItems: "center", gap: 4, background: isAdded ? "#E8F5E9" : "white", color: isAdded ? "#1A5C2E" : "#856404", fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 99, border: `1.5px solid ${isAdded ? "#C8E6C9" : "#F5C842"}`, cursor: "pointer" }}>
                              {isAdded ? "✓" : "+"} {name}
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Tap to add items you recognize</div>
                    </div>
                  )}

                  <button onClick={generate}
                    style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", color: "white", border: "none", borderRadius: 24, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    ✦ Build My 7-Day Plan Using These
                  </button>
                </div>
              )}
            </div>
          )}

          {showManual && settingsPanel}

          {/* Food feed — two-column masonry */}
          <div style={{ padding: "4px 8px 8px" }}>
            {/* Any search can become a recipe, even when the feed has close matches */}
            {search.trim() && (
              <button onClick={() => { track("search_ai_recipe", { query: search.trim(), feedMatches: feedList().length }); openSheet({ name: search.trim(), source: "search" }); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", minHeight: 56, margin: "0 0 10px", padding: "8px 14px", borderRadius: 16, border: "1.5px solid #1A5C2E", background: "#F1F8F1", color: "#1A5C2E", cursor: "pointer", textAlign: "left" as const, fontFamily: "'Nunito', sans-serif" }}>
                <span aria-hidden="true" style={{ fontSize: 22 }}>✨</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 900, fontSize: 15 }}>Get a recipe for &ldquo;{search.trim()}&rdquo;</span>
                  <span style={{ display: "block", fontSize: 12.5, color: "#4A6B50", fontWeight: 600 }}>
                    {feedList().length > 0 ? `Written by GoEat AI · or pick from ${feedList().length} dish${feedList().length > 1 ? "es" : ""} below` : "Not in our photo feed yet · written by GoEat AI"}
                  </span>
                </span>
                <span aria-hidden="true" style={{ fontWeight: 900 }}>→</span>
              </button>
            )}
            {feedList().length === 0 ? (
              !search.trim() && (
                <div style={{ padding: "24px 12px 8px", textAlign: "center", fontSize: 15, color: "#666" }}>No dishes in this category yet.</div>
              )
            ) : (() => {
              const HEIGHTS = [240, 190, 280, 210, 255, 225, 300, 200];
              const items = feedList().map((d, i) => ({ kind: "dish" as const, d, h: HEIGHTS[i % HEIGHTS.length] }));
              const cols: (typeof items)[] = [[], []];
              const heights = [0, 0];
              for (const it of items) {
                const c = heights[0] <= heights[1] ? 0 : 1;
                cols[c].push(it);
                heights[c] += it.h + 48;
              }
              return (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  {cols.map((col, ci) => (
                    <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                      {col.map(it => (
                        <div key={it.d.name} style={{ position: "relative" }}>
                          <button onClick={() => openFeedDish(it.d)}
                            style={{ display: "block", width: "100%", border: "none", padding: 0, background: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: "'Nunito', sans-serif" }}>
                            <div style={{ position: "relative", height: it.h, borderRadius: 18, overflow: "hidden", background: "#F1EEE8" }}>
                              {it.d.video ? (
                                <>
                                  <FeedVideo src={feedVideoSrc(it.d.video)} poster={feedVideoPoster(it.d.video)} alt={it.d.name}
                                    onFirstPlay={() => track("feed_video_played", { recipe: it.d.name })} />
                                  <span aria-hidden="true" style={{ position: "absolute", top: 8, left: 8, padding: "3px 8px", borderRadius: 99, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 11, fontWeight: 800 }}>▶ Video</span>
                                </>
                              ) : mealPhotos[it.d.name] && (
                                <img src={sizedPhoto(mealPhotos[it.d.name], 500)} alt={it.d.name} loading="lazy"
                                  onError={() => { setBrokenPhotos(p => ({ ...p, [it.d.name]: true })); track("feed_photo_failed", { recipe: it.d.name }); }}
                                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              )}
                            </div>
                            <div style={{ padding: "6px 4px 0", fontWeight: 700, fontSize: 14, color: "#222", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.d.name}</div>
                            <div style={{ padding: "1px 4px 0", fontSize: 12, color: "#888" }}>~{it.d.minutes} min · {it.d.cuisine}</div>
                          </button>
                          {it.d.video && (
                            <a href={`https://www.pexels.com/@${it.d.video.by[1]}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: "block", padding: "1px 4px 0", fontSize: 10.5, color: "#AAA", textDecoration: "none" }}>Video: {it.d.video.by[0]} / Pexels</a>
                          )}
                          {it.d.noPlan ? (
                          <button onClick={() => toggleSave({ name: it.d.name, cuisine: it.d.cuisine, minutes: it.d.minutes, meal: it.d.meal, source: "feed" })}
                            aria-label={isSaved(it.d.name) ? `Unsave ${it.d.name}` : `Save ${it.d.name}`} aria-pressed={isSaved(it.d.name)}
                            style={{ position: "absolute", top: it.h - 50, right: 8, width: 42, height: 42, borderRadius: 14, border: "none", background: isSaved(it.d.name) ? "#E8620A" : "rgba(255,255,255,0.95)", color: isSaved(it.d.name) ? "white" : "#E8620A", fontSize: 20, cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,0.25)" }}>
                            {isSaved(it.d.name) ? "♥" : "♡"}
                          </button>
                          ) : (
                          <button onClick={() => quickAdd(it.d)}
                            aria-label={isPicked(it.d.name) ? `Remove ${it.d.name} from my week` : `Add ${it.d.name} to my week`} aria-pressed={isPicked(it.d.name)}
                            style={{ position: "absolute", top: it.h - 50, right: 8, minWidth: 42, height: 42, padding: "0 10px", borderRadius: 14, border: "none", background: isPicked(it.d.name) ? "#1A5C2E" : "#F97316", color: "white", fontSize: isPicked(it.d.name) ? 13 : 24, fontWeight: 900, cursor: "pointer", boxShadow: "0 3px 10px rgba(0,0,0,0.25)", fontFamily: "'Nunito', sans-serif" }}>
                            {isPicked(it.d.name) ? `✓ ${weekPicks.find(p => p.name === it.d.name)?.day.slice(0, 3)}` : "＋"}
                          </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* End of feed: act right here instead of scrolling back up */}
          {feedList().length > 0 && (
            <div ref={feedEndRef} style={{ margin: "18px 12px 24px", padding: "22px 18px", borderRadius: 24, background: "linear-gradient(160deg,#1A5C2E,#2E7D32)", color: "white", textAlign: "center" as const }}>
              <div aria-hidden="true" style={{ fontSize: 34 }}>🍽️</div>
              <div style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Nunito', sans-serif", marginTop: 4 }}>
                {weekPicks.length > 0 ? `You picked ${weekPicks.length} dish${weekPicks.length > 1 ? "es" : ""}` : "You've seen them all!"}
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4, lineHeight: 1.45 }}>
                {weekPicks.length > 0 ? "We'll plan the rest of your week and make one grocery list." : "Turn the dishes you liked into this week's meal plan."}
              </div>
              <button onClick={() => { track("build_plan_clicked", { from: "feed_end" }); setView("week"); window.scrollTo(0, 0); }}
                style={{ width: "100%", minHeight: 52, marginTop: 16, border: "none", borderRadius: 99, background: "#F97316", color: "white", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 6px 16px rgba(0,0,0,0.2)" }}>
                🗓 {weekPicks.length > 0 ? `Plan my week with ${weekPicks.length}` : "Plan my week"}
              </button>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => { track("scan_clicked", { from: "feed_end" }); fridgeRef.current?.click(); }}
                  style={{ flex: 1, minHeight: 46, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>📸 Scan fridge</button>
                <button onClick={() => { track("receipt_clicked", { from: "feed_end" }); receiptRef.current?.click(); }}
                  style={{ flex: 1, minHeight: 46, borderRadius: 99, border: "1.5px solid rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>🧾 Scan receipt</button>
              </div>
              <button onClick={() => { track("back_to_top_clicked", { from: "feed_end" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                style={{ marginTop: 14, minHeight: 40, padding: "0 16px", border: "none", background: "none", color: "white", fontWeight: 800, fontSize: 14, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                ↑ Back to top
              </button>
            </div>
          )}
        </div>
      )}

      {/* MY WEEK — builder (before a plan exists) */}
      {screen !== "loading" && view === "week" && !result && (
        <div>
          <div style={{ padding: "20px 22px 4px" }}>
            <h1 style={{ margin: 0, fontWeight: 900, fontSize: 26, color: "#1A5C2E", fontFamily: "'Nunito', sans-serif" }}>My Week</h1>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#666" }}>Pick dishes you want, and GoEat fills in the rest of the week.</p>
          </div>

          {weekPicks.length === 0 && includeMeals.length === 0 ? (
            <div style={{ margin: "14px 22px 0", padding: 16, borderRadius: 18, background: "#F7FAF7", border: "1.5px dashed #C8E6C9" }}>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.5 }}>No dishes picked yet. Tap <strong>＋ Add to My Week</strong> on any dish, or just build a plan below.</div>
              <button onClick={() => openSample("week_empty")}
                style={{ marginTop: 10, minHeight: 40, padding: "0 14px", borderRadius: 99, border: "1.5px dashed #F5B98A", background: "#FFF8F2", color: "#B4400A", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>👀 See a sample week</button>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" as const }}>
                <button onClick={() => setView("home")}
                  style={{ minHeight: 40, padding: "0 14px", borderRadius: 99, border: "1.5px solid #1A5C2E", background: "white", color: "#1A5C2E", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Browse dishes</button>
                {savedRecipes.length > 0 && (
                  <button onClick={() => { setSelectingSaved(true); setView("saved"); }}
                    style={{ minHeight: 40, padding: "0 14px", borderRadius: 99, border: "1.5px solid #F97316", background: "white", color: "#E8620A", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Use my saved dishes ({savedRecipes.length})</button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "14px 22px 0" }}>
              {DAYS.flatMap(d => weekPicks.filter(p => p.day === d)).map(p => (
                <div key={`${p.day}-${p.type}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: 8, border: "1.5px solid #E8F5E9", borderRadius: 16, marginBottom: 8 }}>
                  <button onClick={() => { const f = findFeedDish(p.name); if (f) openFeedDish(f, "plan"); else openSheet({ name: p.name, source: "plan" }); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" as const, fontFamily: "'Nunito', sans-serif" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", background: "#E8F5E9", flexShrink: 0 }}>
                      {mealPhotos[p.name] && <img src={sizedPhoto(mealPhotos[p.name], 200)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: "#2E7D32" }}>{p.day} · {p.type}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#222" }}>{p.name}</div>
                    </div>
                  </button>
                  <button onClick={() => removePick(p)} aria-label={`Remove ${p.name} from ${p.day}`}
                    style={{ width: 36, height: 36, borderRadius: "50%", border: "none", background: "#F5F5F5", color: "#888", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>×</button>
                </div>
              ))}
              {includeMeals.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#1A5C2E", marginBottom: 6 }}>Also this week (any day)</div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                    {includeMeals.map(n => (
                      <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 6px 6px 12px", borderRadius: 99, background: "#FFF4EC", color: "#B4400A", fontSize: 13, fontWeight: 700 }}>
                        {n}
                        <button onClick={() => setIncludeMeals(p => p.filter(x => x !== n))} aria-label={`Remove ${n}`}
                          style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "white", color: "#B4400A", cursor: "pointer" }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ padding: "18px 22px 0" }}>
            {error && !editSettings && <div role="alert" style={{ background: "#FFF0F0", border: "1.5px solid #FFCDD2", borderRadius: 16, padding: "12px 14px", fontSize: 14, color: "#e63946", fontWeight: 600, marginBottom: 10 }}>⚠️ {error}</div>}
            <button onClick={() => { track("week_generate_clicked", { picks: weekPicks.length, edited: editSettings }); generate(); }}
              style={{ width: "100%", minHeight: 56, borderRadius: 99, border: "none", background: "linear-gradient(135deg,#F97316,#E8620A)", color: "white", fontWeight: 900, fontSize: 17, cursor: "pointer", boxShadow: "0 6px 16px rgba(232,98,10,0.3)", fontFamily: "'Nunito', sans-serif" }}>
              🍽️ {weekPicks.length + includeMeals.length > 0 ? "Build my week with these" : "Build my 7-day plan"}
            </button>
            {/* Quick picks: country + family size, no need to open Edit */}
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 8 }}>
              <div role="group" aria-label="Country" style={{ display: "flex", gap: 6 }}>
                {([["CA", "🇨🇦 Canada"], ["US", "🇺🇸 United States"]] as const).map(([code, label]) => (
                  <button key={code} aria-pressed={country === code}
                    onClick={() => { if (country !== code) { setCountry(code); setStore(code === "CA" ? CA_STORES[0] : US_STORES[0]); track("quick_setting_changed", { setting: "country", value: code }); } }}
                    style={{ flex: 1, minHeight: 44, borderRadius: 12, border: `1.5px solid ${country === code ? "#1A5C2E" : "#E3E3E3"}`, background: country === code ? "#E8F5E9" : "white", color: country === code ? "#1A5C2E" : "#777", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                    {label}
                  </button>
                ))}
              </div>
              <div role="group" aria-label="Family size" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#1A5C2E", flexShrink: 0, marginRight: 2 }}>👨‍👩‍👧 People</span>
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <button key={n} aria-pressed={family === n} aria-label={`${n}${n === 6 ? " or more" : ""} ${n === 1 ? "person" : "people"}`}
                    onClick={() => { setFamily(n); track("quick_setting_changed", { setting: "family", value: n }); }}
                    style={{ flex: 1, minWidth: 0, minHeight: 44, borderRadius: 12, border: `1.5px solid ${family === n ? "#1A5C2E" : "#E3E3E3"}`, background: family === n ? "#1A5C2E" : "white", color: family === n ? "white" : "#555", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                    {n}{n === 6 ? "+" : ""}
                  </button>
                ))}
              </div>
            </div>
            {/* Budget and store, also without opening Edit */}
            <div role="group" aria-label="Weekly budget" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1A5C2E", flexShrink: 0, marginRight: 2 }}>💰 Budget</span>
              {["100", "150", "200", "250", "300"].map(b => {
                const on = (budget || "150") === b;
                return (
                  <button key={b} aria-pressed={on} aria-label={`${sym}${b} per week`}
                    onClick={() => { setBudget(b); track("quick_setting_changed", { setting: "budget", value: b }); }}
                    style={{ flex: 1, minWidth: 0, minHeight: 44, borderRadius: 12, border: `1.5px solid ${on ? "#1A5C2E" : "#E3E3E3"}`, background: on ? "#1A5C2E" : "white", color: on ? "white" : "#555", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif", padding: 0 }}>
                    {b}
                  </button>
                );
              })}
            </div>
            {budget && !["100", "150", "200", "250", "300"].includes(budget) && (
              <div style={{ fontSize: 12.5, color: "#666", marginTop: 4, paddingLeft: 2 }}>Custom budget: {sym}{budget}/week</div>
            )}
            <div role="group" aria-label="Store" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, overflowX: "auto", scrollbarWidth: "none" as const, paddingBottom: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#1A5C2E", flexShrink: 0, marginRight: 2 }}>🏪 Store</span>
              {stores.map(st => {
                const on = store === st;
                return (
                  <button key={st} aria-pressed={on}
                    onClick={() => { setStore(st); track("quick_setting_changed", { setting: "store", value: st }); }}
                    style={{ flex: "0 0 auto", minHeight: 40, padding: "0 12px", borderRadius: 99, border: `1.5px solid ${on ? "#1A5C2E" : "#E3E3E3"}`, background: on ? "#1A5C2E" : "white", color: on ? "white" : "#555", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" as const }}>
                    {st}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 10, padding: "8px 12px", borderRadius: 14, background: "#F7FAF7" }}>
              <span style={{ fontSize: 13, color: "#555", fontWeight: 700, minWidth: 0 }}>
                {diets.length || cuisines.length ? [...diets, ...cuisines].join(" · ") : "Diet, cuisine, family allergies"}
              </span>
              <button onClick={() => setEditSettings(v => !v)} aria-expanded={editSettings}
                style={{ flexShrink: 0, minHeight: 36, padding: "0 12px", borderRadius: 99, border: "1.5px solid #1A5C2E", background: "white", color: "#1A5C2E", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                {editSettings ? "Done" : "More options"}
              </button>
            </div>
          </div>
          {editSettings && settingsPanel}
        </div>
      )}

      {/* SAVED */}
      {screen !== "loading" && view === "saved" && (
        <div>
          <div style={{ padding: "20px 22px 4px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
            <div>
              <h1 style={{ margin: 0, fontWeight: 900, fontSize: 26, color: "#1A5C2E", fontFamily: "'Nunito', sans-serif" }}>Saved</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>Saved on this device.</p>
            </div>
            {savedRecipes.length > 0 && (
              <button onClick={() => { setSelectingSaved(v => !v); setSelectedSaved([]); }}
                style={{ minHeight: 38, padding: "0 14px", borderRadius: 99, border: "1.5px solid #1A5C2E", background: selectingSaved ? "#1A5C2E" : "white", color: selectingSaved ? "white" : "#1A5C2E", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                {selectingSaved ? "Cancel" : "Plan with these"}
              </button>
            )}
          </div>

          {selectingSaved && (
            <div style={{ margin: "10px 22px 0", fontSize: 14, color: "#555" }}>Tap the dishes you want this week.</div>
          )}

          {savedRecipes.length === 0 ? (
            <div style={{ margin: "16px 22px", padding: 18, borderRadius: 18, background: "#F7FAF7", textAlign: "center" }}>
              <div style={{ fontSize: 30, marginBottom: 6 }}>♡</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#333", marginBottom: 4 }}>No saved dishes yet</div>
              <div style={{ fontSize: 14, color: "#777", marginBottom: 12 }}>Tap ♡ on any dish to keep it here.</div>
              <button onClick={() => setView("home")}
                style={{ minHeight: 40, padding: "0 16px", borderRadius: 99, border: "none", background: "#1A5C2E", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>Browse dishes</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "14px 18px 0" }}>
              {savedRecipes.map(r => {
                const sel = selectedSaved.includes(r.name);
                return (
                  <div key={r.name} style={{ position: "relative" }}>
                    <button onClick={() => {
                      if (selectingSaved) setSelectedSaved(p => (sel ? p.filter(x => x !== r.name) : [...p, r.name]));
                      else openSheet({ name: r.name, cuisine: r.cuisine, minutes: r.minutes, meal: findFeedDish(r.name)?.meal, source: "saved" });
                    }}
                      aria-pressed={selectingSaved ? sel : undefined}
                      style={{ display: "block", width: "100%", border: "none", padding: 0, background: "none", cursor: "pointer", textAlign: "left" as const, fontFamily: "'Nunito', sans-serif" }}>
                      <div style={{ height: 150, borderRadius: 16, overflow: "hidden", background: "#E8F5E9", outline: sel ? "3px solid #F97316" : "none", outlineOffset: 2 }}>
                        {mealPhotos[r.name] && <img src={sizedPhoto(mealPhotos[r.name], 400)} alt={r.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#222", marginTop: 6, lineHeight: 1.25 }}>{r.name}</div>
                      {(r.minutes || r.cuisine) && <div style={{ fontSize: 12, color: "#888" }}>{r.minutes ? `~${r.minutes} min` : ""}{r.minutes && r.cuisine ? " · " : ""}{r.cuisine || ""}</div>}
                    </button>
                    {selectingSaved ? (
                      <span aria-hidden="true" style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: sel ? "#F97316" : "rgba(255,255,255,0.92)", color: "white", border: sel ? "none" : "2px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>{sel ? "✓" : ""}</span>
                    ) : (
                      <button onClick={() => toggleSave({ name: r.name, cuisine: r.cuisine, minutes: r.minutes, source: "saved" })} aria-label={`Unsave ${r.name}`}
                        style={{ position: "absolute", top: 8, right: 8, width: 36, height: 36, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.92)", color: "#E8620A", fontSize: 18, cursor: "pointer" }}>♥</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {selectingSaved && selectedSaved.length > 0 && (
            <div style={{ position: "fixed", left: 0, right: 0, bottom: 68, zIndex: 160, padding: "0 16px" }}>
              <button onClick={() => {
                setIncludeMeals(selectedSaved);
                setSelectingSaved(false);
                track("saved_used_for_plan", { count: selectedSaved.length });
                setView("week");
              }}
                style={{ display: "block", width: "100%", maxWidth: 398, margin: "0 auto", minHeight: 52, borderRadius: 99, border: "none", background: "linear-gradient(135deg,#F97316,#E8620A)", color: "white", fontWeight: 800, fontSize: 16, cursor: "pointer", boxShadow: "0 6px 18px rgba(0,0,0,0.18)", fontFamily: "'Nunito', sans-serif" }}>
                Use {selectedSaved.length} dish{selectedSaved.length > 1 ? "es" : ""} this week
              </button>
            </div>
          )}

          {/* Saved meal plans (existing feature) */}
          <div style={{ padding: "24px 22px 0" }}>
            <h2 style={{ margin: "0 0 10px", fontWeight: 900, fontSize: 18, color: "#1A1A18", fontFamily: "'Nunito', sans-serif" }}>Saved plans</h2>
            {savedPlans.length === 0 ? (
              <div style={{ fontSize: 14, color: "#888" }}>Generate a plan and tap &ldquo;Save This Plan&rdquo; to keep it here.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {savedPlans.map((plan, i) => (
                  <div key={i} style={{ border: "1.5px solid #E8F5E9", borderRadius: 18, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={() => loadSavedPlan(plan)} style={{ flex: 1, border: "none", background: "none", padding: 0, textAlign: "left" as const, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#1A5C2E", marginBottom: 2 }}>{plan.savedName}</div>
                      <div style={{ fontSize: 13, color: "#999" }}>{plan.country === "CA" ? "🇨🇦" : "🇺🇸"} Family of {plan.family} · {plan.store}</div>
                      <div style={{ fontSize: 13, color: "#2E7D32", fontWeight: 600 }}>{plan.sym}{plan.totalCost?.toFixed?.(2)} est. · {plan.diet}</div>
                    </button>
                    <button onClick={() => deleteSavedPlan(i)} aria-label={`Delete ${plan.savedName}`}
                      style={{ background: "#FFF0F0", border: "none", borderRadius: 8, padding: "6px 10px", color: "#e63946", fontSize: 14, cursor: "pointer", marginLeft: 10 }}>🗑️</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SHOPPING — before a plan exists */}
      {screen !== "loading" && view === "shop" && !result && (
        <div style={{ padding: "20px 22px 0" }}>
          <h1 style={{ margin: 0, fontWeight: 900, fontSize: 26, color: "#1A5C2E", fontFamily: "'Nunito', sans-serif" }}>Shopping</h1>
          <div style={{ margin: "12px 0 16px", padding: 14, borderRadius: 16, background: "#F7FAF7", border: "1.5px solid #E8F5E9" }}>
            <div style={{ fontSize: 14, color: "#555", lineHeight: 1.5, marginBottom: 10 }}>Build a 7-day plan to get one combined grocery list with estimated prices.</div>
            <button onClick={() => setView("week")}
              style={{ minHeight: 42, padding: "0 16px", borderRadius: 99, border: "none", background: "#1A5C2E", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>🗓 Build my plan</button>
          </div>
          {extraItems.length > 0 ? extrasList : (
            <div style={{ fontSize: 14, color: "#888" }}>Ingredients you add from recipes will show up here.</div>
          )}
        </div>
      )}

      {/* LOADING */}
      {screen === "loading" && (
        <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 24, padding: "40px 24px" }}>
          <div style={{ width: 56, height: 56, border: "4px solid #E8F5E9", borderTopColor: "#2E7D32", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1A5C2E" }}>Building your plan...</div>
            <div style={{ fontSize: 14, color: "#999", marginTop: 6, lineHeight: 1.6 }}>Creating a 7-day meal plan<br />for a family of {family} at {store}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, width: "100%" }}>
            {["Analyzing your ingredients","Crafting 7-day meal schedule","Building smart shopping list","Calculating estimated costs & savings"].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: loadStep > i ? "#2E7D32" : "#999" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: loadStep > i ? "none" : "2px solid #e5e0d8", background: loadStep > i ? "#2E7D32" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", flexShrink: 0 }}>
                  {loadStep > i ? "✓" : ""}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {screen !== "loading" && (view === "week" || view === "shop") && result && (
        <div>
          {/* Hero */}
          <div style={{ background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", padding: "22px 22px 18px", color: "white" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#81C784", marginBottom: 4 }}>✦ Your personalized plan is ready</div>
            <div style={{ fontWeight: 900, fontSize: 22, fontFamily: "'Nunito', sans-serif", marginBottom: 2 }}>Week of Meals 🎉</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              {result.country === "CA" ? "🇨🇦" : "🇺🇸"} Family of {result.family} · {result.store}
              {result.cuisine !== "Any Cuisine" ? ` · ${result.cuisine}` : ""}
            </div>
            {result.pickedCount > 0 && (
              <div style={{ marginTop: 8, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 14, color: "#FDBA74", fontWeight: 600 }}>
                ♥ Built around {result.pickedCount} dish{result.pickedCount > 1 ? "es" : ""} you picked
              </div>
            )}
            {result.scannedCount > 0 && (
              <div style={{ marginTop: 8, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 14, color: "#81C784", fontWeight: 600 }}>
                🌱 Using {result.scannedCount} ingredients from your fridge
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "12px 22px", borderBottom: "1px solid #e5e0d8" }}>
            {[["plan","🗓 Plan"],["shop","🛒 Shop"],["budget","💰 Budget"]].map(([id,label]) => (
              <button key={id} onClick={() => { setTab(id); setView(id === "shop" ? "shop" : "week"); }}
                style={{ flex: 1, padding: "8px 4px", border: "none", background: tab === id ? "#1A5C2E" : "none", color: tab === id ? "white" : "#999", fontSize: 14, fontWeight: 700, cursor: "pointer", borderRadius: 8, fontFamily: "'Nunito', sans-serif" }}>{label}</button>
            ))}
          </div>

          {/* PLAN TAB */}
          {tab === "plan" && (
            <div>
              {shoppingStale && (
                shopError ? (
                  <div role="alert" style={{ margin: "14px 22px 0", padding: "12px 14px", borderRadius: 16, background: "#FFF0EC", border: "1.5px solid #F5B49A" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#B4400A", marginBottom: 8 }}>{shopError} {result.shoppingList ? "The list and cost don't include your new meals yet." : ""}</div>
                    <button onClick={() => setShopError("")}
                      style={{ width: "100%", minHeight: 44, borderRadius: 99, border: "none", background: "#1A5C2E", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      Try again
                    </button>
                  </div>
                ) : (
                  <div role="status" style={{ margin: "14px 22px 0", padding: "12px 14px", borderRadius: 16, background: "#F1F8F1", border: "1.5px solid #C8E6C9", fontSize: 14, fontWeight: 700, color: "#1A5C2E" }}>
                    {result.shoppingList ? "🔄 Updating your shopping list for the new meals…" : "🛒 Building your shopping list and cost estimate…"}
                  </div>
                )
              )}
              {swapError && <div role="alert" style={{ margin: "10px 22px 0", fontSize: 13, color: "#B4400A" }}>{swapError}</div>}
              {/* Week view: day tabs + photo cards (one day at a time) */}
              {(() => {
                const days: any[] = result.mealPlan || [];
                const cur = days.find(d => d.day === planDay) || days[0];
                if (!cur) return null;
                const idx = days.indexOf(cur);
                const nextDay = days[idx + 1];
                const MEAL_ICON: Record<string, string> = { Breakfast: "🍳", Lunch: "🥗", Dinner: "🍲" };
                const MEAL_BG: Record<string, string> = { Breakfast: "linear-gradient(135deg,#FFE9B8,#FFD48A)", Lunch: "linear-gradient(135deg,#CDEBF2,#A9D9E6)", Dinner: "linear-gradient(135deg,#D7EFD9,#B3DDB7)" };
                return (
                  <div>
                    <div style={{ padding: "16px 22px 10px", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 900, fontSize: 20, fontFamily: "'Nunito', sans-serif", color: "#1A5C2E" }}>📅 Your 7-Day Plan</div>
                      {typeof result.totalCost === "number" && result.totalCost > 0 && (
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#2E7D32", whiteSpace: "nowrap" as const }}>~{result.sym}{(result.totalCost / 7).toFixed(2)}/day <span style={{ color: "#999", fontWeight: 600 }}>est.</span></div>
                      )}
                    </div>
                    <div role="tablist" aria-label="Days" style={{ display: "flex", gap: 6, padding: "0 16px 12px", overflowX: "auto", scrollbarWidth: "none" as const }}>
                      {days.map(d => {
                        const on = d === cur;
                        const thumb = (d.meals || []).map((m: any) => mealPhotos[m.name]).find(Boolean);
                        return (
                          <button key={d.day} role="tab" aria-selected={on} aria-label={d.day}
                            onClick={() => { setPlanDay(d.day); track("plan_day_viewed", { day: d.day }); }}
                            style={{ flex: "1 0 46px", minWidth: 46, padding: "6px 0 8px", borderRadius: 16, border: on ? "2px solid #1A5C2E" : "2px solid transparent", background: on ? "#1A5C2E" : "#F3F7F3", color: on ? "white" : "#3F5F45", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif" }}>
                            <span style={{ fontSize: 13, fontWeight: 900 }}>{String(d.day).slice(0, 3)}</span>
                            <span style={{ width: 30, height: 30, borderRadius: 10, overflow: "hidden", background: on ? "rgba(255,255,255,0.2)" : "#E1ECE2", display: "block" }}>
                              {thumb && <img src={sizedPhoto(thumb, 80)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ padding: "0 22px 8px", fontWeight: 900, fontSize: 17, color: "#1A1A18", fontFamily: "'Nunito', sans-serif" }}>{cur.day}</div>
                    <div style={{ padding: "0 16px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
                      {(cur.meals || []).map((m: any, j: number) => {
                        const mc = mealColor(m.type);
                        const photo = mealPhotos[m.name];
                        return (
                          <div key={j} onClick={() => openSheet({ name: m.name, meal: m.type, source: "plan", slot: { day: cur.day, type: m.type } })}
                            style={{ borderRadius: 20, overflow: "hidden", background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #EEF3EE", cursor: "pointer" }}>
                            <div style={{ position: "relative", height: 150, background: MEAL_BG[m.type] || "#EEE" }}>
                              {photo ? (
                                <img src={sizedPhoto(photo, 800)} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              ) : (
                                <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54 }}>{MEAL_ICON[m.type] || "🍽️"}</div>
                              )}
                              <div style={{ position: "absolute", top: 10, left: 10, fontSize: 12, fontWeight: 900, padding: "4px 10px", borderRadius: 99, background: mc.bg, color: mc.color, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{m.type}</div>
                            </div>
                            <div style={{ padding: "10px 14px 12px" }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color: "#1A1A18", lineHeight: 1.3, fontFamily: "'Nunito', sans-serif" }}>{m.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const, marginTop: 4, fontSize: 13, color: "#888" }}>
                                {m.calories && <span style={{ fontWeight: 700, color: "#F97316" }}>{m.calories} <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>est.</span></span>}
                                {m.tip && <span>💡 {m.tip}</span>}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                                <button onClick={e => { e.stopPropagation(); swapMeal(cur.day, m.type, m.name); }} disabled={!!swapping}
                                  aria-label={`Swap ${cur.day} ${m.type}`}
                                  style={{ minHeight: 36, padding: "0 14px", borderRadius: 99, border: "1.5px solid #FFD2B3", background: "white", color: "#E8620A", fontWeight: 800, fontSize: 13, cursor: swapping ? "wait" : "pointer", fontFamily: "'Nunito', sans-serif" }}>
                                  {swapping === `${cur.day}-${m.type}` ? "Swapping…" : "↻ Swap"}
                                </button>
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#2E7D32" }}>Recipe →</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {nextDay && (
                      <div style={{ padding: "14px 16px 0" }}>
                        <button onClick={() => { setPlanDay(nextDay.day); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          style={{ width: "100%", minHeight: 48, borderRadius: 99, border: "1.5px solid #C8E6C9", background: "#F7FBF7", color: "#1A5C2E", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                          Next: {nextDay.day} →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Budget summary */}
              <div style={{ height: 8, background: "#F7FBF7", margin: "20px 0 0" }} />
              <div style={{ padding: "16px 22px 0", fontWeight: 900, fontSize: 18, fontFamily: "'Nunito', sans-serif", color: "#1A5C2E" }}>💰 This week&apos;s estimate</div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "12px 22px 16px" }}>
                {[
                  { icon: "🛒", val: typeof result.totalCost === "number" ? `${result.sym}${result.totalCost.toFixed(2)}` : "…", lbl: "Est. Grocery Cost", note: `of ${result.sym}${result.budget} budget`, color: "#2E7D32" },
                  { icon: "💰", val: typeof result.savings === "number" ? `${result.sym}${result.savings.toFixed(2)}` : "…", lbl: "Estimated Savings", note: `left in your ${result.sym}${result.budget} budget`, color: "#F97316" },
                  { icon: "♻️", val: result.wasteReduction?.estimatedWasteReduced, lbl: "Waste Reduced", note: "AI estimate", color: "#457b9d" },
                  { icon: "🍱", val: result.wasteReduction?.mealsFromLeftovers, lbl: "Leftover Meals", note: "planned this week", color: "#e63946" },
                ].filter(x => x.val !== undefined && x.val !== null && x.val !== "").map(({ icon, val, lbl, note, color }) => (
                  <div key={lbl} style={{ background: "white", border: "1.5px solid #E8F5E9", borderRadius: 22, padding: "14px 14px 12px" }}>
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
                    <div style={{ fontWeight: 900, fontSize: 22, fontFamily: "'Nunito', sans-serif", lineHeight: 1, color }}>{val}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: 4 }}>{lbl}</div>
                    <div style={{ fontSize: 14, color: "#999", marginTop: 2 }}>{note}</div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ margin: "0 22px 16px", background: "#FFF8E6", border: "1px solid #F5C842", borderRadius: 14, padding: "8px 12px", fontSize: 14, color: "#856404" }}>
                💡 Prices and savings are <strong>estimates</strong>. Actual costs may vary by location and store.
              </div>

              <div style={{ height: 20 }} />
            </div>
          )}

          {/* SHOP TAB */}
          {tab === "shop" && (
            <div>
              {shoppingStale && (
                shopError ? (
                  <div role="alert" style={{ margin: "14px 22px 0", padding: "12px 14px", borderRadius: 16, background: "#FFF0EC", border: "1.5px solid #F5B49A" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#B4400A", marginBottom: 8 }}>{shopError} {result.shoppingList ? "The list and cost don't include your new meals yet." : ""}</div>
                    <button onClick={() => setShopError("")}
                      style={{ width: "100%", minHeight: 44, borderRadius: 99, border: "none", background: "#1A5C2E", color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                      Try again
                    </button>
                  </div>
                ) : (
                  <div role="status" style={{ margin: "14px 22px 0", padding: "12px 14px", borderRadius: 16, background: "#F1F8F1", border: "1.5px solid #C8E6C9", fontSize: 14, fontWeight: 700, color: "#1A5C2E" }}>
                    {result.shoppingList ? "🔄 Updating your shopping list for the new meals…" : "🛒 Building your shopping list and cost estimate…"}
                  </div>
                )
              )}

              <div style={{ padding: "16px 22px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: "#2E7D32" }}>{checkedCount}/{totalItems} items</span>
                  <span style={{ color: "#999" }}>{totalItems - checkedCount} left</span>
                </div>
                <div style={{ height: 6, background: "#e5e0d8", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#388E3C,#81C784)", borderRadius: 99, width: totalItems ? `${checkedCount / totalItems * 100}%` : "0%", transition: "width 0.4s ease" }} />
                </div>
              </div>
              <div style={{ padding: "0 22px" }}>
                {result.shoppingList?.map((cat: any, ci: number) => (
                  cat.items?.length > 0 && (
                    <div key={ci} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#2E7D32", marginBottom: 8 }}>{cat.emoji} {cat.category}</div>
                      {cat.items.map((item: any, ii: number) => {
                        const k = `${ci}-${ii}`;
                        const isChecked = checked[k];
                        return (
                          <div key={ii} onClick={() => setChecked(p => ({ ...p, [k]: !p[k] }))}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "white", border: "1.5px solid #E8F5E9", borderRadius: 14, marginBottom: 7, cursor: "pointer", opacity: isChecked ? 0.5 : 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${isChecked ? "#2E7D32" : "#e5e0d8"}`, background: isChecked ? "#2E7D32" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "white", flexShrink: 0 }}>
                                {isChecked ? "✓" : ""}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, textDecoration: isChecked ? "line-through" : "none" }}>{item.name}</div>
                                <div style={{ fontSize: 14, color: "#999" }}>{item.qty}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#F97316" }}>{result.sym}{typeof item.price === "number" ? item.price.toFixed(2) : item.price}</div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ))}
              </div>
              {extraItems.length > 0 && (
                <div style={{ padding: "4px 22px 8px" }}>{extrasList}</div>
              )}
            </div>
          )}

          {/* BUDGET TAB */}
          {tab === "budget" && (
            <div style={{ padding: "16px 22px" }}>
              <div style={{ background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", borderRadius: 22, padding: 20, color: "white", marginBottom: 16 }}>
                <div style={{ fontSize: 14, opacity: 0.7, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Estimated Total</div>
                <div style={{ fontWeight: 900, fontSize: 36, fontFamily: "'Nunito', sans-serif" }}>{typeof result.totalCost === "number" ? `${result.sym}${result.totalCost.toFixed(2)}` : "Calculating…"}</div>
                <div style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>at {result.store} · family of {result.family}</div>
              </div>

              {/* Estimated savings */}
              <div style={{ background: "#FFF4F0", border: "1.5px solid #F97316", borderRadius: 22, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>💰</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#F97316" }}>Estimated savings: {typeof result.savings === "number" ? `${result.sym}${result.savings.toFixed(2)}` : "…"}</div>
                  <div style={{ fontSize: 14, color: "#999", marginTop: 2 }}>left in your {result.sym}{result.budget} weekly budget</div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ background: "#FFF8E6", border: "1px solid #F5C842", borderRadius: 14, padding: "10px 12px", marginBottom: 16, fontSize: 14, color: "#856404" }}>
                ⚠️ All prices and savings are <strong>estimates</strong>. Actual costs depend on your location, store promotions, and product availability.
              </div>

              <div style={{ background: "#E8F5E9", borderRadius: 22, padding: 16 }}>
                <div style={{ fontSize: 14, color: "#1A5C2E", fontWeight: 600, lineHeight: 1.7 }}>
                  💡 Est. cost per meal: ~{result.sym}{result.totalCost ? (result.totalCost / (7 * 3 * result.family)).toFixed(2) : "—"} per person<br />
                  💡 Est. cost per day: ~{result.sym}{result.totalCost ? (result.totalCost / 7).toFixed(2) : "—"} for the family<br />
                  {result.wasteReduction?.estimatedWasteReduced && <>♻️ ~{result.wasteReduction.estimatedWasteReduced} of food waste avoided (AI estimate)<br /></>}
                  {result.wasteReduction?.co2Saved && <>🌍 ~{result.wasteReduction.co2Saved} carbon emissions saved (AI estimate)</>}
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          <div style={{ height: 8, background: "#F7FBF7", margin: "4px 0" }} />
          <div style={{ margin: "0 22px 18px", background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", borderRadius: 22, padding: 20, color: "white" }}>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#F87171", marginBottom: 8 }}>❤️ GoEatAI Impact</div>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 10, lineHeight: 1.3 }}>This plan makes a difference.</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Rough AI estimates for this plan.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { val: result.wasteReduction?.estimatedWasteReduced, lbl: "Food Saved" },
                { val: result.wasteReduction?.co2Saved, lbl: "CO₂ Reduced" },
                { val: typeof result.wasteReduction?.moneySavedFromWaste === "number" ? `${result.sym}${result.wasteReduction.moneySavedFromWaste.toFixed(2)}` : undefined, lbl: "Extra Saved" },
              ].filter(x => !!x.val).map(({ val, lbl }) => (
                <div key={lbl} style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: "10px 8px", textAlign: "center" as const }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: "#81C784" }}>{val}</div>
                  <div style={{ fontSize: 14, opacity: 0.7, marginTop: 2, fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "4px 22px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Save Plan Button */}
            <button onClick={() => { setSavePlanName(""); setShowSaveModal(true); }}
              style={{ width: "100%", padding: 14, background: "#E8F5E9", border: "2px solid #2E7D32", borderRadius: 22, fontWeight: 800, fontSize: 14, color: "#1A5C2E", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              📁 Save This Plan
            </button>
            <button onClick={() => { setScreen("setup"); setView("home"); setResult(null); setShoppingStale(false); setScanImage(null); setScannedItems([]); try { localStorage.removeItem("goeatai_last_result"); } catch {} }}
              style={{ width: "100%", padding: 14, background: "white", border: "2px solid #e5e0d8", borderRadius: 22, fontWeight: 800, fontSize: 14, color: "#999", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              ↩ Create New Meal Plan
            </button>
          </div>
        </div>
      )}
      {/* Floating back-to-top on the Home feed */}
      {screen !== "loading" && view === "home" && !sheet && showTopBtn && (
        <button onClick={() => { track("back_to_top_clicked", { from: "floating" }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          aria-label="Back to top"
          style={{ position: "fixed", right: "max(14px, calc(50vw - 201px))", bottom: (result || weekPicks.length > 0) ? 132 : 84, zIndex: 141, width: 46, height: 46, borderRadius: "50%", border: "none", background: "rgba(26,92,46,0.92)", color: "white", fontSize: 20, fontWeight: 900, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}>
          ↑
        </button>
      )}

      {/* This-week tray — browsing always leads to the plan */}
      {screen !== "loading" && view === "home" && !sheet && (result || weekPicks.length > 0) && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 72, zIndex: 140, padding: "0 12px" }}>
          <button onClick={() => { track("week_tray_clicked", { picks: weekPicks.length, hasPlan: !!result }); setView("week"); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", maxWidth: 406, margin: "0 auto", minHeight: 46, padding: "5px 6px 5px 12px", borderRadius: 16, border: "none", background: "#1A5C2E", color: "white", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.22)", fontFamily: "'Nunito', sans-serif", textAlign: "left" as const }}>
            <span style={{ display: "flex", flexShrink: 0 }}>
              {weekPicks.slice(0, 3).map((p, i) => (
                <span key={p.name + p.day} style={{ width: 28, height: 28, borderRadius: 8, overflow: "hidden", border: "2px solid #1A5C2E", marginLeft: i ? -10 : 0, background: "#2E7D32" }}>
                  {mealPhotos[p.name] && <img src={sizedPhoto(mealPhotos[p.name], 80)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                </span>
              ))}
              {weekPicks.length === 0 && <span aria-hidden="true" style={{ fontSize: 22 }}>🗓</span>}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 900, fontSize: 15 }}>
                {result ? "Your meal plan is ready" : weekPicks.length > 0 ? `${weekPicks.length} dish${weekPicks.length > 1 ? "es" : ""} picked` : "This week's plan"}
              </span>
            </span>
            <span style={{ flexShrink: 0, padding: "8px 12px", borderRadius: 11, background: "#F97316", fontWeight: 900, fontSize: 14 }}>
              {result ? "View →" : "Build plan →"}
            </span>
          </button>
        </div>
      )}

      {screen !== "loading" && (
        <BottomNav
          view={view}
          onChange={v => { if (v === "saved") setSelectingSaved(false); if (v === "shop") setTab("shop"); else if (v === "week" && tab === "shop") setTab("plan"); setView(v); window.scrollTo(0, 0); }}
          badges={{ week: result ? 0 : weekPicks.length, saved: savedRecipes.length, shop: 0 }}
        />
      )}
    </div>
  );
}
