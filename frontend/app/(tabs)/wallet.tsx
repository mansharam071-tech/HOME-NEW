import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDT, inr, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { payMessage, useRazorpay } from "@/src/razorpay";
import { Empty, ErrorBox, Icon, Press, Row, Skeleton, T, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";
import { ActivityIndicator } from "react-native";

export default function Wallet() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { lang } = useLang();
  const { data, loading, error, refreshing, refresh, reload } = useApi<any>("/customer/wallet");
  const pay = useRazorpay();
  const [busy, setBusy] = useState<number | null>(null);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const topup = async (amount: number) => {
    setBusy(amount);
    try {
      const d = await api("/customer/wallet/topup", { method: "POST", params: { amount } });
      if (d.razorpay) {
        const r = await pay(d.razorpay, "Wallet top-up");
        toast(r === "paid" ? `${inr(amount)} added to wallet` : payMessage(r), r === "paid" ? "success" : "error");
        reload();
      } else { toast(`${inr(amount)} added (demo UPI)`); reload(); }
    } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingBottom: bottomChrome + spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.onBrand} />}>
        <View style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.blob} />
          <T v="label" color="rgba(255,255,255,0.7)">SMARTFIX Wallet</T>
          {loading && !data ? <Skeleton h={44} style={{ width: 160, marginTop: spacing.sm, opacity: 0.3 }} /> :
            <T v="display" color={colors.onBrand} style={{ fontSize: 40, lineHeight: 50, marginTop: spacing.sm }} testID="wallet-balance">{inr(data?.balance)}</T>}
          <T v="caption" color="rgba(255,255,255,0.75)">Cashbacks, refunds & promo rewards live here</T>
          <Row style={{ marginTop: spacing.lg }}>
            {[100, 500, 1000].map((a) => (
              <Press key={a} testID={`wallet-topup-${a}`} onPress={() => topup(a)} disabled={busy !== null} style={styles.topup}>
                {busy === a ? <ActivityIndicator color={colors.onBrand} size="small" /> : <Icon name="add" size={14} color={colors.onBrand} />}
                <T v="bodyMedium" color={colors.onBrand} style={{ fontSize: 13 }}>{inr(a)}</T>
              </Press>
            ))}
          </Row>
        </View>
        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          <T v="title">Transactions</T>
          {error && !data ? <ErrorBox text={error} onRetry={reload} /> : loading && !data ? [0, 1, 2].map((i) => <Skeleton key={i} h={60} />) :
            !data?.transactions?.length ? <Empty text="No transactions yet" icon="receipt-outline" testID="wallet-empty" /> :
              data.transactions.map((t: any) => {
                const pos = t.amount >= 0;
                return (
                  <View key={t.id} style={styles.txn} testID={`wallet-txn-${t.id}`}>
                    <View style={[styles.txIcon, { backgroundColor: pos ? colors.successTint : colors.errorTint }]}>
                      <Icon name={pos ? "arrow-down" : "arrow-up"} size={16} color={pos ? colors.success : colors.error} />
                    </View>
                    <View style={{ flex: 1 }}><T v="bodyMedium" numberOfLines={1}>{t.reason}</T><T v="caption">{fmtDT(t.created_at, lang)}</T></View>
                    <T v="bodyMedium" color={pos ? "#15803D" : colors.error}>{`${pos ? "+" : ""}${inr(t.amount)}`}</T>
                  </View>
                );
              })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.brand, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, overflow: "hidden", borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  blob: { position: "absolute", right: -50, top: -30, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(245,158,11,0.25)" },
  topup: { flexDirection: "row", alignItems: "center", gap: 4, height: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.16)" },
  txn: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
  txIcon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
});
