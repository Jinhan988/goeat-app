"use client";
import { useEffect, useRef } from "react";
import { COLLECTIONS, type Collection, type CollectionDish } from "../lib/collections";

// Full-screen themed collection: photo + "A + B + C" main ingredients per dish,
// ＋ to pick, then one step to a 7-day plan and grocery list.
export default function CollectionSheet(p: {
  collection: Collection;
  photo: (name: string) => string | undefined;
  minutes: (name: string) => number | undefined;
  isPicked: (name: string) => boolean;
  onToggle: (name: string) => void;
  onAddMany: (names: string[]) => void;
  onOpen: (name: string) => void;
  onSwitch: (id: string) => void;
  onBuild: () => void;
  onClose: () => void;
}) {
  const c = p.collection;
  const scroller = useRef<HTMLDivElement>(null);
  const pickedHere = c.dishes.filter(x => p.isPicked(x.name)).length;
  const top5 = c.dishes.slice(0, 5).map(x => x.name);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => { scroller.current?.scrollTo({ top: 0 }); }, [c.id]);

  const ingLine = (x: CollectionDish) => (
    <div style={{ display: "flex", flexWrap: "wrap" as const, alignItems: "center", gap: "2px 4px", marginTop: 6, fontSize: 13, fontWeight: 800, color: "#4A5A4E" }}>
      {x.ing.map(([emo, label], i) => (
        <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          {i > 0 && <span aria-hidden="true" style={{ color: "#C2AE93", fontWeight: 900, margin: "0 2px" }}>+</span>}
          <span aria-hidden="true" style={{ fontSize: 16 }}>{emo}</span>{label}
        </span>
      ))}
    </div>
  );

  return (
    <div ref={scroller} role="dialog" aria-modal="true" aria-label={c.title}
      style={{ position: "fixed", inset: 0, zIndex: 250, background: "#FDF9F3", overflowY: "auto", overscrollBehavior: "contain" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", paddingBottom: 120 }}>
        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 5, background: "rgba(253,249,243,0.97)", padding: "12px 16px 8px", borderBottom: "1px solid #F0E6D8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#E8620A", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>Collection · {c.dishes.length} ideas</div>
              <h2 style={{ margin: 0, fontWeight: 900, fontSize: 21, lineHeight: 1.15, color: "#16361F", fontFamily: "'Nunito', sans-serif" }}>{c.emoji} {c.title}</h2>
            </div>
            <button onClick={p.onClose} aria-label="Close collection"
              style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: "#EFE7DA", color: "#333", fontSize: 18, cursor: "pointer", flexShrink: 0 }}>✕</button>
          </div>
          {/* Switch collections */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", marginTop: 8, paddingBottom: 2, scrollbarWidth: "none" as const }}>
            {COLLECTIONS.map(o => {
              const on = o.id === c.id;
              return (
                <button key={o.id} onClick={() => p.onSwitch(o.id)} aria-pressed={on}
                  style={{ flex: "0 0 auto", minHeight: 36, padding: "0 12px", borderRadius: 99, border: `1.5px solid ${on ? "#1A5C2E" : "#E6DCCB"}`, background: on ? "#1A5C2E" : "white", color: on ? "white" : "#4A5A4E", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" as const }}>
                  {o.emoji} {o.title}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "12px 16px 4px", fontSize: 14.5, color: "#5a6b5e", fontWeight: 700 }}>
          {c.subtitle}. Tap <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "#F97316", color: "white", fontWeight: 900, fontSize: 13 }}>＋</span> on the ones you want this week.
        </div>

        {/* Dishes */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10, padding: "8px 12px" }}>
          {c.dishes.map(x => {
            const ph = p.photo(x.name);
            const on = p.isPicked(x.name);
            const mins = p.minutes(x.name);
            return (
              <div key={x.name} style={{ display: "flex", alignItems: "center", gap: 12, background: "white", borderRadius: 20, padding: 8, boxShadow: "0 4px 14px rgba(60,40,10,0.06)", border: on ? "2px solid #1A5C2E" : "2px solid transparent" }}>
                <button onClick={() => p.onOpen(x.name)} aria-label={`Open ${x.name}`}
                  style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, border: "none", background: "none", padding: 0, cursor: "pointer", textAlign: "left" as const, fontFamily: "'Nunito', sans-serif" }}>
                  <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", background: "#F1EEE8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
                    {ph ? <img src={ph} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <span aria-hidden="true">{x.ing.map(i => i[0]).join("")}</span>}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, fontSize: 16, lineHeight: 1.2, color: "#16361F" }}>{x.name}</div>
                    {mins ? <div style={{ fontSize: 12.5, color: "#888", fontWeight: 700, marginTop: 2 }}>~{mins} min</div> : null}
                    {ingLine(x)}
                  </div>
                </button>
                <button onClick={() => p.onToggle(x.name)} aria-pressed={on}
                  aria-label={on ? `Remove ${x.name} from my week` : `Add ${x.name} to my week`}
                  style={{ width: 46, height: 46, flexShrink: 0, borderRadius: 14, border: "none", background: on ? "#1A5C2E" : "#F97316", color: "white", fontSize: on ? 20 : 26, fontWeight: 900, cursor: "pointer" }}>
                  {on ? "✓" : "＋"}
                </button>
              </div>
            );
          })}
        </div>

        {/* More collections */}
        <div style={{ padding: "18px 16px 0" }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#16361F", marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>More collections</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {COLLECTIONS.filter(o => o.id !== c.id).map(o => (
              <button key={o.id} onClick={() => p.onSwitch(o.id)}
                style={{ minHeight: 64, padding: "10px 12px", borderRadius: 16, border: "1.5px solid #E6DCCB", background: "white", textAlign: "left" as const, cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
                <div style={{ fontSize: 20 }}>{o.emoji}</div>
                <div style={{ fontWeight: 900, fontSize: 14, color: "#16361F", lineHeight: 1.2 }}>{o.title}</div>
                <div style={{ fontSize: 12, color: "#888", fontWeight: 700 }}>{o.dishes.length} ideas</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky action */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 6, background: "linear-gradient(180deg, rgba(253,249,243,0) 0%, #FDF9F3 30%)", padding: "18px 16px 16px" }}>
        <div style={{ maxWidth: 398, margin: "0 auto" }}>
          {pickedHere === 0 ? (
            <button onClick={() => p.onAddMany(top5)}
              style={{ width: "100%", minHeight: 54, border: "none", borderRadius: 99, background: "linear-gradient(135deg,#F97316,#E8620A)", color: "white", fontWeight: 900, fontSize: 16.5, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 6px 16px rgba(232,98,10,0.3)" }}>
              ＋ Add the first 5 to my week
            </button>
          ) : (
            <button onClick={p.onBuild}
              style={{ width: "100%", minHeight: 54, border: "none", borderRadius: 99, background: "linear-gradient(135deg,#1A5C2E,#2E7D32)", color: "white", fontWeight: 900, fontSize: 16.5, cursor: "pointer", fontFamily: "'Nunito', sans-serif", boxShadow: "0 6px 16px rgba(26,92,46,0.3)" }}>
              🗓 Plan my week with {pickedHere} → grocery list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
