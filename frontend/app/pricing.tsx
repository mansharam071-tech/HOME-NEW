import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDate, inr, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { Button, Card, Chip, Empty, ErrorBox, Icon, IconName, Input, Row, ScreenHeader, Segmented, Sheet, Skeleton, T, Toggle, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

const TRIG: Record<string, { icon: IconName; label: string }> = {
  weather: { icon: "rainy", label: "Weather" }, peak_hours: { icon: "time", label: "Peak hours" }, high_demand: { icon: "flame", label: "High demand zone" },
};

const Picker = ({ options, value, onChange, testID }: { options: { k: string; label: string }[]; value: string; onChange: (k: string) => void; testID: string }) => (
  <View style={styles.wrap}>{options.map((o) => <Chip key={o.k} label={o.label} active={value === o.k} onPress={() => onChange(o.k)} testID={`${testID}-${o.k}`} />)}</View>
);

const SurgeForm = ({ open, onClose, cities }: { open: boolean; onClose: (ok: boolean) => void; cities: any[] }) => {
  const toast = useToast();
  const [f, setF] = useState<any>({ name: "", trigger: "peak_hours", multiplier: "1.2", city_id: "all", start_hour: "18", end_hour: "21", weather: "Rain", is_active: true });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await api("/admin/surge-rules", { method: "POST", body: { ...f, multiplier: Number(f.multiplier), start_hour: Number(f.start_hour), end_hour: Number(f.end_hour) } });
      toast("Surge rule created"); onClose(true);
    } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={() => onClose(false)} title="New surge rule" testID="surge-dialog" form>
      <Input testID="surge-name-input" label="Rule name" placeholder="Evening Peak Hours" value={f.name} onChangeText={(v) => setF({ ...f, name: v })} />
      <T v="label">Trigger</T>
      <Picker testID="surge-trigger" value={f.trigger} onChange={(v) => setF({ ...f, trigger: v })} options={Object.entries(TRIG).map(([k, x]) => ({ k, label: x.label }))} />
      <T v="label">Multiplier</T>
      <View style={styles.wrap}>
        {["1.2", "1.5", "1.8", "2"].map((m) => <Chip key={m} label={`${m}x`} active={Number(f.multiplier) === Number(m)} onPress={() => setF({ ...f, multiplier: m })} testID={`surge-mult-${m}`} />)}
      </View>
      <Input testID="surge-multiplier-input" keyboardType="decimal-pad" value={String(f.multiplier)} onChangeText={(v) => setF({ ...f, multiplier: v })} />
      <T v="label">City</T>
      <Picker testID="surge-city" value={f.city_id} onChange={(v) => setF({ ...f, city_id: v })} options={[{ k: "all", label: "All cities" }, ...cities.map((c) => ({ k: c.id, label: c.city_name }))]} />
      {f.trigger === "peak_hours" && (
        <Row>
          <View style={{ flex: 1 }}><Input testID="surge-start-hour" label="Start hour" keyboardType="number-pad" value={f.start_hour} onChangeText={(v) => setF({ ...f, start_hour: v })} /></View>
          <View style={{ flex: 1 }}><Input testID="surge-end-hour" label="End hour" keyboardType="number-pad" value={f.end_hour} onChangeText={(v) => setF({ ...f, end_hour: v })} /></View>
        </Row>
      )}
      {f.trigger === "weather" && <Picker testID="surge-weather" value={f.weather} onChange={(v) => setF({ ...f, weather: v })} options={["Rain", "Heatwave", "Storm", "Fog"].map((w) => ({ k: w, label: w }))} />}
      <Button testID="surge-save-btn" title="Create rule" disabled={!f.name} loading={busy} onPress={save} />
    </Sheet>
  );
};

const CouponForm = ({ open, onClose, cities, cats }: { open: boolean; onClose: (ok: boolean) => void; cities: any[]; cats: any[] }) => {
  const toast = useToast();
  const [f, setF] = useState<any>({ code: "", description: "", discount_type: "percent", value: "50", max_discount: "100", min_order: "0", city_ids: [], category_ids: [], usage_limit: "1000", first_order_only: false, valid_till: "", is_active: true });
  const [busy, setBusy] = useState(false);
  const tog = (k: string, id: string) => setF({ ...f, [k]: f[k].includes(id) ? f[k].filter((x: string) => x !== id) : [...f[k], id] });
  const save = async () => {
    if (f.valid_till && !/^\d{4}-\d{2}-\d{2}$/.test(f.valid_till)) return toast("Valid till (YYYY-MM-DD)", "error");
    setBusy(true);
    try {
      await api("/admin/coupons", { method: "POST", body: { ...f, value: Number(f.value), max_discount: f.max_discount ? Number(f.max_discount) : null, min_order: Number(f.min_order) || 0,
        usage_limit: f.usage_limit ? Number(f.usage_limit) : null, valid_till: f.valid_till || null } });
      toast(`Coupon ${f.code} created`); onClose(true);
    } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <Sheet open={open} onClose={() => onClose(false)} title="Create promo code" testID="coupon-dialog" form>
      <Input testID="coupon-code-input" label="Code" placeholder="CODE e.g. FIRST50" autoCapitalize="characters" value={f.code} onChangeText={(v) => setF({ ...f, code: v.toUpperCase() })} />
      <T v="label">Discount type</T>
      <Picker testID="coupon-type" value={f.discount_type} onChange={(v) => setF({ ...f, discount_type: v })} options={[{ k: "percent", label: "% off" }, { k: "flat", label: "Flat ₹ off" }]} />
      <Row>
        <View style={{ flex: 1 }}><Input testID="coupon-value-input" label="Value" keyboardType="number-pad" value={f.value} onChangeText={(v) => setF({ ...f, value: v })} /></View>
        <View style={{ flex: 1 }}><Input testID="coupon-max-input" label="Max discount ₹" keyboardType="number-pad" value={f.max_discount} onChangeText={(v) => setF({ ...f, max_discount: v })} /></View>
      </Row>
      <Row>
        <View style={{ flex: 1 }}><Input testID="coupon-min-order-input" label="Min order ₹" keyboardType="number-pad" value={f.min_order} onChangeText={(v) => setF({ ...f, min_order: v })} /></View>
        <View style={{ flex: 1 }}><Input testID="coupon-usage-limit-input" label="Usage limit" keyboardType="number-pad" value={f.usage_limit} onChangeText={(v) => setF({ ...f, usage_limit: v })} /></View>
      </Row>
      <Input testID="coupon-valid-till-input" label="Valid till (YYYY-MM-DD)" placeholder="2026-12-31" value={f.valid_till} onChangeText={(v) => setF({ ...f, valid_till: v })} />
      <Row style={styles.toggleRow}><T v="bodyMedium" style={{ flex: 1 }}>First order only</T><Toggle testID="coupon-first-order-switch" value={f.first_order_only} onChange={(v) => setF({ ...f, first_order_only: v })} /></Row>
      <Input testID="coupon-desc-input" label="Description" placeholder="Description" value={f.description} onChangeText={(v) => setF({ ...f, description: v })} />
      <T v="label">Target cities (none = all)</T>
      <View style={styles.wrap}>{cities.map((c) => <Chip key={c.id} label={c.city_name} active={f.city_ids.includes(c.id)} onPress={() => tog("city_ids", c.id)} testID={`coupon-city-${c.id}`} />)}</View>
      <T v="label">Target categories (none = all)</T>
      <View style={styles.wrap}>{cats.map((c) => <Chip key={c.id} label={c.name} active={f.category_ids.includes(c.id)} onPress={() => tog("category_ids", c.id)} testID={`coupon-cat-${c.id}`} />)}</View>
      <Button testID="coupon-save-btn" variant="accent" title="Create coupon" disabled={!f.code || !f.value} loading={busy} onPress={save} />
    </Sheet>
  );
};

export default function Pricing() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { lang, t } = useLang();
  const [seg, setSeg] = useState("surge");
  const [dlg, setDlg] = useState<string | null>(null);
  const rules = useApi<any[]>("/admin/surge-rules");
  const coupons = useApi<any[]>("/admin/coupons");
  const cities = useApi<any[]>("/admin/cities");
  const cats = useApi<any>("/catalog/home");
  const cityName = (id: string) => (id === "all" ? t("All cities") : cities.data?.find((c) => c.id === id)?.city_name || id);
  const catName = (id: string) => cats.data?.categories?.find((c: any) => c.id === id)?.name || id;
  const cur = seg === "surge" ? rules : coupons;
  const wrap = async (fn: () => Promise<any>) => { try { await fn(); cur.reload(); } catch (e) { toast(errMsg(e), "error"); } };
  const toggleRule = (r: any, v: boolean) => { const { id, created_at, ...rest } = r; rules.setData((rules.data || []).map((x) => (x.id === id ? { ...x, is_active: v } : x))); wrap(() => api(`/admin/surge-rules/${id}`, { method: "PUT", body: { ...rest, is_active: v } })); };
  const toggleCoupon = (c: any, v: boolean) => { const { id, used_count, created_at, ...rest } = c; coupons.setData((coupons.data || []).map((x) => (x.id === id ? { ...x, is_active: v } : x))); wrap(() => api(`/admin/coupons/${id}`, { method: "PUT", body: { ...rest, is_active: v } })); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Surge & Promos" />
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Segmented testID="pricing-seg" value={seg} onChange={setSeg} options={[{ k: "surge", label: "Surge rules" }, { k: "coupons", label: "Coupons" }]} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 96 }}
        refreshControl={<RefreshControl refreshing={cur.refreshing} onRefresh={cur.refresh} tintColor={colors.brand} />}>
        {seg === "surge" && <T v="caption">Highest active multiplier applies at checkout (city surge + matching rules).</T>}
        {cur.loading && !cur.data ? [0, 1, 2].map((i) => <Skeleton key={i} h={110} />) : cur.error && !cur.data ? <ErrorBox text={cur.error} onRetry={cur.reload} /> :
          seg === "surge" ? (!rules.data?.length ? <Empty text="No active alerts" /> : rules.data.map((r) => {
            const tr = TRIG[r.trigger] || TRIG.high_demand;
            return (
              <Card key={r.id} testID={`surge-rule-${r.id}`} style={[{ gap: 4 }, r.is_active && { borderColor: colors.brandSecondary, borderWidth: 1.5 }]}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Row style={{ gap: 6 }}><Icon name={tr.icon} size={16} color={colors.brandSecondary} /><T v="label">{tr.label}</T></Row>
                  <Toggle testID={`surge-toggle-${r.id}`} value={r.is_active} onChange={(v) => toggleRule(r, v)} />
                </Row>
                <T v="bodyMedium">{r.name}</T>
                <T v="display" color={colors.brand}>{`${r.multiplier}x`}</T>
                <Row style={{ justifyContent: "space-between" }}>
                  <T v="caption" style={{ flex: 1 }}>{`${cityName(r.city_id)}${r.trigger === "peak_hours" ? ` · ${r.start_hour}:00–${r.end_hour}:00 IST` : r.weather ? ` · ${t(r.weather)}` : ""}`}</T>
                  <Button small variant="ghost" icon="trash-outline" title="Delete" onPress={() => wrap(() => api(`/admin/surge-rules/${r.id}`, { method: "DELETE" }))} testID={`surge-delete-${r.id}`} />
                </Row>
              </Card>
            );
          })) : (!coupons.data?.length ? <Empty text="No results" /> : coupons.data.map((c) => (
            <Card key={c.id} testID={`coupon-row-${c.code}`} style={{ gap: 6 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <View style={styles.code}><T v="mono" color={colors.brand} style={{ fontSize: 14 }}>{c.code}</T></View>
                <Toggle testID={`coupon-toggle-${c.code}`} value={c.is_active} onChange={(v) => toggleCoupon(c, v)} />
              </Row>
              <T v="bodyMedium">{`${c.discount_type === "percent" ? t(`${c.value}% off${c.max_discount ? ` up to ${inr(c.max_discount)}` : ""}`) : t(`${inr(c.value)} off`)}${c.min_order ? " " + t(`· min ${inr(c.min_order)}`) : ""}${c.first_order_only ? " " + t("· 1st order") : ""}`}</T>
              <T v="caption">{`${c.city_ids.length ? c.city_ids.map(cityName).join(", ") : t("All cities")} · ${c.category_ids.length ? c.category_ids.map(catName).join(", ") : t("All categories")}`}</T>
              <Row style={{ justifyContent: "space-between" }}>
                <T v="caption">{`${t("Usage")} ${c.used_count}/${c.usage_limit || "∞"} · ${t("Valid till")} ${c.valid_till ? fmtDate(c.valid_till, lang) : "-"}`}</T>
                <Button small variant="ghost" icon="trash-outline" title="Delete" onPress={() => wrap(() => api(`/admin/coupons/${c.id}`, { method: "DELETE" }))} testID={`coupon-delete-${c.code}`} />
              </Row>
            </Card>
          )))}
      </ScrollView>
      <View style={[styles.fabWrap, { bottom: insets.bottom + spacing.lg }]}>
        <Button variant={seg === "surge" ? "primary" : "accent"} icon="add" title={seg === "surge" ? "New rule" : "New coupon"} onPress={() => setDlg(seg)}
          testID={seg === "surge" ? "open-surge-dialog-btn" : "open-coupon-dialog-btn"} style={styles.fab} />
      </View>
      <SurgeForm open={dlg === "surge"} cities={cities.data || []} onClose={(ok) => { setDlg(null); if (ok) rules.reload(); }} />
      <CouponForm open={dlg === "coupons"} cities={cities.data || []} cats={cats.data?.categories || []} onClose={(ok) => { setDlg(null); if (ok) coupons.reload(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  toggleRow: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  code: { backgroundColor: colors.brandTertiary, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4, borderStyle: "dashed", borderWidth: 1, borderColor: colors.brand },
  fabWrap: { position: "absolute", right: spacing.lg },
  fab: { borderRadius: radius.pill, paddingHorizontal: spacing.xl, shadowColor: colors.onSurface, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
});
