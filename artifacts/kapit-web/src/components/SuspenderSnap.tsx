import React, { useCallback, useEffect, useRef, useState } from "react";

const DRAG_THRESHOLD = 60;
const MAX_DRAG = 220;

function getPhysicalDrag(raw: number): number {
  if (raw < 0) return 0;
  if (raw < DRAG_THRESHOLD) return raw;
  return DRAG_THRESHOLD + (raw - DRAG_THRESHOLD) * 0.5;
}

function getFeedback(drag: number): { text: string; pastThreshold: boolean } {
  if (drag < 15) return { text: "", pastThreshold: false };
  if (drag < 60) return { text: "a little further\u2026", pastThreshold: false };
  if (drag < 110) return { text: "let go, darling \u2191", pastThreshold: true };
  if (drag < 150) return { text: "oh, you mean business", pastThreshold: true };
  return { text: "absolute menace", pastThreshold: true };
}

interface Props {
  onSnap: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  disabled?: boolean;
}

export default function SuspenderSnap({ onSnap, onDragStart, onDragEnd, disabled = false }: Props) {
  const [svgY, setSvgY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [buckleY, setBuckleY] = useState(0);
  const [buckleScale, setBuckleScale] = useState(1);
  const [showGlow, setShowGlow] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; pastThreshold: boolean }>({ text: "", pastThreshold: false });

  const startYRef = useRef(0);
  const activeRef = useRef(false);
  const disabledRef = useRef(disabled);
  const onSnapRef = useRef(onSnap);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const stretchOscRef = useRef<OscillatorNode | null>(null);
  const stretchGainRef = useRef<GainNode | null>(null);
  const stretchLFORef = useRef<OscillatorNode | null>(null);
  const stretchLFOGainRef = useRef<GainNode | null>(null);

  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { onSnapRef.current = onSnap; }, [onSnap]);
  useEffect(() => { onDragStartRef.current = onDragStart; }, [onDragStart]);
  useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

  useEffect(() => {
    return () => {
      stopStretch();
      audioCtxRef.current?.close();
    };
  }, []);

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function startStretch() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(6, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.018, now);

      osc.connect(gain);
      gain.connect(ctx.destination);
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      osc.start(now);
      lfo.start(now);

      stretchOscRef.current = osc;
      stretchGainRef.current = gain;
      stretchLFORef.current = lfo;
      stretchLFOGainRef.current = lfoGain;
    } catch {}
  }

  function updateStretch(physical: number) {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx || !stretchOscRef.current || !stretchGainRef.current) return;
      const t = Math.min(physical / MAX_DRAG, 1);
      const freq = 80 + t * 220;
      const gain = 0.05 + t * 0.10;
      const now = ctx.currentTime;
      stretchOscRef.current.frequency.setTargetAtTime(freq, now, 0.015);
      stretchGainRef.current.gain.setTargetAtTime(gain, now, 0.015);
    } catch {}
  }

  function stopStretch() {
    try {
      const now = audioCtxRef.current?.currentTime ?? 0;
      if (stretchOscRef.current) {
        stretchOscRef.current.stop(now);
        stretchOscRef.current.disconnect();
        stretchOscRef.current = null;
      }
      if (stretchLFORef.current) {
        stretchLFORef.current.stop(now);
        stretchLFORef.current.disconnect();
        stretchLFORef.current = null;
      }
      if (stretchGainRef.current) {
        stretchGainRef.current.disconnect();
        stretchGainRef.current = null;
      }
      if (stretchLFOGainRef.current) {
        stretchLFOGainRef.current.disconnect();
        stretchLFOGainRef.current = null;
      }
    } catch {}
  }

  function playSnapSound() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;

      const crack1Size = Math.floor(ctx.sampleRate * 0.04);
      const crack1Buf = ctx.createBuffer(1, crack1Size, ctx.sampleRate);
      const crack1Data = crack1Buf.getChannelData(0);
      for (let i = 0; i < crack1Size; i++) crack1Data[i] = Math.random() * 2 - 1;
      const crack1 = ctx.createBufferSource();
      crack1.buffer = crack1Buf;
      const crack1Gain = ctx.createGain();
      crack1Gain.gain.setValueAtTime(0.5, now);
      crack1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      crack1.connect(crack1Gain);
      crack1Gain.connect(ctx.destination);
      crack1.start(now);
      crack1.stop(now + 0.04);

      const whip = ctx.createOscillator();
      whip.type = "sine";
      whip.frequency.setValueAtTime(400, now);
      whip.frequency.exponentialRampToValueAtTime(80, now + 0.1);
      const whipGain = ctx.createGain();
      whipGain.gain.setValueAtTime(0.3, now);
      whipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      whip.connect(whipGain);
      whipGain.connect(ctx.destination);
      whip.start(now);
      whip.stop(now + 0.1);

      const crack2Size = Math.floor(ctx.sampleRate * 0.03);
      const crack2Buf = ctx.createBuffer(1, crack2Size, ctx.sampleRate);
      const crack2Data = crack2Buf.getChannelData(0);
      for (let i = 0; i < crack2Size; i++) crack2Data[i] = Math.random() * 2 - 1;
      const crack2 = ctx.createBufferSource();
      crack2.buffer = crack2Buf;
      const crack2Gain = ctx.createGain();
      crack2Gain.gain.setValueAtTime(0.2, now + 0.05);
      crack2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      crack2.connect(crack2Gain);
      crack2Gain.connect(ctx.destination);
      crack2.start(now + 0.05);
      crack2.stop(now + 0.08);
    } catch {}
  }

  function playThudSound() {
    try {
      const ctx = getAudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(60, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  const fireSnap = useCallback(() => {
    playSnapSound();
    setShowFlash(true);
    setShowGlow(true);
    setBuckleScale(1.5);
    setTimeout(() => {
      setBuckleScale(1);
      setShowFlash(false);
      setTimeout(() => setShowGlow(false), 500);
    }, 120);
    onSnapRef.current?.();
  }, []);

  const finishDrag = useCallback((currentY: number) => {
    const triggered = currentY >= DRAG_THRESHOLD && !disabledRef.current;
    stopStretch();
    setBuckleY(0);
    setSvgY(0);
    setIsDragging(false);
    setFeedback({ text: "", pastThreshold: false });
    onDragEndRef.current?.();
    if (triggered) {
      fireSnap();
    } else if (currentY > 8) {
      playThudSound();
    }
  }, [fireSnap]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabledRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startYRef.current = e.clientY;
    activeRef.current = true;
    setIsDragging(true);
    setFeedback({ text: "", pastThreshold: false });
    startStretch();
    onDragStartRef.current?.();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeRef.current || disabledRef.current) return;
    const rawDelta = e.clientY - startYRef.current;
    const physical = getPhysicalDrag(Math.max(0, rawDelta));
    setBuckleY(physical);
    setSvgY(physical);
    setFeedback(getFeedback(physical));
    updateStretch(physical);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    const rawDelta = e.clientY - startYRef.current;
    const physical = getPhysicalDrag(Math.max(0, rawDelta));
    finishDrag(physical);
  }, [finishDrag]);

  const handlePointerCancel = useCallback(() => {
    if (!activeRef.current) return;
    activeRef.current = false;
    finishDrag(0);
  }, [finishDrag]);

  const strapHeight = Math.max(8, svgY);
  const stretchPercent = Math.min(svgY / MAX_DRAG, 1);
  const bowAmount = stretchPercent * 18;
  const strokeWidth = Math.max(3.5, 5 - stretchPercent * 1.5);

  const leftPath = `M 45 0 Q ${45 - bowAmount} ${strapHeight * 0.5} 75 ${strapHeight}`;
  const rightPath = `M 105 0 Q ${105 + bowAmount} ${strapHeight * 0.5} 75 ${strapHeight}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, paddingBottom: 40, minHeight: 260, position: "relative", userSelect: "none" }}>
      {showFlash && (
        <div
          className="snap-flash"
          style={{ position: "absolute", inset: 0, backgroundColor: "rgba(196,121,58,0.08)", zIndex: 20, pointerEvents: "none" }}
        />
      )}

      <div style={{ display: "flex", gap: 120, zIndex: 2 }}>
        <BrassClip />
        <BrassClip />
      </div>

      {svgY > 0 && (
        <svg
          width={150}
          height={strapHeight}
          viewBox={`0 0 150 ${strapHeight}`}
          style={{ overflow: "visible", display: "block" }}
        >
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#C4793A" stopOpacity="1" />
              <stop offset="1" stopColor="#8A5428" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path d={leftPath} stroke="url(#sg)" strokeWidth={strokeWidth} fill="none" />
          <path d={leftPath} stroke="#D4945A" strokeWidth={1} fill="none" strokeOpacity={0.2} />
          <path d={leftPath} stroke="#8A5428" strokeWidth={0.8} fill="none" strokeOpacity={0.5} strokeDasharray="3,4" />
          <path d={rightPath} stroke="url(#sg)" strokeWidth={strokeWidth} fill="none" />
          <path d={rightPath} stroke="#D4945A" strokeWidth={1} fill="none" strokeOpacity={0.2} />
          <path d={rightPath} stroke="#8A5428" strokeWidth={0.8} fill="none" strokeOpacity={0.5} strokeDasharray="3,4" />
        </svg>
      )}

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          marginTop: 4,
          cursor: disabled ? "not-allowed" : isDragging ? "grabbing" : "grab",
          transform: `translateY(${buckleY}px) scale(${buckleScale})`,
          transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          position: "relative",
          touchAction: "none",
        }}
      >
        {showGlow && (
          <div
            className="glow-pulse"
            style={{
              position: "absolute",
              width: 72, height: 72, borderRadius: "50%",
              border: "3px solid #FFD700",
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
        )}
        <div style={{
          width: 58, height: 58, borderRadius: "50%",
          border: "2.5px solid var(--brass)",
          backgroundColor: "var(--secondary)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 3px 8px rgba(0,0,0,0.5)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            width: 38, height: 38, borderRadius: "50%",
            border: "1px solid rgba(196,121,58,0.25)",
          }} />
          <span style={{ color: "var(--bourbon)", fontSize: 18, lineHeight: 1, position: "relative", zIndex: 1 }}>◆</span>
        </div>
      </div>

      {isDragging && feedback.text.length > 0 && (
        <span className="font-mono" style={{
          fontSize: 13, letterSpacing: 1, marginTop: 24, fontStyle: "italic",
          color: feedback.pastThreshold ? "var(--bourbon)" : "var(--smoke)",
        }}>
          {feedback.text}
        </span>
      )}

      {!isDragging && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 24 }}>
          <div style={{ width: 20, height: 1, backgroundColor: "var(--smoke)" }} />
          <span className="font-mono" style={{ fontSize: 10, color: "var(--smoke)", letterSpacing: 3 }}>PULL THE SUSPENDER</span>
          <div style={{ width: 20, height: 1, backgroundColor: "var(--smoke)" }} />
        </div>
      )}
    </div>
  );
}

function BrassClip() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--brass)", boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} />
      <div style={{ width: 20, height: 8, backgroundColor: "var(--brass)", marginTop: 2, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(245,237,224,0.4)" }} />
      </div>
    </div>
  );
}
