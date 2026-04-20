import React, { useState } from "react";
import type { Factoid } from "@/context/KapitContext";
import { getCategoryLabel } from "./FactoidCard";

interface Props {
  repertoire: Factoid[];
}

export default function Repertoire({ repertoire }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (repertoire.length === 0) return null;

  const visible = expanded ? repertoire : repertoire.slice(0, 3);

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 32, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--smoke)" }}>YOUR REPERTOIRE</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {visible.map((f) => (
          <div key={f.id} style={{
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
            padding: "12px 14px",
            borderLeft: "3px solid var(--bourbon)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--powder-blue)" }}>
                {getCategoryLabel(f.category)}
              </span>
              <div style={{ width: 3, height: 3, backgroundColor: "var(--smoke)" }} />
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--smoke)" }}>{f.year}</span>
              <div style={{ flex: 1 }} />
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: 1, color: "var(--smoke-muted)" }}>◆ {f.location}</span>
            </div>
            <span className="font-serif" style={{ fontSize: 14, lineHeight: "22px", color: "var(--cream-muted)" }}>
              {f.factoid.length > 120 ? f.factoid.slice(0, 120) + "…" : f.factoid}
            </span>
          </div>
        ))}
      </div>

      {repertoire.length > 3 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", marginTop: 12, textAlign: "center" }}
        >
          <span className="font-mono" style={{ fontSize: 10, letterSpacing: 3, color: "var(--smoke)", textDecoration: "underline" }}>
            {expanded ? "— SHOW LESS —" : `— ${repertoire.length - 3} MORE IN YOUR REPERTOIRE —`}
          </span>
        </button>
      )}
    </div>
  );
}
