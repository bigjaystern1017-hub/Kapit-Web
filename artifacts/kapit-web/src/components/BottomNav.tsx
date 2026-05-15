import React from "react";

export type TabId = "pull" | "stash" | "profile";

interface Props {
  active: TabId;
  onChange: (tab: TabId) => void;
}

export default function BottomNav({ active, onChange }: Props) {
  const tabs: { id: TabId; icon: string; label: string }[] = [
    { id: "pull", icon: "⚡", label: "Pull" },
    { id: "stash", icon: "📦", label: "Stash" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "calc(60px + env(safe-area-inset-bottom, 0px))",
        backgroundColor: "#1C1916",
        borderTop: "1px solid rgba(196,121,58,0.15)",
        display: "flex",
        alignItems: "flex-start",
        zIndex: 200,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: 60,
              background: "none",
              border: "none",
              cursor: "pointer",
              gap: 3,
              transition: "color 0.2s ease",
              WebkitTapHighlightColor: "transparent",
            } as React.CSSProperties}
          >
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                letterSpacing: 1.5,
                textTransform: "uppercase" as const,
                color: isActive ? "#C4793A" : "#8A8078",
                transition: "color 0.2s ease",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
