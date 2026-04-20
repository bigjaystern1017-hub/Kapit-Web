import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

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
}

const KapitContext = createContext<KapitContextType | null>(null);

const STORAGE_KEY = "kapit_repertoire";
const BASE_URL = import.meta.env.BASE_URL || "/kapit-web/";

export function KapitProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [factoids, setFactoids] = useState<Factoid[]>([]);
  const [currentFactoidIndex, setCurrentFactoidIndex] = useState(0);
  const [repertoire, setRepertoire] = useState<Factoid[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchFactoids = useCallback(async () => {
    if (!selectedLocation) return;
    setIsLoading(true);
    setError(null);
    try {
      const apiBase = BASE_URL.replace(/\/$/, "").replace("/kapit-web", "");
      const response = await fetch(`${apiBase}/api/kapit/factoids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          locationName: selectedLocation.name,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch factoids");
      const data = await response.json();
      const mapped: Factoid[] = data.factoids.map(
        (f: { factoid: string; year: string; category: string }, i: number) => ({
          ...f,
          location: selectedLocation.name,
          id: `${selectedLocation.lat.toFixed(3)}-${selectedLocation.lng.toFixed(3)}-${i}-${Date.now()}`,
        })
      );
      setFactoids(mapped);
      setCurrentFactoidIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation]);

  const getCurrentFactoid = useCallback(() => {
    if (factoids.length === 0) return null;
    return factoids[currentFactoidIndex % factoids.length] ?? null;
  }, [factoids, currentFactoidIndex]);

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
