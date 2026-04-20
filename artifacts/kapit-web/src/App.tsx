import React, { useCallback, useRef, useState } from "react";
import LocationSelector from "@/components/LocationSelector";
import SuspenderSnap from "@/components/SuspenderSnap";
import FactoidCard from "@/components/FactoidCard";
import Repertoire from "@/components/Repertoire";
import { KapitProvider, useKapit } from "@/context/KapitContext";

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

  const [phase, setPhase] = useState<"idle" | "loading" | "spinning" | "revealed">("idle");
  const [locationSelected, setLocationSelected] = useState(false);
  const [snapActive, setSnapActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLocationSelected = () => {
    setLocationSelected(true);
    setPhase("idle");
  };

  const handleSnap = useCallback(async () => {
    if (!selectedLocation) return;
    if (phase === "loading") return;

    if (factoids.length === 0) {
      setPhase("loading");
      await fetchFactoids();
      setPhase("spinning");
    } else {
      advanceFactoidIndex();
      setPhase("spinning");
    }

    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: 420, behavior: "smooth" });
      }
    }, 200);
  }, [selectedLocation, phase, factoids.length, fetchFactoids, advanceFactoidIndex]);

  const handleRevealComplete = useCallback(() => {
    setPhase("revealed");
    const f = getCurrentFactoid();
    if (f) addToRepertoire(f);
  }, [getCurrentFactoid, addToRepertoire]);

  const currentFactoid = getCurrentFactoid();

  return (
    <div style={{ height: "100vh", backgroundColor: "var(--warm-black)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 5, backgroundColor: "#2A1F14", borderRight: "1px solid var(--border-subtle)", zIndex: 10 }} />
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 5, backgroundColor: "#2A1F14", borderLeft: "1px solid var(--border-subtle)", zIndex: 10 }} />

      <div
        ref={scrollRef}
        style={{
          height: "100%",
          overflowY: snapActive ? "hidden" : "auto",
          overflowX: "hidden",
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 16,
          paddingBottom: 60,
          WebkitOverflowScrolling: "touch" as any,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: 20, paddingRight: 20, marginBottom: 20, paddingTop: 8, textAlign: "center" }}>
          <span className="font-mono" style={{ fontSize: 9, letterSpacing: 6, color: "var(--smoke-muted)", textTransform: "uppercase", marginBottom: 6 }}>
            A Gentleman&apos;s Companion
          </span>

          <span className="font-serif" style={{
            fontSize: 64, letterSpacing: 12, color: "var(--cream)",
            textShadow: "1px 2px 8px #000",
            marginBottom: 8, display: "block",
          }}>
            KAPIT
          </span>

          <span className="font-serif" style={{ fontSize: 13, color: "var(--smoke)", lineHeight: "20px", fontStyle: "italic", paddingLeft: 20, paddingRight: 20 }}>
            Yes, yes you are about to be the most interesting person in any room
          </span>
          <span className="font-serif" style={{ fontSize: 13, color: "var(--powder-blue)", marginTop: 2, marginBottom: 14, fontStyle: "italic" }}>
            with a wi-fi signal.
          </span>

          <div style={{ width: 140, marginBottom: 10 }}>
            <div style={{ height: 2, backgroundColor: "var(--bourbon)" }} />
            <div style={{ height: 3 }} />
            <div style={{ height: 1, backgroundColor: "var(--bourbon)", opacity: 0.3 }} />
          </div>

          <div style={{ width: 60, height: 3, backgroundColor: "var(--powder-blue)", opacity: 0.6, marginBottom: 4 }} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <LocationSelector onLocationSelected={handleLocationSelected} />
        </div>

        {locationSelected && (
          <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 16, paddingBottom: 16, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
              <span className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--smoke)" }}>THE SNAP</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
            </div>

            {isLoading && phase === "loading" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 40, paddingBottom: 40, gap: 16 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div className="dot-1" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
                  <div className="dot-2" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
                  <div className="dot-3" style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
                </div>
                <span className="font-serif" style={{ fontSize: 14, color: "var(--smoke)", fontStyle: "italic" }}>
                  digging through the archives&hellip;
                </span>
              </div>
            )}

            {error && (
              <div style={{ border: "1px solid var(--destructive)", padding: 16, marginBottom: 16 }}>
                <div className="font-mono" style={{ fontSize: 12, color: "var(--destructive)", textAlign: "center", marginBottom: 10 }}>{error}</div>
                <button
                  onClick={() => fetchFactoids()}
                  style={{ width: "100%", backgroundColor: "var(--destructive)", border: "none", paddingTop: 10, paddingBottom: 10, cursor: "pointer" }}
                >
                  <span className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--cream)" }}>TRY AGAIN</span>
                </button>
              </div>
            )}

            {phase !== "loading" && !error && (
              <SuspenderSnap
                onSnap={handleSnap}
                onDragStart={() => setSnapActive(true)}
                onDragEnd={() => setSnapActive(false)}
                disabled={isLoading || !selectedLocation}
              />
            )}

            {phase === "revealed" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, paddingLeft: 4, paddingRight: 4 }}>
                <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
                <button
                  onClick={() => {
                    advanceFactoidIndex();
                    setPhase("spinning");
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span className="font-mono" style={{ fontSize: 10, letterSpacing: 3, color: "var(--smoke)" }}>PULL AGAIN FOR ANOTHER</span>
                </button>
                <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
              </div>
            )}
          </div>
        )}

        {(phase === "spinning" || phase === "revealed") && (
          <FactoidCard
            factoid={currentFactoid}
            isSpinning={phase === "spinning"}
            onRevealComplete={handleRevealComplete}
          />
        )}

        <Repertoire repertoire={repertoire} />

        <div style={{
          paddingTop: 28, paddingBottom: 28, textAlign: "center",
          borderTop: "1px solid var(--border)", marginTop: 24, marginLeft: 20, marginRight: 20, display: "flex", flexDirection: "column", gap: 4, alignItems: "center",
        }}>
          <span className="font-mono" style={{ fontSize: 11, letterSpacing: 6, color: "var(--border)" }}>KAPIT</span>
          <span className="font-serif" style={{ fontSize: 12, color: "var(--smoke-muted)", fontStyle: "italic" }}>Be Insufferable, Everywhere&trade;</span>
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
