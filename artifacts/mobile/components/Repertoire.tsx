import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Factoid } from "@/context/KapitContext";
import { getCategoryLabel } from "./LocationSelector";

const CATEGORY_ICONS: Record<string, string> = {
  crime: "★",
  science: "◈",
  culture: "◆",
  politics: "▲",
  sports: "●",
  weird: "✦",
  food: "◉",
  architecture: "■",
  nature: "◇",
};

interface Props {
  repertoire: Factoid[];
}

export default function Repertoire({ repertoire }: Props) {
  const colors = useColors();
  const s = styles(colors);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View style={s.rule} />
        <View style={s.headerCenter}>
          <Text style={s.headerTitle}>YOUR REPERTOIRE</Text>
          <Text style={s.headerCount}>{repertoire.length} ENTRIES</Text>
        </View>
        <View style={s.rule} />
      </View>

      {repertoire.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyText}>Pull the suspender to begin your collection.</Text>
          <Text style={s.emptySubtext}>Your facts await, darling.</Text>
        </View>
      )}

      {repertoire.map((item) => (
        <View key={item.id} style={s.item}>
          <View style={s.itemLeft}>
            <Text style={s.itemIcon}>{CATEGORY_ICONS[item.category] ?? "◆"}</Text>
          </View>
          <View style={s.itemRight}>
            <View style={s.itemMeta}>
              <Text style={s.itemCategory}>{getCategoryLabel(item.category)}</Text>
              <Text style={s.itemSep}> · </Text>
              <Text style={s.itemYear}>{item.year}</Text>
              <Text style={s.itemSep}> · </Text>
              <Text style={s.itemLocation}>{item.location}</Text>
            </View>
            <Text style={s.itemText} numberOfLines={2}>
              {item.factoid}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
      marginTop: 24,
    },
    rule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    headerCenter: {
      alignItems: "center",
    },
    headerTitle: {
      fontFamily: "Courier",
      fontSize: 12,
      letterSpacing: 3,
      color: colors.cream,
    },
    headerCount: {
      fontFamily: "Courier",
      fontSize: 9,
      letterSpacing: 2,
      color: colors.smoke,
      marginTop: 2,
    },
    empty: {
      paddingVertical: 24,
      alignItems: "center",
    },
    emptyText: {
      fontFamily: "Courier",
      fontSize: 13,
      color: colors.smoke,
      textAlign: "center",
      fontStyle: "italic",
    },
    emptySubtext: {
      fontFamily: "Courier",
      fontSize: 11,
      color: colors.border,
      textAlign: "center",
      marginTop: 6,
    },
    item: {
      flexDirection: "row",
      gap: 12,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    itemLeft: {
      width: 24,
      alignItems: "center",
      paddingTop: 2,
    },
    itemIcon: {
      color: colors.bourbon,
      fontSize: 14,
    },
    itemRight: {
      flex: 1,
    },
    itemMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 4,
    },
    itemCategory: {
      fontFamily: "Courier",
      fontSize: 9,
      letterSpacing: 2,
      color: colors.powderBlue,
    },
    itemSep: {
      fontFamily: "Courier",
      fontSize: 9,
      color: colors.smoke,
    },
    itemYear: {
      fontFamily: "Courier",
      fontSize: 9,
      color: colors.smoke,
    },
    itemLocation: {
      fontFamily: "Courier",
      fontSize: 9,
      color: colors.smoke,
    },
    itemText: {
      fontFamily: "Courier",
      fontSize: 12,
      color: colors.cream,
      lineHeight: 18,
    },
  });
