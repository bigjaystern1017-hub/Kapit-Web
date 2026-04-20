import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LocationSelector from "@/components/LocationSelector";
import Repertoire from "@/components/Repertoire";
import SpinningWheel from "@/components/SpinningWheel";
import SuspenderSnap from "@/components/SuspenderSnap";
import { useKapit } from "@/context/KapitContext";
import { useColors } from "@/hooks/useColors";

const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "'Playfair Display', Georgia, serif",
});

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    selectedLocation,
    factoids,
    isLoading,
    error,
    fetchFactoids,
    getCurrentFactoid,
    advanceFactoidIndex,
    addToRepertoire,
    repertoire,
  } = useKapit();

  const [phase, setPhase] = useState<"idle" | "loading" | "spinning" | "revealed">("idle");
  const [locationSelected, setLocationSelected] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleLocationSelected = () => {
    setLocationSelected(true);
    setPhase("idle");
  };

  const handleSnap = useCallback(async () => {
    if (!selectedLocation) return;
    if (phase === "loading") return;

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    if (factoids.length === 0) {
      setPhase("loading");
      await fetchFactoids();
      setPhase("spinning");
    } else {
      advanceFactoidIndex();
      setPhase("spinning");
    }

    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 400, animated: true });
    }, 200);
  }, [selectedLocation, phase, factoids.length, fetchFactoids, advanceFactoidIndex]);

  const handleRevealComplete = useCallback(() => {
    setPhase("revealed");
    const f = getCurrentFactoid();
    if (f) addToRepertoire(f);
  }, [getCurrentFactoid, addToRepertoire]);

  const s = styles(colors);
  const currentFactoid = getCurrentFactoid();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[s.root, { backgroundColor: colors.warmBlack }]}>
      {/* Wood-panel edge strips */}
      <View style={s.edgeLeft} />
      <View style={s.edgeRight} />

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Masthead */}
        <View style={s.mastheadArea}>
          <Text style={s.mastheadOverline}>A Gentleman&apos;s Companion</Text>

          <Text style={s.mastheadTitle}>KAPIT</Text>

          <Text style={s.tagline}>
            Yes, yes you are about to be the most interesting person in any room
          </Text>
          <Text style={s.taglineAccent}>with a wi-fi signal.</Text>

          <View style={s.decorativeDoubleRule}>
            <View style={s.doubleRuleThick} />
            <View style={{ height: 3 }} />
            <View style={s.doubleRuleThin} />
          </View>

          <View style={s.cummerbundAccent} />
        </View>

        <View style={s.section}>
          <LocationSelector onLocationSelected={handleLocationSelected} />
        </View>

        {locationSelected && (
          <View style={s.snapZone}>
            <View style={s.snapZoneHeader}>
              <View style={s.rule} />
              <Text style={s.snapZoneLabel}>THE SNAP</Text>
              <View style={s.rule} />
            </View>

            {isLoading && phase === "loading" && (
              <View style={s.loadingBox}>
                <ActivityIndicator color={colors.bourbon} size="large" />
                <Text style={s.loadingText}>digging through the archives\u2026</Text>
              </View>
            )}

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
                <TouchableOpacity
                  style={s.retryButton}
                  onPress={() => fetchFactoids()}
                  activeOpacity={0.7}
                >
                  <Text style={s.retryButtonText}>TRY AGAIN</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase !== "loading" && !error && (
              <SuspenderSnap
                onSnap={handleSnap}
                disabled={isLoading || !selectedLocation}
              />
            )}

            {phase === "revealed" && (
              <View style={s.pullAgainRow}>
                <View style={s.pullAgainRule} />
                <TouchableOpacity
                  onPress={() => {
                    advanceFactoidIndex();
                    setPhase("spinning");
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={s.pullAgainText}>PULL AGAIN FOR ANOTHER</Text>
                </TouchableOpacity>
                <View style={s.pullAgainRule} />
              </View>
            )}
          </View>
        )}

        {(phase === "spinning" || phase === "revealed") && (
          <SpinningWheel
            factoid={currentFactoid}
            isSpinning={phase === "spinning"}
            onRevealComplete={handleRevealComplete}
          />
        )}

        <Repertoire repertoire={repertoire} />

        <View style={s.footer}>
          <Text style={s.footerBrand}>KAPIT</Text>
          <Text style={s.footerTagline}>Be Insufferable, Everywhere\u2122</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    root: {
      flex: 1,
      position: "relative",
    },
    edgeLeft: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: 5,
      backgroundColor: "#2A1F14",
      borderRightWidth: 1,
      borderRightColor: "rgba(196,121,58,0.06)",
      zIndex: 10,
    },
    edgeRight: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: 5,
      backgroundColor: "#2A1F14",
      borderLeftWidth: 1,
      borderLeftColor: "rgba(196,121,58,0.06)",
      zIndex: 10,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: 8,
    },
    mastheadArea: {
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 20,
      paddingTop: 8,
    },
    mastheadOverline: {
      fontFamily: "Courier",
      fontSize: 9,
      letterSpacing: 6,
      color: colors.smokeMuted,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    mastheadTitle: {
      fontFamily: serifFont,
      fontSize: 64,
      letterSpacing: 12,
      color: colors.cream,
      textShadowColor: "#000000",
      textShadowOffset: { width: 1, height: 2 },
      textShadowRadius: 8,
      marginBottom: 8,
    },
    tagline: {
      fontFamily: serifFont,
      fontSize: 13,
      color: colors.smoke,
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 20,
      fontStyle: "italic",
    },
    taglineAccent: {
      fontFamily: serifFont,
      fontSize: 13,
      color: colors.powderBlue,
      textAlign: "center",
      marginTop: 2,
      marginBottom: 14,
      fontStyle: "italic",
    },
    decorativeDoubleRule: {
      width: 140,
      marginBottom: 10,
    },
    doubleRuleThick: {
      height: 2,
      backgroundColor: colors.bourbon,
    },
    doubleRuleThin: {
      height: 1,
      backgroundColor: colors.bourbon,
      opacity: 0.3,
    },
    cummerbundAccent: {
      width: 60,
      height: 3,
      backgroundColor: colors.powderBlue,
      opacity: 0.6,
      marginBottom: 4,
    },
    section: {
      marginBottom: 8,
    },
    snapZone: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      marginTop: 8,
    },
    snapZoneHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    rule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    snapZoneLabel: {
      fontFamily: "Courier",
      fontSize: 11,
      letterSpacing: 3,
      color: colors.smoke,
    },
    loadingBox: {
      alignItems: "center",
      paddingVertical: 40,
      gap: 16,
    },
    loadingText: {
      fontFamily: serifFont,
      fontSize: 14,
      color: colors.smoke,
      fontStyle: "italic",
    },
    errorBox: {
      borderWidth: 1,
      borderColor: colors.destructive,
      padding: 16,
      marginBottom: 16,
      gap: 10,
    },
    errorText: {
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.destructive,
      textAlign: "center",
    },
    retryButton: {
      backgroundColor: colors.destructive,
      paddingVertical: 10,
      alignItems: "center",
    },
    retryButtonText: {
      fontFamily: "Courier",
      fontSize: 11,
      letterSpacing: 3,
      color: colors.cream,
    },
    pullAgainRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 12,
      paddingHorizontal: 4,
    },
    pullAgainRule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    pullAgainText: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 3,
      color: colors.smoke,
    },
    footer: {
      paddingVertical: 28,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 24,
      marginHorizontal: 20,
      gap: 4,
    },
    footerBrand: {
      fontFamily: "Courier",
      fontSize: 11,
      letterSpacing: 6,
      color: colors.border,
    },
    footerTagline: {
      fontFamily: serifFont,
      fontSize: 12,
      color: colors.smokeMuted,
      fontStyle: "italic",
    },
  });
