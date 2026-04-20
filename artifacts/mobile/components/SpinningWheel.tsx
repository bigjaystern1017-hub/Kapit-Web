import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Factoid } from "@/context/KapitContext";
import { getCategoryLabel } from "./LocationSelector";

const TEASERS = [
  "No one asked, but...",
  "The past called...",
  "Brace yourself, darling...",
  "You didn't hear this from me...",
  "History is insufferable...",
  "Somebody had to know...",
  "Consider yourself warned...",
];

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
  const slideAnim = useRef(new Animated.Value(20)).current;
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    if (!isSpinning) {
      setRevealed(false);
      setDisplayText("");
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
      return;
    }

    setRevealed(false);
    tickRef.current = 0;

    const spin = () => {
      const tick = tickRef.current;
      if (tick < TEASERS.length) {
        setDisplayText(TEASERS[tick % TEASERS.length]);
        tickRef.current++;
        const delay = 70 * Math.pow(1.28, tick);
        intervalRef.current = setTimeout(spin, delay);
      } else {
        if (factoid) {
          setDisplayText(factoid.factoid);
          setRevealed(true);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onRevealComplete();
          });
        }
      }
    };

    intervalRef.current = setTimeout(spin, 70);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isSpinning, factoid]);

  const s = styles(colors);

  if (!isSpinning && !revealed) return null;

  return (
    <View style={s.container}>
      <View style={s.doubleRuleTop}>
        <View style={s.rule} />
        <View style={[s.rule, { marginTop: 2 }]} />
      </View>

      {!revealed && (
        <View style={s.spinnerBox}>
          <Text style={s.spinnerText}>{displayText}</Text>
        </View>
      )}

      {revealed && factoid && (
        <Animated.View
          style={[
            s.factoidCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={s.cardHeader}>
            <Text style={s.categoryLabel}>{getCategoryLabel(factoid.category)}</Text>
            <View style={s.dot} />
            <Text style={s.yearLabel}>{factoid.year}</Text>
          </View>

          <View style={s.locationRow}>
            <Text style={s.locationText}>◆ {factoid.location}</Text>
          </View>

          <View style={s.rule} />

          <View style={s.factoidBody}>
            <Text style={s.dropCap}>{factoid.factoid.charAt(0)}</Text>
            <Text style={s.factoidText}>{factoid.factoid.slice(1)}</Text>
          </View>

          <View style={s.doubleRuleBottom}>
            <View style={s.rule} />
            <View style={[s.rule, { marginTop: 2 }]} />
          </View>

          <View style={s.yourMoveSection}>
            <Text style={s.yourMoveLabel}>YOUR MOVE</Text>
            <Text style={s.yourMoveText}>
              {getConversationOpener(factoid)}
            </Text>
          </View>
        </Animated.View>
      )}

      <View style={s.doubleRuleBottom}>
        <View style={s.rule} />
        <View style={[s.rule, { marginTop: 2 }]} />
      </View>
    </View>
  );
}

function getConversationOpener(factoid: Factoid): string {
  const openers: Record<string, string> = {
    crime: `"You know, the most interesting criminals in history never got caught — they got celebrated."`,
    science: `"There's a fact about this neighborhood that would make your physics professor cry into their coffee."`,
    culture: `"The cultural history of this block is, frankly, more interesting than anything you'll read this week."`,
    politics: `"Politicians here used to be genuinely colorful. Now they're just... loud."`,
    sports: `"Athletic achievement used to mean something very different right here."`,
    weird: `"If I told you what happened here, you wouldn't believe me. But I have a source."`,
    food: `"The culinary history of this exact spot is the reason I will never apologize for ordering the expensive thing."`,
    architecture: `"The building you're standing near has a past that the architects would very much prefer you didn't know."`,
    nature: `"Nature has been absolutely unhinged in this neighborhood. Let me explain."`,
  };
  return openers[factoid.category] ?? `"The history here is, frankly, more interesting than most people."`;
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      marginTop: 8,
    },
    rule: {
      height: 1,
      backgroundColor: colors.border,
    },
    doubleRuleTop: {
      marginBottom: 20,
    },
    doubleRuleBottom: {
      marginTop: 16,
      marginBottom: 0,
    },
    spinnerBox: {
      minHeight: 80,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 20,
    },
    spinnerText: {
      fontFamily: "Courier",
      fontSize: 16,
      color: colors.blush,
      letterSpacing: 1,
      fontStyle: "italic",
      textAlign: "center",
    },
    factoidCard: {
      backgroundColor: colors.card,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
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
    dot: {
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
      marginBottom: 12,
    },
    locationText: {
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.cream,
      letterSpacing: 1,
    },
    factoidBody: {
      flexDirection: "row",
      marginTop: 12,
      marginBottom: 4,
      flexWrap: "wrap",
    },
    dropCap: {
      fontSize: 48,
      lineHeight: 48,
      color: colors.bourbon,
      fontFamily: "Courier",
      fontWeight: "bold" as const,
      marginRight: 4,
      marginTop: -4,
      float: "left",
    } as any,
    factoidText: {
      fontFamily: "Courier",
      fontSize: 14,
      lineHeight: 22,
      color: colors.cream,
      flex: 1,
      flexShrink: 1,
    },
    yourMoveSection: {
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    yourMoveLabel: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 3,
      color: colors.bourbon,
      marginBottom: 6,
    },
    yourMoveText: {
      fontFamily: "Courier",
      fontSize: 13,
      color: colors.smoke,
      lineHeight: 20,
      fontStyle: "italic",
    },
  });
