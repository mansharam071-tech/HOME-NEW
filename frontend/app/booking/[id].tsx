import React, { useEffect, useState } from "react";
import { Linking, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, fmtDT, inr, useApi } from "@/src/api";
import { useCart } from "@/src/cart";
import { useLang } from "@/src/i18n";
import TrackMap from "@/src/TrackMap";
import { Badge, Button, Divider, ErrorBox, Icon, IconBtn, Input, KV, Press, Row, Sheet, Skeleton, T, useToast } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";
import { ActivityIndicator } from "react-native";

const STEPS = ["Confirmed", "En Route", "Job Started", "Completed"];
const stepOf = (b: any) => ({ pending: 0, assigned: 1, en_route: b.arrived_at ? 2 : 1, in_progress: 3, completed: 4 } as any)[b.status] ?? 0;

const Stepper = ({ current }: { current: number }) => (
  <View style={styles.stepper} testID="tracking-stepper">
    {STEPS.map((s, i) => {
      const done = i < current, active = i === current;
      return (
        <View key={s} style={{ flex: 1, alignItems: "center", gap: 4 }}>
          <Row style={{ gap: 0, width: "100%" }}>
            <View style={[styles.track, { opacity: i === 0 ? 0 : 1 }, (done || active) && { backgroundColor: colors.brand }]} />
            <View style={[styles.node, done && { backgroundColor: colors.brand, borderColor: colors.brand }, active && { borderColor: colors.brand }]}>
              {done ? <Icon name="checkmark" size={12} color={colors.onBrand} /> : active ? <View style={styles.inner} /> : null}
            </View>
            <View style={[styles.track, { opacity: i === STEPS.length - 1 ? 0 : 1 }, done && { backgroundColor: colors.brand }]} />
          </Row>
          <T v="caption" style={{ fontSize: 10, textAlign: "center" }} color={done || active ? colors.onSurface : colors.muted}>{s}</T>
        </View>
      );
    })}
  </View>
);

const Chat = ({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) => {
  const toast = useToast();
  const { lang, t } = useLang();
  const { data, setData } = useApi<any[]>(open ? `/bookings/${id}/messages` : null, undefined, 3000);
  const [text, setText] = useState("");
  const send = async () => {
    if (!text.trim()) return;
    try { const m = await api(`/bookings/${id}/messages`, { method: "POST", body: { text } }); setData([...(data || []), m]); setText(""); } catch (e) { toast(errMsg(e), "error"); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="In-app chat" testID="chat-dialog" form>
      <View style={{ gap: spacing.sm, minHeight: 200 }}>
        {!data?.length ? <T v="caption" style={{ textAlign: "center", marginTop: spacing.xl }}>No messages yet</T> : data.map((m) => {
          const me = m.sender_role === "customer";
          return (
            <View key={m.id} style={[styles.bubble, me ? styles.me : styles.them]}>
              <T v="body" color={me ? colors.onBrand : colors.onSurface}>{m.text}</T>
              <T v="caption" color={me ? "rgba(255,255,255,0.7)" : colors.muted} style={{ fontSize: 10 }}>{fmtDT(m.created_at, lang)}</T>
            </View>
          );
        })}
      </View>
      <Row>
        <TextInput testID="chat-input" value={text} onChangeText={setText} placeholder={t("Type a message")} placeholderTextColor={colors.muted} style={styles.chatInput} onSubmitEditing={send} returnKeyType="send" />
        <IconBtn testID="chat-send-btn" name="send" color={colors.onBrand} bg={colors.brand} onPress={send} />
      </Row>
    </Sheet>
  );
};

const Invoice = ({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) => {
  const { lang } = useLang();
  const { data: inv, error } = useApi<any>(open ? `/bookings/${id}/invoice` : null);
  const p = inv?.pricing || {};
  return (
    <Sheet open={open} onClose={onClose} title="Tax Invoice" testID="invoice-dialog">
      {!inv ? (error ? <T v="body" color={colors.error}>{error}</T> : <Skeleton h={200} />) : (
        <View style={{ gap: 2 }}>
          <Row style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}><T v="bodyMedium">{inv.seller.name}</T><T v="caption">{`GSTIN: ${inv.seller.gstin}`}</T></View>
            <View style={{ alignItems: "flex-end" }}><T v="mono" testID="invoice-number">{inv.invoice_no}</T><T v="caption">{fmtDT(inv.date, lang)}</T></View>
          </Row>
          <View style={styles.billTo}><T v="caption">{`Bill to: ${inv.buyer.name || "Customer"} · ${inv.buyer.address} (${inv.buyer.pincode})\nPlace of supply: ${inv.place_of_supply} · SAC ${inv.sac}`}</T></View>
          {inv.lines.map((l: any) => <KV key={l.service_id} k={`${l.name} × ${l.qty}`} v={inr(l.line_total)} />)}
          {inv.extras.map((e: any) => <KV key={e.id} k={`Extra: ${e.name}`} v={inr(e.amount)} />)}
          <Divider />
          <KV k="Subtotal" v={inr(p.subtotal)} />
          {p.surge_amount > 0 && <KV k={`Surge (${p.surge_multiplier}x)`} v={inr(p.surge_amount)} />}
          {p.discount > 0 && <KV k={`Discount ${p.coupon_code || ""}`} v={`- ${inr(p.discount)}`} />}
          <KV k="Taxable value" v={inr(p.taxable)} />
          <KV k="CGST 9%" v={inr(p.cgst)} />
          <KV k="SGST 9%" v={inr(p.sgst)} />
          <Divider />
          <KV k="Invoice total" v={inr(p.total)} bold />
          {inv.tip > 0 && <KV k="Tip to partner (non-taxable)" v={inr(inv.tip)} />}
        </View>
      )}
    </Sheet>
  );
};

const RateCard = ({ b, onDone }: { b: any; onDone: () => void }) => {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [tip, setTip] = useState(0);
  const [review, setReview] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try { await api(`/customer/bookings/${b.id}/rate`, { method: "POST", body: { rating, review, tip } }); toast("Thanks for your feedback!"); onDone(); }
    catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  return (
    <View style={styles.rate} testID="rate-card">
      <T v="subtitle">Rate your experience</T>
      <Row style={{ gap: spacing.xs }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Press key={n} testID={`rate-star-${n}`} onPress={() => setRating(n)}><Icon name={n <= rating ? "star" : "star-outline"} size={34} color={n <= rating ? colors.brandSecondary : colors.borderStrong} /></Press>
        ))}
      </Row>
      <T v="caption">Add a tip (100% goes to partner)</T>
      <Row>
        {[0, 20, 50, 100].map((x) => (
          <Press key={x} testID={`tip-${x}`} onPress={() => setTip(x)} style={[styles.tip, tip === x && { backgroundColor: colors.brand, borderColor: colors.brand }]}>
            <T v="bodyMedium" color={tip === x ? colors.onBrand : colors.onSurface} style={{ fontSize: 12 }}>{x ? inr(x) : "No tip"}</T>
          </Press>
        ))}
      </Row>
      <Input testID="rate-review-input" placeholder="Write a review (optional)" value={review} onChangeText={setReview} multiline />
      <Button testID="rate-submit-btn" title="Submit" disabled={!rating} loading={busy} onPress={submit} />
    </View>
  );
};

export default function Tracking() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  const { refresh } = useCart();
  const { data: b, error, reload } = useApi<any>(`/customer/bookings/${id}`, undefined, 3000);
  const [chat, setChat] = useState(false);
  const [invoice, setInvoice] = useState(false);
  const [call, setCall] = useState<any>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [extraSeen, setExtraSeen] = useState<string | null>(null);
  const pendingExtra = b?.extras?.find((e: any) => e.status === "pending");
  useEffect(() => { if (!pendingExtra) setExtraSeen(null); }, [pendingExtra]);
  const back = () => router.replace("/(tabs)/bookings");

  if (!b) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top + spacing.lg, padding: spacing.lg, gap: spacing.md }}>
        {error ? <ErrorBox text={error} onRetry={reload} /> : <><Skeleton h={260} /><Skeleton h={140} /></>}
      </View>
    );
  }
  const run = async (key: string, fn: () => Promise<any>) => { setBusy(key); try { await fn(); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(null); } };
  const respond = (approve: boolean) => run(`extra${approve}`, async () => {
    await api(`/customer/bookings/${b.id}/extras/${pendingExtra.id}`, { method: "POST", params: { approve } });
    toast(approve ? "Extra charge approved" : "Extra charge declined"); reload();
  });
  const cancel = () => run("cancel", async () => {
    const d = await api(`/customer/bookings/${b.id}/cancel`, { method: "POST" });
    toast(`${t("Cancelled · fee")} ${inr(d.fee)} · ${t("refund")} ${inr(d.refund)}`); setCancelOpen(false); reload();
  });
  const payBalance = () => run("bal", async () => {
    const d = await api(`/customer/bookings/${b.id}/pay-balance`, { method: "POST" });
    if (d.razorpay) await api("/payments/cancel", { method: "POST", body: { order_id: d.razorpay.order_id, reason: "Online payment not available in app yet" } }).catch(() => {});
    toast("Online payment is not available in the app yet", "error");
  });
  const rebook = () => run("rebook", async () => { await api(`/customer/bookings/${b.id}/rebook`, { method: "POST" }); await refresh(); router.push("/checkout"); });
  const masked = () => run("call", async () => setCall(await api(`/bookings/${b.id}/call`, { method: "POST" })));
  const p = b.pricing;
  const live = ["assigned", "en_route", "in_progress"].includes(b.status);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View>
        <TrackMap height={300} dest={b.address?.location} partner={b.partner_id && b.status !== "completed" ? b.live_location : null} />
        <View style={{ position: "absolute", top: insets.top + spacing.sm, left: spacing.lg }}><IconBtn testID="tracking-back-btn" name="chevron-back" onPress={back} /></View>
        {b.eta_min != null && b.status === "en_route" && !b.arrived_at && (
          <View style={[styles.eta, { top: insets.top + spacing.md }]} testID="tracking-eta"><T v="bodyMedium" color={colors.onSurfaceInverse} style={{ fontSize: 12 }}>{`${t("Arriving in")} ~${b.eta_min} min`}</T></View>
        )}
      </View>
      <ScrollView style={styles.panel} contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + spacing.xl }} testID="tracking-bottom-sheet">
        <View style={styles.handle} />
        <Row style={{ justifyContent: "space-between" }}><T v="mono" color={colors.muted}>{b.booking_no}</T><Badge status={b.status} testID="tracking-status" /></Row>
        {b.status !== "cancelled" && <Stepper current={stepOf(b)} />}
        {b.status === "pending" && (
          <View style={styles.finding} testID="tracking-finding-partner"><ActivityIndicator color={colors.brand} /><T v="body" color={colors.brand} style={{ flex: 1 }}>Finding the best verified partner near you…</T></View>
        )}
        {b.partner && (
          <View style={styles.partner} testID="tracking-partner-card">
            {b.partner.avatar ? <Image source={{ uri: b.partner.avatar }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: colors.brandTertiary }]} />}
            <View style={{ flex: 1 }}>
              <Row style={{ gap: 4 }}><T v="subtitle" numberOfLines={1}>{b.partner.name}</T>{b.partner.verified && <Icon name="checkmark-circle" size={16} color={colors.success} />}</Row>
              <Row style={{ gap: 3 }}><Icon name="star" size={12} color={colors.brandSecondary} /><T v="caption">{`${b.partner.rating} · ${b.partner.jobs_done} ${t("jobs")} · ${t("Verified")}`}</T></Row>
            </View>
            {live && <>
              <IconBtn testID="masked-call-btn" name="call" color={colors.success} onPress={masked} />
              <IconBtn testID="tracking-chat-btn" name="chatbubble-ellipses" color={colors.brand} onPress={() => setChat(true)} />
            </>}
          </View>
        )}
        {["assigned", "en_route"].includes(b.status) && (
          <View style={styles.otp} testID="tracking-start-otp"><Row style={{ flex: 1 }}><Icon name="shield-checkmark" size={20} color={colors.success} /><T v="body" color={colors.onSurfaceInverse}>Share Start OTP</T></Row>
            <T v="display" color={colors.onSurfaceInverse} style={styles.otpTxt}>{b.start_otp}</T></View>
        )}
        {b.status === "in_progress" && (
          <View style={styles.otp} testID="tracking-end-otp"><Row style={{ flex: 1 }}><Icon name="shield-checkmark" size={20} color={colors.brandSecondary} /><T v="body" color={colors.onSurfaceInverse} style={{ flex: 1 }}>End OTP (share when done)</T></Row>
            <T v="display" color={colors.onSurfaceInverse} style={styles.otpTxt}>{b.end_otp}</T></View>
        )}
        {b.extras?.length > 0 && (
          <View style={styles.box}>
            <T v="bodyMedium">Extra parts / charges</T>
            {b.extras.map((e: any) => (
              <Row key={e.id} style={{ justifyContent: "space-between" }}><T v="body" style={{ flex: 1 }}>{e.name}</T>
                <T v="bodyMedium" color={e.status === "approved" ? colors.success : e.status === "rejected" ? colors.error : "#A16207"}>{`${inr(e.amount)} · ${t(e.status)}`}</T></Row>
            ))}
          </View>
        )}
        <View style={[styles.box, { backgroundColor: colors.surfaceTertiary, borderWidth: 0 }]}>
          {b.lines.map((l: any) => <KV key={l.service_id} k={`${l.name} ×${l.qty}`} v={inr(l.line_total)} />)}
          {p.surge_amount > 0 && <KV k={`Surge ${p.surge_multiplier}x`} v={inr(p.surge_amount)} />}
          {p.discount > 0 && <KV k="Discount" v={`-${inr(p.discount)}`} />}
          {p.extras_total > 0 && <KV k="Approved extras" v={inr(p.extras_total)} />}
          <KV k="GST 18%" v={inr(p.gst)} />
          <Divider />
          <Row style={{ justifyContent: "space-between", paddingTop: 6 }}>
            <T v="bodyMedium" style={{ flex: 1 }}>{`${t("Total")} (${String(b.payment_method).toUpperCase()} · ${t(b.payment_status)})`}</T>
            <T v="subtitle" testID="tracking-total">{inr(p.total)}</T>
          </Row>
        </View>
        {b.payment_status === "balance_due" && (
          <View style={styles.balance} testID="tracking-balance-due">
            <T v="bodyMedium" style={{ flex: 1 }}>Balance due for approved extras</T>
            <Button small variant="accent" title={`${t("Pay balance")} ${inr(p.total - (b.amount_paid || 0))}`} loading={busy === "bal"} onPress={payBalance} testID="tracking-pay-balance-btn" />
          </View>
        )}
        {b.status === "completed" && (
          <Row>
            <Button style={{ flex: 1 }} variant="outline" icon="document-text-outline" title="GST Invoice" onPress={() => setInvoice(true)} testID="tracking-invoice-btn" />
            <Button style={{ flex: 1 }} icon="refresh" title="Re-book" loading={busy === "rebook"} onPress={rebook} testID="tracking-rebook-btn" />
          </Row>
        )}
        {b.status === "completed" && !b.rating && <RateCard b={b} onDone={reload} />}
        {b.rating ? <T v="caption" style={{ textAlign: "center" }} testID="tracking-rated">{`${t("You rated")} ${b.rating}★${b.tip ? ` · ${t("tipped")} ${inr(b.tip)}` : ""}`}</T> : null}
        {b.status === "cancelled" && (
          <View style={styles.cancelInfo} testID="tracking-cancel-info"><T v="body" color={colors.error}>{`${t("Cancelled · fee")} ${inr(b.cancellation?.fee)} · ${t("refunded")} ${inr(b.cancellation?.refund)} ${t("to wallet")}`}</T></View>
        )}
        {["payment_pending", "pending", "assigned", "en_route"].includes(b.status) && (
          <Button variant="ghost" title="Cancel booking" onPress={() => setCancelOpen(true)} testID="tracking-cancel-btn" />
        )}
      </ScrollView>

      <Chat id={b.id} open={chat} onClose={() => setChat(false)} />
      <Invoice id={b.id} open={invoice} onClose={() => setInvoice(false)} />
      <Sheet open={!!call} onClose={() => setCall(null)} title="Masked call" testID="masked-call-dialog">
        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <T v="display" color={colors.brand}>{call?.masked_number}</T>
          <T v="body">{`${t("Enter PIN")} ${call?.pin} ${t("when prompted")}`}</T>
          <T v="caption" style={{ textAlign: "center" }}>{call?.note}</T>
        </View>
        <Button variant="success" icon="call" title="Dial now" onPress={() => Linking.openURL(`tel:${String(call?.masked_number || "").replace(/\s/g, "")}`)} testID="masked-call-dial-btn" />
      </Sheet>
      <Sheet open={cancelOpen} onClose={() => setCancelOpen(false)} title="Cancel booking" testID="cancel-confirm-sheet">
        <T v="body">Cancel this booking? Fees apply as per policy.</T>
        <Button variant="danger" title="Yes, cancel" loading={busy === "cancel"} onPress={cancel} testID="confirm-cancel-btn" />
        <Button variant="outline" title="Keep booking" onPress={() => setCancelOpen(false)} testID="keep-booking-btn" />
      </Sheet>
      <Sheet open={!!pendingExtra && extraSeen !== pendingExtra.id} onClose={() => setExtraSeen(pendingExtra?.id)} title="Approve extra charge?" testID="extra-approval-dialog">
        <T v="body">{`${b.partner?.name || "Partner"} ${t("requested")} ${pendingExtra?.name} ${t("for")} ${inr(pendingExtra?.amount)} (+18% GST). ${t("It will be added to your bill only if you approve.")}`}</T>
        <Row>
          <Button style={{ flex: 1 }} variant="outline" title="Decline" loading={busy === "extrafalse"} onPress={() => respond(false)} testID="extra-reject-btn" />
          <Button style={{ flex: 1 }} variant="success" title="Approve" loading={busy === "extratrue"} onPress={() => respond(true)} testID="extra-approve-btn" />
        </Row>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  eta: { position: "absolute", right: spacing.lg, backgroundColor: colors.surfaceInverse, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  panel: { flex: 1, marginTop: -spacing.xl, backgroundColor: colors.surfaceSecondary, borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, alignSelf: "center" },
  stepper: { flexDirection: "row", paddingVertical: spacing.sm },
  track: { flex: 1, height: 3, backgroundColor: colors.border },
  node: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSecondary, alignItems: "center", justifyContent: "center" },
  inner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  finding: { flexDirection: "row", gap: spacing.md, alignItems: "center", backgroundColor: colors.brandTertiary, padding: spacing.lg, borderRadius: radius.lg },
  partner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  otp: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surfaceInverse, padding: spacing.lg, borderRadius: radius.lg },
  otpTxt: { letterSpacing: 8, fontFamily: fonts.display },
  box: { gap: 4, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  balance: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.brandSecondary, backgroundColor: colors.amberTint },
  rate: { gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: "#FDE68A", backgroundColor: colors.amberTint },
  tip: { height: 36, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, justifyContent: "center" },
  cancelInfo: { backgroundColor: colors.errorTint, padding: spacing.md, borderRadius: radius.md },
  billTo: { backgroundColor: colors.surfaceTertiary, borderRadius: radius.sm, padding: spacing.sm, marginVertical: spacing.sm },
  bubble: { maxWidth: "82%", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.lg, gap: 2 },
  me: { alignSelf: "flex-end", backgroundColor: colors.brand },
  them: { alignSelf: "flex-start", backgroundColor: colors.surfaceTertiary },
  chatInput: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
});
