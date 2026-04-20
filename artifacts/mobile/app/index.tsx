import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={[
          s.content,
          { paddingTop: topPad + 20, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.masthead}>
          <View style={s.mastheadRule} />
          <Text style={s.mastheadTitle}>KAPIT</Text>
          <View style={s.mastheadRule} />
        </View>

        <Text style={s.tagline}>
          Yes, yes you are about to be the most interesting person in any room...
        </Text>
        <Text style={s.taglineAccent}>with a wi-fi signal.</Text>

        <View style={s.powderBlueStripe} />

        <View style={s.section}>
          <LocationSelector onLocationSelected={handleLocationSelected} />
        </View>

        {locationSelected && (
          <View style={s.snapZone}>
            <View style={s.snapZoneHeader}>
              <View style={s.rule} />
              <Text style={s.snapZoneLabel}>SNAP ZONE</Text>
              <View style={s.rule} />
            </View>

            {isLoading && phase === "loading" && (
              <View style={s.loadingBox}>
                <ActivityIndicator color={colors.bourbon} size="large" />
                <Text style={s.loadingText}>consulting the archives...</Text>
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
              <TouchableOpacity
                style={s.pullAgainButton}
                onPress={() => {
                  advanceFactoidIndex();
                  setPhase("spinning");
                }}
                activeOpacity={0.8}
              >
                <Text style={s.pullAgainText}>PULL AGAIN</Text>
              </TouchableOpacity>
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
          <Text style={s.footerText}>Be Insufferable, Everywhere™</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
    },
    masthead: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      marginBottom: 12,
      gap: 16,
    },
    mastheadRule: {
      flex: 1,
      height: 2,
      backgroundColor: colors.bourbon,
    },
    mastheadTitle: {
      fontFamily: "Courier",
      fontSize: 36,
      fontWeight: "bold" as const,
      letterSpacing: 12,
      color: colors.cream,
    },
    tagline: {
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.smoke,
      textAlign: "center",
      paddingHorizontal: 28,
      lineHeight: 18,
      fontStyle: "italic",
    },
    taglineAccent: {
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.bourbon,
      textAlign: "center",
      marginTop: 2,
      marginBottom: 20,
      fontStyle: "italic",
    },
    powderBlueStripe: {
      height: 3,
      backgroundColor: colors.powderBlue,
      marginHorizontal: 20,
      marginBottom: 24,
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
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.smoke,
      fontStyle: "italic",
      letterSpacing: 1,
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
    pullAgainButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 8,
    },
    pullAgainText: {
      fontFamily: "Courier",
      fontSize: 11,
      letterSpacing: 4,
      color: colors.smoke,
    },
    footer: {
      paddingVertical: 24,
      alignItems: "center",
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 24,
      marginHorizontal: 20,
    },
    footerText: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.border,
      fontStyle: "italic",
    },
  });
