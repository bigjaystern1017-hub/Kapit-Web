import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DEMO_FACTOIDS, DEMO_WILDCARDS, type DemoFactoid } from "@/data/demoFacts";
import { findPreloadedLocation, type PreloadedFactoid } from "@/data/preloadedFacts";

export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface Factoid {
  factoid: string;
  year: string;
  category: string;
  location: string;
  id: string;
  archiveFallback?: boolean;
  broadRadius?: boolean;
  isGlobalWildcard?: boolean;
}

interface KapitContextType {
  selectedLocation: Location | null;
  setSelectedLocation: (loc: Location) => void;
  factoids: Factoid[];
  currentFactoidIndex: number;
  repertoire: Factoid[];
  addToRepertoire: (f: Factoid) => void;
  isLoading: boolean;
  error: string | null;
  fetchFactoids: () => Promise<void>;
  getCurrentFactoid: () => Factoid | null;
  advanceFactoidIndex: () => void;
  clearFactoids: () => void;
  triggerSnap: () => Promise<void>;
  triggerFreestyle: () => Promise<void>;
  isWildcard: boolean;
  isFreestyle: boolean;
  loadingReady: boolean;
  loadingMessage: string;
  loadingTick: number;
  demoMode: boolean;
  toggleDemoMode: () => void;
  markAsServed: (f: Factoid) => void;
}

const KapitContext = createContext<KapitContextType | null>(null);

const STORAGE_KEY = "kapit_repertoire";
const DEMO_KEY = "kapit_demo_mode";
const BASE_URL = import.meta.env.BASE_URL || "/kapit-web/";
const FALLBACK_TIMEOUT_MS = 6000;

function apiBase() {
  return BASE_URL.replace(/\/$/, "").replace("/kapit-web", "");
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let _factoidIdSeq = 0;
function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${++_factoidIdSeq}`;
}

function fingerprint(text: string): string {
  return text.trim().split(/\s+/).slice(0, 20).join(" ").toLowerCase();
}

function preloadedToFactoid(f: PreloadedFactoid, locationName: string): Factoid {
  return { ...f, location: locationName, id: makeId("pre") };
}

function demoToFactoid(f: DemoFactoid, prefix: string): Factoid {
  return { ...f, id: makeId(prefix) };
}

export function KapitProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocationState] = useState<Location | null>(null);
  const [factoids, setFactoids] = useState<Factoid[]>([]);
  const [currentFactoidIndex, setCurrentFactoidIndex] = useState(0);
  const [repertoire, setRepertoire] = useState<Factoid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [snapCount, setSnapCount] = useState(0);
  const [wildcardFactoid, setWildcardFactoid] = useState<Factoid | null>(null);
  const [isWildcard, setIsWildcard] = useState(false);
  const [isFreestyle, setIsFreestyle] = useState(false);
  const [loadingReady, setLoadingReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("ambulating...");
  const [loadingTick, setLoadingTick] = useState(0);

  const [demoMode, setDemoMode] = useState<boolean>(() => {
    try { return localStorage.getItem(DEMO_KEY) === "1"; } catch { return false; }
  });

  const demoDeckRef = useRef<DemoFactoid[]>(shuffle(DEMO_FACTOIDS));
  const demoIdxRef = useRef(0);
  const demoWildDeckRef = useRef<DemoFactoid[]>(shuffle(DEMO_WILDCARDS));
  const demoWildIdxRef = useRef(0);

  const selectedLocationRef = useRef<Location | null>(null);
  selectedLocationRef.current = selectedLocation;
  const factoidsRef = useRef<Factoid[]>([]);
  factoidsRef.current = factoids;
  const isLoadingRef = useRef(false);
  isLoadingRef.current = isLoading;
  const demoModeRef = useRef(demoMode);
  demoModeRef.current = demoMode;

  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchGenerationRef = useRef(0);
  const fetchCallCountRef = useRef(0);
  const servedFactTextsRef = useRef<string[]>([]);

  const clearFallbackTimer = () => {
    if (fallbackTimerRef.current !== null) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  };

  const drawDemo = useCallback((): DemoFactoid => {
    if (demoIdxRef.current >= demoDeckRef.current.length) {
      demoDeckRef.current = shuffle(DEMO_FACTOIDS);
      demoIdxRef.current = 0;
    }
    return demoDeckRef.current[demoIdxRef.current++];
  }, []);

  const drawDemoWild = useCallback((): DemoFactoid => {
    if (demoWildIdxRef.current >= demoWildDeckRef.current.length) {
      demoWildDeckRef.current = shuffle(DEMO_WILDCARDS);
      demoWildIdxRef.current = 0;
    }
    return demoWildDeckRef.current[demoWildIdxRef.current++];
  }, []);

  const toggleDemoMode = useCallback(() => {
    setDemoMode((prev) => {
      const next = !prev;
      try {
        if (next) localStorage.setItem(DEMO_KEY, "1");
        else localStorage.removeItem(DEMO_KEY);
      } catch {}
      console.log("[kapit] demo mode", next ? "ENABLED" : "disabled");
      return next;
    });
  }, []);

  useEffect(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) setRepertoire(JSON.parse(data));
    } catch {}
  }, []);

  const addToRepertoire = useCallback((f: Factoid) => {
    setRepertoire((prev) => {
      const exists = prev.some((x) => x.id === f.id);
      if (exists) return prev;
      const next = [f, ...prev];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const fetchFactoidsRef = useRef<(() => Promise<void>) | null>(null);

  const markAsServed = useCallback((f: Factoid) => {
    const fp = fingerprint(f.factoid);
    if (!servedFactTextsRef.current.includes(fp)) {
      servedFactTextsRef.current = [...servedFactTextsRef.current.slice(-19), fp];
    }
  }, []);

  const fetchFactoids = useCallback(async () => {
    const loc = selectedLocationRef.current;
    if (!loc) return;
    if (isLoadingRef.current) return;

    const gen = ++fetchGenerationRef.current;
    const callNum = ++fetchCallCountRef.current;
    const expandRadius = callNum > 2 && callNum % 3 === 0;
    const wildcardMode = callNum > 4 && callNum % 5 === 0;
    const seenTopics = servedFactTextsRef.current.slice(-12);

    setLoadingReady(false);
    setIsLoading(true);
    isLoadingRef.current = true;
    setError(null);
    clearFallbackTimer();

    // Layer 5 — 6-second fallback: serve a demo fact as a placeholder
    fallbackTimerRef.current = setTimeout(() => {
      fallbackTimerRef.current = null;
      if (fetchGenerationRef.current !== gen) return;
      if (factoidsRef.current.length > 0) return;
      console.log("[kapit] 6s timeout: serving archive fallback");
      const fallback = demoToFactoid(drawDemo(), "fallback");
      fallback.archiveFallback = true;
      fallback.location = loc.name;
      setFactoids([fallback]);
      factoidsRef.current = [fallback];
      setCurrentFactoidIndex(0);
      setLoadingReady(true);
      setLoadingMessage("apparatus ready");
      setIsLoading(false);
      isLoadingRef.current = false;
    }, FALLBACK_TIMEOUT_MS);

    try {
      const url = `${apiBase()}/api/kapit/factoids`;
      const body = { lat: loc.lat, lng: loc.lng, locationName: loc.name, count: 3, seenTopics, expandRadius, wildcardMode };
      console.log("[kapit] fetchFactoids POST", url, { callNum, expandRadius, wildcardMode, seenTopics: seenTopics.length });
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`Failed to fetch factoids (${response.status})`);
      const data = await response.json();
      console.log("[kapit] fetchFactoids data", { count: data?.factoids?.length, mode: data?.mode, cached: data?.cached });

      if (fetchGenerationRef.current !== gen) return;

      const current = selectedLocationRef.current;
      if (!current || current.lat !== loc.lat || current.lng !== loc.lng) return;

      clearFallbackTimer();

      const responseMode = (data.mode as string) ?? "normal";
      const isGlobalWildcard = responseMode === "wildcard";
      const isBroad = responseMode === "broad";

      const raw = data.factoids as { factoid: string; year: string; category: string; location?: string }[];

      // Deduplicate against previously served facts
      const servedFps = new Set(servedFactTextsRef.current);
      const deduped = raw.filter((f) => !servedFps.has(fingerprint(f.factoid)));
      const toUse = deduped.length > 0 ? deduped : raw;

      const mapped: Factoid[] = toUse.map((f) => ({
        ...f,
        location: f.location ?? loc.name,
        id: makeId("api"),
        broadRadius: isBroad ? true : undefined,
        isGlobalWildcard: isGlobalWildcard ? true : undefined,
      }));

      setFactoids(mapped);
      factoidsRef.current = mapped;
      setCurrentFactoidIndex(0);
      setLoadingReady(true);
      setLoadingMessage("apparatus ready");
    } catch (err) {
      if (fetchGenerationRef.current !== gen) return;
      clearFallbackTimer();
      if (factoidsRef.current.length === 0) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      if (fetchGenerationRef.current === gen) {
        setIsLoading(false);
        isLoadingRef.current = false;
      }
    }
  }, [drawDemo]);
  fetchFactoidsRef.current = fetchFactoids;

  const setSelectedLocation = useCallback((loc: Location) => {
    const prev = selectedLocationRef.current;
    const isDifferent =
      !prev || prev.lat !== loc.lat || prev.lng !== loc.lng || prev.name !== loc.name;
    selectedLocationRef.current = loc;
    setSelectedLocationState(loc);

    if (!isDifferent) return;

    fetchGenerationRef.current++;
    clearFallbackTimer();
    setFactoids([]);
    factoidsRef.current = [];
    setCurrentFactoidIndex(0);
    setError(null);
    setWildcardFactoid(null);
    setIsWildcard(false);
    setIsFreestyle(false);
    setLoadingReady(false);
    setLoadingMessage("ambulating...");
    setLoadingTick(0);

    if (demoModeRef.current) return;

    // Layer 1 — preloaded facts: instant, no API call
    const preloaded = findPreloadedLocation(loc.lat, loc.lng, loc.name);
    if (preloaded) {
      console.log("[kapit] serving preloaded facts for", preloaded.name);
      const shuffledFacts = shuffle(preloaded.facts);
      const mapped = shuffledFacts.map((f) => preloadedToFactoid(f, loc.name));
      setFactoids(mapped);
      factoidsRef.current = mapped;
      setCurrentFactoidIndex(0);
      setLoadingReady(true);
      setLoadingMessage("apparatus ready");
      return;
    }

    // Non-preloaded: fetch from API
    void fetchFactoidsRef.current?.();
  }, []);

  const clearFactoids = useCallback(() => {
    setFactoids([]);
    setCurrentFactoidIndex(0);
  }, []);

  const fetchWildcard = useCallback(async () => {
    setIsLoading(true);
    setLoadingReady(false);
    setError(null);
    try {
      const response = await fetch(`${apiBase()}/api/kapit/wildcard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Failed to fetch wildcard");
      const data = await response.json();
      const f = data.factoid as { factoid: string; year: string; category: string };
      setWildcardFactoid({ ...f, location: "Anywhere", id: makeId("wild") });
      setLoadingReady(true);
      setLoadingMessage("mechanism engaged");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsWildcard(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const triggerSnap = useCallback(async () => {
    const next = snapCount + 1;
    setSnapCount(next);
    setLoadingTick((t) => t + 1);
    setIsFreestyle(false);

    if (demoModeRef.current) {
      const isFourth = next % 4 === 0;
      if (isFourth) {
        setWildcardFactoid(demoToFactoid(drawDemoWild(), "demo-wild"));
        setIsWildcard(true);
      } else {
        setIsWildcard(false);
        setWildcardFactoid(null);
        const df = demoToFactoid(drawDemo(), "demo");
        setFactoids([df]);
        factoidsRef.current = [df];
        setCurrentFactoidIndex(0);
      }
      return;
    }

    const isFourth = next % 4 === 0;
    if (isFourth) {
      setWildcardFactoid(null);
      setIsWildcard(true);
      await fetchWildcard();
    } else {
      setIsWildcard(false);
      setWildcardFactoid(null);
      if (factoidsRef.current.length === 0) {
        await fetchFactoids();
      } else {
        setCurrentFactoidIndex((i) => i + 1);
      }
    }
  }, [snapCount, fetchWildcard, fetchFactoids, drawDemo, drawDemoWild]);

  const triggerFreestyle = useCallback(async () => {
    setIsFreestyle(true);
    setIsWildcard(true);
    if (demoModeRef.current) {
      setWildcardFactoid(demoToFactoid(drawDemoWild(), "demo-freestyle"));
      return;
    }
    setWildcardFactoid(null);
    await fetchWildcard();
  }, [fetchWildcard, drawDemoWild]);

  const getCurrentFactoid = useCallback(() => {
    if (isWildcard) return wildcardFactoid;
    if (factoids.length === 0) return null;
    return factoids[currentFactoidIndex % factoids.length] ?? null;
  }, [factoids, currentFactoidIndex, isWildcard, wildcardFactoid]);

  const advanceFactoidIndex = useCallback(() => {
    setCurrentFactoidIndex((i) => i + 1);
  }, []);

  return (
    <KapitContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        factoids,
        currentFactoidIndex,
        repertoire,
        addToRepertoire,
        isLoading,
        error,
        fetchFactoids,
        getCurrentFactoid,
        advanceFactoidIndex,
        clearFactoids,
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
      }}
    >
      {children}
    </KapitContext.Provider>
  );
}

export function useKapit() {
  const ctx = useContext(KapitContext);
  if (!ctx) throw new Error("useKapit must be used within KapitProvider");
  return ctx;
}
