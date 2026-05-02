import React, { useEffect, useRef, useState } from "react";
import { WAITING_FACTS } from "@/data/waitingFacts";

function pickFact(exclude: string): string {
  const pool = WAITING_FACTS.filter((f) => f !== exclude);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function WaitingFactCard() {
  const [fact, setFact] = useState(() => {
    return WAITING_FACTS[Math.floor(Math.random() * WAITING_FACTS.length)];
  });
  const [opacity, setOpacity] = useState(0);
  const factRef = useRef(fact);

  useEffect(() => {
    const fadeIn = window.setTimeout(() => setOpacity(1), 40);

    const id = window.setInterval(() => {
      setOpacity(0);
      window.setTimeout(() => {
        const next = pickFact(factRef.current);
        factRef.current = next;
        setFact(next);
        setOpacity(1);
      }, 400);
    }, 3400);

    return () => {
      window.clearTimeout(fadeIn);
      window.clearInterval(id);
    };
  }, []);

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: 4,
        padding: "14px 18px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        border: "1px solid var(--border)",
        width: "100%",
        transition: "opacity 0.4s ease",
        opacity,
      }}
    >
      <div
        className="font-mono"
        style={{
          fontSize: 9,
          letterSpacing: 2,
          color: "var(--smoke-muted)",
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        while you wait
      </div>
      <div
        className="font-serif"
        style={{
          fontStyle: "italic",
          fontSize: 15,
          lineHeight: 1.6,
          color: "var(--warm-black)",
        }}
      >
        {fact}
      </div>
    </div>
  );
}
