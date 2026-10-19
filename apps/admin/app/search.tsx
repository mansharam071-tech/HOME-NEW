import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@/src/api";
import { useLang } from "@/src/i18n";
import { Empty, Icon, Press, ScreenHeader, T } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

export default function Search() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [r, setR] = useState<any>(null);
  useEffect(() => {
    if (q.trim().length < 2) { setR(null); return; }
    const tm = setTimeout(() => api("/admin/search", { params: { q: q.trim() } }).then(setR).catch(() => setR(null)), 300);
    return () => clearTimeout(tm);
  }, [q]);
  const items = r ? [
    ...r.bookings.map((b: any) => ({ k: b.id, icon: "receipt-outline", title: `${t("Booking")} ${b.booking_no}`, sub: b.status, go: () => router.push({ pathname: "/(tabs)/bookings", params: { q: b.booking_no, status: "all" } }) })),
    ...r.users.map((u: any) => ({ k: u.id, icon: u.role === "partner" ? "construct-outline" : "person-outline", title: `${u.name || "-"} (${u.phone})`, sub: u.role,
      go: () => (u.role === "partner" ? router.push("/(tabs)/partners") : router.push({ pathname: "/(tabs)/bookings", params: { q: u.phone, status: "all" } })) })),
    ...r.cities.map((c: any) => ({ k: c.id, icon: "map-outline", title: c.city_name, sub: "city", go: () => router.push("/cities") })),
  ] : [];
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Global search" />
      <View style={{ padding: spacing.lg, paddingBottom: 0 }}>
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput testID="admin-global-search" autoFocus value={q} onChangeText={setQ} placeholder={t("Search booking ID, phone, partner, city…")}
            placeholderTextColor={colors.muted} style={styles.input} returnKeyType="search" />
        </View>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, paddingBottom: insets.bottom + spacing.xl }} testID="admin-search-results">
        {!r ? <Empty text="Type at least 2 characters" icon="search-outline" /> : !items.length ? <Empty text="No results" icon="sad-outline" testID="search-no-results" /> :
          items.map((x) => (
            <Press key={x.k} testID={`search-result-${x.k}`} onPress={x.go} style={styles.row}>
              <Icon name={x.icon} size={20} color={colors.brand} />
              <T v="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{x.title}</T>
              <T v="label">{x.sub}</T>
            </Press>
          ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md },
  input: { flex: 1, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface, height: 48 },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, minHeight: 52, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
});
