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
      },
      () => {
        setGpsLoading(false);
      }
    );
  };

  const selectPreset = (loc: Location) => {
    setSelectedLocation(loc);
    onLocationSelected();
  };

  const submitCustom = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || !customName.trim()) return;
    setSelectedLocation({ lat, lng, name: customName.trim() });
    setShowCustom(false);
    onLocationSelected();
  };

  return (
    <div style={{ paddingLeft: 20, paddingRight: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
        <span className="font-mono" style={{ fontSize: 11, letterSpacing: 3, color: "var(--smoke)" }}>LOCALE</span>
        <div style={{ flex: 1, height: 1, backgroundColor: "var(--border)" }} />
      </div>

      <button
        onClick={handleGPS}
        disabled={gpsLoading}
        style={{
          width: "100%",
          backgroundColor: "var(--bourbon)",
          color: "var(--warm-black)",
          paddingTop: 14,
          paddingBottom: 14,
          border: "none",
          cursor: "pointer",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {gpsLoading ? (
          <span className="font-mono" style={{ fontSize: 12, letterSpacing: 4, fontWeight: "bold" }}>LOCATING…</span>
        ) : (
          <span className="font-mono" style={{ fontSize: 12, letterSpacing: 4, fontWeight: "bold" }}>FIND ME</span>
        )}
      </button>

      {selectedLocation && (
        <div style={{
          border: "1px solid var(--powder-blue)",
          paddingLeft: 14, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
          marginBottom: 16,
        }}>
          <div className="font-mono" style={{ fontSize: 9, letterSpacing: 3, color: "var(--powder-blue)", marginBottom: 4 }}>CURRENT LOCALE</div>
          <div className="font-mono" style={{ fontSize: 14, color: "var(--cream)", letterSpacing: 1 }}>◆ {selectedLocation.name}</div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 1, backgroundColor: "var(--border)" }} />
        <div style={{ height: 1, backgroundColor: "var(--border)", marginTop: 2 }} />
      </div>

      <div className="font-mono" style={{ fontSize: 10, letterSpacing: 2, color: "var(--smoke)", textAlign: "center", marginBottom: 12 }}>
        — OR SELECT A DESTINATION —
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {PRESET_LOCATIONS.map((loc) => (
          <button
            key={loc.name}
            onClick={() => selectPreset(loc)}
            style={{
              border: `1px solid ${selectedLocation?.name === loc.name ? "var(--bourbon)" : "var(--border)"}`,
              backgroundColor: selectedLocation?.name === loc.name ? "rgba(196,121,58,0.13)" : "transparent",
              paddingTop: 8, paddingBottom: 8, paddingLeft: 10, paddingRight: 10,
              cursor: "pointer",
            }}
          >
            <span className="font-mono" style={{
              fontSize: 9, letterSpacing: 2,
              color: selectedLocation?.name === loc.name ? "var(--bourbon)" : "var(--smoke)",
            }}>
              {loc.name.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowCustom(!showCustom)}
        style={{ display: "block", width: "100%", background: "none", border: "none", cursor: "pointer", paddingTop: 10, paddingBottom: 10, marginBottom: 8, textAlign: "center" }}
      >
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: 3, color: "var(--smoke)", textDecoration: "underline" }}>
          {showCustom ? "— CLOSE —" : "ENTER COORDINATES"}
        </span>
      </button>

      {showCustom && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
          {[
            { value: customLat, setter: setCustomLat, placeholder: "LATITUDE (e.g. 40.758)" },
            { value: customLng, setter: setCustomLng, placeholder: "LONGITUDE (e.g. -73.985)" },
            { value: customName, setter: setCustomName, placeholder: "LOCATION NAME" },
          ].map(({ value, setter, placeholder }) => (
            <input
              key={placeholder}
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              className="font-mono"
              style={{
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--cream)",
                paddingTop: 10, paddingBottom: 10, paddingLeft: 14, paddingRight: 14,
                fontSize: 12,
                outline: "none",
              }}
            />
          ))}
          <button
            onClick={submitCustom}
            style={{
              backgroundColor: "var(--bourbon)",
              color: "var(--warm-black)",
              paddingTop: 14, paddingBottom: 14,
              border: "none", cursor: "pointer",
            }}
          >
            <span className="font-mono" style={{ fontSize: 12, letterSpacing: 4, fontWeight: "bold" }}>SET LOCATION</span>
          </button>
        </div>
      )}
    </div>
  );
}
