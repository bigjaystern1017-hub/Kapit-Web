import React, { useEffect, useRef, useState } from "react";
import type { Factoid } from "@/context/KapitContext";

const TEASERS = [
  "No one asked, but\u2026",
  "The past called\u2026",
  "Brace yourself, darling\u2026",
  "You didn\u2019t hear this from me\u2026",
  "History is insufferable\u2026",
  "Somebody had to know\u2026",
  "Consider yourself warned\u2026",
];

export const CATEGORY_LABELS: Record<string, string> = {
  celebrity:    "FAMOUS",
  crime:        "CRIME",
  haunted:      "HAUNTED",
  music:        "NIGHTLIFE",
  food:         "DINING",
  sports:       "ATHLETICS",
  hidden:       "HIDDEN",
  history:      "HISTORY",
  culture:      "CULTURE",
  science:      "SCIENCE",
  politics:     "POLITICS",
  weird:        "PECULIAR",
  architecture: "HIDDEN",
  nature:       "NATURE",
};

export const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  celebrity:    { bg: "#B8A44C", color: "#1C1916" },
  crime:        { bg: "#8B2252", color: "#F5EDE0" },
  haunted:      { bg: "#4A2066", color: "#F5EDE0" },
  music:        { bg: "#6A9CB7", color: "#1C1916" },
  food:         { bg: "#C4793A", color: "#F5EDE0" },
  sports:       { bg: "#2D6A4F", color: "#F5EDE0" },
  hidden:       { bg: "#1C1916", color: "#F5EDE0" },
  history:      { bg: "#D4C5A9", color: "#1C1916" },
  culture:      { bg: "#C4A07A", color: "#1C1916" },
  architecture: { bg: "#1C1916", color: "#F5EDE0" },
};

export const CONVERSATION_OPENERS: Record<string, string> = {
  celebrity:    "\u201cIf I told you who used to drink at the bar on this block, you\u2019d never shut up about it at parties.\u201d",
  crime:        "\u201cThe most interesting criminals in history never got caught \u2014 they got celebrated.\u201d",
  haunted:      "\u201cI\u2019m not saying I believe in ghosts. I\u2019m saying something happened here that nobody has explained.\u201d",
  music:        "\u201cThe music that came out of this neighborhood changed everything. Most people just don\u2019t know it yet.\u201d",
  food:         "\u201cThe culinary history of this exact spot is the reason I will never apologize for ordering the expensive thing.\u201d",
  sports:       "\u201cAthletic achievement used to mean something very different right here.\u201d",
  hidden:       "\u201cThere is something underneath this block that the city would very much prefer you didn\u2019t know about.\u201d",
  history:      "\u201cThe official version of what happened here is significantly less interesting than what actually happened.\u201d",
  culture:      "\u201cThe cultural history of this block is, frankly, more interesting than anything you\u2019ll read this week.\u201d",
  science:      "\u201cThere\u2019s a fact about this neighborhood that would make your physics professor cry into their coffee.\u201d",
  politics:     "\u201cPoliticians here used to be genuinely colorful. Now they\u2019re just\u2026 loud.\u201d",
  weird:        "\u201cIf I told you what happened here, you wouldn\u2019t believe me. But I have a source.\u201d",
  architecture: "\u201cThe building you\u2019re standing near has a past that the architects would very much prefer you didn\u2019t know.\u201d",
  nature:       "\u201cNature has been absolutely unhinged in this neighborhood. Let me explain.\u201d",
};

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat.toUpperCase();
}

function shortYear(year: string): string {
  const match = year.match(/(\d{4})/);
  if (match) return "'" + match[1].slice(-2);
  const m2 = year.match(/(\d{2})$/);
  return m2 ? "'" + m2[1] : year;
}

interface Props {
  factoid: Factoid | null;
  isSpinning: boolean;
  onRevealComplete: () => void;
  onAgain: () => void;
  onKeep?: () => void;
  isWildcard?: boolean;
  isFreestyle?: boolean;
  isArchiveFallback?: boolean;
}

export default function FactoidCard({
  factoid, isSpinning, onRevealComplete, onAgain, onKeep,
  isWildcard, isFreestyle, isArchiveFallback,
}: Props) {
  const [displayText, setDisplayText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [revealKey, setRevealKey] = useState(0);
  const [isKept, setIsKept] = useState(false);
  const [shareStatus, setShareStatus] = useState<"" | "copied">("");

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitingForDataRef = useRef(false);
  const teasersDoneRef = useRef(false);
  const keepRevealedRef = useRef(false);
  const factoidRef = useRef<Factoid | null>(factoid);
  const cardRef = useRef<HTMLDivElement>(null);

  factoidRef.current = factoid;

  const doReveal = (f: Factoid) => {
    waitingForDataRef.current = false;
    keepRevealedRef.current = true;
    setDisplayText(f.factoid);
    setRevealed(true);
    setRevealKey((k) => k + 1);
    setIsKept(false);
    setShareStatus("");
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      onRevealComplete();
    }, 600);
  };

  useEffect(() => {
    if (!isSpinning) {
      if (!keepRevealedRef.current) {
        setRevealed(false);
        setDisplayText("");
        teasersDoneRef.current = false;
        waitingForDataRef.current = false;
      }
      if (intervalRef.current) clearTimeout(intervalRef.current);
      return;
    }

    keepRevealedRef.current = false;
    setRevealed(false);
    teasersDoneRef.current = false;
    waitingForDataRef.current = false;
    let tick = 0;

    const spin = () => {
      if (tick < TEASERS.length) {
        setDisplayText(TEASERS[tick]);
        tick++;
        const delay = 70 * Math.pow(1.28, tick);
        intervalRef.current = setTimeout(spin, delay);
      } else {
        teasersDoneRef.current = true;
        const available = factoidRef.current;
        if (available) {
          doReveal(available);
        } else {
          waitingForDataRef.current = true;
          setDisplayText("almost there\u2026");
        }
      }
    };

    intervalRef.current = setTimeout(spin, 70);
    return () => { if (intervalRef.current) clearTimeout(intervalRef.current); };
  }, [isSpinning]);

  useEffect(() => {
    if (factoid && waitingForDataRef.current) doReveal(factoid);
  }, [factoid]);

  const handleKeep = () => {
    if (!isKept) {
      setIsKept(true);
      onKeep?.();
    }
  };

  const handleShare = async () => {
    if (!factoid) return;
    const categoryLabel = getCategoryLabel(factoid.category).toLowerCase();
    const text = `${factoid.factoid}\n— ${categoryLabel} · ${factoid.year} · ${factoid.location}\nvia Kapit · kapitapp.com`;
    try {
      if (navigator.share) {
        await navigator.share({ text, title: "Kapit" });
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus("copied");
        setTimeout(() => setShareStatus(""), 2000);
      }
    } catch {}
  };

  if (!isSpinning && !revealed) return null;

  const catStyle = factoid
    ? (CATEGORY_STYLE[factoid.category] ?? { bg: "#C4793A", color: "#F5EDE0" })
    : { bg: "#C4793A", color: "#F5EDE0" };

  const headerLabel = isFreestyle
    ? "✦ FREESTYLE"
    : isWildcard
    ? "⚡ WILDCARD"
    : isArchiveFallback
    ? "FROM THE ARCHIVES"
    : "★ NEW FACT";
  const headerLabelColor = (isFreestyle || isWildcard)
    ? "#B8A44C"
    : isArchiveFallback
    ? "#8A8078"
    : "#C4793A";

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 16 }}>
      {!revealed && (
        <div style={{
          minHeight: 100,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "28px 20px", gap: 18,
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}>
          <span className="font-serif" style={{ fontSize: 18, color: "var(--bourbon)", fontStyle: "italic", textAlign: "center" }}>
            {displayText}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="dot-1" style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
            <div className="dot-2" style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
            <div className="dot-3" style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
          </div>
        </div>
      )}

      {revealed && factoid && (
        <div ref={cardRef} key={revealKey} className="factoid-card-enter" style={{
          backgroundColor: "var(--card)",
          borderRadius: 4,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>
          {/* Gradient header — placeholder for future location image */}
          <div style={{
            position: "relative",
            height: 80,
            background: "linear-gradient(to bottom, #1C1916 0%, rgba(28,25,22,0) 100%)",
          }}>
            <div className="font-mono" style={{
              position: "absolute", top: 10, left: 14,
              fontSize: 9, letterSpacing: 2,
              color: headerLabelColor,
              textTransform: "uppercase",
            }}>
              {headerLabel}
            </div>
            <div style={{ position: "absolute", bottom: 10, left: 14, display: "flex", gap: 6, alignItems: "center" }}>
              <span
                className="pill font-mono"
                style={{ fontSize: 9, backgroundColor: catStyle.bg, color: catStyle.color, border: "none" }}
              >
                {getCategoryLabel(factoid.category)}
              </span>
              <span className="pill pill-dark font-mono" style={{ fontSize: 9 }}>
                {shortYear(factoid.year)}
              </span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: "4px 22px 20px" }}>
            <div style={{ marginBottom: 16 }}>
              <span
                className="font-display"
                style={{
                  fontSize: 56, lineHeight: 0.85,
                  color: "var(--bourbon)", fontStyle: "italic", fontWeight: 800,
                  marginRight: 8, marginTop: 4, float: "left",
                  fontVariationSettings: "'SOFT' 50",
                }}
              >
                {factoid.factoid.charAt(0)}
              </span>
              <span className="font-serif" style={{ fontSize: 17, lineHeight: 1.7, color: "var(--warm-black)", display: "block" }}>
                {factoid.factoid.slice(1)}
              </span>
              <div style={{ clear: "both" }} />
            </div>

            <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: "var(--smoke)", marginBottom: 16 }}>
              {factoid.isGlobalWildcard
                ? `⚡ WILDCARD · ${factoid.location}`
                : `${factoid.broadRadius ? "◎" : "◆"} ${factoid.location}`}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 18 }}>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", marginBottom: 6, textTransform: "uppercase" }}>
                — your audience awaits —
              </div>
              <div className="font-serif" style={{ fontSize: 15, color: "var(--warm-black)", lineHeight: 1.6, fontStyle: "italic" }}>
                {CONVERSATION_OPENERS[factoid.category] ?? "\u201cThe history here is, frankly, more interesting than most people.\u201d"}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                onClick={handleKeep}
                title={isKept ? "Saved to Stash" : "Save to Stash"}
                style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  border: `1px solid ${isKept ? "var(--bourbon)" : "var(--border)"}`,
                  background: isKept ? "rgba(196,121,58,0.08)" : "transparent",
                  cursor: isKept ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20,
                  color: isKept ? "var(--bourbon)" : "var(--smoke)",
                  transition: "all 0.2s ease",
                }}
              >
                {isKept ? "★" : "☆"}
              </button>

              <button
                onClick={onAgain}
                className="font-mono"
                style={{
                  flex: 1, height: 48, borderRadius: 24,
                  backgroundColor: "var(--bourbon)", color: "#F5EDE0",
                  border: "none", cursor: "pointer",
                  fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
                  fontFamily: "JetBrains Mono, monospace",
                  transition: "background-color 0.2s ease",
                }}
              >
                Snap Again
              </button>

              <button
                onClick={() => void handleShare()}
                title="Share"
                style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                  border: "1px solid var(--border)", background: "transparent",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, color: "var(--warm-black)",
                  transition: "background 0.2s ease",
                }}
              >
                ↗
              </button>
            </div>

            {shareStatus === "copied" && (
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--bourbon)", marginTop: 10, textAlign: "right" }}>
                copied to clipboard
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 18, paddingTop: 12, textAlign: "center" }}>
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--smoke-muted)" }}>
                Kapit™ · no cap · source: your phone
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
