import React from "react";
import type { Factoid } from "@/context/KapitContext";
import { getCategoryLabel } from "./FactoidCard";

interface Props {
  repertoire: Factoid[];
}

function shortYear(year: string): string {
  const match = year.match(/(\d{4})/);
  if (match) return "'" + match[1].slice(-2);
  const m2 = year.match(/(\d{2})$/);
  return m2 ? "'" + m2[1] : year;
}

export default function Repertoire({ repertoire }: Props) {
  if (repertoire.length === 0) return null;

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 36 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <h3 className="font-display" style={{ fontSize: 24, fontWeight: 800, color: "var(--warm-black)", lineHeight: 1, letterSpacing: "-0.01em" }}>
          your bits
        </h3>
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--smoke)" }}>
          {repertoire.length} in the chamber
        </span>
      </div>

      <div className="repertoire-scroll" style={{ paddingLeft: 0, paddingRight: 0 }}>
        {repertoire.map((f) => (
          <div key={f.id} style={{
            flex: "0 0 260px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            borderRadius: 4,
            padding: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <span className="pill pill-bourbon font-mono" style={{ fontSize: 9 }}>
                {getCategoryLabel(f.category)}
              </span>
              <span className="pill pill-dark font-mono" style={{ fontSize: 9 }}>
                {shortYear(f.year)}
              </span>
            </div>

            <div className="font-serif" style={{ fontSize: 14, lineHeight: 1.5, color: "var(--warm-black)" }}>
              {f.factoid.length > 110 ? f.factoid.slice(0, 110) + "…" : f.factoid}
            </div>

            <div className="font-mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--smoke)", marginTop: "auto" }}>
              ◆ {f.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
