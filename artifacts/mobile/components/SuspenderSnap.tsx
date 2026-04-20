import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import { useColors } from "@/hooks/useColors";

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

function BrassClip({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: colors.brass,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
          elevation: 3,
        }}
      />
      <View
        style={{
          width: 20,
          height: 8,
          backgroundColor: colors.brass,
          marginTop: 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: "rgba(245,237,224,0.4)",
          }}
        />
      </View>
    </View>
  );
}

export default function SuspenderSnap({ onSnap, onDragStart, onDragEnd, disabled = false }: Props) {
  const colors = useColors();
  const disabledRef = useRef(disabled);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  const [svgY, setSvgY] = useState(0);
  const dragY = useRef(new Animated.Value(0)).current;
  const buckleScale = useRef(new Animated.Value(1)).current;
  const buckleGlow = useRef(new Animated.Value(0)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; pastThreshold: boolean }>({
    text: "",
    pastThreshold: false,
  });
  const [snapping, setSnapping] = useState(false);

  useEffect(() => {
    const id = dragY.addListener(({ value }) => setSvgY(Math.max(0, value)));
    return () => dragY.removeListener(id);
  }, [dragY]);

  const snapBack = useCallback(
    (triggeredSnap: boolean) => {
      setSnapping(true);
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 7,
      }).start(() => {
        setSnapping(false);
        setIsDragging(false);
        setFeedback({ text: "", pastThreshold: false });
        setSvgY(0);
      });

      if (triggeredSnap) {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
          Animated.timing(flashAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();
        Animated.sequence([
          Animated.spring(buckleScale, {
            toValue: 1.5,
            useNativeDriver: true,
            tension: 400,
            friction: 5,
          }),
          Animated.spring(buckleScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }),
        ]).start();
        Animated.sequence([
          Animated.timing(buckleGlow, { toValue: 1, duration: 100, useNativeDriver: true }),
          Animated.timing(buckleGlow, { toValue: 0, duration: 500, useNativeDriver: true }),
        ]).start();
        onSnap();
      }
    },
    [dragY, buckleScale, buckleGlow, flashAnim, onSnap]
  );

  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  useEffect(() => { onDragStartRef.current = onDragStart; }, [onDragStart]);
  useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        if (disabledRef.current) return;
        setIsDragging(true);
        setFeedback({ text: "", pastThreshold: false });
        onDragStartRef.current?.();
      },
      onPanResponderMove: (_, gs) => {
        if (disabledRef.current) return;
        const physical = getPhysicalDrag(Math.max(0, gs.dy));
        dragY.setValue(physical);
        setFeedback(getFeedback(physical));
        if (physical > DRAG_THRESHOLD && Platform.OS !== "web") {
          Haptics.selectionAsync();
        }
      },
      onPanResponderRelease: (_, gs) => {
        onDragEndRef.current?.();
        if (disabledRef.current) { snapBack(false); return; }
        const physical = getPhysicalDrag(Math.max(0, gs.dy));
        const triggered = physical >= DRAG_THRESHOLD;
        snapBack(triggered);
      },
      onPanResponderTerminate: () => {
        onDragEndRef.current?.();
        snapBack(false);
      },
    })
  ).current;

  const strapHeight = Math.max(8, svgY);
  const stretchPercent = Math.min(svgY / MAX_DRAG, 1);
  const bowAmount = stretchPercent * 18;
  const strokeWidth = Math.max(3.5, 5 - stretchPercent * 1.5);

  const leftPath = `M 45 0 Q ${45 - bowAmount} ${strapHeight * 0.5} 75 ${strapHeight}`;
  const rightPath = `M 105 0 Q ${105 + bowAmount} ${strapHeight * 0.5} 75 ${strapHeight}`;

  const buckleGlowColor = buckleGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.brass, "#FFD700"],
  });

  const s = styles(colors);

  return (
    <View style={s.container}>
      <Animated.View
        style={[s.flashOverlay, { opacity: flashAnim }]}
        pointerEvents="none"
      />

      <View style={s.clipsRow}>
        <BrassClip colors={colors} />
        <BrassClip colors={colors} />
      </View>

      {svgY > 0 && (
        <Svg
          width={150}
          height={strapHeight}
          viewBox={`0 0 150 ${strapHeight}`}
          style={{ overflow: "visible" }}
        >
          <Defs>
            <SvgLinearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.bourbon} stopOpacity="1" />
              <Stop offset="1" stopColor={colors.bourbonDark} stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          <Path d={leftPath} stroke="url(#sg)" strokeWidth={strokeWidth} fill="none" />
          <Path
            d={leftPath}
            stroke={colors.bourbonLight}
            strokeWidth={1}
            fill="none"
            strokeOpacity={0.2}
          />
          <Path
            d={leftPath}
            stroke={colors.bourbonDark}
            strokeWidth={0.8}
            fill="none"
            strokeOpacity={0.5}
            strokeDasharray="3,4"
          />
          <Path d={rightPath} stroke="url(#sg)" strokeWidth={strokeWidth} fill="none" />
          <Path
            d={rightPath}
            stroke={colors.bourbonLight}
            strokeWidth={1}
            fill="none"
            strokeOpacity={0.2}
          />
          <Path
            d={rightPath}
            stroke={colors.bourbonDark}
            strokeWidth={0.8}
            fill="none"
            strokeOpacity={0.5}
            strokeDasharray="3,4"
          />
        </Svg>
      )}

      <View onStartShouldSetResponderCapture={() => true}>
      <Animated.View
        style={[
          s.buckleWrapper,
          {
            transform: [{ translateY: dragY }, { scale: buckleScale }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[s.glowRing, { borderColor: buckleGlowColor }]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            s.buckle,
            {
              borderColor: buckleGlowColor,
              backgroundColor: buckleGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.secondary, "#2A1800"],
              }),
            },
          ]}
        >
          <View style={s.innerRing} />
          <Text style={s.buckleSymbol}>◆</Text>
        </Animated.View>
      </Animated.View>
      </View>

      {(isDragging || snapping) && feedback.text.length > 0 && (
        <Text
          style={[
            s.feedbackText,
            feedback.pastThreshold && { color: colors.bourbon },
          ]}
        >
          {feedback.text}
        </Text>
      )}

      {!isDragging && !snapping && (
        <View style={s.hintRow}>
          <View style={s.hintRule} />
          <Text style={s.hintText}>PULL THE SUSPENDER</Text>
          <View style={s.hintRule} />
        </View>
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      alignItems: "center",
      paddingTop: 20,
      paddingBottom: 40,
      minHeight: 260,
      position: "relative",
    },
    flashOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(196,121,58,0.08)",
      zIndex: 20,
    },
    clipsRow: {
      flexDirection: "row",
      gap: 120,
      zIndex: 2,
    },
    buckleWrapper: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      cursor: "grab" as any,
      marginTop: 4,
    },
    glowRing: {
      position: "absolute",
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      zIndex: -1,
    },
    buckle: {
      width: 58,
      height: 58,
      borderRadius: 29,
      borderWidth: 2.5,
      borderColor: colors.brass,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    innerRing: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: "rgba(196,121,58,0.25)",
      position: "absolute",
    },
    buckleSymbol: {
      color: colors.bourbon,
      fontSize: 18,
      lineHeight: 22,
    },
    feedbackText: {
      fontFamily: "Courier",
      fontSize: 13,
      color: colors.smoke,
      letterSpacing: 1,
      marginTop: 24,
      fontStyle: "italic",
    },
    hintRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 24,
    },
    hintRule: {
      width: 20,
      height: 1,
      backgroundColor: colors.smoke,
    },
    hintText: {
      fontFamily: "Courier",
      fontSize: 10,
      color: colors.smoke,
      letterSpacing: 3,
    },
  });
