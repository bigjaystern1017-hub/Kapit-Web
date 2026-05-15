import React, { useCallback, useEffect, useRef, useState } from "react";
import LocationSelector from "@/components/LocationSelector";
import SuspenderSnap from "@/components/SuspenderSnap";
import FactoidCard from "@/components/FactoidCard";
import Stash from "@/components/Stash";
import WaitingFactCard from "@/components/WaitingFactCard";
import BottomNav, { type TabId } from "@/components/BottomNav";
import { KapitProvider, useKapit } from "@/context/KapitContext";

const MARQUEE_TEXT = " Charisma in your pocket\u2026  \u2605  Charisma in your pocket\u2026  \u2605  Charisma in your pocket\u2026  \u2605 ";
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const STREAK_KEY = "kapit_streak_dates";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function recordSnapDay(): void {
  try {
    const dates = JSON.parse(localStorage.getItem(STREAK_KEY) || "[]") as string[];
    const today = todayStr();
    if (!dates.includes(today)) {
      localStorage.setItem(STREAK_KEY, JSON.stringify([...dates, today].slice(-365)));
    }
  } catch {}
}

function getStreakInfo(): { count: number; weekDots: boolean[] } {
  try {
    const dates = new Set(JSON.parse(localStorage.getItem(STREAK_KEY) || "[]") as string[]);
    let count = 0;
    const cursor = new Date();
    while (dates.has(cursor.toISOString().split("T")[0])) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    const today = new Date();
    const dow = today.getDay();
    const weekDots: boolean[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - dow + i);
      return dates.has(d.toISOString().split("T")[0]);
    });
    return { count, weekDots };
  } catch {
    return { count: 0, weekDots: new Array(7).fill(false) };
  }
}

function BrandSeal() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 20, marginBottom: 4 }}>
      <div style={{
        width: 50, height: 50, borderRadius: "50%",
        backgroundColor: "#1C1916",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}>
        <span className="font-display" style={{ fontSize: 26, fontWeight: 800, color: "#F5EDE0", fontStyle: "italic", lineHeight: 1, marginTop: 3 }}>K</span>
      </div>
      <span className="font-mono" style={{ fontSize: 8, letterSpacing: 2, color: "var(--smoke-muted)", textTransform: "uppercase" }}>
        Pull · Snap · Be Amazed · Repeat
      </span>
    </div>
  );
}

function ProfileTab({ selectedLocation }: { selectedLocation: { name: string } | null }) {
  return (
    <div style={{ padding: "24px 20px" }}>
      <h2 className="font-display" style={{ fontSize: 28, fontWeight: 800, color: "var(--warm-black)", lineHeight: 1, marginBottom: 24 }}>
        Profile
      </h2>
      <div style={{
        backgroundColor: "var(--card)", borderRadius: 4, padding: 18,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 12,
        border: "1px solid var(--border-subtle)",
      }}>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", marginBottom: 8, textTransform: "uppercase" }}>
          Current Location
        </div>
        <div className="font-serif" style={{ fontSize: 16, color: "var(--warm-black)" }}>
          {selectedLocation?.name ?? "Not set"}
        </div>
      </div>
      <div style={{
        backgroundColor: "var(--card)", borderRadius: 4, padding: 18,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        border: "1px solid var(--border-subtle)",
      }}>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", marginBottom: 8, textTransform: "uppercase" }}>
          Settings
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: "var(--smoke-muted)", letterSpacing: 1 }}>
          coming soon
        </div>
      </div>
    </div>
  );
}

function HomeScreen() {
  const {
    selectedLocation,
    isLoading,
    error,
    fetchFactoids,
    getCurrentFactoid,
    addToRepertoire,
    repertoire,
    triggerSnap,
    triggerFreestyle,
    isWildcard,
    isFreestyle,
    loadingReady,
    loadingMessage,
    loadingTick,
    demoMode,
    toggleDemoMode,
    markAsServed,
  } = useKapit();

  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const [locationSelected, setLocationSelected] = useState(false);
  const [snapActive, setSnapActive] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [showReadyFlash, setShowReadyFlash] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [slowLoad, setSlowLoad] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("pull");
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo());

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLocationSelected = () => {
    setLocationSelected(true);
    setPhase("idle");
    setShowReadyFlash(false);
  };

  useEffect(() => {
    if (isLoading) {
      setShowLoading(true);
      setSlowLoad(false);
      const slowTimer = window.setTimeout(() => setSlowLoad(true), 8000);
      const giveupTimer = window.setTimeout(() => setShowLoading(false), 12000);
      return () => { window.clearTimeout(slowTimer); window.clearTimeout(giveupTimer); };
    }
    if (!showLoading) return;
    if (error) { setShowLoading(false); setSlowLoad(false); return; }
    setShowReadyFlash(true);
    const hideTimer = window.setTimeout(() => {
      setShowLoading(false); setShowReadyFlash(false); setSlowLoad(false);
    }, 700);
    return () => window.clearTimeout(hideTimer);
  }, [isLoading, error, showLoading]);

  const bumpStreak = useCallback(() => {
    recordSnapDay();
    setStreakInfo(getStreakInfo());
  }, []);

  const handleSnap = useCallback(() => {
    if (!selectedLocation) return;
    if (phase === "spinning") return;
    bumpStreak();
    setPhase("spinning");
    void triggerSnap();
  }, [selectedLocation, phase, triggerSnap, bumpStreak]);

  const handleFreestyle = useCallback(() => {
    if (phase === "spinning") return;
    bumpStreak();
    setPhase("spinning");
    void triggerFreestyle();
  }, [phase, triggerFreestyle, bumpStreak]);

  useEffect(() => {
    const base = (import.meta.env.BASE_URL || "/kapit-web/").replace(/\/$/, "").replace("/kapit-web", "");
    const ping = () => { fetch(`${base}/api/healthz`, { method: "GET" }).catch(() => {}); };
    ping();
    const id = window.setInterval(ping, 4 * 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const tapTimesRef = useRef<number[]>([]);
  const [wordmarkGlow, setWordmarkGlow] = useState(false);
  const handleWordmarkTap = useCallback(() => {
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current, now].filter((t) => now - t < 800);
    if (tapTimesRef.current.length >= 3) {
      tapTimesRef.current = [];
      toggleDemoMode();
      setWordmarkGlow(true);
      window.setTimeout(() => setWordmarkGlow(false), 700);
    }
  }, [toggleDemoMode]);

  const handleRevealComplete = useCallback(() => {
    setPhase("revealed");
    const f = getCurrentFactoid();
    if (f) markAsServed(f);
  }, [getCurrentFactoid, markAsServed]);

  const handleKeep = useCallback(() => {
    const f = getCurrentFactoid();
    if (f) addToRepertoire(f);
  }, [getCurrentFactoid, addToRepertoire]);

  const handleAgain = useCallback(() => {
    bumpStreak();
    setPhase("spinning");
    if (isFreestyle) void triggerFreestyle();
    else void triggerSnap();
  }, [triggerSnap, triggerFreestyle, isFreestyle, bumpStreak]);

  const currentFactoid = getCurrentFactoid();
  const loadingMessages = [
    "ambulating...", "percolating...", "kapitulating locale...",
    "consulting the archives...", "winding the mainspring...",
    "engaging the apparatus...", "calibrating charisma...",
    "buffing the brass...", "polishing your repertoire...",
    "locating something insufferable...",
  ];
  const loadingMessageIndex = loadingTick % loadingMessages.length;

  return (
    <div style={{
      height: "100vh",
      background: "linear-gradient(180deg, #F7F0E3 0%, #F0EBE0 100%)",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      {demoMode && (
        <div className="font-mono" style={{
          position: "absolute", top: 26, right: 10, zIndex: 50,
          backgroundColor: "var(--warm-black)", color: "var(--brass-highlight)",
          padding: "3px 7px", borderRadius: 2, fontSize: 9, letterSpacing: 2,
          boxShadow: "0 2px 6px rgba(0,0,0,0.25)", pointerEvents: "none",
        }}>
          ◆ DEMO
        </div>
      )}

      <div className="marquee-bar">
        <div className="marquee-content font-mono" style={{ color: "var(--cream)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase" }}>
          {MARQUEE_TEXT.repeat(3)}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: activeTab === "pull" && snapActive ? "hidden" : "auto",
          overflowX: "hidden",
          paddingLeft: 8,
          paddingRight: 8,
          paddingTop: 24,
          paddingBottom: "calc(60px + env(safe-area-inset-bottom, 0px))",
          WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        }}
      >
        {/* ── PULL TAB ── */}
        {activeTab === "pull" && (
          <>
            {/* Masthead */}
            <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: 16, paddingRight: 16, marginBottom: 20, textAlign: "center" }}>
              {/* Streak — top right */}
              {streakInfo.count > 0 && (
                <div style={{ position: "absolute", right: 0, top: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <span style={{ fontSize: 16 }}>🔥</span>
                    <span className="font-display" style={{ fontSize: 20, fontWeight: 700, color: "var(--bourbon)", lineHeight: 1 }}>{streakInfo.count}</span>
                  </div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {DAY_LABELS.map((label, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span className="font-mono" style={{ fontSize: 7, color: "var(--smoke-muted)" }}>{label}</span>
                        <div style={{
                          width: 6, height: 6, borderRadius: "50%",
                          backgroundColor: streakInfo.weekDots[i] ? "var(--bourbon)" : "transparent",
                          border: `1px solid ${streakInfo.weekDots[i] ? "var(--bourbon)" : "var(--smoke-muted)"}`,
                        }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                <span className="pill pill-outlined font-mono">◆ chronically interesting</span>
                <span className="pill pill-blue font-mono">· v1.0</span>
              </div>

              <h1
                className="font-display"
                onClick={handleWordmarkTap}
                style={{
                  fontSize: 78, lineHeight: 1, fontStyle: "italic", fontWeight: 900,
                  transform: "rotate(-2.5deg)", margin: "8px 0 4px", letterSpacing: "-0.02em",
                  fontVariationSettings: "'SOFT' 50", cursor: "pointer",
                  userSelect: "none", WebkitUserSelect: "none" as React.CSSProperties["WebkitUserSelect"],
                  transition: "filter 0.4s ease",
                  filter: wordmarkGlow ? "drop-shadow(0 0 14px rgba(196,121,58,0.85))" : "none",
                }}
              >
                <span style={{ color: "var(--warm-black)" }}>K</span>
                <span style={{ color: "var(--bourbon)" }}>a</span>
                <span style={{ color: "var(--powder-blue)" }}>p</span>
                <span style={{ color: "var(--bourbon)" }}>i</span>
                <span style={{ color: "var(--warm-black)" }}>t</span>
                <sup style={{ fontSize: 14, fontWeight: 700, marginLeft: 2, top: "-1.4em", color: "var(--bourbon)" }}>™</sup>
              </h1>

              <p className="font-serif" style={{ fontSize: 14, color: "var(--smoke)", fontStyle: "italic", marginTop: 8, marginBottom: 14 }}>
                Pocket trivia for more magnetic conversations.
              </p>

              <div style={{
                display: "inline-block", backgroundColor: "var(--warm-black)", color: "var(--cream)",
                padding: "8px 16px", transform: "rotate(2.5deg)", boxShadow: "0 3px 10px rgba(0,0,0,0.18)", borderRadius: 2,
              }}>
                <span className="font-serif" style={{ fontStyle: "italic", fontSize: 14, letterSpacing: "0.5px" }}>
                  Be Chronically Interesting.
                </span>
              </div>
            </div>

            <LocationSelector onLocationSelected={handleLocationSelected} />

            <div style={{ display: "flex", justifyContent: "center", paddingLeft: 20, paddingRight: 20, marginTop: 4, marginBottom: 8 }}>
              <button
                onClick={handleFreestyle}
                disabled={phase === "spinning"}
                className="font-mono"
                style={{
                  background: "transparent", border: "1px solid var(--bourbon)", color: "var(--bourbon)",
                  padding: "8px 14px", borderRadius: 4, cursor: phase === "spinning" ? "wait" : "pointer",
                  fontSize: 11, letterSpacing: 2, textTransform: "lowercase",
                  opacity: phase === "spinning" ? 0.5 : 1, transition: "opacity 0.2s ease",
                }}
              >
                ⚡ freestyle <span style={{ color: "var(--smoke)", marginLeft: 6 }}>· bonus pull</span>
              </button>
            </div>

            {locationSelected && (
              <div style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8 }}>
                <div style={{ textAlign: "center", marginBottom: 4 }}>
                  <h2 className="font-display" style={{ fontSize: 48, fontWeight: 800, color: "var(--warm-black)", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    PULL
                  </h2>
                  <div className="font-serif" style={{ fontStyle: "italic", fontSize: 14, color: "var(--smoke)", marginTop: 6 }}>
                    A tiny ritual of curiosity.
                  </div>
                  <div className="font-mono" style={{ fontSize: 11, letterSpacing: 4, color: "var(--bourbon)", marginTop: 14 }}>
                    — pull the lever —
                  </div>
                </div>

                {showLoading && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, paddingTop: 24, paddingBottom: 22 }}>
                    <WaitingFactCard />
                    <div className="loading-gear">
                      <div className="loading-gear-inner" />
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className={`loading-tick loading-tick-${i + 1}`} />
                      ))}
                    </div>
                    <div key={loadingMessageIndex} className="font-serif loading-message" style={{ fontStyle: "italic", fontSize: 13, color: "var(--bourbon)", textAlign: "center" }}>
                      {loadingMessages[loadingMessageIndex]}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
                      {Array.from({ length: 6 }, (_, i) => (
                        <span key={i} className={`loading-dot ${i <= (loadingTick % 6) ? "loading-dot-active" : ""}`} />
                      ))}
                    </div>
                    {slowLoad && (
                      <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1.5, color: "var(--smoke)", marginTop: 4 }}>
                        taking longer than usual...
                      </div>
                    )}
                  </div>
                )}

                {error && !showLoading && (
                  <div style={{ border: "1px solid var(--bourbon)", padding: 14, marginTop: 12, marginBottom: 12, borderRadius: 4, backgroundColor: "rgba(196,121,58,0.08)" }}>
                    <div className="font-mono" style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--bourbon)", textAlign: "center", marginBottom: 10 }}>
                      archives unavailable — try again
                    </div>
                    <button onClick={() => { void fetchFactoids(); }} style={{ width: "100%", background: "transparent", border: "1px solid var(--bourbon)", padding: "10px 0", cursor: "pointer", borderRadius: 4 }}>
                      <span className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--bourbon)" }}>RETRY</span>
                    </button>
                  </div>
                )}

                {!showLoading && (
                  <div style={{ display: (showReadyFlash || loadingReady) && !error ? "flex" : "none", justifyContent: "center", marginBottom: 10 }}>
                    <span className="font-mono loading-ready-flash" style={{ fontSize: 10, letterSpacing: 2, color: "var(--bourbon)" }}>
                      {loadingMessage}
                    </span>
                  </div>
                )}

                {!showLoading && (
                  <SuspenderSnap
                    onSnap={handleSnap}
                    onDragStart={() => setSnapActive(true)}
                    onDragEnd={() => setSnapActive(false)}
                    disabled={!selectedLocation}
                  />
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 8, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  <span className="font-display" style={{ fontSize: 22, fontWeight: 800, color: "var(--bourbon)", lineHeight: 1 }}>3/3</span>
                  <span className="font-mono" style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--smoke)" }}>free pulls today</span>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "var(--smoke-muted)" }} />
                  <a href="#" onClick={(e) => e.preventDefault()} className="font-mono" style={{ fontSize: 11, letterSpacing: 1.5, color: "var(--bourbon)", textDecoration: "none", borderBottom: "1px solid var(--bourbon)" }}>
                    go Stuntin' →
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
                onKeep={handleKeep}
                isWildcard={isWildcard && !isFreestyle}
                isFreestyle={isFreestyle}
                isArchiveFallback={currentFactoid?.archiveFallback === true}
              />
            )}

            {/* Upsell cards */}
            <div style={{ paddingLeft: 20, paddingRight: 20, marginTop: 32 }}>
              <div style={{
                backgroundColor: "var(--card)", color: "var(--warm-black)", padding: 22, borderRadius: 4,
                borderLeft: "3px solid var(--bourbon)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16,
              }}>
                <div className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--bourbon)", marginBottom: 10 }}>KAPIT STUNTIN'</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                  {["Unlimited pulls — no daily cap", "Priority fact loading — faster snaps", "Wildcard facts from around the world", "Save unlimited facts to your stash", "No ads, ever"].map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <span className="font-mono" style={{ fontSize: 11, lineHeight: 1.4, color: "var(--bourbon)", marginTop: 2 }}>◆</span>
                      <span className="font-serif" style={{ fontSize: 14, lineHeight: 1.55, color: "var(--warm-black)" }}>{item}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div className="font-mono" style={{ fontSize: 12, letterSpacing: 1.5, color: "var(--smoke)", marginBottom: 4 }}>$3.99 / mo</div>
                  <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1, color: "var(--smoke-muted)" }}>cancel anytime</div>
                </div>
                <button onClick={(e) => e.preventDefault()} className="btn-outlined" style={{ border: "1px solid var(--bourbon)", color: "var(--bourbon)", padding: "10px 18px", cursor: "pointer", borderRadius: 4, fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: 2, textTransform: "lowercase", background: "transparent" }}>
                  start stuntin' →
                </button>
              </div>

              <div style={{ backgroundColor: "var(--warm-black)", color: "var(--cream)", padding: 22, borderRadius: 4, boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}>
                <div className="font-mono" style={{ fontSize: 11, letterSpacing: 4, color: "var(--brass-highlight)", marginBottom: 8 }}>KAPIT / BLACK</div>
                <p className="font-serif" style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.55, color: "var(--cream)", marginBottom: 14 }}>
                  that loud pack. after dark. unfiltered. facts your HR department will flag. $9.99. your call.
                </p>

                {!showInvite && (
                  <>
                    <button
                      onClick={() => setShowInvite(true)}
                      style={{ background: "transparent", border: "1px solid var(--cream)", color: "var(--cream)", padding: "10px 18px", cursor: "pointer", borderRadius: 4, fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", transition: "background 0.2s ease" }}
                    >
                      GO DARK →
                    </button>
                    <div className="font-mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--smoke-muted)", marginTop: 10, textTransform: "lowercase" }}>
                      currently invite-only
                    </div>
                  </>
                )}

                {showInvite && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    <input
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="invite code"
                      className="font-mono"
                      style={{ border: "1px solid var(--cream)", background: "transparent", color: "var(--cream)", padding: "10px 14px", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", outline: "none", borderRadius: 4 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setInviteCode("")} style={{ background: "transparent", border: "1px solid var(--cream)", color: "var(--cream)", padding: "10px 18px", cursor: "pointer", borderRadius: 4, fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", flex: 1 }}>submit</button>
                      <button onClick={() => { setShowInvite(false); setInviteCode(""); }} style={{ background: "transparent", border: "none", color: "var(--smoke-muted)", padding: "10px 12px", cursor: "pointer", fontFamily: "JetBrains Mono, monospace", fontSize: 10, letterSpacing: 1.5 }}>cancel</button>
                    </div>
                    <div className="font-mono" style={{ fontSize: 9, letterSpacing: 1.5, color: "var(--smoke-muted)", marginTop: 4, textTransform: "lowercase" }}>currently invite-only</div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ paddingTop: 28, paddingBottom: 20, textAlign: "center" }}>
              <BrandSeal />
              <span className="font-mono" style={{ fontSize: 9, letterSpacing: 2, color: "var(--smoke-muted)" }}>
                Kapit™ · 2026 · Snap It 2 Kapit
              </span>
            </div>
          </>
        )}

        {/* ── STASH TAB ── */}
        {activeTab === "stash" && <Stash repertoire={repertoire} />}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && <ProfileTab selectedLocation={selectedLocation} />}
      </div>

      <BottomNav active={activeTab} onChange={setActiveTab} />
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
