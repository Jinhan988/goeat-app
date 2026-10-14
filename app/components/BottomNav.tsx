"use client";

export type View = "home" | "week" | "saved" | "shop";

const ITEMS: { id: View; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "week", icon: "🗓", label: "My Week" },
  { id: "saved", icon: "♡", label: "Saved" },
  { id: "shop", icon: "🛒", label: "Shopping" },
];

export default function BottomNav({ view, onChange, badges }: { view: View; onChange: (v: View) => void; badges: Partial<Record<View, number>> }) {
  return (
    <nav aria-label="Main"
      style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 150, background: "rgba(255,255,255,0.97)", borderTop: "1px solid #E8F5E9", boxShadow: "0 -4px 16px rgba(0,0,0,0.05)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div style={{ maxWidth: 430, margin: "0 auto", display: "flex" }}>
        {ITEMS.map(it => {
          const active = view === it.id;
          const badge = badges[it.id] || 0;
          return (
            <button key={it.id} onClick={() => onChange(it.id)} aria-current={active ? "page" : undefined}
              style={{ flex: 1, minHeight: 60, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: active ? "#1A5C2E" : "#8A8A8A", fontFamily: "'Nunito', sans-serif", position: "relative" }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>{it.icon}</span>
              <span style={{ fontSize: 12, fontWeight: active ? 900 : 700 }}>{it.label}</span>
              {badge > 0 && (
                <span style={{ position: "absolute", top: 6, left: "calc(50% + 6px)", minWidth: 18, height: 18, padding: "0 5px", borderRadius: 99, background: "#F97316", color: "white", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>
              )}
              {active && <span style={{ position: "absolute", top: 0, width: 28, height: 3, borderRadius: 99, background: "#1A5C2E" }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
