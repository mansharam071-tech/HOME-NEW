import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, inr, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { Button, Card, Empty, ErrorBox, Icon, Input, Press, Row, ScreenHeader, Sheet, Skeleton, T, Toggle, useToast } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

const BLANK = { city_name: "", state: "", is_active: true, pincodes: [] as string[], polygon: [], surge_pricing: { is_active: false, multiplier: 1.0, reason: "" }, assigned_services: [] as any[] };
const toPayload = (c: any) => ({
  city_name: c.city_name, state: c.state, is_active: c.is_active, pincodes: c.pincodes, polygon: c.polygon || [],
  center: c.center, surge_pricing: { ...c.surge_pricing, multiplier: Number(c.surge_pricing.multiplier) || 1 }, assigned_services: c.assigned_services,
});

const PincodeChips = ({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) => {
  const [txt, setTxt] = useState("");
  const toast = useToast();
  const add = () => {
    const parts = txt.split(/[\s,]+/).filter((x) => /^\d{6}$/.test(x));
    if (!parts.length) return toast("Enter valid 6-digit pincodes", "error");
    onChange([...new Set([...value, ...parts])]);
    setTxt("");
  };
  return (
    <View style={{ gap: spacing.sm }} testID="city-modal-pincodes">
      <T v="label">Pincodes</T>
      <View style={styles.chips}>
        {value.map((p) => (
          <Press key={p} testID={`pincode-chip-${p}`} onPress={() => onChange(value.filter((x) => x !== p))} style={styles.pin}>
            <T v="mono" color={colors.brand}>{p}</T><Icon name="close" size={12} color={colors.brand} />
          </Press>
        ))}
      </View>
      <Row>
        <TextInput testID="pincode-chip-input-field" value={txt} onChangeText={setTxt} onSubmitEditing={add} keyboardType="number-pad" returnKeyType="done"
          placeholder="226010, 226016" placeholderTextColor={colors.muted} style={styles.pinInput} />
        <Button small title="Add" icon="add" onPress={add} testID="pincode-add-btn" />
      </Row>
    </View>
  );
};

const CityEditor = ({ city, services, onClose, onSaved }: { city: any; services: any[]; onClose: () => void; onSaved: () => void }) => {
  const toast = useToast();
  const { t } = useLang();
  const isNew = city === "new";
  const [f, setF] = useState<any>(BLANK);
  const [busy, setBusy] = useState<string | null>(null);
  const [json, setJson] = useState(false);
  const [csv, setCsv] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);
  useEffect(() => { if (city) { setF(isNew ? BLANK : { ...city }); setJson(false); setCsv(""); setConfirmDel(false); } }, [city, isNew]);
  if (!city) return null;
  const sp = f.surge_pricing;
  const assigned = (sid: string) => f.assigned_services.find((a: any) => a.service_id === sid);
  const toggleSvc = (s: any) => setF({ ...f, assigned_services: assigned(s.id) ? f.assigned_services.filter((a: any) => a.service_id !== s.id) : [...f.assigned_services, { service_id: s.id, city_price: s.price }] });
  const setPrice = (sid: string, v: string) => setF({ ...f, assigned_services: f.assigned_services.map((a: any) => (a.service_id === sid ? { ...a, city_price: Number(v) || 0 } : a)) });
  const run = async (key: string, fn: () => Promise<any>, msg: string) => {
    setBusy(key);
    try { await fn(); toast(msg); onSaved(); if (key !== "csv") onClose(); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  const save = () => run("save", () => (isNew ? api("/admin/cities", { method: "POST", body: toPayload(f) }) : api(`/admin/cities/${f.id}`, { method: "PUT", body: toPayload(f) })),
    isNew ? `${f.city_name} launched!` : "City updated");
  const uploadCsv = () => run("csv", async () => {
    const d = await api(`/admin/cities/${f.id}/pincodes/bulk`, { method: "POST", body: { csv_text: csv } });
    setF((x: any) => ({ ...x, pincodes: d.pincodes })); setCsv("");
    toast(`${d.added} new pincodes added from CSV`);
  }, "Geofence & pincodes saved");
  const jsonView = { city_name: f.city_name, state: f.state, is_active: f.is_active, pincodes: f.pincodes, surge_pricing: f.surge_pricing, assigned_services: f.assigned_services };

  return (
    <Sheet open={!!city} onClose={onClose} title={isNew ? "Launch a new city" : t(`Edit ${city.city_name}`)} testID="city-launch-modal" form>
      <Input testID="city-name-input" label="City name" placeholder="Lucknow" value={f.city_name} onChangeText={(v) => setF({ ...f, city_name: v })} />
      <Input testID="city-state-input" label="State" placeholder="Uttar Pradesh" value={f.state} onChangeText={(v) => setF({ ...f, state: v })} />
      <Row style={styles.toggleRow}><T v="bodyMedium" style={{ flex: 1 }}>Active status</T><Toggle testID="city-active-switch" value={f.is_active} onChange={(v) => setF({ ...f, is_active: v })} /></Row>
      <PincodeChips value={f.pincodes} onChange={(v) => setF({ ...f, pincodes: v })} />
      {!isNew && (
        <View style={{ gap: spacing.sm }}>
          <Input testID="pincode-csv-input" label="CSV bulk upload" placeholder="Paste CSV text with pincodes" multiline value={csv} onChangeText={setCsv} />
          <Button small variant="outline" icon="cloud-upload-outline" title="Upload CSV text" disabled={!csv.trim()} loading={busy === "csv"} onPress={uploadCsv} testID="pincode-csv-upload" style={{ alignSelf: "flex-start" }} />
        </View>
      )}
      <View style={styles.box}>
        <Row><T v="bodyMedium" style={{ flex: 1 }}>City surge pricing</T><Toggle testID="city-surge-switch" value={sp.is_active} onChange={(v) => setF({ ...f, surge_pricing: { ...sp, is_active: v } })} /></Row>
        {sp.is_active && (
          <Row style={{ alignItems: "flex-end" }}>
            <View style={{ width: 96 }}><Input testID="city-surge-multiplier" label="Multiplier" keyboardType="decimal-pad" value={String(sp.multiplier)} onChangeText={(v) => setF({ ...f, surge_pricing: { ...sp, multiplier: v } })} /></View>
            <View style={{ flex: 1 }}><Input testID="city-surge-reason" label="Reason" placeholder="Rain / Peak Demand" value={sp.reason} onChangeText={(v) => setF({ ...f, surge_pricing: { ...sp, reason: v } })} /></View>
          </Row>
        )}
      </View>
      <T v="label">Assigned services & custom city base price</T>
      {services.map((s) => {
        const a = assigned(s.id);
        return (
          <View key={s.id} style={styles.svc}>
            <Press testID={`city-svc-${s.id}`} onPress={() => toggleSvc(s)} style={[styles.check, a && { backgroundColor: colors.brand, borderColor: colors.brand }]}>
              {a ? <Icon name="checkmark" size={16} color={colors.onBrand} /> : null}
            </Press>
            <View style={{ flex: 1 }}><T v="body" numberOfLines={1}>{s.name}</T><T v="caption">{`${t("base")} ${inr(s.price)}`}</T></View>
            {a && <TextInput testID={`city-price-${s.id}`} keyboardType="number-pad" value={String(a.city_price)} onChangeText={(v) => setPrice(s.id, v)} style={styles.price} />}
          </View>
        );
      })}
      <T v="caption">Polygon geofence points are kept as drawn on the web console.</T>
      <Button small variant="outline" icon="code-slash" title={json ? "Hide JSON" : "Show JSON"} onPress={() => setJson(!json)} testID="city-json-btn" style={{ alignSelf: "flex-start" }} />
      {json && <View style={styles.json} testID="city-json-dialog"><T v="mono" color="#86EFAC" style={{ fontSize: 11 }}>{JSON.stringify(jsonView, null, 2)}</T></View>}
      <Button testID="city-save-btn" title={isNew ? "Launch city" : "Save changes"} icon={isNew ? "rocket-outline" : "save-outline"} disabled={!f.city_name || !f.state} loading={busy === "save"} onPress={save} />
      {!isNew && (confirmDel ? (
        <Row>
          <Button style={{ flex: 1 }} variant="danger" title="Delete" loading={busy === "del"} testID="city-delete-confirm"
            onPress={() => run("del", () => api(`/admin/cities/${f.id}`, { method: "DELETE" }), `${f.city_name} deleted`)} />
          <Button style={{ flex: 1 }} variant="outline" title="Cancel" onPress={() => setConfirmDel(false)} testID="city-delete-cancel" />
        </Row>
      ) : <Button variant="ghost" icon="trash-outline" title="Delete city" onPress={() => setConfirmDel(true)} testID="city-delete-btn" />)}
    </Sheet>
  );
};

export default function Cities() {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const { data, loading, error, refreshing, refresh, reload } = useApi<any[]>("/admin/cities");
  const services = useApi<any[]>("/admin/services");
  const [sel, setSel] = useState<any>(null);
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Geofencing & Cities" subtitle={data ? `${data.length} ${t("Cities")}` : undefined} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + 96 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}>
        {loading && !data ? [0, 1, 2].map((i) => <Skeleton key={i} h={96} />) : error && !data ? <ErrorBox text={error} onRetry={reload} /> :
          !data?.length ? <Empty text="No cities configured" icon="map-outline" /> : data.map((c) => (
            <Press key={c.id} testID={`city-card-${c.id}`} onPress={() => setSel(c)}>
              <Card style={{ gap: 6 }}>
                <Row style={{ justifyContent: "space-between" }}>
                  <T v="subtitle">{c.city_name}</T>
                  <View style={[styles.pill, { backgroundColor: c.is_active ? "#DCFCE7" : colors.surfaceTertiary }]}>
                    <T v="label" color={c.is_active ? "#166534" : colors.muted} style={{ fontSize: 10 }}>{c.is_active ? "Active" : "Inactive"}</T>
                  </View>
                </Row>
                <T v="caption">{`${c.state} · ${c.pincodes.length} ${t("pincodes ·")} ${c.assigned_services.length} ${t("services")} · ${(c.polygon || []).length} pts`}</T>
                {c.surge_pricing?.is_active && <Row style={{ gap: 4 }}><Icon name="flash" size={14} color="#A16207" /><T v="caption" color="#A16207">{`Surge ${c.surge_pricing.multiplier}x · ${c.surge_pricing.reason}`}</T></Row>}
              </Card>
            </Press>
          ))}
      </ScrollView>
      <View style={[styles.fabWrap, { bottom: insets.bottom + spacing.lg }]}>
        <Button variant="accent" icon="add" title="Launch new city" onPress={() => setSel("new")} testID="open-city-launch-btn" style={styles.fab} />
      </View>
      <CityEditor city={sel} services={services.data || []} onClose={() => setSel(null)} onSaved={reload} />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  pin: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: colors.brandTertiary },
  pinInput: { flex: 1, height: 40, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  toggleRow: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  box: { gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  svc: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  check: { width: 26, height: 26, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  price: { width: 84, height: 36, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 8, fontFamily: fonts.textMedium, color: colors.onSurface, textAlign: "right" },
  json: { backgroundColor: colors.surfaceInverse, borderRadius: radius.md, padding: spacing.md },
  fabWrap: { position: "absolute", right: spacing.lg },
  fab: { borderRadius: radius.pill, paddingHorizontal: spacing.xl, shadowColor: colors.onSurface, shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
});
