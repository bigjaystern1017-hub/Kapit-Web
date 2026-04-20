import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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

export default function SuspenderSnap({
  onSnap,
  onDragStart,
  onDragEnd,
  disabled = false,
}: Props) {
  const colors = useColors();

  const disabledRef = useRef(disabled);
  const onSnapRef = useRef(onSnap);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { onSnapRef.current = onSnap; }, [onSnap]);
  useEffect(() => { onDragStartRef.current = onDragStart; }, [onDragStart]);
  useEffect(() => { onDragEndRef.current = onDragEnd; }, [onDragEnd]);

  const [svgY, setSvgY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; pastThreshold: boolean }>({
    text: "",
    pastThreshold: false,
  });

  const translateY = useSharedValue(0);
  const buckleScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);
  const flashOpacity = useSharedValue(0);

  const fireHapticHeavy = useCallback(() => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }, []);

  const fireHapticSelection = useCallback(() => {
    if (Platform.OS !== "web") Haptics.selectionAsync();
  }, []);

  const fireSnapAnimations = useCallback(() => {
    flashOpacity.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 250 })
    );
    buckleScale.value = withSequence(
      withSpring(1.5, { damping: 6, stiffness: 400 }),
      withSpring(1, { damping: 8, stiffness: 300 })
    );
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 500 })
    );
    onSnapRef.current?.();
  }, []);

  const finishGesture = useCallback((triggered: boolean) => {
    setIsDragging(false);
    setFeedback({ text: "", pastThreshold: false });
    setSvgY(0);
    onDragEndRef.current?.();
    if (triggered) {
      fireHapticHeavy();
      fireSnapAnimations();
    }
  }, [fireHapticHeavy, fireSnapAnimations]);

  const pan = Gesture.Pan()
    .onBegin(() => {
      if (disabledRef.current) return;
      runOnJS(setIsDragging)(true);
      runOnJS(setFeedback)({ text: "", pastThreshold: false });
      if (onDragStartRef.current) runOnJS(onDragStartRef.current)();
    })
    .onChange((e) => {
      if (disabledRef.current) return;
      const physical = getPhysicalDrag(Math.max(0, e.translationY));
      translateY.value = physical;
      runOnJS(setSvgY)(physical);
      runOnJS(setFeedback)(getFeedback(physical));
      if (physical > DRAG_THRESHOLD) {
        runOnJS(fireHapticSelection)();
      }
    })
    .onEnd((e) => {
      const physical = getPhysicalDrag(Math.max(0, e.translationY));
      const triggered = physical >= DRAG_THRESHOLD && !disabledRef.current;
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      runOnJS(finishGesture)(triggered);
    })
    .onFinalize(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      runOnJS(setSvgY)(0);
      runOnJS(setIsDragging)(false);
      if (onDragEndRef.current) runOnJS(onDragEndRef.current)();
    });

  const buckleAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: buckleScale.value }],
  }));

  const glowRingStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const strapHeight = Math.max(8, svgY);
  const stretchPercent = Math.min(svgY / MAX_DRAG, 1);
  const bowAmount = stretchPercent * 18;
  const strokeWidth = Math.max(3.5, 5 - stretchPercent * 1.5);

  const leftPath = `M 45 0 Q ${45 - bowAmount} ${strapHeight * 0.5} 75 ${strapHeight}`;
  const rightPath = `M 105 0 Q ${105 + bowAmount} ${strapHeight * 0.5} 75 ${strapHeight}`;

  const s = styles(colors);

  return (
    <View style={s.container}>
      <Animated.View style={[s.flashOverlay, flashStyle]} pointerEvents="none" />

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

      <GestureDetector gesture={pan}>
        <Animated.View style={[s.buckleWrapper, buckleAnimStyle]}>
          <Animated.View
            style={[s.glowRing, glowRingStyle]}
            pointerEvents="none"
          />
          <View style={s.buckle}>
            <View style={s.innerRing} />
            <Text style={s.buckleSymbol}>◆</Text>
          </View>
        </Animated.View>
      </GestureDetector>

      {isDragging && feedback.text.length > 0 && (
        <Text
          style={[
            s.feedbackText,
            feedback.pastThreshold && { color: colors.bourbon },
          ]}
        >
          {feedback.text}
        </Text>
      )}

      {!isDragging && (
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
      marginTop: 4,
      cursor: "grab" as any,
    },
    glowRing: {
      position: "absolute",
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 3,
      borderColor: "#FFD700",
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
