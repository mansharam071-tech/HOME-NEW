import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDate, fmtDT, inr, useApi } from "@/src/api";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { Badge, Button, Card, Empty, ErrorBox, Icon, Input, Press, Row, Segmented, Sheet, Skeleton, T, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

const DOCS: Record<string, string> = { aadhaar: "Aadhaar", pan: "PAN", dl: "Driving Licence", police: "Police Verification" };

const DocRow = ({ p, type, doc, reload }: any) => {
  const toast = useToast();
  const { lang, t } = useLang();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [file, setFile] = useState<string | null | undefined>(undefined);
  const act = async (action: string) => {
    setBusy(action);
    try { await api(`/admin/kyc/${p.id}/${type}`, { method: "POST", body: { action, note } }); toast(`${DOCS[type]} ${action}d`); reload(); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  const view = async () => {
    try { setFile((await api(`/admin/kyc/${p.id}/${type}/file`)).file || null); } catch (e) { toast(errMsg(e), "error"); }
  };
  return (
    <View style={styles.doc} testID={`kyc-row-${p.id}-${type}`}>
      <Row style={{ justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <T v="bodyMedium">{DOCS[type]}</T>
          <T v="caption">{`${doc.number || "—"}${doc.expiry_date ? ` · ${t("Valid till")} ${fmtDate(doc.expiry_date, lang)}` : ""}`}</T>
        </View>
        <Badge status={doc.status} />
        <Press testID={`kyc-view-${p.id}-${type}`} onPress={view} style={styles.viewBtn}><Icon name="document-text-outline" size={18} color={colors.brand} /></Press>
      </Row>
      <Input testID={`kyc-note-${p.id}-${type}`} placeholder="Note to partner (optional)" value={note} onChangeText={setNote} style={{ minHeight: 40 }} />
      <Row>
        <Button small style={{ flex: 1 }} variant="success" title="Accept" loading={busy === "approve"} onPress={() => act("approve")} testID={`kyc-approve-${p.id}-${type}`} />
        <Button small style={{ flex: 1 }} variant="danger" title="Reject" loading={busy === "reject"} onPress={() => act("reject")} testID={`kyc-reject-${p.id}-${type}`} />
        <Button small style={{ flex: 1 }} variant="outline" title="Resubmit" loading={busy === "resubmit"} onPress={() => act("resubmit")} testID={`kyc-resubmit-${p.id}-${type}`} />
      </Row>
      <Sheet open={file !== undefined} onClose={() => setFile(undefined)} title={`${p.name} · ${t(DOCS[type])}`} testID="kyc-file-sheet">
        {file && file.startsWith("data:image") ? <Image source={{ uri: file }} style={{ width: "100%", height: 360, borderRadius: radius.md }} contentFit="contain" />
          : <Empty icon="document-outline" text={file ? "PDF document – open on web console" : "No file uploaded for this document (seeded demo record)."} />}
      </Sheet>
    </View>
  );
};

const KycCard = ({ p, reload }: any) => {
  const [open, setOpen] = useState(false);
  const { lang, t } = useLang();
  const docs = Object.entries(p.documents || {});
  return (
    <Card testID={`kyc-partner-${p.id}`} style={{ gap: spacing.md }}>
      <Press testID={`kyc-expand-${p.id}`} onPress={() => setOpen(!open)}>
        <Row>
          {p.avatar ? <Image source={{ uri: p.avatar }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarFb]}><Icon name="person" size={20} color={colors.brand} /></View>}
          <View style={{ flex: 1 }}>
            <T v="subtitle" numberOfLines={1}>{p.name || "New partner"}</T>
            <T v="caption" numberOfLines={1}>{`+91 ${p.phone} · ${t("· joined").replace("· ", "")} ${fmtDT(p.created_at, lang)}`}</T>
          </View>
          <Badge status={p.kyc_status} />
          <Icon name={open ? "chevron-up" : "chevron-down"} size={20} color={colors.muted} />
        </Row>
      </Press>
      <Row style={{ flexWrap: "wrap", gap: 6 }}>
        {docs.map(([k, d]: any) => (
          <View key={k} style={[styles.docPill, d.status === "approved" && { backgroundColor: "#DCFCE7" }, d.status === "rejected" && { backgroundColor: "#FEE2E2" }]}>
            <Icon name={d.status === "approved" ? "checkmark-circle" : d.status === "rejected" ? "close-circle" : "time-outline"} size={12}
              color={d.status === "approved" ? "#166534" : d.status === "rejected" ? "#B91C1C" : colors.muted} />
            <T v="caption" style={{ fontSize: 11 }}>{DOCS[k]}</T>
          </View>
        ))}
      </Row>
      {open && (docs.length ? docs.map(([k, d]) => <DocRow key={k} p={p} type={k} doc={d} reload={reload} />) : <T v="caption">No documents uploaded yet</T>)}
    </Card>
  );
};

export default function Partners() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { lang, t } = useLang();
  const [seg, setSeg] = useState("kyc");
  const kyc = useApi<any[]>("/admin/kyc");
  const partners = useApi<any[]>("/admin/partners", undefined, 15000);
  const sos = useApi<any[]>("/admin/sos", undefined, 10000);
  const payouts = useApi<any[]>("/admin/payouts");
  const [busy, setBusy] = useState<string | null>(null);
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const openSos = (sos.data || []).filter((s) => s.status === "open");
  const reloadAll = () => { kyc.reload(); partners.reload(); sos.reload(); payouts.reload(); };
  const post = async (key: string, url: string, msg: string) => {
    setBusy(key);
    try { await api(url, { method: "POST" }); toast(msg); reloadAll(); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); }
  };
  const cur = seg === "kyc" ? kyc : seg === "partners" ? partners : payouts;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.head, { paddingTop: insets.top + spacing.sm }]}>
        <T v="title" testID="screen-title">Partners & SOS</T>
        <Segmented testID="partners-seg" value={seg} onChange={setSeg} options={[
          { k: "kyc", label: `${t("KYC")} (${kyc.data?.length ?? 0})` }, { k: "partners", label: "Partners" }, { k: "payouts", label: "Payouts" },
        ]} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: bottomChrome + spacing.xl }}
        refreshControl={<RefreshControl refreshing={cur.refreshing} onRefresh={reloadAll} tintColor={colors.brand} />}>
        {openSos.length > 0 && (
          <View style={styles.sos} testID="sos-alerts-panel">
            <Row><Icon name="warning" size={20} color={colors.error} /><T v="subtitle" color={colors.error}>Active SOS emergencies</T></Row>
            {openSos.map((s) => (
              <View key={s.id} style={styles.sosRow} testID={`sos-${s.id}`}>
                <View style={{ flex: 1 }}>
                  <T v="bodyMedium">{s.partner_name}</T>
                  <T v="caption">{`${s.phone} · ${fmtDT(s.created_at, lang)} · ${s.location ? `${s.location.lat.toFixed(4)}, ${s.location.lng.toFixed(4)}` : t("no GPS")}`}</T>
                </View>
                <Button small variant="danger" title="Mark resolved" loading={busy === s.id} onPress={() => post(s.id, `/admin/sos/${s.id}/resolve`, "SOS resolved")} testID={`sos-resolve-${s.id}`} />
              </View>
            ))}
          </View>
        )}
        {cur.loading && !cur.data ? [0, 1, 2].map((i) => <Skeleton key={i} h={110} />) : cur.error && !cur.data ? <ErrorBox text={cur.error} onRetry={cur.reload} /> : (
          <>
            {seg === "kyc" && <>
              <T v="caption">Partners with documents awaiting verification. Approving all 4 documents activates the partner.</T>
              {!kyc.data?.length ? <Empty text="KYC queue is clear" icon="shield-checkmark-outline" testID="kyc-empty" /> :
                kyc.data.map((p) => <KycCard key={p.id} p={p} reload={() => { kyc.reload(); partners.reload(); }} />)}
            </>}
            {seg === "partners" && (partners.data || []).map((p) => (
              <Card key={p.id} testID={`partner-row-${p.id}`} style={{ gap: spacing.sm, padding: spacing.md }}>
                <Row>
                  <View style={[styles.dot, { backgroundColor: p.is_online ? colors.success : colors.borderStrong }]} />
                  <View style={{ flex: 1 }}>
                    <T v="bodyMedium" numberOfLines={1}>{p.name || "—"}</T>
                    <T v="caption">{`${p.phone} · ${t(p.is_online ? "Online" : "Offline")} · ★ ${p.rating ?? 0} · ${p.jobs_done ?? 0} ${t("Jobs")}`}</T>
                  </View>
                  <Badge status={p.kyc_status} />
                </Row>
                <Row style={{ gap: spacing.md }}>
                  <View style={styles.stat}><T v="label">COD cash</T><T v="bodyMedium" color={p.cod_blocked ? colors.error : colors.onSurface}>{`${inr(p.cod_cash)} / ${inr(p.cod_limit)}`}</T></View>
                  <View style={styles.stat}><T v="label">Rejections</T><T v="bodyMedium" color={p.consecutive_rejections >= 3 ? "#A16207" : colors.onSurface}>{String(p.consecutive_rejections ?? 0)}</T></View>
                  <View style={styles.stat}><T v="label">Pending / Wallet</T><T v="bodyMedium" numberOfLines={1}>{`${inr(p.pending_earnings)} / ${inr(p.wallet_balance)}`}</T></View>
                </Row>
                {(p.cod_cash > 0 || p.consecutive_rejections > 0) && (
                  <Row>
                    {p.cod_cash > 0 && <Button small variant="outline" icon="cash-outline" title="Settle COD" loading={busy === `cod${p.id}`} onPress={() => post(`cod${p.id}`, `/admin/partners/${p.id}/settle-cod`, "COD cash marked remitted")} testID={`settle-cod-${p.id}`} />}
                    {p.consecutive_rejections > 0 && <Button small variant="outline" icon="refresh" title="Reset" loading={busy === `rej${p.id}`} onPress={() => post(`rej${p.id}`, `/admin/partners/${p.id}/reset-rejections`, "Counter reset")} testID={`reset-rej-${p.id}`} />}
                  </Row>
                )}
              </Card>
            ))}
            {seg === "payouts" && (!payouts.data?.length ? <Empty text="No requests" icon="wallet-outline" testID="payouts-empty" /> : payouts.data.map((x) => (
              <Card key={x.id} testID={`admin-payout-${x.id}`} style={{ gap: spacing.sm, padding: spacing.md }}>
                <Row style={{ justifyContent: "space-between" }}><T v="bodyMedium">{x.partner_name}</T><T v="subtitle">{inr(x.amount)}</T></Row>
                <T v="caption">{`${x.bank?.bank_name || ""} ${x.bank?.account_no || ""} · ${fmtDT(x.created_at, lang)}`}</T>
                {x.status === "requested" ? <Button small variant="success" icon="checkmark" title="Mark paid" loading={busy === x.id} onPress={() => post(x.id, `/admin/payouts/${x.id}/pay`, "Payout marked paid")} testID={`payout-pay-${x.id}`} style={{ alignSelf: "flex-start" }} />
                  : <T v="label" color={colors.success}>{`${t("PAID ·")} ${x.utr}`}</T>}
              </Card>
            )))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  doc: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary },
  viewBtn: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", backgroundColor: colors.brandTertiary },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarFb: { backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  docPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary },
  sos: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.error, backgroundColor: colors.errorTint },
  sosRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary },
  dot: { width: 10, height: 10, borderRadius: 5 },
  stat: { flex: 1, gap: 2 },
});
