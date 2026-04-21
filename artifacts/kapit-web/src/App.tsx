import React, { useCallback, useRef, useState } from "react";
import LocationSelector from "@/components/LocationSelector";
import SuspenderSnap from "@/components/SuspenderSnap";
import FactoidCard from "@/components/FactoidCard";
import Repertoire from "@/components/Repertoire";
import { KapitProvider, useKapit } from "@/context/KapitContext";

const MARQUEE_TEXT = " BE INSUFFERABLE  ★  BE INSUFFERABLE  ★  BE INSUFFERABLE  ★  BE INSUFFERABLE  ★  BE INSUFFERABLE  ★  BE INSUFFERABLE  ★ ";

function HomeScreen() {
  const {
    selectedLocation,
    factoids,
    isLoading,
    error,
    fetchFactoids,
    getCurrentFactoid,
    advanceFactoidIndex,
    addToRepertoire,
    repertoire,
  } = useKapit();

  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const [locationSelected, setLocationSelected] = useState(false);
  const [snapActive, setSnapActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLocationSelected = () => {
    setLocationSelected(true);
    setPhase("idle");
  };

  const handleSnap = useCallback(() => {
    if (!selectedLocation) return;
    if (phase === "spinning") return;

    if (factoids.length === 0) {
      setPhase("spinning");
      fetchFactoids();
    } else {
      advanceFactoidIndex();
      setPhase("spinning");
    }
  }, [selectedLocation, phase, factoids.length, fetchFactoids, advanceFactoidIndex]);

  const handleRevealComplete = useCallback(() => {
    setPhase("revealed");
    const f = getCurrentFactoid();
    if (f) addToRepertoire(f);
  }, [getCurrentFactoid, addToRepertoire]);

  const handleAgain = useCallback(() => {
    advanceFactoidIndex();
    setPhase("spinning");
  }, [advanceFactoidIndex]);

  const currentFactoid = getCurrentFactoid();

  return (
    <div style={{ height: "100vh", backgroundColor: "var(--cream)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="marquee-bar">
        <div className="marquee-content font-mono" style={{ color: "var(--cream)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>
          {MARQUEE_TEXT.repeat(3)}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: snapActive ? "hidden" : "auto",
          overflowX: "hidden",
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 24,
          paddingBottom: 60,
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: 16, paddingRight: 16, marginBottom: 24, textAlign: "center" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            <span className="pill pill-outlined font-mono">◆ gentleman&apos;s companion</span>
            <span className="pill pill-blue font-mono">· v1.0</span>
          </div>

          <h1
            className="font-display"
            style={{
              fontSize: 78,
              lineHeight: 1,
              fontStyle: "italic",
              fontWeight: 900,
              color: "var(--bourbon)",
              transform: "rotate(-2.5deg)",
              margin: "8px 0 4px",
              letterSpacing: "-0.02em",
              fontVariationSettings: "'SOFT' 50",
            }}
          >
            Kapit<sup style={{ fontSize: 14, fontWeight: 700, marginLeft: 2, top: "-1.4em" }}>™</sup>
          </h1>

          <div
            style={{
              display: "inline-block",
              backgroundColor: "var(--warm-black)",
              color: "var(--cream)",
              padding: "8px 16px",
              transform: "rotate(2.5deg)",
              marginTop: 14,
              boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
              borderRadius: 2,
            }}
          >
            <span className="font-serif" style={{ fontStyle: "italic", fontSize: 14, letterSpacing: "0.5px" }}>
              Be insufferable, everywhere.
            </span>
          </div>

          <span className="font-mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--smoke)", textTransform: "lowercase", marginTop: 22 }}>
            drop a fact &middot; no cap
          </span>
        </div>

        <LocationSelector onLocationSelected={handleLocationSelected} />

        {locationSelected && (
          <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8 }}>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <h2 className="font-display" style={{ fontSize: 48, fontWeight: 800, color: "var(--warm-black)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                PULL
              </h2>
              <div className="font-serif" style={{ fontStyle: "italic", fontSize: 14, color: "var(--smoke)", marginTop: 6 }}>
                the cord. that&apos;s it. that&apos;s the app.
              </div>
              <div className="font-mono" style={{ fontSize: 11, letterSpacing: 4, color: "var(--bourbon)", marginTop: 14 }}>
                ↓ ↓ ↓ PULL ↓ ↓ ↓
              </div>
            </div>

            {error && (
              <div style={{ border: "1px solid var(--destructive)", padding: 16, marginTop: 16, marginBottom: 16, borderRadius: 4, backgroundColor: "#FCE8E8" }}>
                <div className="font-mono" style={{ fontSize: 12, color: "var(--destructive)", textAlign: "center", marginBottom: 10 }}>{error}</div>
                <button
                  onClick={() => fetchFactoids()}
                  style={{ width: "100%", backgroundColor: "var(--destructive)", border: "none", padding: "12px 0", cursor: "pointer", borderRadius: 4 }}
                >
                  <span className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--cream)" }}>TRY AGAIN</span>
                </button>
              </div>
            )}

            {!error && (
              <SuspenderSnap
                onSnap={handleSnap}
                onDragStart={() => setSnapActive(true)}
                onDragEnd={() => setSnapActive(false)}
                disabled={isLoading || !selectedLocation}
              />
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <span className="font-display" style={{ fontSize: 22, fontWeight: 800, color: "var(--bourbon)", lineHeight: 1 }}>3/3</span>
              <span className="font-mono" style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--smoke)" }}>
                free pulls today
              </span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--smoke-muted)" }} />
              <a href="#" onClick={(e) => e.preventDefault()} className="font-mono" style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--bourbon)", textDecoration: "none", borderBottom: "1px solid var(--bourbon)" }}>
                go unlimited →
              </a>
            </div>
          </div>
        )}

        {(phase === "spinning" || phase === "revealed") && (
          <FactoidCard
            factoid={currentFactoid}
            isSpinning={phase === "spinning"}
            onRevealComplete={handleRevealComplete}
            onAgain={handleAgain}
          />
        )}

        <Repertoire repertoire={repertoire} />

        <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 32 }}>
          <div style={{ backgroundColor: "var(--warm-black)", color: "var(--cream)", padding: 22, borderRadius: 4, boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
            <div className="font-mono" style={{ fontSize: 11, letterSpacing: 4, color: "var(--brass-highlight)", marginBottom: 8 }}>
              KAPIT / BLACK
            </div>
            <p className="font-serif" style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.55, color: "var(--cream)", marginBottom: 14 }}>
              after dark. unexpurgated. the ones your HR department will flag. $9.99. your call.
            </p>
            <button
              onClick={(e) => e.preventDefault()}
              style={{
                background: "transparent",
                border: "1px solid var(--cream)",
                color: "var(--cream)",
                padding: "10px 18px",
                cursor: "pointer",
                borderRadius: 4,
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              flip to black →
            </button>
          </div>
        </div>

        <div style={{ paddingTop: 28, paddingBottom: 20, textAlign: "center" }}>
          <span className="font-mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--smoke-muted)" }}>
            Kapit™ &middot; 2026 &middot; do not use in elevators
          </span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <KapitProvider>
      <HomeScreen />
    </KapitProvider>
  );
}
