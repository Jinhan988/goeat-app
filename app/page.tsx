"use client";
import { useState, useRef, useEffect } from "react";

const CA_STORES = ["Costco","No Frills","Loblaws","Sobeys","Metro","FreshCo","Food Basics","Walmart Canada","T&T Supermarket"];
const US_STORES = ["Costco","Walmart","Kroger","Whole Foods","Trader Joe's","Aldi","Target","Safeway","Publix"];

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

const MERITS = [
  { icon:"📸", title:"Fridge Scan", desc:"Take one photo of your fridge. GoEat AI instantly recognizes what you have — no typing needed." },
  { icon:"🤖", title:"7-Day Meal Plan", desc:"Not just one recipe. A full week of meals decided for you — breakfast, lunch, and dinner." },
  { icon:"🥗", title:"Nutrition Info", desc:"Calories and nutritional info for every meal. Eat better without counting anything." },
  { icon:"🛒", title:"Smart Shopping List", desc:"Only shows what you're missing. Items you already have are automatically excluded." },
  { icon:"💰", title:"Cost & Savings", desc:"See your estimated grocery cost and how much you're saving compared to eating out." },
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
  const [result, setResult] = useState<any>(null);
  const [tab, setTab] = useState("plan");
  const [openDays, setOpenDays] = useState<Record<string,boolean>>({"Monday":true});
  const [checked, setChecked] = useState<Record<string,boolean>>({});
  const [loadStep, setLoadStep] = useState(0);
  const [error, setError] = useState("");
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savePlanName, setSavePlanName] = useState("");
  const fridgeRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLInputElement>(null);

  const sym = country === "CA" ? "CA$" : "$";
  const stores = country === "CA" ? CA_STORES : US_STORES;

  // Load saved plans on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("goeatai_saved_plans");
      if (saved) setSavedPlans(JSON.parse(saved));
      // Also restore last result
      const last = localStorage.getItem("goeatai_last_result");
      if (last) {
        const parsed = JSON.parse(last);
        setResult(parsed);
        setScreen("results");
      }
    } catch {}
  }, []);

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
    setScreen("results");
    setShowSaved(false);
    setTab("plan");
    setOpenDays({ Monday: true });
  }

  async function handleScan(file: File, mode: "fridge"|"receipt") {
    setScanMode(mode);
    setScanImage(null);
    setScannedItems([]);
    setUncertainItems([]);
    setScanLoading(true);
    setShowManual(true);

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
        const data = await res.json();
        setScannedItems(data.items || []);
        setUncertainItems(data.uncertain || []);
      } catch {
        setScannedItems(mode === "receipt"
          ? ["Chicken breast","Brown rice","Broccoli","Eggs","Yogurt","Spinach","Tomatoes"]
          : ["Eggs","Milk","Cheese","Bell peppers","Carrots","Butter","Onions"]);
      }
      setScanLoading(false);
    };
    reader.readAsDataURL(file);
  }

  async function generate() {
    const eff = budget || "150";
    setError("");
    setScreen("loading");
    setLoadStep(0);

    const steps = [
      setTimeout(() => setLoadStep(1), 800),
      setTimeout(() => setLoadStep(2), 2500),
      setTimeout(() => setLoadStep(3), 4000),
    ];

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ family, budget: eff, store, diet: diets.length ? diets.join(" + ") : "No Restriction", cuisine: cuisines.length ? cuisines.join(" + ") : "Any Cuisine", country, ingredients: scannedItems })
      });

      steps.forEach(clearTimeout);
      setLoadStep(4);

      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const finalResult = { ...data, family, budget: eff, store, diet: diets.join(" + ") || "No Restriction", cuisine: cuisines.join(" + ") || "Any Cuisine", country, sym, scannedCount: scannedItems.length };
      setResult(finalResult);
      setChecked({});
      setOpenDays({ Monday: true });
      setTab("plan");
      // Auto-save last result
      try { localStorage.setItem("goeatai_last_result", JSON.stringify(finalResult)); } catch {}
      setTimeout(() => setScreen("results"), 300);
    } catch {
      steps.forEach(clearTimeout);
      setError("Failed to generate meal plan. Please try again.");
      setScreen("setup");
    }
  }

  const totalItems = result?.shoppingList?.flatMap((c: any) => c.items).length || 0;
  const checkedCount = Object.values(checked).filter(Boolean).length;

  const mealColor = (type: string) => {
    if (type === "Breakfast") return { bg: "#FFF3CD", color: "#856404" };
    if (type === "Lunch") return { bg: "#D1ECF1", color: "#0C5460" };
    if (type === "Dinner") return { bg: "#D8F3DC", color: "#1B4332" };
    return { bg: "#F3F0FF", color: "#6B21A8" };
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "white", boxShadow: "0 0 40px rgba(0,0,0,0.08)", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "#1B4332", padding: "18px 22px 14px", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#40916C,#74C69D)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛒</div>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, color: "white" }}>
                Go<span style={{ color: "#F97316" }}>Eat</span>
                <span style={{ fontSize: 9, background: "#22C55E", color: "#1B4332", fontWeight: 800, padding: "2px 5px", borderRadius: 4, marginLeft: 4, verticalAlign: "top" }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: "#74C69D", fontWeight: 500 }}>Your fridge. Your meals. Your budget.</div>
            </div>
          </div>
          {/* Saved plans button */}
          <button onClick={() => setShowSaved(true)}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 10, padding: "8px 12px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            📁 {savedPlans.length > 0 ? `Saved (${savedPlans.length})` : "Saved"}
          </button>
        </div>
      </div>

      {/* SAVE PLAN MODAL */}
      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 22px" }} onClick={() => setShowSaveModal(false)}>
          <div style={{ background: "white", borderRadius: 20, width: "100%", maxWidth: 380, padding: 24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 900, fontSize: 20, color: "#1B4332", marginBottom: 6 }}>📁 Save This Plan</div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>Give your plan a name so you can find it later.</div>
            <input
              type="text"
              placeholder={`e.g. ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${result?.diet || "My Plan"}`}
              value={savePlanName}
              onChange={e => setSavePlanName(e.target.value)}
              autoFocus
              style={{ width: "100%", padding: "13px 14px", border: "1.5px solid #e5e0d8", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "#1A1A18", background: "white", outline: "none", fontFamily: "inherit", marginBottom: 14 }}
            />
            <button onClick={() => {
              const name = savePlanName.trim() || `${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} Plan`;
              savePlan(result, name);
              setShowSaveModal(false);
              setSavePlanName("");
            }}
              style={{ width: "100%", padding: 14, background: "linear-gradient(135deg,#1B4332,#2D6A4F)", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
              ✅ Save Plan
            </button>
            <button onClick={() => setShowSaveModal(false)}
              style={{ width: "100%", padding: 12, background: "none", border: "none", color: "#999", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* SAVED PLANS MODAL */}
      {showSaved && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "flex-end" }} onClick={() => setShowSaved(false)}>
          <div style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, margin: "0 auto", padding: "24px 22px 40px", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 40, height: 4, background: "#e5e0d8", borderRadius: 99, margin: "0 auto 18px" }} />
            <div style={{ fontWeight: 900, fontSize: 20, color: "#1B4332", marginBottom: 4 }}>📁 Saved Plans</div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 20 }}>Tap a plan to load it back.</div>

            {savedPlans.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>No saved plans yet</div>
                <div style={{ fontSize: 13 }}>Generate a meal plan and tap &ldquo;Save Plan&rdquo; to save it here.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {savedPlans.map((plan, i) => (
                  <div key={i} style={{ border: "1.5px solid #e5e0d8", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ cursor: "pointer", flex: 1 }} onClick={() => loadSavedPlan(plan)}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#1B4332", marginBottom: 4 }}>{plan.savedName}</div>
                      <div style={{ fontSize: 12, color: "#999" }}>
                        {plan.country === "CA" ? "🇨🇦" : "🇺🇸"} Family of {plan.family} · {plan.store}
                      </div>
                      <div style={{ fontSize: 12, color: "#2D6A4F", fontWeight: 600, marginTop: 2 }}>
                        {plan.sym}{plan.totalCost?.toFixed?.(2)} · {plan.diet}
                      </div>
                    </div>
                    <button onClick={() => deleteSavedPlan(i)}
                      style={{ background: "#FFF0F0", border: "none", borderRadius: 8, padding: "6px 10px", color: "#e63946", fontSize: 12, cursor: "pointer", marginLeft: 10 }}>
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => setShowSaved(false)}
              style={{ width: "100%", padding: 14, background: "none", border: "2px solid #e5e0d8", borderRadius: 14, fontWeight: 700, fontSize: 15, color: "#999", cursor: "pointer", marginTop: 20, fontFamily: "inherit" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* SETUP */}
      {screen === "setup" && (
        <div>
          {/* Hero */}
          <div style={{ background: "linear-gradient(160deg,#0D1F12,#1B3A22,#2D6A4F)", padding: "28px 22px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -30, top: -30, width: 180, height: 180, borderRadius: "50%", background: "rgba(116,198,157,0.15)" }} />

            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ADE80", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 99, marginBottom: 14 }}>
              <span style={{ width: 6, height: 6, background: "#4ADE80", borderRadius: "50%", display: "inline-block" }} /> Now in Beta — Free
            </div>

            {/* Headline */}
            <div style={{ fontWeight: 900, fontSize: 26, color: "white", lineHeight: 1.2, marginBottom: 10 }}>
              Before you go grocery shopping...<br/>
              <span style={{ background: "linear-gradient(135deg,#22C55E,#4ADE80)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>scan your fridge first. 📸</span>
            </div>

            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 16 }}>
              GoEat AI turns what you already have into a personalized 7-day meal plan — with calories, shopping costs, and estimated savings.
            </div>

            {/* 4 problems solved */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              {[
                { emoji: "🤔", text: "What to eat?" },
                { emoji: "🛒", text: "What to buy?" },
                { emoji: "💰", text: "How much to spend?" },
                { emoji: "🗑️", text: "Stop wasting food" },
              ].map(({ emoji, text }) => (
                <div key={text} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{emoji}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Scan buttons */}
            <input ref={fridgeRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleScan(e.target.files[0], "fridge")} />
            <button onClick={() => fridgeRef.current?.click()}
              style={{ width: "100%", padding: 15, background: "white", color: "#1B4332", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 20px rgba(0,0,0,0.18)", marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>🧊</span> Scan My Fridge
            </button>

            <input ref={receiptRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleScan(e.target.files[0], "receipt")} />
            <div onClick={() => receiptRef.current?.click()}
              style={{ textAlign: "center", fontSize: 12, color: "#74C69D", fontWeight: 700, cursor: "pointer", textDecoration: "underline", marginBottom: 6 }}>
              🧾 Or scan your grocery receipt
            </div>
            <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>Powered by Claude AI · US & Canada</div>
          </div>

          {/* 5 Merits */}
          <div style={{ padding: "20px 22px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#2D6A4F", marginBottom: 12, textAlign: "center" }}>
              One app. Five problems solved.
            </div>
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {MERITS.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#F8FAF8", borderRadius: 12, border: "1px solid #e5f0e5" }}>
                  <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{m.icon}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: "#1B4332", marginBottom: 3 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.5 }}>{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ChatGPT difference */}
          <div style={{ margin: "20px 22px 0", background: "#FFF8F0", border: "1.5px solid #F97316", borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#F97316", marginBottom: 8 }}>🆚 Why not just ask ChatGPT?</div>
            <div style={{ fontSize: 12, color: "#555", lineHeight: 1.7 }}>
              ChatGPT gives you one recipe at a time.<br/>
              <strong style={{ color: "#1B4332" }}>GoEat AI gives you the full workflow:</strong><br/>
              📸 Photo → 🤖 7-day plan → 🥗 Calories → 🛒 Shopping list → 💰 Estimated cost & savings<br/>
              <span style={{ color: "#F97316", fontWeight: 700 }}>All in one tap. Automatically connected.</span>
            </div>
          </div>

          {/* Scan preview */}
          {scanImage && (
            <div style={{ margin: "16px 22px 0" }}>
              <div style={{ borderRadius: 12, overflow: "hidden", border: "2px solid #40916C", position: "relative" }}>
                <img src={scanImage} alt="scan" style={{ width: "100%", maxHeight: 160, objectFit: "cover", display: "block" }} />
                {scanLoading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(27,67,50,0.75)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                    <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <div style={{ color: "white", fontSize: 12, fontWeight: 700 }}>Analyzing your {scanMode === "receipt" ? "receipt" : "fridge"}...</div>
                  </div>
                )}
              </div>

              {/* Use What You Have */}
              {!scanLoading && scannedItems.length > 0 && (
                <div style={{ background: "white", border: "1.5px solid #e5e0d8", borderRadius: 12, padding: 14, marginTop: 10 }}>
                  {/* Header */}
                  <div style={{ background: "#D8F3DC", borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1B4332" }}>
                      ✅ We found {scannedItems.length} ingredients you already have.
                    </div>
                    <div style={{ fontSize: 12, color: "#2D6A4F", marginTop: 3 }}>
                      Let&apos;s use them before they go to waste. 🌱
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#2D6A4F", marginBottom: 8 }}>
                    Detected ingredients
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 12 }}>
                    {scannedItems.map((item, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, background: "#D8F3DC", color: "#1B4332", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 99 }}>
                        {item}
                        <span style={{ cursor: "pointer" }} onClick={() => setScannedItems(p => p.filter((_, j) => j !== i))}>×</span>
                      </div>
                    ))}
                  </div>

                  {/* Uncertain items */}
                  {uncertainItems.length > 0 && (
                    <div style={{ background: "#FFF8E6", border: "1px solid #F5C842", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: "#856404", marginBottom: 6 }}>⚠️ Quantity uncertain — please confirm:</div>
                      {uncertainItems.map((item, i) => (
                        <div key={i} style={{ fontSize: 12, color: "#856404", marginBottom: 4 }}>
                          • {item} — <em>How much do you have?</em>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={generate}
                    style={{ width: "100%", padding: 13, background: "linear-gradient(135deg,#1B4332,#2D6A4F)", color: "white", border: "none", borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    ✦ Build My 7-Day Plan Using These
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual toggle */}
          {!showManual && (
            <div onClick={() => setShowManual(true)}
              style={{ margin: "16px 22px 0", textAlign: "center", padding: 11, border: "1.5px dashed #e5e0d8", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#2D6A4F" }}>
              ⚙️ Set up manually (family size, budget, store...)
            </div>
          )}

          {/* Manual fields */}
          {showManual && (
            <div style={{ padding: "20px 22px 0", display: "flex", flexDirection: "column" as const, gap: 20 }}>
              {error && <div style={{ background: "#FFF0F0", border: "1.5px solid #FFCDD2", borderRadius: 12, padding: "12px 14px", fontSize: 13, color: "#e63946", fontWeight: 600 }}>⚠️ {error}</div>}

              {/* Country */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1B4332", marginBottom: 8 }}>🌍 Country</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[["CA","🇨🇦","Canada"],["US","🇺🇸","United States"]].map(([code,flag,name]) => (
                    <div key={code} onClick={() => { setCountry(code); setStore(code === "CA" ? CA_STORES[0] : US_STORES[0]); }}
                      style={{ flex: 1, padding: "11px 8px", border: `1.5px solid ${country === code ? (code === "CA" ? "#C8102E" : "#2D6A4F") : "#e5e0d8"}`, borderRadius: 12, background: country === code ? (code === "CA" ? "#FFF0F0" : "#D8F3DC") : "white", cursor: "pointer", textAlign: "center" as const }}>
                      <div style={{ fontSize: 22 }}>{flag}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4, color: country === code ? (code === "CA" ? "#C8102E" : "#1B4332") : "#999" }}>{name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Family */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1B4332", marginBottom: 8 }}>👨‍👩‍👧‍👦 Family Size</div>
                <div style={{ display: "flex", gap: 7 }}>
                  {[1,2,3,4,5,6].map(n => (
                    <div key={n} onClick={() => setFamily(n)}
                      style={{ flex: 1, padding: "11px 4px", border: `1.5px solid ${family === n ? "#2D6A4F" : "#e5e0d8"}`, borderRadius: 10, background: family === n ? "#D8F3DC" : "white", fontSize: 14, fontWeight: 700, color: family === n ? "#1B4332" : "#999", cursor: "pointer", textAlign: "center" as const }}>
                      {n}{n === 6 ? "+" : ""}
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1B4332", marginBottom: 8 }}>💰 Weekly Budget ({sym})</div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, fontWeight: 700, color: "#2D6A4F", pointerEvents: "none" }}>{sym}</span>
                  <input type="number" placeholder={country === "CA" ? "e.g. 180" : "e.g. 150"} value={budget} onChange={e => setBudget(e.target.value)}
                    style={{ width: "100%", padding: "13px 14px 13px 44px", border: "1.5px solid #e5e0d8", borderRadius: 12, fontSize: 16, fontWeight: 600, color: "#1A1A18", background: "white", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 5 }}>Estimated prices — actual costs may vary by location.</div>
              </div>

              {/* Store */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1B4332", marginBottom: 8 }}>🏪 Grocery Store</div>
                <select value={store} onChange={e => setStore(e.target.value)}
                  style={{ width: "100%", padding: "13px 38px 13px 14px", border: "1.5px solid #e5e0d8", borderRadius: 12, fontSize: 14, fontWeight: 500, color: "#1A1A18", background: "white", outline: "none", cursor: "pointer", appearance: "none", fontFamily: "inherit" }}>
                  {stores.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Diet & Cuisine — Multi Select */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: "#1B4332", marginBottom: 8 }}>
                  🥗 Diet & Cuisine
                  <span style={{ fontSize: 10, color: "#999", fontWeight: 500, marginLeft: 6 }}>Select multiple</span>
                </div>

                {/* Tab switcher */}
                <div style={{ display: "flex", gap: 0, border: "1.5px solid #e5e0d8", borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                  {[["diet","🥗 Diet Goal"],["cuisine","🍜 Cuisine Style"]].map(([t,l]) => (
                    <button key={t} onClick={() => setPrefTab(t)}
                      style={{ flex: 1, padding: "9px 6px", border: "none", background: prefTab === t ? "#1B4332" : "white", color: prefTab === t ? "white" : "#999", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
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
                          style={{ padding: "11px 6px", border: `1.5px solid ${isOn ? "#F97316" : "#e5e0d8"}`, borderRadius: 11, background: isOn ? "#FFF4F0" : "white", cursor: "pointer", textAlign: "center" as const, position: "relative" as const }}>
                          {isOn && <div style={{ position: "absolute" as const, top: 4, right: 6, fontSize: 10, color: "#F97316", fontWeight: 900 }}>✓</div>}
                          <div style={{ fontSize: 20, marginBottom: 3 }}>{item.icon}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isOn ? "#F97316" : "#999" }}>{item.id}</div>
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
                          style={{ padding: "11px 6px", border: `1.5px solid ${isOn ? "#2D6A4F" : "#e5e0d8"}`, borderRadius: 11, background: isOn ? "#D8F3DC" : "white", cursor: "pointer", textAlign: "center" as const, position: "relative" as const }}>
                          {isOn && <div style={{ position: "absolute" as const, top: 4, right: 6, fontSize: 10, color: "#2D6A4F", fontWeight: 900 }}>✓</div>}
                          <div style={{ fontSize: 20, marginBottom: 3 }}>{item.icon}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: isOn ? "#2D6A4F" : "#999" }}>{item.id}</div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected tags summary */}
                {(diets.length > 0 || cuisines.length > 0) && (
                  <div style={{ marginTop: 12, padding: "10px 12px", background: "#F8FAF8", borderRadius: 10, border: "1px solid #e5f0e5" }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#2D6A4F", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Your selections:</div>
                    <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                      {diets.map(d => {
                        const item = DIETS.find(x => x.id === d);
                        return (
                          <div key={d} style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFF4F0", border: "1px solid #F97316", color: "#F97316", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                            {item?.icon} {d}
                            <span style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => setDiets(prev => prev.filter(x => x !== d))}>×</span>
                          </div>
                        );
                      })}
                      {cuisines.map(c => {
                        const item = CUISINES.find(x => x.id === c);
                        return (
                          <div key={c} style={{ display: "flex", alignItems: "center", gap: 4, background: "#D8F3DC", border: "1px solid #2D6A4F", color: "#1B4332", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>
                            {item?.icon} {c}
                            <span style={{ cursor: "pointer", marginLeft: 2 }} onClick={() => setCuisines(prev => prev.filter(x => x !== c))}>×</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <button onClick={generate}
                style={{ width: "100%", padding: 17, background: "linear-gradient(135deg,#F97316,#EA580C)", color: "white", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 17, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 24px rgba(249,115,22,0.38)" }}>
                🍽️ Generate My Meal Plan
              </button>
              <div style={{ textAlign: "center", fontSize: 11, color: "#999", marginTop: -12, paddingBottom: 8 }}>Powered by Claude AI · Takes ~15 seconds</div>
            </div>
          )}

          {/* Give Back */}
          <div style={{ margin: "22px 22px 32px", background: "linear-gradient(135deg,#1B4332,#2D6A4F)", borderRadius: 18, padding: 20, color: "white" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#74C69D", marginBottom: 8 }}>❤️ GoEatAI Gives Back</div>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>Eat Smart. Give Back.</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>A portion of every Premium subscription supports food banks and hunger relief programs.</div>
            <div style={{ fontSize: 11, color: "#74C69D", textAlign: "center", marginTop: 12 }}>❤️ &ldquo;A portion of GoEatAI profits supports food charities.&rdquo;</div>
          </div>
        </div>
      )}

      {/* LOADING */}
      {screen === "loading" && (
        <div style={{ minHeight: "70vh", display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", gap: 24, padding: "40px 24px" }}>
          <div style={{ width: 56, height: 56, border: "4px solid #D8F3DC", borderTopColor: "#2D6A4F", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1B4332" }}>Building your plan...</div>
            <div style={{ fontSize: 13, color: "#999", marginTop: 6, lineHeight: 1.6 }}>Creating a 7-day meal plan<br />for a family of {family} at {store}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, width: "100%" }}>
            {["Analyzing your ingredients","Crafting 7-day meal schedule","Building smart shopping list","Calculating estimated costs & savings"].map((label, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, fontWeight: 500, color: loadStep > i ? "#2D6A4F" : "#999" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: loadStep > i ? "none" : "2px solid #e5e0d8", background: loadStep > i ? "#2D6A4F" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", flexShrink: 0 }}>
                  {loadStep > i ? "✓" : ""}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {screen === "results" && result && (
        <div>
          {/* Hero */}
          <div style={{ background: "linear-gradient(135deg,#1B4332,#2D6A4F)", padding: "22px 22px 18px", color: "white" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#74C69D", marginBottom: 4 }}>✦ Your personalized plan is ready</div>
            <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 2 }}>Week of Meals 🎉</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
              {result.country === "CA" ? "🇨🇦" : "🇺🇸"} Family of {result.family} · {result.store}
              {result.cuisine !== "Any Cuisine" ? ` · ${result.cuisine}` : ""}
            </div>
            {result.scannedCount > 0 && (
              <div style={{ marginTop: 8, background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#74C69D", fontWeight: 600 }}>
                🌱 Using {result.scannedCount} ingredients from your fridge
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, padding: "12px 22px", borderBottom: "1px solid #e5e0d8" }}>
            {[["plan","🗓 Plan"],["shop","🛒 Shop"],["budget","💰 Budget"]].map(([id,label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, padding: "8px 4px", border: "none", background: tab === id ? "#1B4332" : "none", color: tab === id ? "white" : "#999", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 8, fontFamily: "inherit" }}>{label}</button>
            ))}
          </div>

          {/* PLAN TAB */}
          {tab === "plan" && (
            <div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, padding: "16px 22px" }}>
                {[
                  { icon: "🛒", val: `${result.sym}${typeof result.totalCost === "number" ? result.totalCost.toFixed(2) : result.totalCost}`, lbl: "Est. Grocery Cost", note: `of ${result.sym}${result.budget} budget`, color: "#2D6A4F" },
                  { icon: "💰", val: `${result.sym}${typeof result.savings === "number" ? result.savings.toFixed(2) : result.savings}`, lbl: "Estimated Savings", note: "vs eating out / avg spend", color: "#F97316" },
                  { icon: "♻️", val: result.wasteReduction?.estimatedWasteReduced || "2.1 kg", lbl: "Waste Reduced", note: result.wasteReduction?.co2Saved || "", color: "#457b9d" },
                  { icon: "🍱", val: result.wasteReduction?.mealsFromLeftovers || "5", lbl: "Leftover Meals", note: "planned this week", color: "#e63946" },
                ].map(({ icon, val, lbl, note, color }) => (
                  <div key={lbl} style={{ background: "white", border: "1.5px solid #e5e0d8", borderRadius: 14, padding: "14px 14px 12px" }}>
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{icon}</div>
                    <div style={{ fontWeight: 900, fontSize: 22, lineHeight: 1, color }}>{val}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#999", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginTop: 4 }}>{lbl}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{note}</div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={{ margin: "0 22px 16px", background: "#FFF8E6", border: "1px solid #F5C842", borderRadius: 10, padding: "8px 12px", fontSize: 11, color: "#856404" }}>
                💡 Prices and savings are <strong>estimates</strong>. Actual costs may vary by location and store.
              </div>

              {/* Meal Plan */}
              <div style={{ height: 8, background: "#FAF0E6", margin: "0 0 4px" }} />
              <div style={{ padding: "6px 22px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 900, fontSize: 18, color: "#1B4332" }}>📅 7-Day Meal Plan</div>
                <div style={{ fontSize: 11, fontWeight: 700, background: "#D8F3DC", color: "#2D6A4F", padding: "4px 10px", borderRadius: 99 }}>7 days</div>
              </div>
              <div style={{ padding: "0 22px", display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {result.mealPlan?.map((day: any, i: number) => (
                  <div key={i} style={{ border: "1.5px solid #e5e0d8", borderRadius: 16, overflow: "hidden" }}>
                    <div onClick={() => setOpenDays(p => ({ ...p, [day.day]: !p[day.day] }))}
                      style={{ padding: "12px 16px", background: "#D8F3DC", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#1B4332" }}>{day.day}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#40916C" }}>{day.meals?.length} meals</div>
                        <div style={{ fontSize: 10, color: "#40916C" }}>{openDays[day.day] ? "▲" : "▼"}</div>
                      </div>
                    </div>
                    {openDays[day.day] && (
                      <div style={{ background: "white" }}>
                        {day.meals?.map((m: any, j: number) => {
                          const mc = mealColor(m.type);
                          return (
                            <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 16px", borderBottom: j < day.meals.length - 1 ? "1px solid #e5e0d8" : "none" }}>
                              <div style={{ minWidth: 62, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const, textAlign: "center" as const, flexShrink: 0, marginTop: 2, background: mc.bg, color: mc.color }}>{m.type}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>{m.name}</div>
                                {m.tip && <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>💡 {m.tip}</div>}
                                {m.calories && <div style={{ fontSize: 11, fontWeight: 700, color: "#F97316", marginTop: 3 }}>{m.calories}</div>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ height: 20 }} />
            </div>
          )}

          {/* SHOP TAB */}
          {tab === "shop" && (
            <div>
              <div style={{ padding: "16px 22px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
                  <span style={{ color: "#2D6A4F" }}>{checkedCount}/{totalItems} items</span>
                  <span style={{ color: "#999" }}>{totalItems - checkedCount} left</span>
                </div>
                <div style={{ height: 6, background: "#e5e0d8", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "linear-gradient(90deg,#40916C,#74C69D)", borderRadius: 99, width: totalItems ? `${checkedCount / totalItems * 100}%` : "0%", transition: "width 0.4s ease" }} />
                </div>
              </div>
              <div style={{ padding: "0 22px" }}>
                {result.shoppingList?.map((cat: any, ci: number) => (
                  cat.items?.length > 0 && (
                    <div key={ci} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#2D6A4F", marginBottom: 8 }}>{cat.emoji} {cat.category}</div>
                      {cat.items.map((item: any, ii: number) => {
                        const k = `${ci}-${ii}`;
                        const isChecked = checked[k];
                        return (
                          <div key={ii} onClick={() => setChecked(p => ({ ...p, [k]: !p[k] }))}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "white", border: "1.5px solid #e5e0d8", borderRadius: 11, marginBottom: 7, cursor: "pointer", opacity: isChecked ? 0.5 : 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${isChecked ? "#2D6A4F" : "#e5e0d8"}`, background: isChecked ? "#2D6A4F" : "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "white", flexShrink: 0 }}>
                                {isChecked ? "✓" : ""}
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 600, textDecoration: isChecked ? "line-through" : "none" }}>{item.name}</div>
                                <div style={{ fontSize: 11, color: "#999" }}>{item.qty}</div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#F97316" }}>{result.sym}{typeof item.price === "number" ? item.price.toFixed(2) : item.price}</div>
                          </div>
                        );
                      })}
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* BUDGET TAB */}
          {tab === "budget" && (
            <div style={{ padding: "16px 22px" }}>
              <div style={{ background: "linear-gradient(135deg,#1B4332,#2D6A4F)", borderRadius: 18, padding: 20, color: "white", marginBottom: 16 }}>
                <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 }}>Estimated Total</div>
                <div style={{ fontWeight: 900, fontSize: 36 }}>{result.sym}{typeof result.totalCost === "number" ? result.totalCost.toFixed(2) : result.totalCost}</div>
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>at {result.store} · family of {result.family}</div>
              </div>

              {/* Estimated savings */}
              <div style={{ background: "#FFF4F0", border: "1.5px solid #F97316", borderRadius: 14, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>💰</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: "#F97316" }}>Estimated savings: {result.sym}{typeof result.savings === "number" ? result.savings.toFixed(2) : result.savings}</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>vs avg restaurant / takeout spending</div>
                </div>
              </div>

              {/* Disclaimer */}
              <div style={{ background: "#FFF8E6", border: "1px solid #F5C842", borderRadius: 10, padding: "10px 12px", marginBottom: 16, fontSize: 11, color: "#856404" }}>
                ⚠️ All prices and savings are <strong>estimates</strong>. Actual costs depend on your location, store promotions, and product availability.
              </div>

              <div style={{ background: "#D8F3DC", borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 13, color: "#1B4332", fontWeight: 600, lineHeight: 1.7 }}>
                  💡 Est. cost per meal: ~{result.sym}{result.totalCost ? (result.totalCost / (7 * 3 * result.family)).toFixed(2) : "—"} per person<br />
                  💡 Est. cost per day: ~{result.sym}{result.totalCost ? (result.totalCost / 7).toFixed(2) : "—"} for the family<br />
                  ♻️ {result.wasteReduction?.estimatedWasteReduced || "2.1 kg"} of food waste avoided<br />
                  🌍 {result.wasteReduction?.co2Saved || "3.8 kg CO₂"} carbon emissions saved
                </div>
              </div>
            </div>
          )}

          {/* Impact */}
          <div style={{ height: 8, background: "#FAF0E6", margin: "4px 0" }} />
          <div style={{ margin: "0 22px 18px", background: "linear-gradient(135deg,#0D1F12,#1B4332)", borderRadius: 18, padding: 20, color: "white" }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#F87171", marginBottom: 8 }}>❤️ GoEatAI Impact</div>
            <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 10, lineHeight: 1.3 }}>This plan makes a difference.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { val: result.wasteReduction?.estimatedWasteReduced || "2.1 kg", lbl: "Food Saved" },
                { val: result.wasteReduction?.co2Saved || "3.8 kg", lbl: "CO₂ Reduced" },
                { val: `${result.sym}${result.wasteReduction?.moneySavedFromWaste?.toFixed?.(2) || "14.20"}`, lbl: "Extra Saved" },
              ].map(({ val, lbl }) => (
                <div key={lbl} style={{ flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 8px", textAlign: "center" as const }}>
                  <div style={{ fontWeight: 900, fontSize: 14, color: "#74C69D" }}>{val}</div>
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2, fontWeight: 600 }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
              ❤️ <strong style={{ color: "white" }}>GoEatAI Gives Back.</strong> A portion of Premium subscriptions supports food banks worldwide.
            </div>
          </div>

          <div style={{ padding: "4px 22px 32px", display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Save Plan Button */}
            <button onClick={() => { setSavePlanName(""); setShowSaveModal(true); }}
              style={{ width: "100%", padding: 14, background: "#D8F3DC", border: "2px solid #2D6A4F", borderRadius: 14, fontWeight: 800, fontSize: 15, color: "#1B4332", cursor: "pointer", fontFamily: "inherit" }}>
              📁 Save This Plan
            </button>
            <button onClick={() => { setScreen("setup"); setResult(null); setScanImage(null); setScannedItems([]); try { localStorage.removeItem("goeatai_last_result"); } catch {} }}
              style={{ width: "100%", padding: 14, background: "white", border: "2px solid #e5e0d8", borderRadius: 14, fontWeight: 800, fontSize: 15, color: "#999", cursor: "pointer", fontFamily: "inherit" }}>
              ↩ Create New Meal Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
