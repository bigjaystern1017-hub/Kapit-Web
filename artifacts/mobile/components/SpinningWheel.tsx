import React, { useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";

import type { Factoid } from "@/context/KapitContext";
import { useColors } from "@/hooks/useColors";

const TEASERS = [
  "No one asked, but\u2026",
  "The past called\u2026",
  "Brace yourself, darling\u2026",
  "You didn't hear this from me\u2026",
  "History is insufferable\u2026",
  "Somebody had to know\u2026",
  "Consider yourself warned\u2026",
];

const CATEGORY_LABELS: Record<string, string> = {
  crime: "CRIME",
  science: "SCIENCE",
  culture: "CULTURE",
  politics: "POLITICS",
  sports: "ATHLETICS",
  weird: "PECULIAR",
  food: "DINING",
  architecture: "EDIFICE",
  nature: "NATURE",
};

export function getCategoryLabel(cat: string): string {
  return CATEGORY_LABELS[cat] ?? cat.toUpperCase();
}

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "'Playfair Display', Georgia, serif",
});

interface Props {
  factoid: Factoid | null;
  isSpinning: boolean;
  onRevealComplete: () => void;
}

export default function SpinningWheel({ factoid, isSpinning, onRevealComplete }: Props) {
  const colors = useColors();
  const [displayText, setDisplayText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;
  const scaleAnim = useRef(new Animated.Value(0.97)).current;
  const dot1Anim = useRef(new Animated.Value(0.3)).current;
  const dot2Anim = useRef(new Animated.Value(0.6)).current;
  const dot3Anim = useRef(new Animated.Value(1.0)).current;
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dotLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!isSpinning) {
      setRevealed(false);
      setDisplayText("");
      fadeAnim.setValue(0);
      slideAnim.setValue(16);
      scaleAnim.setValue(0.97);
      dot1Anim.setValue(0.3);
      dot2Anim.setValue(0.6);
      dot3Anim.setValue(1.0);
      if (dotLoopRef.current) dotLoopRef.current.stop();
      return;
    }

    setRevealed(false);
    tickRef.current = 0;

    dotLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1Anim, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 0.6, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1.0, duration: 300, useNativeDriver: true }),
      ])
    );
    dotLoopRef.current.start();

    const spin = () => {
      const tick = tickRef.current;
      if (tick < TEASERS.length) {
        setDisplayText(TEASERS[tick % TEASERS.length]);
        tickRef.current++;
        const delay = 70 * Math.pow(1.28, tick);
        intervalRef.current = setTimeout(spin, delay);
      } else {
        if (dotLoopRef.current) dotLoopRef.current.stop();
        if (factoid) {
          setDisplayText(factoid.factoid);
          setRevealed(true);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              useNativeDriver: true,
              tension: 200,
              friction: 10,
            }),
          ]).start(() => onRevealComplete());
        }
      }
    };

    intervalRef.current = setTimeout(spin, 70);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (dotLoopRef.current) dotLoopRef.current.stop();
    };
  }, [isSpinning, factoid]);

  const s = styles(colors);

  if (!isSpinning && !revealed) return null;

  return (
    <View style={s.container}>
      <View style={s.doubleRuleTop}>
        <View style={s.ruleThick} />
        <View style={{ height: 3 }} />
        <View style={[s.ruleThin, { opacity: 0.4 }]} />
      </View>

      {!revealed && (
        <View style={s.spinnerBox}>
          <Text style={s.spinnerText}>{displayText}</Text>
          <View style={s.dotsRow}>
            <Animated.View style={[s.dot, { opacity: dot1Anim }]} />
            <Animated.View style={[s.dot, { opacity: dot2Anim }]} />
            <Animated.View style={[s.dot, { opacity: dot3Anim }]} />
          </View>
        </View>
      )}

      {revealed && factoid && (
        <Animated.View
          style={[
            s.factoidCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          <View style={s.cummerbundStripe} />

          <View style={s.cardInner}>
            <View style={s.cardHeader}>
              <Text style={s.categoryLabel}>{getCategoryLabel(factoid.category)}</Text>
              <View style={s.headerDot} />
              <Text style={s.yearLabel}>{factoid.year}</Text>
            </View>

            <View style={s.locationRow}>
              <Text style={s.locationText}>◆ {factoid.location}</Text>
            </View>

            <View style={s.ruleDivider} />

            <View style={s.factoidBody}>
              <Text style={s.dropCap}>{factoid.factoid.charAt(0)}</Text>
              <Text style={s.factoidText}>{factoid.factoid.slice(1)}</Text>
            </View>

            <View style={s.doubleRuleInner}>
              <View style={s.ruleThick} />
              <View style={{ height: 3 }} />
              <View style={[s.ruleThin, { backgroundColor: colors.borderSubtle }]} />
            </View>

            <View style={s.yourMoveSection}>
              <Text style={s.yourMoveLabel}>YOUR MOVE</Text>
              <Text style={s.yourMoveText}>{getConversationOpener(factoid)}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      <View style={s.doubleRuleBottom}>
        <View style={s.ruleThick} />
        <View style={{ height: 3 }} />
        <View style={[s.ruleThin, { opacity: 0.4 }]} />
      </View>
    </View>
  );
}

function getConversationOpener(factoid: Factoid): string {
  const openers: Record<string, string> = {
    crime: `\u201cThe most interesting criminals in history never got caught \u2014 they got celebrated.\u201d`,
    science: `\u201cThere\u2019s a fact about this neighborhood that would make your physics professor cry into their coffee.\u201d`,
    culture: `\u201cThe cultural history of this block is, frankly, more interesting than anything you\u2019ll read this week.\u201d`,
    politics: `\u201cPoliticians here used to be genuinely colorful. Now they\u2019re just\u2026 loud.\u201d`,
    sports: `\u201cAthletic achievement used to mean something very different right here.\u201d`,
    weird: `\u201cIf I told you what happened here, you wouldn\u2019t believe me. But I have a source.\u201d`,
    food: `\u201cThe culinary history of this exact spot is the reason I will never apologize for ordering the expensive thing.\u201d`,
    architecture: `\u201cThe building you\u2019re standing near has a past that the architects would very much prefer you didn\u2019t know.\u201d`,
    nature: `\u201cNature has been absolutely unhinged in this neighborhood. Let me explain.\u201d`,
  };
  return openers[factoid.category] ?? `\u201cThe history here is, frankly, more interesting than most people.\u201d`;
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginTop: 8,
    },
    ruleThick: {
      height: 2,
      backgroundColor: colors.border,
    },
    ruleThin: {
      height: 1,
      backgroundColor: colors.border,
    },
    ruleDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 12,
    },
    doubleRuleTop: {
      marginBottom: 20,
    },
    doubleRuleBottom: {
      marginTop: 16,
    },
    spinnerBox: {
      minHeight: 80,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
      gap: 16,
    },
    spinnerText: {
      fontFamily: serifFont,
      fontSize: 17,
      color: colors.blush,
      fontStyle: "italic",
      textAlign: "center",
    },
    dotsRow: {
      flexDirection: "row",
      gap: 8,
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.bourbon,
    },
    factoidCard: {
      backgroundColor: colors.cardElevated,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    cummerbundStripe: {
      height: 3,
      backgroundColor: colors.powderBlue,
    },
    cardInner: {
      padding: 20,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    categoryLabel: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 3,
      color: colors.powderBlue,
    },
    headerDot: {
      width: 4,
      height: 4,
      backgroundColor: colors.smoke,
    },
    yearLabel: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.smoke,
    },
    locationRow: {
      marginBottom: 4,
    },
    locationText: {
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.creamMuted,
      letterSpacing: 1,
    },
    factoidBody: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 4,
    },
    dropCap: {
      fontSize: 52,
      lineHeight: 50,
      color: colors.bourbon,
      fontFamily: serifFont,
      marginRight: 6,
      marginTop: -2,
    } as any,
    factoidText: {
      fontFamily: serifFont,
      fontSize: 18,
      lineHeight: 30,
      color: colors.textPrimary,
      flex: 1,
      flexShrink: 1,
    },
    doubleRuleInner: {
      marginTop: 16,
      marginBottom: 0,
    },
    yourMoveSection: {
      paddingTop: 14,
    },
    yourMoveLabel: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 3,
      color: colors.bourbon,
      marginBottom: 6,
    },
    yourMoveText: {
      fontFamily: serifFont,
      fontSize: 14,
      color: colors.smoke,
      lineHeight: 22,
      fontStyle: "italic",
    },
  });
