"use client";
import { useEffect, useState } from "react";
import { SAMPLE_INFO, SAMPLE_SHOPPING, SAMPLE_WEEK } from "../lib/sample";

const MEAL_COLOR: Record<string, { bg: string; color: string }> = {
  Breakfast: { bg: "#FFF3CD", color: "#856404" },
  Lunch: { bg: "#D1ECF1", color: "#0C5460" },
  Dinner: { bg: "#E8F5E9", color: "#1A5C2E" },
};

// Full-screen example week: day tabs with photo cards, plus the matching
// grocery list. Shown instantly; the real plan is one tap away.
export default function SampleWeek(p: {
  photo: (name: string) => string | undefined;
  canUse: boolean;
  onMakeMine: () => void;
  onUse: () => void;
  onOpenDish: (name: string) => void;
  onClose: () => void;
  track: (name: string, props?: Record<string, unknown>) => void;
}) {
  const [tab, setTab] = useState<"plan" | "shop">("plan");
  const [day, setDay] = useState(SAMPLE_WEEK[0].day);
  const cur = SAMPLE_WEEK.find(d => d.day === day) || SAMPLE_WEEK[0];
  const idx = SAMPLE_WEEK.indexOf(cur);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const cta = (
    <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
      <button onClick={p.onMakeMine}
        style={{ width: "100%", minHeight: 52, border: "none", borderRadius: 99, background: "linear-gradient(135deg,#F97316,#E8620A)", color: "white", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 6px 16px rgba(232,98,10,0.3)" }}>
        🗓 Make mine — my budget & store
      </button>
      {p.canUse && (
        <button onClick={p.onUse}
          style={{ width: "100%", minHeight: 46, borderRadius: 99, border: "1.5px solid #1A5C2E", background: "white", color: "#1A5C2E", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
          Use these meals, priced for my store
        </button>
      )}
    </div>
  );

  return (
    <div role="dialog" aria-modal="true" aria-label="Sample week"
      style={{ position: "fixed", inset: 0, zIndex: 250, background: "white", overflowY: "auto", overscrollBehavior: "contain" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 40 }}>
        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(255,255,255,0.97)", padding: "12px 16px 10px", borderBottom: "1px solid #EEF3EE", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: "#E8620A", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Example week</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: "#1A5C2E", fontFamily: "'Nunito', sans-serif" }}>Family of {SAMPLE_INFO.family} · {SAMPLE_INFO.store}</div>
          </div>
          <button onClick={p.onClose} aria-label="Close sample"
            style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "#F1F4F1", color: "#333", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ padding: "12px 16px 0" }}>
          <div style={{ fontSize: 13.5, color: "#555", lineHeight: 1.45, marginBottom: 12 }}>
            This is a sample so you can see how GoEat works. Your plan is built for your family size, budget and store, with an estimated grocery cost.
          </div>
          {cta}
        </div>

        {/* Plan / Shopping tabs */}
        <div role="tablist" style={{ display: "flex", gap: 6, padding: "16px 16px 0" }}>
          {([["plan", "🗓 7-day plan"], ["shop", "🛒 Grocery list"]] as const).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => { setTab(id); p.track("sample_week_tab", { tab: id }); }}
              style={{ flex: 1, minHeight: 44, borderRadius: 12, border: "none", background: tab === id ? "#1A5C2E" : "#F3F7F3", color: tab === id ? "white" : "#3F5F45", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "plan" ? (
          <div>
            <div style={{ display: "flex", gap: 6, padding: "12px 16px", overflowX: "auto", scrollbarWidth: "none" as const }}>
              {SAMPLE_WEEK.map(d => {
                const on = d.day === cur.day;
                const thumb = p.photo(d.meals[2].name);
                return (
                  <button key={d.day} aria-pressed={on} aria-label={`Sample ${d.day}`} onClick={() => setDay(d.day)}
                    style={{ flex: "1 0 46px", minWidth: 46, padding: "6px 0 8px", borderRadius: 16, border: "none", background: on ? "#1A5C2E" : "#F3F7F3", color: on ? "white" : "#3F5F45", cursor: "pointer", display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 4, fontFamily: "'Nunito', sans-serif" }}>
                    <span style={{ fontSize: 13, fontWeight: 900 }}>{d.day.slice(0, 3)}</span>
                    <span style={{ width: 30, height: 30, borderRadius: 10, overflow: "hidden", background: "#E1ECE2", display: "block" }}>
                      {thumb && <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ padding: "0 16px", display: "flex", flexDirection: "column" as const, gap: 12 }}>
              {cur.meals.map(m => {
                const mc = MEAL_COLOR[m.type];
                const photo = p.photo(m.name);
                return (
                  <button key={m.type} onClick={() => p.onOpenDish(m.name)}
                    style={{ display: "block", width: "100%", padding: 0, textAlign: "left" as const, borderRadius: 20, overflow: "hidden", background: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.07)", border: "1px solid #EEF3EE", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                    <div style={{ position: "relative", height: 150, background: "#F1EEE8" }}>
                      {photo && <img src={photo} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />}
                      <span style={{ position: "absolute", top: 10, left: 10, fontSize: 12, fontWeight: 900, padding: "4px 10px", borderRadius: 99, background: mc.bg, color: mc.color, textTransform: "uppercase" as const }}>{m.type}</span>
                    </div>
                    <div style={{ padding: "10px 14px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: "#1A1A18" }}>{m.name}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#2E7D32", flexShrink: 0 }}>Recipe →</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {idx < SAMPLE_WEEK.length - 1 && (
              <div style={{ padding: "14px 16px 0" }}>
                <button onClick={() => setDay(SAMPLE_WEEK[idx + 1].day)}
                  style={{ width: "100%", minHeight: 46, borderRadius: 99, border: "1.5px solid #C8E6C9", background: "#F7FBF7", color: "#1A5C2E", fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                  Next: {SAMPLE_WEEK[idx + 1].day} →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "12px 16px 0" }}>
            <div style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>One list for the whole week. Quantities are a rough guide; your own plan adds estimated prices for your store.</div>
            {SAMPLE_SHOPPING.map(c => (
              <div key={c.category} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 15, color: "#1A5C2E", marginBottom: 6 }}>{c.emoji} {c.category}</div>
                {c.items.map(it => (
                  <div key={it} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 2px", borderBottom: "1px solid #F1F4F1", fontSize: 14.5, color: "#333" }}>
                    <span aria-hidden="true" style={{ width: 18, height: 18, borderRadius: 5, border: "1.5px solid #B9D3BC", flexShrink: 0 }} />
                    {it}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "20px 16px 0" }}>{cta}</div>
      </div>
    </div>
  );
}
