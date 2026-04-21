import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

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
  isWildcard: boolean;
  loadingReady: boolean;
  loadingMessage: string;
  loadingTick: number;
}

const KapitContext = createContext<KapitContextType | null>(null);

const STORAGE_KEY = "kapit_repertoire";
const BASE_URL = import.meta.env.BASE_URL || "/kapit-web/";

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
  const [loadingReady, setLoadingReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("ambulating...");
  const [loadingTick, setLoadingTick] = useState(0);

  const selectedLocationRef = useRef<Location | null>(null);
  selectedLocationRef.current = selectedLocation;
  const factoidsRef = useRef<Factoid[]>([]);
  factoidsRef.current = factoids;
  const isLoadingRef = useRef(false);
  isLoadingRef.current = isLoading;

  const setSelectedLocation = useCallback((loc: Location) => {
    const prev = selectedLocationRef.current;
    const isDifferent =
      !prev ||
      prev.lat !== loc.lat ||
      prev.lng !== loc.lng ||
      prev.name !== loc.name;
    selectedLocationRef.current = loc;
    setSelectedLocationState(loc);
    if (isDifferent) {
      setFactoids([]);
      factoidsRef.current = [];
      setCurrentFactoidIndex(0);
      setError(null);
      setWildcardFactoid(null);
      setIsWildcard(false);
      setLoadingReady(false);
      setLoadingMessage("ambulating...");
      setLoadingTick(0);
      void fetchFactoidsRef.current?.();
    }
  }, []);

  const clearFactoids = useCallback(() => {
    setFactoids([]);
    setCurrentFactoidIndex(0);
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

  const fetchFactoids = useCallback(async () => {
    const loc = selectedLocationRef.current;
    if (!loc) return;
    if (isLoadingRef.current) return;
    setLoadingReady(false);
    setIsLoading(true);
    isLoadingRef.current = true;
    setError(null);
    try {
      const apiBase = BASE_URL.replace(/\/$/, "").replace("/kapit-web", "");
      const url = `${apiBase}/api/kapit/factoids`;
      const body = { lat: loc.lat, lng: loc.lng, locationName: loc.name };
      console.log("[kapit] fetchFactoids POST", url, body);
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      console.log("[kapit] fetchFactoids response", response.status, response.ok);
      if (!response.ok) throw new Error(`Failed to fetch factoids (${response.status})`);
      const data = await response.json();
      console.log("[kapit] fetchFactoids data", { count: data?.factoids?.length, cached: data?.cached });
      const current = selectedLocationRef.current;
      if (
        !current ||
        current.lat !== loc.lat ||
        current.lng !== loc.lng ||
        current.name !== loc.name
      ) {
        return;
      }
      const mapped: Factoid[] = data.factoids.map(
        (f: { factoid: string; year: string; category: string }, i: number) => ({
          ...f,
          location: loc.name,
          id: `${loc.lat.toFixed(3)}-${loc.lng.toFixed(3)}-${i}-${Date.now()}`,
        })
      );
      setFactoids(mapped);
      factoidsRef.current = mapped;
      setCurrentFactoidIndex(0);
      setLoadingReady(true);
      setLoadingMessage("apparatus ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, []);
  fetchFactoidsRef.current = fetchFactoids;

  const fetchWildcard = useCallback(async () => {
    setIsLoading(true);
    setLoadingReady(false);
    setError(null);
    try {
      const apiBase = BASE_URL.replace(/\/$/, "").replace("/kapit-web", "");
      const response = await fetch(`${apiBase}/api/kapit/wildcard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Failed to fetch wildcard");
      const data = await response.json();
      const f = data.factoid as { factoid: string; year: string; category: string };
      const wc: Factoid = {
        ...f,
        location: "Anywhere",
        id: `wild-${Date.now()}`,
      };
      setWildcardFactoid(wc);
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
  }, [snapCount, fetchWildcard, fetchFactoids]);

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
        isWildcard,
        loadingReady,
        loadingMessage,
        loadingTick,
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
