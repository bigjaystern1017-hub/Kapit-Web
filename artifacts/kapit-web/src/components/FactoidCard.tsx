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

const CATEGORY_LABELS: Record<string, string> = {
  crime: "CRIME",
  science: "SCIENCE",
  culture: "CULTURE",
  politics: "POLITICS",
  sports: "ATHLETICS",
  weird: "PECULIAR",
  food: "DINING",
  architecture: "EDIFICE",
  nature: "NATURE",
};

const CONVERSATION_OPENERS: Record<string, string> = {
  crime: "\u201cThe most interesting criminals in history never got caught \u2014 they got celebrated.\u201d",
  science: "\u201cThere\u2019s a fact about this neighborhood that would make your physics professor cry into their coffee.\u201d",
  culture: "\u201cThe cultural history of this block is, frankly, more interesting than anything you\u2019ll read this week.\u201d",
  politics: "\u201cPoliticians here used to be genuinely colorful. Now they\u2019re just\u2026 loud.\u201d",
  sports: "\u201cAthletic achievement used to mean something very different right here.\u201d",
  weird: "\u201cIf I told you what happened here, you wouldn\u2019t believe me. But I have a source.\u201d",
  food: "\u201cThe culinary history of this exact spot is the reason I will never apologize for ordering the expensive thing.\u201d",
  architecture: "\u201cThe building you\u2019re standing near has a past that the architects would very much prefer you didn\u2019t know.\u201d",
  nature: "\u201cNature has been absolutely unhinged in this neighborhood. Let me explain.\u201d",
};

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat.toUpperCase();
}

interface Props {
  factoid: Factoid | null;
  isSpinning: boolean;
  onRevealComplete: () => void;
}

export default function FactoidCard({ factoid, isSpinning, onRevealComplete }: Props) {
  const [displayText, setDisplayText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [revealKey, setRevealKey] = useState(0);

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

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isSpinning]);

  useEffect(() => {
    if (factoid && waitingForDataRef.current) {
      doReveal(factoid);
    }
  }, [factoid]);

  if (!isSpinning && !revealed) return null;

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 8 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ height: 2, backgroundColor: "var(--border)" }} />
        <div style={{ height: 3 }} />
        <div style={{ height: 1, backgroundColor: "var(--border)", opacity: 0.4 }} />
      </div>

      {!revealed && (
        <div style={{ minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 20, paddingBottom: 20, gap: 16 }}>
          <span className="font-serif" style={{ fontSize: 17, color: "var(--blush)", fontStyle: "italic", textAlign: "center" }}>
            {displayText}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="dot-1" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
            <div className="dot-2" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
            <div className="dot-3" style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
          </div>
        </div>
      )}

      {revealed && factoid && (
        <div ref={cardRef} key={revealKey} className="factoid-card-enter" style={{
          backgroundColor: "var(--card-elevated)",
          border: "1px solid var(--border)",
          boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
        }}>
          <div style={{ height: 3, backgroundColor: "var(--powder-blue)", flexShrink: 0 }} />

          <div style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span className="font-mono" style={{ fontSize: 10, letterSpacing: 3, color: "var(--powder-blue)" }}>
                {getCategoryLabel(factoid.category)}
              </span>
              <div style={{ width: 4, height: 4, backgroundColor: "var(--smoke)", flexShrink: 0 }} />
              <span className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)" }}>
                {factoid.year}
              </span>
            </div>

            <div style={{ marginBottom: 4 }}>
              <span className="font-mono" style={{ fontSize: 12, color: "var(--cream-muted)", letterSpacing: 1 }}>
                ◆ {factoid.location}
              </span>
            </div>

            <div style={{ height: 1, backgroundColor: "var(--border)", marginTop: 12, marginBottom: 12 }} />

            <div style={{ marginBottom: 4 }}>
              <span className="font-serif" style={{
                fontSize: 52,
                lineHeight: "50px",
                color: "var(--bourbon)",
                marginRight: 6,
                marginTop: -2,
                float: "left",
              }}>
                {factoid.factoid.charAt(0)}
              </span>
              <span className="font-serif" style={{
                fontSize: 18,
                lineHeight: "30px",
                color: "var(--cream)",
                display: "block",
              }}>
                {factoid.factoid.slice(1)}
              </span>
              <div style={{ clear: "both" }} />
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={{ height: 2, backgroundColor: "var(--border)" }} />
              <div style={{ height: 3 }} />
              <div style={{ height: 1, backgroundColor: "var(--border-subtle)" }} />
            </div>

            <div style={{ paddingTop: 14 }}>
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: 3, color: "var(--bourbon)", marginBottom: 6 }}>YOUR MOVE</div>
              <div className="font-serif" style={{ fontSize: 14, color: "var(--smoke)", lineHeight: "22px", fontStyle: "italic" }}>
                {CONVERSATION_OPENERS[factoid.category] ?? "\u201cThe history here is, frankly, more interesting than most people.\u201d"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <div style={{ height: 2, backgroundColor: "var(--border)" }} />
        <div style={{ height: 3 }} />
        <div style={{ height: 1, backgroundColor: "var(--border)", opacity: 0.4 }} />
      </div>
    </div>
  );
}
