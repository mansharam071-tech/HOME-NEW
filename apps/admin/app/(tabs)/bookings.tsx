import React, { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDT, inr, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Badge, Button, Card, Chip, ChipRow, Empty, ErrorBox, Icon, Input, KV, Divider, Press, Row, Sheet, Skeleton, STATUS, T, useToast } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

const TABS = ["all", "pending", "assigned", "en_route", "in_progress", "completed", "cancelled"];
const ACTIVE = ["pending", "assigned", "en_route"];

const Candidates = ({ booking, onAssigned }: { booking: any; onAssigned: () => void }) => {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const { data, loading } = useApi<any[]>(`/admin/bookings/${booking.id}/candidates`);
  const { t } = useLang();
  const assign = async (pid: string) => {
    setBusy(pid);
    try { await api(`/admin/bookings/${booking.id}/reassign`, { method: "POST", body: { partner_id: pid, reason } }); toast("Job (re)assigned"); onAssigned(); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  return (
    <View style={{ gap: spacing.md }} testID="reassign-panel">
      <Input testID="reassign-reason-input" placeholder="Reason (e.g. partner unreachable, emergency)" value={reason} onChangeText={setReason} />
      {loading ? <Skeleton h={64} /> : !data?.length ? <Empty text="No partners available" icon="people-outline" /> : data.map((p) => (
        <View key={p.id} style={styles.cand} testID={`candidate-${p.id}`}>
          <View style={[styles.dot, { backgroundColor: p.is_online ? colors.success : colors.borderStrong }]} />
          <View style={{ flex: 1 }}>
            <T v="bodyMedium" numberOfLines={1}>{p.name}</T>
            <T v="caption" numberOfLines={2}>{`★ ${p.rating ?? "-"} · ${p.distance_km} km · ${t(p.skill_match ? "Skill match" : "No skill match")}${p.cod_blocked ? " " + t("· COD blocked") : ""}`}</T>
          </View>
          {p.current ? <T v="label" color={colors.brand}>Current</T> :
            <Button small title="Assign" loading={busy === p.id} onPress={() => assign(p.id)} testID={`assign-${p.id}`} />}
        </View>
      ))}
    </View>
  );
};

const Detail = ({ b, onClose, onChanged }: { b: any; onClose: () => void; onChanged: () => void }) => {
  const toast = useToast();
  const { lang, t } = useLang();
  const [mode, setMode] = useState<"info" | "assign" | "cancel">("info");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setMode("info"); }, [b?.id]);
  if (!b) return null;
  const cancel = async () => {
    setBusy(true);
    try { await api(`/admin/bookings/${b.id}/cancel`, { method: "POST" }); toast("Cancelled & refunded"); onChanged(); onClose(); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <Sheet open={!!b} onClose={onClose} title={mode === "assign" ? `${t("Manual / emergency re-assignment ·")} ${b.booking_no}` : `${t("Booking")} ${b.booking_no}`} testID="booking-detail-sheet" form={mode === "assign"}>
      {mode === "info" && (
        <>
          <Row style={{ justifyContent: "space-between" }}><Badge status={b.status} /><T v="caption">{fmtDT(b.created_at, lang)}</T></Row>
          <Card style={{ padding: spacing.md }}>
            {b.lines.map((l: any, i: number) => <KV key={i} k={`${l.name} × ${l.qty}`} v={inr(l.line_total)} />)}
            <Divider />
            {b.pricing.surge_amount ? <KV k={`Surge ${b.pricing.surge_multiplier}x`} v={inr(b.pricing.surge_amount)} /> : null}
            {b.pricing.discount ? <KV k={`Discount ${b.pricing.coupon_code || ""}`} v={`-${inr(b.pricing.discount)}`} /> : null}
            <KV k="GST" v={inr(b.pricing.gst)} />
            <KV k="Total" v={inr(b.pricing.total)} bold />
          </Card>
          <KV k="Customer" v={`${b.customer?.name || "-"} · ${b.customer?.phone || ""}`} />
          <KV k="Partner" v={b.partner_name || t("Unassigned")} />
          <KV k="Payment" v={String(b.payment_method || "").toUpperCase()} />
          <KV k="City" v={`${b.city_name} · ${t(b.mode)}`} />
          {b.address?.line ? <T v="caption">{`${b.address.line} · ${b.address.pincode || ""}`}</T> : null}
          {ACTIVE.includes(b.status) && (
            <Row style={{ marginTop: spacing.sm }}>
              <Button style={{ flex: 1 }} icon="person-add" title={b.partner_id ? "Re-assign" : "Assign"} onPress={() => setMode("assign")} testID={`reassign-btn-${b.id}`} />
              <Button style={{ flex: 1 }} variant="outline" icon="close-circle" title="Cancel booking" onPress={() => setMode("cancel")} testID={`admin-cancel-btn-${b.id}`} />
            </Row>
          )}
        </>
      )}
      {mode === "assign" && <Candidates booking={b} onAssigned={() => { onChanged(); onClose(); }} />}
      {mode === "cancel" && (
        <View style={{ gap: spacing.md }} testID="cancel-confirm">
          <View style={styles.warn}><Icon name="alert-circle" size={20} color={colors.error} /><T v="bodyMedium" style={{ flex: 1 }}>Cancel with full refund?</T></View>
          <T v="caption">{`${b.booking_no} · ${inr(b.pricing.total)}`}</T>
          <Button variant="danger" title="Yes, cancel" loading={busy} onPress={cancel} testID="confirm-cancel-btn" />
          <Button variant="outline" title="Keep booking" onPress={() => setMode("info")} testID="keep-booking-btn" />
        </View>
      )}
    </Sheet>
  );
};

export default function Bookings() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ status?: string; q?: string }>();
  const { lang, t } = useLang();
  const [status, setStatus] = useState(params.status || "all");
  const [q, setQ] = useState(params.q || "");
  const [dq, setDq] = useState(q);
  const [sel, setSel] = useState<any>(null);
  useEffect(() => { if (params.status) setStatus(params.status); }, [params.status]);
  useEffect(() => { if (params.q !== undefined) { setQ(params.q); setDq(params.q); } }, [params.q]);
  useEffect(() => { const tm = setTimeout(() => setDq(q), 350); return () => clearTimeout(tm); }, [q]);
  const { data, loading, error, refreshing, refresh, reload } = useApi<any>("/admin/bookings", { status, q: dq || undefined }, 10000);
  const counts = data?.counts || {};
  const total = Object.values(counts).reduce((a: number, b: any) => a + b, 0) as number;
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          <T v="title" testID="screen-title">Live Bookings</T>
          <View style={styles.search}>
            <Icon name="search" size={18} color={colors.muted} />
            <TextInput testID="bookings-search-input" value={q} onChangeText={setQ} placeholder={t("Booking ID or customer phone")}
              placeholderTextColor={colors.muted} style={styles.searchInput} autoCapitalize="characters" returnKeyType="search" />
            {q ? <Icon name="close-circle" size={18} color={colors.muted} onPress={() => setQ("")} testID="bookings-search-clear" /> : null}
          </View>
        </View>
        <ChipRow>
          {TABS.map((s) => (
            <Chip key={s} testID={`bookings-tab-${s}`} active={status === s} onPress={() => setStatus(s)}
              label={s === "all" ? "All" : STATUS[s].label} count={s === "all" ? total : counts[s] || 0} />
          ))}
        </ChipRow>
      </View>
      {loading && !data ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={96} />)}</View>
      ) : error && !data ? <View style={{ padding: spacing.lg }}><ErrorBox text={error} onRetry={reload} /></View> : (
        <FlatList
          testID="bookings-list"
          data={data?.bookings || []}
          keyExtractor={(b) => b.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: bottomChrome + spacing.xl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
          ListEmptyComponent={<Empty text="No bookings" icon="calendar-clear-outline" testID="bookings-empty" />}
          renderItem={({ item: b }) => (
            <Press testID={`booking-row-${b.id}`} onPress={() => setSel(b)} style={styles.row}>
              <Row style={{ justifyContent: "space-between" }}>
                <T v="mono" testID={`booking-no-${b.id}`}>{b.booking_no}</T>
                <Badge status={b.status} />
              </Row>
              <T v="bodyMedium" numberOfLines={1}>{b.lines.map((l: any) => l.name).join(", ")}</T>
              <Row style={{ justifyContent: "space-between" }}>
                <T v="caption" numberOfLines={1} style={{ flex: 1 }}>{`${b.customer?.name || "-"} · ${b.city_name} · ${fmtDT(b.created_at, lang)}`}</T>
                <T v="subtitle">{inr(b.pricing.total)}</T>
              </Row>
              <Row>
                <Icon name="construct-outline" size={14} color={b.partner_name ? colors.muted : colors.warning} />
                <T v="caption" color={b.partner_name ? colors.muted : "#A16207"} style={{ flex: 1 }}>{b.partner_name || t("Unassigned")}</T>
                <T v="label">{String(b.payment_method || "")}</T>
              </Row>
            </Press>
          )}
        />
      )}
      <Detail b={sel} onClose={() => setSel(null)} onChanged={reload} />
    </View>
  );
}

const styles = StyleSheet.create({
  head: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.xs },
  search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, height: 44, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface, height: 44 },
  row: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.md, gap: 6, borderWidth: 1, borderColor: colors.border },
  cand: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  dot: { width: 10, height: 10, borderRadius: 5 },
  warn: { flexDirection: "row", gap: spacing.sm, alignItems: "center", backgroundColor: colors.errorTint, padding: spacing.md, borderRadius: radius.md },
});
