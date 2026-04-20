import * as Haptics from "expo-haptics";
import * as ExpoLocation from "expo-location";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { useKapit, type Location } from "@/context/KapitContext";

const PRESET_LOCATIONS: Location[] = [
  { lat: 40.758, lng: -73.9855, name: "Times Square" },
  { lat: 40.7061, lng: -73.9969, name: "Brooklyn Bridge" },
  { lat: 40.7074, lng: -74.0113, name: "Wall Street" },
  { lat: 40.7851, lng: -73.9683, name: "Central Park" },
  { lat: 40.6892, lng: -74.0445, name: "Statue of Liberty" },
  { lat: 48.8584, lng: 2.2945, name: "Eiffel Tower" },
  { lat: 51.5007, lng: -0.1246, name: "Westminster" },
  { lat: 41.9029, lng: 12.4534, name: "The Vatican" },
];

const CATEGORY_LABELS: Record<string, string> = {
  crime: "CRIMINAL",
  science: "SCIENTIFIC",
  culture: "CULTURAL",
  politics: "POLITICAL",
  sports: "SPORTING",
  weird: "PECULIAR",
  food: "DINING",
  architecture: "EDIFICE",
  nature: "NATURAL",
};

export function getCategoryLabel(cat: string) {
  return CATEGORY_LABELS[cat] ?? cat.toUpperCase();
}

interface LocationSelectorProps {
  onLocationSelected: () => void;
}

export default function LocationSelector({ onLocationSelected }: LocationSelectorProps) {
  const colors = useColors();
  const { selectedLocation, setSelectedLocation } = useKapit();
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [customName, setCustomName] = useState("");

  const handleGPS = async () => {
    setGpsLoading(true);
    try {
      if (Platform.OS === "web") {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc: Location = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              name: "Your Location",
            };
            setSelectedLocation(loc);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onLocationSelected();
            setGpsLoading(false);
          },
          () => {
            setGpsLoading(false);
          }
        );
      } else {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setGpsLoading(false);
          return;
        }
        const pos = await ExpoLocation.getCurrentPositionAsync({});
        const [place] = await ExpoLocation.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const name = place?.city ?? place?.region ?? "Your Location";
        setSelectedLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, name });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLocationSelected();
      }
    } catch {
      setGpsLoading(false);
    } finally {
      setGpsLoading(false);
    }
  };

  const selectPreset = (loc: Location) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedLocation(loc);
    onLocationSelected();
  };

  const submitCustom = () => {
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng) || !customName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedLocation({ lat, lng, name: customName.trim() });
    setShowCustom(false);
    onLocationSelected();
  };

  const s = styles(colors);

  return (
    <View style={s.container}>
      <View style={s.titleRow}>
        <View style={s.rule} />
        <Text style={s.sectionLabel}>LOCALE</Text>
        <View style={s.rule} />
      </View>

      <TouchableOpacity style={s.gpsButton} onPress={handleGPS} activeOpacity={0.8}>
        {gpsLoading ? (
          <ActivityIndicator color={colors.warmBlack} size="small" />
        ) : (
          <Text style={s.gpsButtonText}>FIND ME</Text>
        )}
      </TouchableOpacity>

      {selectedLocation && (
        <View style={s.selectedBadge}>
          <Text style={s.selectedBadgeLabel}>CURRENT LOCALE</Text>
          <Text style={s.selectedBadgeName}>◆ {selectedLocation.name}</Text>
        </View>
      )}

      <View style={s.doubleRule}>
        <View style={s.rule} />
        <View style={[s.rule, { marginTop: 2 }]} />
      </View>

      <Text style={s.presetLabel}>— OR SELECT A DESTINATION —</Text>

      <View style={s.presetGrid}>
        {PRESET_LOCATIONS.map((loc) => (
          <TouchableOpacity
            key={loc.name}
            style={[
              s.presetButton,
              selectedLocation?.name === loc.name && s.presetButtonActive,
            ]}
            onPress={() => selectPreset(loc)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                s.presetButtonText,
                selectedLocation?.name === loc.name && s.presetButtonTextActive,
              ]}
            >
              {loc.name.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={s.customToggle}
        onPress={() => setShowCustom(!showCustom)}
        activeOpacity={0.7}
      >
        <Text style={s.customToggleText}>
          {showCustom ? "— CLOSE —" : "ENTER COORDINATES"}
        </Text>
      </TouchableOpacity>

      {showCustom && (
        <View style={s.customForm}>
          <TextInput
            style={s.input}
            placeholder="LATITUDE (e.g. 40.758)"
            placeholderTextColor={colors.smoke}
            value={customLat}
            onChangeText={setCustomLat}
            keyboardType="numeric"
          />
          <TextInput
            style={s.input}
            placeholder="LONGITUDE (e.g. -73.985)"
            placeholderTextColor={colors.smoke}
            value={customLng}
            onChangeText={setCustomLng}
            keyboardType="numeric"
          />
          <TextInput
            style={s.input}
            placeholder="LOCATION NAME"
            placeholderTextColor={colors.smoke}
            value={customName}
            onChangeText={setCustomName}
          />
          <TouchableOpacity style={s.gpsButton} onPress={submitCustom} activeOpacity={0.8}>
            <Text style={s.gpsButtonText}>SET LOCATION</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 20,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    rule: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    sectionLabel: {
      fontFamily: "Courier",
      fontSize: 11,
      letterSpacing: 3,
      color: colors.smoke,
    },
    gpsButton: {
      backgroundColor: colors.bourbon,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: "center",
      marginBottom: 12,
    },
    gpsButtonText: {
      fontFamily: "Courier",
      fontSize: 12,
      fontWeight: "bold" as const,
      letterSpacing: 4,
      color: colors.warmBlack,
    },
    selectedBadge: {
      borderWidth: 1,
      borderColor: colors.powderBlue,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 16,
    },
    selectedBadgeLabel: {
      fontFamily: "Courier",
      fontSize: 9,
      letterSpacing: 3,
      color: colors.powderBlue,
      marginBottom: 4,
    },
    selectedBadgeName: {
      fontFamily: "Courier",
      fontSize: 14,
      color: colors.cream,
      letterSpacing: 1,
    },
    doubleRule: {
      marginBottom: 12,
    },
    presetLabel: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 2,
      color: colors.smoke,
      textAlign: "center",
      marginBottom: 12,
    },
    presetGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    presetButton: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    presetButtonActive: {
      borderColor: colors.bourbon,
      backgroundColor: colors.bourbon + "22",
    },
    presetButtonText: {
      fontFamily: "Courier",
      fontSize: 9,
      letterSpacing: 2,
      color: colors.smoke,
    },
    presetButtonTextActive: {
      color: colors.bourbon,
    },
    customToggle: {
      alignItems: "center",
      paddingVertical: 10,
      marginBottom: 8,
    },
    customToggleText: {
      fontFamily: "Courier",
      fontSize: 10,
      letterSpacing: 3,
      color: colors.smoke,
      textDecorationLine: "underline",
    },
    customForm: {
      gap: 8,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 10,
      paddingHorizontal: 14,
      color: colors.cream,
      fontFamily: "Courier",
      fontSize: 12,
    },
  });
