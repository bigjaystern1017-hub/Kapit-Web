import React, { useState } from "react";
import { useKapit, type Location } from "@/context/KapitContext";

const PRESET_LOCATIONS: Location[] = [
  { lat: 40.758, lng: -73.9855, name: "Times Square" },
  { lat: 40.7061, lng: -73.9969, name: "Brooklyn Bridge" },
  { lat: 40.7074, lng: -74.0113, name: "Wall Street" },
  { lat: 40.7851, lng: -73.9683, name: "Central Park" },
  { lat: 40.6892, lng: -74.0445, name: "Statue of Liberty" },
  { lat: 48.8584, lng: 2.2945, name: "Eiffel Tower" },
  { lat: 51.5007, lng: -0.1246, name: "Westminster" },
  { lat: 41.9029, lng: 12.4534, name: "The Vatican" },
];

interface Props {
  onLocationSelected: () => void;
}

export default function LocationSelector({ onLocationSelected }: Props) {
  const { selectedLocation, setSelectedLocation } = useKapit();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [customName, setCustomName] = useState("");

  const handleGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: Location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "Your Location",
        };
        setSelectedLocation(loc);
        onLocationSelected();
        setGpsLoading(false);
        setShowSwap(false);
      },
      () => {
        setGpsLoading(false);
      }
    );
  };

  const selectPreset = (loc: Location) => {
    setSelectedLocation(loc);
    onLocationSelected();
    setShowSwap(false);
  };

  const submitCustom = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || !customName.trim()) return;
    setSelectedLocation({ lat, lng, name: customName.trim() });
    setShowCustom(false);
    setShowSwap(false);
    onLocationSelected();
  };

  if (selectedLocation && !showSwap) {
    return (
      <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 8 }}>
        <div style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          padding: 18,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div className="location-dot-pulse" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--bourbon)" }} />
            <span className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", textTransform: "uppercase" }}>
              you are at
            </span>
          </div>

          <div className="font-serif" style={{ fontSize: 28, fontWeight: 700, color: "var(--warm-black)", lineHeight: 1.15, marginBottom: 8 }}>
            {selectedLocation.name}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <span className="font-mono" style={{ fontSize: 11, color: "var(--smoke)", letterSpacing: 0.5 }}>
              {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
            </span>
            <span className="pill pill-blue-soft font-mono">↗ exploring</span>
          </div>

          <button
            onClick={() => setShowSwap(true)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "var(--bourbon)",
            }}
            className="font-mono"
          >
            <span style={{ fontSize: 11, letterSpacing: 1.5, borderBottom: "1px solid var(--bourbon)", paddingBottom: 1 }}>
              swap →
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 8 }}>
      <div style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 4,
        padding: 18,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", textTransform: "uppercase" }}>
            where are you
          </span>
          {selectedLocation && (
            <button
              onClick={() => setShowSwap(false)}
              className="font-mono"
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--smoke)", fontSize: 10, letterSpacing: 1.5 }}
            >
              ← back
            </button>
          )}
        </div>

        <button
          onClick={handleGPS}
          disabled={gpsLoading}
          className="btn-outlined"
          style={{ width: "100%", marginBottom: 14, padding: "12px 16px" }}
        >
          {gpsLoading ? "LOCATING…" : "◉ FIND ME"}
        </button>

        <div className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke-muted)", textAlign: "center", marginBottom: 12, textTransform: "uppercase" }}>
          or pick a spot
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {PRESET_LOCATIONS.map((loc) => {
            const active = selectedLocation?.name === loc.name;
            return (
              <button
                key={loc.name}
                onClick={() => selectPreset(loc)}
                className={`pill font-mono ${active ? "pill-bourbon" : "pill-outlined"}`}
                style={{ cursor: "pointer", border: active ? "1px solid var(--bourbon)" : undefined }}
              >
                {loc.name}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowCustom(!showCustom)}
          style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", padding: "8px 0", textAlign: "center" }}
        >
          <span className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", textDecoration: "underline" }}>
            {showCustom ? "— close —" : "enter coordinates"}
          </span>
        </button>

        {showCustom && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {[
              { value: customLat, setter: setCustomLat, placeholder: "latitude (e.g. 40.758)" },
              { value: customLng, setter: setCustomLng, placeholder: "longitude (e.g. -73.985)" },
              { value: customName, setter: setCustomName, placeholder: "location name" },
            ].map(({ value, setter, placeholder }) => (
              <input
                key={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="font-mono"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--cream-warm)",
                  color: "var(--warm-black)",
                  padding: "10px 14px",
                  fontSize: 12,
                  outline: "none",
                  borderRadius: 4,
                }}
              />
            ))}
            <button onClick={submitCustom} className="btn-bourbon" style={{ padding: "12px 16px" }}>
              SET LOCATION
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
