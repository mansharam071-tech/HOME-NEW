import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth";
import { errMsg } from "@/src/api";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Card, Icon, IconName, Press, T, useToast, Toggle } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

const Item = ({ icon, label, sub, onPress, testID, tone = colors.brand, right }: { icon: IconName; label: string; sub?: string; onPress?: () => void; testID: string; tone?: string; right?: React.ReactNode }) => (
  <Press testID={testID} onPress={onPress} style={styles.item}>
    <View style={[styles.ic, { backgroundColor: `${tone}1A` }]}><Icon name={icon} size={20} color={tone} /></View>
    <View style={{ flex: 1 }}>
      <T v="bodyMedium">{label}</T>
      {sub ? <T v="caption" numberOfLines={1}>{sub}</T> : null}
    </View>
    {right || <Icon name="chevron-forward" size={18} color={colors.muted} />}
  </Press>
);

export default function More() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { session, logout, toggleLang } = useAuth();
  const { lang } = useLang();
  const [busy, setBusy] = useState(false);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const switchLang = async () => {
    setBusy(true);
    try { await toggleLang(); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.sm }]}><T v="title" testID="screen-title">More</T></View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: bottomChrome + spacing.xl }}>
        <Card style={styles.profile} testID="admin-profile-card">
          <View style={styles.avatar}><T v="subtitle" color={colors.onBrandSecondary}>{(session?.user?.name || "OA").split(" ").map((x: string) => x[0]).join("").slice(0, 2)}</T></View>
          <View style={{ flex: 1 }}>
            <T v="subtitle">{session?.user?.name || "Admin"}</T>
            <T v="caption" testID="admin-email">{session?.user?.email}</T>
          </View>
        </Card>
        <View style={{ gap: spacing.sm }}>
          <T v="label">Operations</T>
          <Card style={styles.group}>
            <Item testID="more-cities" icon="map" label="Cities & Geofencing" sub="Pincodes · surge · services" onPress={() => router.push("/cities")} />
            <Item testID="more-pricing" icon="pricetags" tone={colors.brandSecondary} label="Surge & Coupons" sub="Surge pricing rules engine" onPress={() => router.push("/pricing")} />
            <Item testID="more-finance" icon="wallet" tone={colors.success} label="Finance & Settlements" sub="Commission engine" onPress={() => router.push("/finance")} />
            <Item testID="more-alerts" icon="notifications" tone={colors.error} label="Notifications & red alerts" onPress={() => router.push("/alerts")} />
            <Item testID="more-search" icon="search" tone={colors.info} label="Global search" onPress={() => router.push("/search")} />
          </Card>
        </View>
        <View style={{ gap: spacing.sm }}>
          <T v="label">Account</T>
          <Card style={styles.group}>
            <Item testID="admin-language-toggle" icon="language" label={lang === "hi" ? "हिंदी" : "English"} sub={lang === "hi" ? "Switch to English" : "हिंदी में बदलें"}
              onPress={switchLang} right={<Toggle testID="language-switch" value={lang === "hi"} onChange={() => !busy && switchLang()} />} />
            <Item testID="admin-logout-btn" icon="log-out-outline" tone={colors.error} label="Logout" onPress={() => { logout(); router.replace("/login"); }} />
          </Card>
        </View>
        <T v="caption" style={{ textAlign: "center" }}>Common API · v1.0</T>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  profile: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center" },
  group: { padding: 0, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 60, borderBottomWidth: 1, borderBottomColor: colors.divider },
  ic: { width: 38, height: 38, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
});
