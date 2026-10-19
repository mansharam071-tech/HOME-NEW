import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDT, inr, useApi } from "@/src/api";
import { useAuth } from "@/src/auth";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Donut, TrendChart } from "@/src/charts";
import { Card, ErrorBox, Icon, IconBtn, IconName, Press, Row, Segmented, Skeleton, T, useToast, Button } from "@/src/ui";
import { CHART_COLORS, colors, radius, spacing } from "@/src/theme";

const Kpi = ({ icon, tone, label, value, sub, testID }: { icon: IconName; tone: string; label: string; value: any; sub: React.ReactNode; testID: string }) => (
  <Card style={styles.kpi} testID={testID}>
    <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <T v="caption" style={{ flex: 1 }} numberOfLines={2}>{label}</T>
      <View style={[styles.kpiIcon, { backgroundColor: `${tone}1A` }]}><Icon name={icon} size={18} color={tone} /></View>
    </Row>
    <T v="display" testID={`${testID}-value`} numberOfLines={1} adjustsFontSizeToFit>{String(value)}</T>
    {typeof sub === "string" ? <T v="caption" numberOfLines={2}>{sub}</T> : sub}
  </Card>
);

export const ALERT_ACTION: Record<string, { label: string; path: (ref: string) => string }> = {
  sos: { label: "Resolve", path: (r) => `/admin/sos/${r}/resolve` },
  cod_limit: { label: "Mark COD settled", path: (r) => `/admin/partners/${r}/settle-cod` },
  consecutive_rejections: { label: "Reset counter", path: (r) => `/admin/partners/${r}/reset-rejections` },
};

export const AlertCard = ({ a, onDone }: { a: any; onDone: () => void }) => {
  const toast = useToast();
  const { lang, t } = useLang();
  const [busy, setBusy] = useState(false);
  const act = ALERT_ACTION[a.type];
  const crit = a.severity !== "medium";
  const run = async () => {
    setBusy(true);
    try { await api(act.path(a.ref), { method: "POST" }); toast("Action recorded"); onDone(); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <View testID={`alert-${a.type}-${a.ref}`} style={[styles.alert, { backgroundColor: crit ? colors.errorTint : colors.warningTint, borderLeftColor: crit ? colors.error : colors.warning }]}>
      <Icon name={a.type === "sos" ? "warning" : a.type === "low_rating" ? "star-half" : a.type === "cod_limit" ? "cash" : "close-circle"} size={20} color={crit ? colors.error : colors.warning} />
      <View style={{ flex: 1, gap: 2 }}>
        <T v="bodyMedium">{a.title}</T>
        <T v="caption">{`${t(a.detail)} · ${fmtDT(a.at, lang)}`}</T>
        {act && <Button small variant="outline" title={act.label} loading={busy} onPress={run} testID={`alert-action-${a.id}`} style={{ alignSelf: "flex-start", marginTop: spacing.sm }} />}
      </View>
    </View>
  );
};

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const { t } = useLang();
  const [range, setRange] = useState("daily");
  const { data: d, error, loading, refreshing, refresh, reload } = useApi<any>("/admin/dashboard", undefined, 20000);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const k = d?.kpis;
  const up = (k?.bookings_change_pct ?? 0) >= 0;
  const sos = d?.alerts?.filter((a: any) => a.type === "sos").length || 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <T v="caption">Good day,</T>
          <T v="title" numberOfLines={1} testID="admin-name">{session?.user?.name || "Admin"}</T>
        </View>
        <IconBtn testID="admin-search-btn" name="search" onPress={() => router.push("/search")} />
        <IconBtn testID="admin-notifications-btn" name={sos ? "warning" : "notifications-outline"} color={sos ? colors.error : colors.onSurface}
          badge={d?.alerts?.length} onPress={() => router.push("/alerts")} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: bottomChrome + spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}>
        {loading && !d ? (
          <View style={styles.grid}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={128} style={styles.kpi} />)}<Skeleton h={220} style={{ width: "100%" }} /></View>
        ) : error && !d ? <ErrorBox text={error} onRetry={reload} /> : d && (
          <>
            <View style={styles.grid}>
              <Kpi testID="kpi-today-bookings" icon="calendar" tone={colors.brand} label="Today's bookings" value={k.today_bookings}
                sub={<Row style={{ gap: 4 }}><Icon name={up ? "trending-up" : "trending-down"} size={14} color={up ? colors.success : colors.error} />
                  <T v="caption" color={up ? colors.success : colors.error} numberOfLines={1} style={{ flex: 1 }}>{`${k.bookings_change_pct ?? "–"}% vs ${k.yesterday_bookings}`}</T></Row>} />
              <Kpi testID="kpi-live-jobs" icon="pulse" tone={colors.brandSecondary} label="Active live jobs" value={k.active_live_jobs}
                sub={`${k.assigned_jobs} ${t("assigned")} · ${k.pending_jobs} ${t("Pending")}`} />
              <Kpi testID="kpi-today-revenue" icon="cash" tone={colors.success} label="Today's gross revenue" value={inr(k.today_revenue)}
                sub={t(`Commission earned ${inr(k.today_commission)}`)} />
              <Kpi testID="kpi-online-partners" icon="people" tone={colors.info} label="Active online partners" value={k.online_partners}
                sub={t(`of ${k.total_partners} verified partners`)} />
            </View>

            {k.pending_jobs > 0 && (
              <Press testID="quick-assign-pending" onPress={() => router.push({ pathname: "/(tabs)/bookings", params: { status: "pending" } })} style={[styles.quick, { backgroundColor: colors.amberTint, borderColor: "#FDE68A" }]}>
                <Icon name="flash" size={18} color="#B45309" />
                <T v="bodyMedium" color="#92400E" style={{ flex: 1 }}>{`${k.pending_jobs} ${t("unassigned bookings → assign")}`}</T>
                <Icon name="chevron-forward" size={18} color="#B45309" />
              </Press>
            )}

            <Card testID="fraud-alerts-widget" style={{ gap: spacing.md }}>
              <Row>
                <Icon name="shield-half" size={20} color={colors.error} />
                <T v="subtitle" style={{ flex: 1 }}>Fraud & quality red alerts</T>
                <View style={styles.count}><T v="label" color={colors.error}>{String(d.alerts.length)}</T></View>
              </Row>
              {d.alerts.length === 0 ? <T v="caption">No active alerts</T> : d.alerts.slice(0, 4).map((a: any) => <AlertCard key={a.id} a={a} onDone={reload} />)}
              {d.alerts.length > 4 && <Button small variant="ghost" title="See all" icon="arrow-forward" onPress={() => router.push("/alerts")} testID="alerts-see-all" />}
            </Card>

            <Card style={{ gap: spacing.md }}>
              <T v="subtitle">Revenue & booking trends</T>
              <Segmented testID="trend-range" value={range} onChange={setRange} options={[{ k: "daily", label: "Daily" }, { k: "weekly", label: "Weekly" }]} />
              <TrendChart data={d[range]} />
              <Row style={{ gap: spacing.lg }}>
                <Row style={{ gap: 6 }}><View style={[styles.dot, { backgroundColor: colors.brand }]} /><T v="caption">Revenue</T></Row>
                <Row style={{ gap: 6 }}><View style={[styles.dot, { backgroundColor: colors.brandSecondary }]} /><T v="caption">Bookings</T></Row>
              </Row>
            </Card>

            <Card style={{ gap: spacing.md }}>
              <T v="subtitle">Category revenue</T>
              <Row style={{ gap: spacing.lg, alignItems: "center" }}>
                <Donut data={d.category_breakdown} />
                <View style={{ flex: 1, gap: 6 }}>
                  {d.category_breakdown.slice(0, 6).map((c: any, i: number) => (
                    <Row key={c.name} style={{ gap: 6 }}>
                      <View style={[styles.dot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
                      <T v="caption" numberOfLines={1} style={{ flex: 1, color: colors.onSurfaceTertiary }}>{c.name}</T>
                      <T v="caption">{inr(c.value)}</T>
                    </Row>
                  ))}
                </View>
              </Row>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <T v="subtitle">Quick actions</T>
              {[
                { id: "kyc", label: "Review KYC queue →", icon: "shield-checkmark", to: "/(tabs)/partners" },
                { id: "finance", label: "Generate weekly settlements →", icon: "wallet", to: "/finance" },
                { id: "cities", label: "Launch new city", icon: "map", to: "/cities" },
              ].map((q) => (
                <Press key={q.id} testID={`quick-${q.id}`} onPress={() => router.push(q.to as any)} style={[styles.quick, { backgroundColor: colors.surfaceTertiary, borderColor: colors.border }]}>
                  <Icon name={q.icon as any} size={18} color={colors.brand} />
                  <T v="bodyMedium" style={{ flex: 1 }}>{q.label}</T>
                </Press>
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.md },
  kpi: { width: "48.3%", padding: spacing.md, gap: 4 },
  kpiIcon: { width: 32, height: 32, borderRadius: radius.sm + 2, alignItems: "center", justifyContent: "center" },
  alert: { flexDirection: "row", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderLeftWidth: 4 },
  count: { backgroundColor: colors.errorTint, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  quick: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, minHeight: 48 },
});
