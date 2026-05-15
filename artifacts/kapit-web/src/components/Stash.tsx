import React, { useState } from "react";
import type { Factoid } from "@/context/KapitContext";
import { getCategoryLabel, CATEGORY_STYLE, CONVERSATION_OPENERS } from "./FactoidCard";

const FILTERS = [
  { label: "All",      value: "all" },
  { label: "Famous",   value: "celebrity" },
  { label: "Crime",    value: "crime" },
  { label: "Haunted",  value: "haunted" },
  { label: "Nightlife",value: "music" },
  { label: "Dining",   value: "food" },
  { label: "History",  value: "history" },
  { label: "Hidden",   value: "hidden" },
];

function shortYear(year: string): string {
  const match = year.match(/(\d{4})/);
  if (match) return "'" + match[1].slice(-2);
  const m2 = year.match(/(\d{2})$/);
  return m2 ? "'" + m2[1] : year;
}

interface Props {
  repertoire: Factoid[];
}

export default function Stash({ repertoire }: Props) {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter === "all"
    ? repertoire
    : repertoire.filter((f) => f.category === filter);

  return (
    <div style={{ padding: "24px 20px 32px" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--warm-black)", lineHeight: 1 }}>
          My Stash
        </h2>
        <div className="font-mono" style={{ fontSize: 12, color: "var(--smoke)", marginTop: 4, letterSpacing: 1 }}>
          {repertoire.length} facts
        </div>
      </div>

      <div style={{
        display: "flex", gap: 8, overflowX: "auto", marginBottom: 24,
        paddingBottom: 4, WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
      }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="pill font-mono"
            style={{
              flexShrink: 0,
              border: filter === f.value ? "none" : "1px solid var(--border)",
              cursor: "pointer",
              backgroundColor: filter === f.value ? "var(--bourbon)" : "var(--card)",
              color: filter === f.value ? "#F5EDE0" : "var(--smoke)",
              transition: "all 0.2s ease",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {repertoire.length === 0 && (
        <div style={{ textAlign: "center", paddingTop: 48 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
          <div className="font-serif" style={{ fontStyle: "italic", color: "var(--smoke)", fontSize: 16, marginBottom: 8 }}>
            Nothing stashed yet.
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: "var(--smoke-muted)", letterSpacing: 1 }}>
            Snap a fact and hit ★ to save it.
          </div>
        </div>
      )}

      {filtered.length === 0 && repertoire.length > 0 && (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <div className="font-serif" style={{ fontStyle: "italic", color: "var(--smoke)", fontSize: 16 }}>
            No {filter} facts in your stash yet.
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((f) => {
          const isExpanded = expandedId === f.id;
          const catStyle = CATEGORY_STYLE[f.category] ?? { bg: "#C4793A", color: "#F5EDE0" };
          return (
            <div
              key={f.id}
              onClick={() => setExpandedId(isExpanded ? null : f.id)}
              style={{
                backgroundColor: "var(--card)",
                borderRadius: 4,
                padding: "14px 16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "box-shadow 0.2s ease",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
                <span
                  className="pill font-mono"
                  style={{ fontSize: 9, backgroundColor: catStyle.bg, color: catStyle.color, border: "none" }}
                >
                  {getCategoryLabel(f.category)}
                </span>
                <span className="pill pill-dark font-mono" style={{ fontSize: 9 }}>
                  {shortYear(f.year)}
                </span>
              </div>

              <div
                className="font-serif"
                style={{
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: "var(--warm-black)",
                  display: "-webkit-box",
                  WebkitLineClamp: isExpanded ? ("unset" as unknown as number) : 2,
                  WebkitBoxOrient: "vertical" as React.CSSProperties["WebkitBoxOrient"],
                  overflow: isExpanded ? "visible" : "hidden",
                }}
              >
                {f.factoid}
              </div>

              {isExpanded && (
                <div style={{ marginTop: 16, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
                  <div className="font-mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--smoke)", marginBottom: 6, textTransform: "uppercase" }}>
                    — your audience awaits —
                  </div>
                  <div className="font-serif" style={{ fontSize: 14, color: "var(--warm-black)", lineHeight: 1.6, fontStyle: "italic" }}>
                    {CONVERSATION_OPENERS[f.category] ?? "\u201cThe history here is, frankly, more interesting than most people.\u201d"}
                  </div>
                </div>
              )}

              <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: "var(--smoke)", marginTop: isExpanded ? 14 : 10 }}>
                ◆ {f.location}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
