import React from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDate, fmtDT, inr, useApi } from "@/src/api";
import { useCart } from "@/src/cart";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Badge, Button, Empty, ErrorBox, Press, Row, Skeleton, T, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { lang } = useLang();
  const { refresh } = useCart();
  const { data, loading, error, refreshing, refresh: reload, reload: retry } = useApi<any[]>("/customer/bookings", undefined, 15000);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const rebook = async (id: string) => {
    try { await api(`/customer/bookings/${id}/rebook`, { method: "POST" }); await refresh(); toast("Added to cart"); router.push("/checkout"); } catch (e) { toast(errMsg(e), "error"); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.sm }]}><T v="display" testID="screen-title">My bookings</T></View>
      {loading && !data ? <View style={{ padding: spacing.lg, gap: spacing.md }}>{[0, 1, 2].map((i) => <Skeleton key={i} h={110} />)}</View> :
        error && !data ? <View style={{ padding: spacing.lg }}><ErrorBox text={error} onRetry={retry} /></View> : (
          <FlatList data={data || []} keyExtractor={(b) => b.id} testID="customer-bookings-list"
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: bottomChrome + spacing.xl }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} tintColor={colors.brand} />}
            ListEmptyComponent={<Empty text="No bookings yet" icon="calendar-clear-outline" testID="bookings-empty" />}
            renderItem={({ item: b }) => (
              <View style={styles.card}>
                <Press testID={`booking-item-${b.id}`} onPress={() => router.push(`/booking/${b.id}`)} style={{ gap: 6 }}>
                  <Row style={{ justifyContent: "space-between" }}><T v="mono" color={colors.muted}>{b.booking_no}</T><Badge status={b.status} /></Row>
                  <T v="bodyMedium" numberOfLines={2}>{b.lines.map((l: any) => `${l.name} ×${l.qty}`).join(", ")}</T>
                  <T v="caption">{`${fmtDate(b.slot_date, lang)} · ${b.slot_time || ""} · ${inr(b.pricing.total)} · ${String(b.payment_method).toUpperCase()}`}</T>
                  <T v="caption" style={{ fontSize: 11 }}>{fmtDT(b.created_at, lang)}</T>
                </Press>
                {["completed", "cancelled"].includes(b.status) && (
                  <Button small variant="outline" icon="refresh" title="One-click Re-book" onPress={() => rebook(b.id)} testID={`bookings-rebook-${b.id}`} style={{ alignSelf: "flex-start" }} />
                )}
              </View>
            )} />
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
});
