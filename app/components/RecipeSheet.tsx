"use client";

import { useEffect, useState } from "react";
import type { MealType } from "../lib/feed";
import { DAYS, MEAL_TYPES } from "../lib/storage";
import { ingredientPhoto, stepTimerSeconds } from "../lib/ingredients";

export type RecipeData = {
  prepTime?: string;
  cookTime?: string;
  servings?: number | string;
  difficulty?: string;
  calories?: string;
  ingredients?: { name: string; qty?: string }[];
  steps?: string[];
  tip?: string;
};

export type SheetDish = {
  name: string;
  cuisine?: string;
  minutes?: number;
  meal?: MealType;
  source: "feed" | "plan" | "saved" | "search" | "sample";
  slot?: { day: string; type: string }; // set when opened from the meal plan
};

type Props = {
  dish: SheetDish;
  photo?: string;
  credit?: { name: string; link: string };
  data: RecipeData | null;
  loading: boolean;
  failed: boolean;
  isSaved: boolean;
  ingredientsAdded: boolean;
  onRetry: () => void;
  onToggleSave: () => void;
  canPlan?: boolean; // false for desserts/snacks/sides: no "Add to My Week"
  onAddToWeek: (day: string, type: MealType) => void;
  onAddIngredients: () => void;
  onClose: () => void;
  onStep?: (step: number, total: number) => void; // analytics: cook mode progress
};

const font = "'Nunito', sans-serif";

export default function RecipeSheet(p: Props) {
  const { dish, data } = p;
  const [picking, setPicking] = useState(false);
  const [day, setDay] = useState(DAYS[0]);
  const [type, setType] = useState<MealType>(dish.meal || "Dinner");
  const [added, setAdded] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [allSteps, setAllSteps] = useState(false);
  const [timer, setTimer] = useState<{ left: number; running: boolean } | null>(null);
  useEffect(() => { setTimer(null); if (step > 0) p.onStep?.(step + 1, p.data?.steps?.length || 0); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [step]);
  useEffect(() => {
    if (!timer?.running) return;
    if (timer.left <= 0) { try { navigator.vibrate?.([300, 150, 300]); } catch {} setTimer({ left: 0, running: false }); return; }
    const t = setTimeout(() => setTimer(x => (x ? { ...x, left: x.left - 1 } : x)), 1000);
    return () => clearTimeout(t);
  }, [timer]);
  const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  // Keep the page behind the sheet from scrolling (on iPhone that scroll can
  // move the browser bars and push the top of the sheet off screen).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") p.onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeLabel = data && (data.prepTime || data.cookTime)
    ? [data.prepTime && `Prep ${data.prepTime}`, data.cookTime && `Cook ${data.cookTime}`].filter(Boolean).join(" · ")
    : dish.minutes ? `~${dish.minutes} min` : "";

  return (
    <div role="dialog" aria-modal="true" aria-label={dish.name} onClick={p.onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 300, display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} className="goeat-sheet"
        style={{ background: "white", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 430, margin: "0 auto", overflowY: "auto", overscrollBehavior: "contain" }}>

        {/* Close button stays pinned at the top while the recipe scrolls */}
        <div style={{ position: "sticky", top: 0, height: 0, zIndex: 10 }}>
          <button onClick={p.onClose} aria-label="Close"
            style={{ position: "absolute", top: 12, right: 12, width: 44, height: 44, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.6)", color: "white", fontSize: 20, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>✕</button>
        </div>

        {/* Photo */}
        <div style={{ position: "relative", height: p.photo ? 300 : 120, background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", borderRadius: "24px 24px 0 0", overflow: "hidden" }}>
          {p.photo && <img src={p.photo} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
          {p.credit && (
            <div style={{ position: "absolute", bottom: 6, right: 10, fontSize: 11, color: "rgba(255,255,255,0.85)", textShadow: "0 1px 2px rgba(0,0,0,0.6)" }}>
              Photo by <a href={`${p.credit.link}?utm_source=goeat_ai&utm_medium=referral`} target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>{p.credit.name}</a> on <a href="https://unsplash.com/?utm_source=goeat_ai&utm_medium=referral" target="_blank" rel="noopener noreferrer" style={{ color: "white" }}>Unsplash</a>
            </div>
          )}
        </div>

        <div style={{ padding: "18px 20px 32px" }}>
          {dish.slot && (
            <div style={{ fontSize: 13, fontWeight: 800, color: "#2E7D32", marginBottom: 4 }}>{dish.slot.day} · {dish.slot.type}</div>
          )}
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, lineHeight: 1.2, color: "#1A1A18", fontFamily: font }}>{dish.name}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, fontSize: 14, color: "#666" }}>
            {dish.cuisine && <span>{dish.cuisine}</span>}
            {timeLabel && <span>⏱ {timeLabel}</span>}
            {data?.servings && <span>👥 Serves {data.servings}</span>}
          </div>
          {data?.calories && (
            <div style={{ marginTop: 6, fontSize: 13, color: "#888" }}>
              🔥 {data.calories} per serving <span style={{ fontStyle: "italic" }}>(AI estimate)</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button onClick={p.onToggleSave} aria-pressed={p.isSaved}
              style={{ flex: "0 0 auto", minHeight: 48, padding: "0 16px", borderRadius: 99, border: `2px solid ${p.isSaved ? "#F97316" : "#E0E0E0"}`, background: p.isSaved ? "#FFF4EC" : "white", color: p.isSaved ? "#E8620A" : "#333", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: font }}>
              {p.isSaved ? "♥ Saved" : "♡ Save"}
            </button>
            {!dish.slot && p.canPlan !== false && (
              <button onClick={() => { setPicking(v => !v); setAdded(null); }}
                style={{ flex: 1, minHeight: 48, borderRadius: 99, border: "none", background: "linear-gradient(135deg,#F97316,#E8620A)", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: font }}>
                ＋ Add to My Week
              </button>
            )}
          </div>

          {added && (
            <div role="status" style={{ marginTop: 10, padding: "10px 14px", borderRadius: 14, background: "#E8F5E9", color: "#1A5C2E", fontWeight: 700, fontSize: 14 }}>✓ Added to {added}</div>
          )}

          {picking && (
            <div style={{ marginTop: 12, padding: 14, borderRadius: 18, border: "1.5px solid #E8F5E9", background: "#FAFFFA" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1A5C2E", marginBottom: 8 }}>Which day?</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {DAYS.map(d => (
                  <button key={d} onClick={() => setDay(d)} aria-pressed={day === d}
                    style={{ minHeight: 36, padding: "0 12px", borderRadius: 99, border: day === d ? "none" : "1.5px solid #DDD", background: day === d ? "#1A5C2E" : "white", color: day === d ? "white" : "#333", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: font }}>
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#1A5C2E", marginBottom: 8 }}>Which meal?</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {MEAL_TYPES.map(t => (
                  <button key={t} onClick={() => setType(t)} aria-pressed={type === t}
                    style={{ flex: 1, minHeight: 36, borderRadius: 99, border: type === t ? "none" : "1.5px solid #DDD", background: type === t ? "#1A5C2E" : "white", color: type === t ? "white" : "#333", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: font }}>
                    {t}
                  </button>
                ))}
              </div>
              <button onClick={() => { p.onAddToWeek(day, type); setPicking(false); setAdded(`${day} ${type}`); }}
                style={{ width: "100%", minHeight: 46, borderRadius: 99, border: "none", background: "#1A5C2E", color: "white", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: font }}>
                Add to {day} {type}
              </button>
            </div>
          )}

          {/* Recipe body */}
          {p.loading ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: "3px solid #E8F5E9", borderTopColor: "#2E7D32", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 12px" }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1A5C2E" }}>Writing the recipe…</div>
            </div>
          ) : p.failed || !data ? (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <div style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>We couldn&apos;t load this recipe.</div>
              <button onClick={p.onRetry}
                style={{ minHeight: 44, padding: "0 20px", borderRadius: 99, border: "2px solid #1A5C2E", background: "white", color: "#1A5C2E", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: font }}>
                Try again
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 20 }}>
              {(() => {
                // At a glance: the first three pictured ingredients = the dish.
                const top = (data.ingredients || []).map(i => ({ name: i.name, pic: ingredientPhoto(i.name) })).filter(i => i.pic).slice(0, 3);
                if (top.length < 2) return null;
                return (
                  <div aria-label={`${top.map(t => t.name).join(" plus ")} makes ${dish.name}`} role="img"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#FBF7F0", borderRadius: 20, padding: "10px 8px", marginBottom: 18 }}>
                    {top.map((t, k) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {k > 0 && <span aria-hidden="true" style={{ fontWeight: 900, fontSize: 22, color: "#C2AE93" }}>+</span>}
                        <img src={t.pic} alt="" style={{ width: 64, height: 64, objectFit: "contain", background: "white", borderRadius: 14 }} />
                      </div>
                    ))}
                    <span aria-hidden="true" style={{ fontWeight: 900, fontSize: 22, color: "#C2AE93", margin: "0 2px" }}>=</span>
                    {p.photo
                      ? <img src={p.photo} alt="" style={{ width: 76, height: 76, objectFit: "cover", borderRadius: 16, border: "3px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }} />
                      : <span style={{ fontWeight: 900, fontSize: 13, color: "#1A5C2E", maxWidth: 80, lineHeight: 1.2 }}>{dish.name}</span>}
                  </div>
                );
              })()}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#1A5C2E", fontFamily: font }}>Ingredients</h3>
                {(data.ingredients?.length ?? 0) > 0 && (
                  <button onClick={p.onAddIngredients} disabled={p.ingredientsAdded}
                    style={{ minHeight: 36, padding: "0 12px", borderRadius: 99, border: "1.5px solid #C8E6C9", background: p.ingredientsAdded ? "#E8F5E9" : "white", color: "#1A5C2E", fontWeight: 700, fontSize: 13, cursor: p.ingredientsAdded ? "default" : "pointer", fontFamily: font }}>
                    {p.ingredientsAdded ? "✓ In shopping list" : "🛒 Add to shopping list"}
                  </button>
                )}
              </div>
              {(() => {
                const ings = data.ingredients || [];
                const withPic = ings.map(ing => ({ ...ing, pic: ingredientPhoto(ing.name) }));
                const shown = withPic.filter(x => x.pic);
                const rest = withPic.filter(x => !x.pic);
                return (
                  <>
                    {shown.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 10 }}>
                        {shown.map((ing, i) => (
                          <div key={i} style={{ background: "white", border: "1px solid #EFEAE0", borderRadius: 16, padding: "6px 6px 8px", textAlign: "center" as const }}>
                            <img src={ing.pic} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "contain", display: "block" }} />
                            <div style={{ fontWeight: 900, fontSize: 13.5, color: "#E8620A", marginTop: 2, lineHeight: 1.2 }}>{ing.qty}</div>
                            <div style={{ fontWeight: 700, fontSize: 12.5, color: "#333", lineHeight: 1.25 }}>{ing.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {rest.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 20 }}>
                        {rest.map((ing, i) => (
                          <span key={i} style={{ display: "inline-flex", gap: 6, alignItems: "baseline", padding: "8px 12px", background: "#F7F4EE", borderRadius: 99, fontSize: 13.5 }}>
                            <span style={{ fontWeight: 700, color: "#333" }}>{ing.name}</span>
                            {ing.qty && <span style={{ fontWeight: 800, color: "#E8620A" }}>{ing.qty}</span>}
                          </span>
                        ))}
                      </div>
                    )}
                    {rest.length === 0 && <div style={{ height: 10 }} />}
                  </>
                );
              })()}

              {(() => {
                const steps = data.steps || [];
                if (!steps.length) return null;
                const i = Math.min(step, steps.length - 1);
                const secs = stepTimerSeconds(steps[i]);
                return (
                  <>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 10px" }}>
                      <h3 style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#1A5C2E", fontFamily: font }}>How to cook</h3>
                      <button onClick={() => setAllSteps(v => !v)}
                        style={{ minHeight: 36, padding: "0 10px", border: "none", background: "none", color: "#1A5C2E", fontWeight: 800, fontSize: 13, textDecoration: "underline", textUnderlineOffset: 3, cursor: "pointer", fontFamily: font }}>
                        {allSteps ? "Step by step" : "Show all steps"}
                      </button>
                    </div>
                    {allSteps ? (
                      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                        {steps.map((st, k) => (
                          <li key={k} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <span style={{ width: 26, height: 26, borderRadius: "50%", background: "#2E7D32", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 13, flexShrink: 0 }}>{k + 1}</span>
                            <span style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>{st}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <div aria-live="polite" style={{ background: "#FBF7F0", border: "1px solid #EFE6D6", borderRadius: 20, padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 12 }} aria-hidden="true">
                          {steps.map((_, k) => <div key={k} style={{ flex: 1, height: 5, borderRadius: 99, background: k <= i ? "#F97316" : "#E9DFCF" }} />)}
                        </div>
                        <div style={{ fontSize: 12.5, fontWeight: 900, color: "#E8620A", letterSpacing: "0.05em", textTransform: "uppercase" as const }}>Step {i + 1} of {steps.length}</div>
                        <div style={{ fontSize: 19, fontWeight: 700, color: "#1E2B22", lineHeight: 1.45, marginTop: 6, minHeight: 84 }}>{steps[i]}</div>
                        {secs && (
                          <button onClick={() => setTimer(t => t && t.left > 0 ? { ...t, running: !t.running } : { left: secs, running: true })}
                            style={{ marginTop: 10, minHeight: 44, padding: "0 16px", borderRadius: 99, border: "none", background: timer && timer.left === 0 ? "#C62828" : "#1A5C2E", color: "white", fontWeight: 900, fontSize: 15, cursor: "pointer", fontFamily: font }}>
                            {!timer ? `⏱ Start ${mmss(secs)} timer` : timer.left === 0 ? "⏰ Time's up" : timer.running ? `⏸ ${mmss(timer.left)}` : `▶ ${mmss(timer.left)}`}
                          </button>
                        )}
                        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                          <button onClick={() => setStep(Math.max(0, i - 1))} disabled={i === 0}
                            style={{ flex: 1, minHeight: 48, borderRadius: 99, border: "1.5px solid #D8CDBB", background: "white", color: i === 0 ? "#BBB" : "#333", fontWeight: 800, fontSize: 15, cursor: i === 0 ? "default" : "pointer", fontFamily: font }}>← Back</button>
                          <button onClick={() => setStep(Math.min(steps.length - 1, i + 1))} disabled={i === steps.length - 1}
                            style={{ flex: 2, minHeight: 48, borderRadius: 99, border: "none", background: i === steps.length - 1 ? "#E8F5E9" : "linear-gradient(135deg,#F97316,#E8620A)", color: i === steps.length - 1 ? "#1A5C2E" : "white", fontWeight: 900, fontSize: 15, cursor: i === steps.length - 1 ? "default" : "pointer", fontFamily: font }}>
                            {i === steps.length - 1 ? "✓ Last step" : "Next step →"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {data.tip && (
                <div style={{ marginTop: 16, background: "#F0FBF2", border: "1.5px solid #A5D6A7", borderRadius: 16, padding: "12px 14px", fontSize: 14, color: "#1A5C2E", lineHeight: 1.5 }}>
                  👨‍🍳 {data.tip}
                </div>
              )}

              <div style={{ marginTop: 14, fontSize: 12.5, color: "#777", lineHeight: 1.5 }}>
                ℹ️ This recipe was written by GoEat AI. Times and calories are estimates. Check ingredients for allergies, and cook meat, fish and eggs all the way through.
              </div>

              <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(dish.name + " recipe")}`} target="_blank" rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 16, minHeight: 44, borderRadius: 99, background: "#FF0000", color: "white", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>
                ▶ Watch on YouTube
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
