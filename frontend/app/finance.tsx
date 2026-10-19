import React, { useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDate, fmtDT, inr, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { Badge, Button, Card, Divider, Empty, ErrorBox, KV, Press, Row, ScreenHeader, Segmented, Sheet, Skeleton, T, useToast, Icon } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

const Stepper = ({ label, v, onV, testID }: { label: string; v: number; onV: (x: number) => void; testID: string }) => {
  const pct = Math.round(v * 1000) / 10;
  const set = (p: number) => onV(Math.min(20, Math.max(15, p)) / 100);
  return (
    <Row style={{ justifyContent: "space-between", paddingVertical: 4 }} testID={testID}>
      <T v="body" style={{ flex: 1 }} numberOfLines={1}>{label}</T>
      <Press testID={`${testID}-dec`} onPress={() => set(pct - 0.5)} style={styles.step} disabled={pct <= 15}><Icon name="remove" size={18} color={colors.brand} /></Press>
      <View style={styles.bar}><View style={[styles.fill, { width: `${((pct - 15) / 5) * 100}%` }]} /></View>
      <Press testID={`${testID}-inc`} onPress={() => set(pct + 0.5)} style={styles.step} disabled={pct >= 20}><Icon name="add" size={18} color={colors.brand} /></Press>
      <T v="bodyMedium" style={{ width: 48, textAlign: "right" }} testID={`${testID}-value`}>{`${pct.toFixed(1)}%`}</T>
    </Row>
  );
};

const Commission = () => {
  const toast = useToast();
  const [c, setC] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const cats = useApi<any>("/catalog/home");
  useEffect(() => { api("/admin/commission").then(setC).catch((e) => toast(errMsg(e), "error")); }, [toast]);
  if (!c) return <Skeleton h={220} />;
  const save = async () => {
    setBusy(true);
    try { setC(await api("/admin/commission", { method: "PUT", body: { default_rate: c.default_rate, category_rates: c.category_rates } })); toast("Commission rules saved"); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <Card testID="commission-engine" style={{ gap: spacing.sm }}>
      <T v="subtitle">Commission engine</T>
      <T v="caption">Rule-based deduction (15–20%) on taxable job value. Highest category rate in a booking applies.</T>
      <Stepper label="Default rate" testID="commission-default" v={c.default_rate} onV={(v) => setC({ ...c, default_rate: v })} />
      <Divider />
      {(cats.data?.categories || []).map((k: any) => (
        <Stepper key={k.id} label={k.name} testID={`commission-${k.id}`} v={c.category_rates[k.id] ?? c.default_rate}
          onV={(v) => setC({ ...c, category_rates: { ...c.category_rates, [k.id]: v } })} />
      ))}
      <Button testID="commission-save-btn" title="Save rules" icon="save-outline" loading={busy} onPress={save} />
    </Card>
  );
};

const Invoice = ({ id, onClose }: { id: string | null; onClose: () => void }) => {
  const { lang } = useLang();
  const { data, loading, error } = useApi<any>(id ? `/bookings/${id}/invoice` : null);
  return (
    <Sheet open={!!id} onClose={onClose} title="Customer GST invoice" testID="invoice-sheet">
      {loading || !data ? (error ? <T v="body" color={colors.error}>{error}</T> : <Skeleton h={200} />) : (
        <View style={{ gap: 4 }}>
          <Row style={{ justifyContent: "space-between" }}><T v="bodyMedium">{data.seller.name}</T><T v="mono" testID="invoice-number">{data.invoice_no}</T></Row>
          <T v="caption">{`${data.seller.gstin} · ${fmtDT(data.date, lang)} · SAC ${data.sac}`}</T>
          <T v="caption">{`${data.buyer.name || "-"} · ${data.buyer.phone || ""} · ${data.buyer.address || ""}`}</T>
          <Divider />
          {data.lines.map((l: any, i: number) => <KV key={i} k={`${l.name} × ${l.qty}`} v={inr(l.line_total)} />)}
          {data.extras.map((e: any, i: number) => <KV key={`e${i}`} k={e.name || "Extra"} v={inr(e.amount)} />)}
          <Divider />
          <KV k="Taxable" v={inr(data.pricing.taxable)} />
          <KV k={`CGST ${(data.gst_rate * 50).toFixed(0)}%`} v={inr(data.pricing.cgst)} />
          <KV k={`SGST ${(data.gst_rate * 50).toFixed(0)}%`} v={inr(data.pricing.sgst)} />
          <KV k="Total" v={inr(data.pricing.total)} bold />
          <T v="caption">{`${String(data.payment_method).toUpperCase()} · ${data.place_of_supply}`}</T>
        </View>
      )}
    </Sheet>
  );
};

export default function Finance() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { lang, t } = useLang();
  const [seg, setSeg] = useState("settlements");
  const stl = useApi<any[]>("/admin/settlements");
  const inv = useApi<any[]>("/admin/invoices");
  const [view, setView] = useState<any>(null);
  const [bInv, setBInv] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const gen = async () => {
    setBusy("gen");
    try { const d = await api("/admin/settlements/generate", { method: "POST" }); toast(`${d.created} settlement(s) generated`); stl.reload(); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  const rel = async (s: any) => {
    setBusy(s.id);
    try { await api(`/admin/settlements/${s.id}/release`, { method: "POST" }); toast(`Released ${inr(s.net_payable)} to ${s.partner_name}`); stl.reload(); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Financials" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        refreshControl={<RefreshControl refreshing={stl.refreshing} onRefresh={() => { stl.refresh(); inv.reload(); }} tintColor={colors.brand} />}>
        <Commission />
        <Segmented testID="finance-seg" value={seg} onChange={setSeg} options={[{ k: "settlements", label: "Settlements" }, { k: "invoices", label: "Invoices" }]} />
        {seg === "settlements" ? (
          <View style={{ gap: spacing.md }}>
            <Row style={{ justifyContent: "space-between" }}>
              <T v="subtitle" style={{ flex: 1 }}>Weekly partner settlements</T>
              <Button small variant="accent" icon="sparkles" title="Generate this week" loading={busy === "gen"} onPress={gen} testID="generate-settlements-btn" />
            </Row>
            {stl.loading && !stl.data ? <Skeleton h={90} /> : stl.error && !stl.data ? <ErrorBox text={stl.error} onRetry={stl.reload} /> :
              !stl.data?.length ? <Empty text="No settlements yet — click generate." icon="wallet-outline" testID="settlements-empty" /> : stl.data.map((s) => (
                <Card key={s.id} testID={`settlement-${s.id}`} style={{ gap: 6, padding: spacing.md }}>
                  <Row style={{ justifyContent: "space-between" }}><T v="bodyMedium" style={{ flex: 1 }} numberOfLines={1}>{s.partner_name}</T><T v="subtitle">{inr(s.net_payable)}</T></Row>
                  <T v="caption">{`${s.jobs} ${t("jobs ·")} ${fmtDate(s.period_start, lang)} → ${fmtDate(s.period_end, lang)}`}</T>
                  <T v="caption">{`${t("Commission")} ${inr(s.commission)} ${t("· penalties")} ${inr(s.penalties)} ${t("· tips")} ${inr(s.tips)}`}</T>
                  <Row style={{ justifyContent: "space-between", marginTop: 4 }}>
                    <Button small variant="outline" icon="document-text-outline" title="GST inv." onPress={() => setView(s)} testID={`settlement-invoice-${s.id}`} />
                    {s.status === "pending" ? <Button small variant="success" icon="send" title="Release" loading={busy === s.id} onPress={() => rel(s)} testID={`settlement-release-${s.id}`} />
                      : <Badge status="completed" />}
                  </Row>
                </Card>
              ))}
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <T v="subtitle">Auto-generated customer GST invoices</T>
            {inv.loading && !inv.data ? <Skeleton h={90} /> : !inv.data?.length ? <Empty text="No results" /> : inv.data.slice(0, 40).map((b) => (
              <Press key={b.id} testID={`invoice-view-${b.id}`} onPress={() => setBInv(b.id)} style={styles.inv}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="mono">{b.invoice_no}</T>
                  <T v="caption">{`${b.booking_no} · ${b.city_name} · ${fmtDT(b.completed_at, lang)}`}</T>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <T v="bodyMedium">{inr(b.pricing.total)}</T>
                  <T v="caption">{`GST ${inr(b.pricing.gst)}`}</T>
                </View>
              </Press>
            ))}
          </View>
        )}
      </ScrollView>
      <Sheet open={!!view} onClose={() => setView(null)} title="Commission tax invoice" testID="settlement-invoice-dialog">
        {view && (
          <View style={{ gap: 2 }}>
            <Row style={{ justifyContent: "space-between" }}><T v="bodyMedium">HomeServe Technologies Pvt. Ltd.</T><T v="mono">{view.gst_invoice_no}</T></Row>
            <T v="caption">{`GSTIN [placeholder] · ${view.partner_name} · ${fmtDate(view.period_start, lang)} → ${fmtDate(view.period_end, lang)}`}</T>
            <Divider />
            <KV k="Jobs" v={view.jobs} />
            <KV k="Gross job value" v={inr(view.gross)} />
            <KV k="Platform commission" v={inr(view.commission)} />
            <KV k="GST on commission (18%)" v={inr(view.commission_gst)} />
            <KV k="Partner earnings" v={inr(view.earnings)} />
            <KV k="Tips" v={inr(view.tips)} />
            <KV k="Penalties" v={`- ${inr(view.penalties)}`} />
            <Divider />
            <KV k="Net payable to partner" v={inr(view.net_payable)} bold />
          </View>
        )}
      </Sheet>
      <Invoice id={bInv} onClose={() => setBInv(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  step: { width: 36, height: 36, borderRadius: radius.sm + 2, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  bar: { width: 56, height: 6, borderRadius: 3, backgroundColor: colors.surfaceTertiary, overflow: "hidden" },
  fill: { height: 6, backgroundColor: colors.brand },
  inv: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
});
