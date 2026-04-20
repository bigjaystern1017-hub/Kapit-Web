import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

const DRAG_THRESHOLD = 60;
const MAX_DRAG = 200;

interface Props {
  onSnap: () => void;
  disabled?: boolean;
}

const FEEDBACK_MESSAGES = [
  "pull it.",
  "a little further...",
  "getting there, darling...",
  "let go. ↑",
  "oh, you mean business.",
];

function getFeedback(dragY: number): string {
  if (dragY < 20) return "pull it.";
  if (dragY < 60) return "a little further...";
  if (dragY < 100) return "getting there, darling...";
  if (dragY < 150) return "let go. ↑";
  return "oh, you mean business.";
}

export default function SuspenderSnap({ onSnap, disabled = false }: Props) {
  const colors = useColors();
  const dragY = useRef(new Animated.Value(0)).current;
  const dragYValue = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState("pull it.");
  const [snapping, setSnapping] = useState(false);
  const buckleScale = useRef(new Animated.Value(1)).current;
  const buckleGlow = useRef(new Animated.Value(0)).current;

  const snapBack = useCallback(
    (triggeredSnap: boolean) => {
      setSnapping(true);
      Animated.spring(dragY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 300,
        friction: 7,
        velocity: -dragYValue.current * 0.5,
      }).start(() => {
        setSnapping(false);
        setIsDragging(false);
        setFeedback("pull it.");
        dragYValue.current = 0;
      });

      if (triggeredSnap) {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        Animated.sequence([
          Animated.parallel([
            Animated.spring(buckleScale, {
              toValue: 1.4,
              useNativeDriver: true,
              tension: 400,
              friction: 6,
            }),
            Animated.timing(buckleGlow, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.spring(buckleScale, {
              toValue: 1,
              useNativeDriver: true,
              tension: 300,
              friction: 8,
            }),
            Animated.timing(buckleGlow, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
        onSnap();
      }
    },
    [dragY, buckleScale, buckleGlow, onSnap]
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        setIsDragging(true);
        setFeedback("pull it.");
      },
      onPanResponderMove: (_, gs) => {
        const clampedY = Math.max(0, Math.min(gs.dy, MAX_DRAG));
        dragYValue.current = clampedY;
        dragY.setValue(clampedY);
        setFeedback(getFeedback(clampedY));
        if (clampedY > DRAG_THRESHOLD && Platform.OS !== "web") {
          Haptics.selectionAsync();
        }
      },
      onPanResponderRelease: (_, gs) => {
        const triggered = gs.dy >= DRAG_THRESHOLD;
        snapBack(triggered);
      },
      onPanResponderTerminate: () => {
        snapBack(false);
      },
    })
  ).current;

  const strapProgress = dragY.interpolate({
    inputRange: [0, MAX_DRAG],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const strapWidth = strapProgress.interpolate
    ? strapProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [12, 4],
      })
    : new Animated.Value(12);

  const strapColor = dragY.interpolate({
    inputRange: [0, DRAG_THRESHOLD, MAX_DRAG],
    outputRange: [colors.bourbon, colors.blush, colors.cream],
    extrapolate: "clamp",
  });

  const buckleGlowColor = buckleGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bourbon, "#FFD700"],
  });

  const s = styles(colors);

  return (
    <View style={s.container}>
      <View style={s.clipsRow}>
        <View style={s.clip}>
          <View style={s.clipTop} />
          <View style={s.clipBody} />
        </View>
        <View style={s.clip}>
          <View style={s.clipTop} />
          <View style={s.clipBody} />
        </View>
      </View>

      <View style={s.strapsContainer}>
        <Animated.View
          style={[
            s.strap,
            {
              width: strapWidth,
              backgroundColor: strapColor,
              height: dragY,
            },
          ]}
        />
        <Animated.View
          style={[
            s.strap,
            {
              width: strapWidth,
              backgroundColor: strapColor,
              height: dragY,
            },
          ]}
        />
      </View>

      <Animated.View
        style={[
          s.buckleWrapper,
          {
            transform: [
              { translateY: dragY },
              { scale: buckleScale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            s.buckle,
            {
              borderColor: buckleGlowColor,
              backgroundColor: buckleGlow.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.secondary, "#3A2800"],
              }),
            },
          ]}
        >
          <Animated.View
            style={[
              s.buckleCenter,
              { backgroundColor: buckleGlowColor },
            ]}
          />
          <View style={s.buckleHorizontal} />
        </Animated.View>
      </Animated.View>

      {(isDragging || snapping) && (
        <Text style={s.feedbackText}>{feedback}</Text>
      )}

      {!isDragging && !snapping && (
        <Text style={s.hintText}>PULL TO REVEAL</Text>
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
    },
    clipsRow: {
      flexDirection: "row",
      gap: 60,
      marginBottom: 0,
      zIndex: 2,
    },
    clip: {
      alignItems: "center",
    },
    clipTop: {
      width: 24,
      height: 6,
      backgroundColor: colors.bourbon,
    },
    clipBody: {
      width: 16,
      height: 10,
      backgroundColor: colors.bourbon,
      marginTop: 1,
    },
    strapsContainer: {
      flexDirection: "row",
      gap: 60,
      alignItems: "flex-start",
    },
    strap: {
      width: 12,
      minHeight: 0,
      backgroundColor: colors.bourbon,
    },
    buckleWrapper: {
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
      cursor: "grab",
    },
    buckle: {
      width: 64,
      height: 48,
      borderWidth: 2,
      borderColor: colors.bourbon,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    buckleCenter: {
      width: 20,
      height: 20,
      backgroundColor: colors.bourbon,
      position: "absolute",
    },
    buckleHorizontal: {
      position: "absolute",
      width: "100%",
      height: 2,
      backgroundColor: colors.bourbon + "88",
    },
    feedbackText: {
      fontFamily: "Courier",
      fontSize: 13,
      color: colors.blush,
      letterSpacing: 2,
      marginTop: 24,
      fontStyle: "italic",
    },
    hintText: {
      fontFamily: "Courier",
      fontSize: 10,
      color: colors.smoke,
      letterSpacing: 3,
      marginTop: 24,
    },
  });
