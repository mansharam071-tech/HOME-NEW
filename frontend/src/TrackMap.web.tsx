import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Icon, T } from "./ui";
import { colors, radius, spacing } from "./theme";

type P = { lat: number; lng: number } | null | undefined;

const km = (a: P, b: P) => {
  if (!a || !b) return null;
  const R = 6371, dLat = ((b.lat - a.lat) * Math.PI) / 180, dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return (2 * R * Math.asin(Math.sqrt(h))).toFixed(1);
};

/** Web preview fallback – native maps render on the phone (Expo Go / builds). */
export default function TrackMap({ dest, partner, height }: { dest: P; partner: P; height: number }) {
  const d = km(dest, partner);
  return (
    <LinearGradient colors={[colors.brandTertiary, colors.surfaceTertiary]} style={{ height, alignItems: "center", justifyContent: "center", gap: spacing.sm }} testID="tracking-map">
      <View style={styles.row}>
        <View style={[styles.pin, { backgroundColor: colors.brand }]}><Icon name="home" size={16} color={colors.onBrand} /></View>
        {partner && <><View style={styles.line} /><View style={[styles.pin, { backgroundColor: colors.brandSecondary }]}><Icon name="construct" size={16} color={colors.onBrandSecondary} /></View></>}
      </View>
      {d && <T v="bodyMedium" color={colors.brand}>{`${d} km`}</T>}
      <T v="caption">Live map is available in the mobile app</T>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  pin: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.surfaceSecondary },
  line: { width: 90, height: 3, borderRadius: radius.pill, backgroundColor: colors.brand, opacity: 0.4 },
});
