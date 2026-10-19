import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, inr, useApi } from "@/src/api";
import { useCart } from "@/src/cart";
import { payMessage, useRazorpay } from "@/src/razorpay";
import { useLang } from "@/src/i18n";
import { Button, Card, Empty, Icon, IconName, KV, Press, Row, ScreenHeader, Skeleton, T, useToast, Divider } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

const SLOTS = ["09:00 AM", "10:30 AM", "12:00 PM", "02:00 PM", "03:30 PM", "05:00 PM", "06:30 PM"];
const PAY: { id: string; label: string; icon: IconName }[] = [
  { id: "upi", label: "UPI (GPay / PhonePe)", icon: "phone-portrait-outline" },
  { id: "card", label: "Credit / Debit Card", icon: "card-outline" },
  { id: "wallet", label: "SMARTFIX Wallet", icon: "wallet-outline" },
  { id: "cod", label: "Cash after service", icon: "cash-outline" },
];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const days = () => Array.from({ length: 5 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i); return d; });

export default function Checkout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { t, lang } = useLang();
  const { address, setAddress, refresh } = useCart();
  const openRazorpay = useRazorpay();
  const [cart, setCart] = useState<any>(null);
  const [mode, setMode] = useState("instant");
  const [date, setDate] = useState(ymd(new Date()));
  const [slot, setSlot] = useState<string | null>(null);
  const [pay, setPay] = useState("upi");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const addrs = useApi<any[]>("/customer/addresses");
  const coupons = useApi<any[]>("/customer/coupons");
  const wallet = useApi<any>("/customer/wallet");
  const policy = useApi<any>("/policy/cancellation");
  const cfg = useApi<any>("/payments/config");

  const load = useCallback(async () => {
    try {
      const d = await api("/customer/cart", { params: { address_id: address?.id, coupon_code: applied || undefined } });
      setCart(d);
      if (applied && d.coupon_error) { toast(d.coupon_error, "error"); setApplied(""); }
    } catch (e) { toast(errMsg(e), "error"); }
  }, [address?.id, applied, toast]);
  useEffect(() => { load(); }, [load]);

  const setQty = async (l: any, qty: number) => {
    try { await api(`/customer/cart/items/${l.service_id}`, { method: "PUT", body: { service_id: l.service_id, qty, addon_ids: l.addons.map((a: any) => a.id) } }); await Promise.all([load(), refresh()]); }
    catch (e) { toast(errMsg(e), "error"); }
  };
  const addr = address || cart?.address;
  const place = async () => {
    setBusy(true);
    try {
      if ((pay === "upi" || pay === "card") && !cfg.data?.enabled) toast("Processing demo payment…");
      const d = await api("/customer/bookings", { method: "POST", body: {
        address_id: addr?.id, mode, slot_date: mode === "scheduled" ? date : null, slot_time: mode === "scheduled" ? slot : null, payment_method: pay, coupon_code: applied || null,
      } });
      if (d.razorpay) {
        await refresh();
        const r = await openRazorpay(d.razorpay, `${t("Booking")} ${d.booking_no}`);
        toast(payMessage(r), r === "paid" ? "success" : "error");
        if (r === "paid") router.replace(`/booking/${d.id}`);
        else setBusy(false);
        return;
      }
      await refresh();
      toast(`Booking ${d.booking_no} confirmed!`);
      router.replace(`/booking/${d.id}`);
    } catch (e) { toast(errMsg(e), "error"); setBusy(false); }
  };

  if (!cart) return <View style={{ flex: 1, backgroundColor: colors.surface }}><ScreenHeader back title="Checkout" /><View style={{ padding: spacing.lg, gap: spacing.md }}><Skeleton h={120} /><Skeleton h={160} /></View></View>;
  const p = cart.pricing;
  const disabled = !cart.serviceable || !addr || (mode === "scheduled" && !slot);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Checkout" />
      {cart.lines.length === 0 ? (
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Empty text="Your cart is empty" icon="cart-outline" testID="checkout-empty" />
          <Button title="Browse services" onPress={() => router.replace("/(tabs)/home")} testID="checkout-browse-btn" />
        </View>
      ) : (
        <>
          <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl }}>
            <Card style={{ gap: spacing.md }}>
              <T v="subtitle">{`${t("Your services ·")} ${cart.lines.length} ${t(cart.lines.length > 1 ? "items" : "item")}`}</T>
              {cart.lines.map((l: any) => (
                <Row key={l.service_id} testID={`cart-line-${l.service_id}`} style={{ gap: spacing.md }}>
                  <Image source={{ uri: l.image }} style={{ width: 44, height: 44, borderRadius: radius.sm + 2 }} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <T v="bodyMedium" numberOfLines={1}>{l.name}</T>
                    <T v="caption" numberOfLines={1}>{`${l.category_name}${l.addons.length ? ` · +${l.addons.map((a: any) => a.name).join(", ")}` : ""}`}</T>
                  </View>
                  <Row style={styles.stepper}>
                    <Press testID={`cart-minus-${l.service_id}`} onPress={() => setQty(l, l.qty - 1)} style={styles.stepBtn}><Icon name="remove" size={16} color={colors.brand} /></Press>
                    <T v="bodyMedium" color={colors.brand}>{String(l.qty)}</T>
                    <Press testID={`cart-plus-${l.service_id}`} onPress={() => setQty(l, l.qty + 1)} style={styles.stepBtn}><Icon name="add" size={16} color={colors.brand} /></Press>
                  </Row>
                  <T v="bodyMedium" style={{ width: 70, textAlign: "right" }}>{inr(l.line_total)}</T>
                </Row>
              ))}
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <T v="subtitle">Service address</T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {(addrs.data || []).map((a) => (
                  <Press key={a.id} testID={`checkout-address-${a.id}`} onPress={() => setAddress(a)} style={[styles.addr, addr?.id === a.id && styles.sel]}>
                    <T v="bodyMedium" style={{ fontSize: 13 }}>{`${a.label} · ${a.pincode}`}</T>
                    <T v="caption" numberOfLines={2} style={{ fontSize: 11 }}>{a.line}</T>
                  </Press>
                ))}
                <Press testID="checkout-add-address" onPress={() => router.push("/address")} style={[styles.addr, styles.newAddr]}>
                  <Icon name="add" size={18} color={colors.brand} /><T v="bodyMedium" color={colors.brand} style={{ fontSize: 13 }}>+ New</T>
                </Press>
              </ScrollView>
              {!cart.serviceable && <T v="caption" color={colors.error} testID="checkout-unserviceable">{"We don't serve this pincode yet. Pick another address."}</T>}
            </Card>

            <Card style={{ gap: spacing.md }}>
              <T v="subtitle">When should we come?</T>
              <Row>
                {[{ k: "instant", icon: "flash", title: "Instant", sub: "Arrives in 30-45 min", c: colors.brandSecondary }, { k: "scheduled", icon: "calendar", title: "Schedule", sub: "Pick date & slot", c: colors.brand }].map((m) => (
                  <Press key={m.k} testID={`checkout-mode-${m.k}`} onPress={() => setMode(m.k)}
                    style={[styles.mode, mode === m.k && { borderColor: m.c, backgroundColor: m.k === "instant" ? colors.amberTint : colors.brandTertiary }]}>
                    <Icon name={m.icon as IconName} size={18} color={m.c} />
                    <T v="bodyMedium">{m.title}</T>
                    <T v="caption" style={{ fontSize: 11 }}>{m.sub}</T>
                  </Press>
                ))}
              </Row>
              {mode === "scheduled" && (
                <>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                    {days().map((d) => {
                      const on = date === ymd(d);
                      return (
                        <Press key={ymd(d)} testID={`slot-date-${ymd(d)}`} onPress={() => setDate(ymd(d))} style={[styles.day, on && { backgroundColor: colors.brand, borderColor: colors.brand }]}>
                          <T v="label" color={on ? colors.onBrand : colors.muted} style={{ fontSize: 10 }}>{d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short" })}</T>
                          <T v="subtitle" color={on ? colors.onBrand : colors.onSurface}>{String(d.getDate())}</T>
                        </Press>
                      );
                    })}
                  </ScrollView>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {SLOTS.map((s) => (
                      <Press key={s} testID={`slot-time-${s.replace(/\W/g, "")}`} onPress={() => setSlot(s)} style={[styles.slot, slot === s && { backgroundColor: colors.brand, borderColor: colors.brand }]}>
                        <T v="bodyMedium" color={slot === s ? colors.onBrand : colors.onSurfaceTertiary} style={{ fontSize: 12 }}>{s}</T>
                      </Press>
                    ))}
                  </View>
                </>
              )}
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <Row><Icon name="pricetag" size={16} color={colors.brandSecondary} /><T v="subtitle">Coupons & offers</T></Row>
              <Row>
                <TextInput testID="checkout-coupon-input" value={coupon} onChangeText={(v) => setCoupon(v.toUpperCase())} placeholder={t("Enter code")} placeholderTextColor={colors.muted}
                  autoCapitalize="characters" style={styles.couponInput} returnKeyType="done" onSubmitEditing={() => setApplied(coupon)} />
                <Button small title="Apply" onPress={() => setApplied(coupon)} testID="checkout-apply-coupon-btn" style={{ height: 44 }} />
              </Row>
              {p.coupon_code ? (
                <Row testID="checkout-coupon-applied">
                  <Icon name="checkmark-circle" size={16} color={colors.success} />
                  <T v="caption" color="#15803D" style={{ flex: 1 }}>{`${p.coupon_code} ${t("applied · you save")} ${inr(p.discount)}`}</T>
                  <Press testID="checkout-remove-coupon" onPress={() => { setApplied(""); setCoupon(""); }}><T v="bodyMedium" color={colors.error} style={{ fontSize: 13 }}>Remove</T></Press>
                </Row>
              ) : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {(coupons.data || []).map((c) => (
                  <Press key={c.id} testID={`coupon-chip-${c.code}`} onPress={() => { setCoupon(c.code); setApplied(c.code); }} style={styles.cchip}>
                    <T v="mono" style={{ fontSize: 11 }}>{c.code}</T>
                  </Press>
                ))}
              </View>
            </Card>

            <Card style={{ gap: spacing.sm }}>
              <T v="subtitle">Payment method</T>
              {PAY.map((m) => {
                const low = m.id === "wallet" && Number(wallet.data?.balance || 0) < p.total;
                return (
                <Press key={m.id} testID={`pay-${m.id}`} onPress={() => setPay(m.id)} disabled={low} style={[styles.pay, pay === m.id && styles.sel]}>
                  <Icon name={m.icon} size={20} color={colors.brand} />
                  <T v="bodyMedium" style={{ flex: 1 }}>{m.label}</T>
                  {m.id === "wallet" && <T v="caption" color={low ? colors.error : colors.muted}>{`${t("Bal")} ${inr(wallet.data?.balance)}`}</T>}
                  <View style={[styles.radio, pay === m.id && { borderColor: colors.brand, borderWidth: 6 }]} />
                </Press>
                );
              })}
              {(pay === "upi" || pay === "card") && (
                <T v="caption" color={cfg.data?.enabled ? "#15803D" : "#A16207"} testID="checkout-payment-mode-note">
                  {cfg.data?.enabled ? "Secure payment via Razorpay" : "Demo payment mode (Razorpay keys not configured)"}
                </T>
              )}
            </Card>

            <Card testID="checkout-price-breakdown" style={{ gap: 0 }}>
              <KV k="Item total" v={inr(p.subtotal)} />
              {p.surge_amount > 0 && <KV k={`Surge ${p.surge_multiplier}x (${(cart.surge_reasons || []).join(", ")})`} v={inr(p.surge_amount)} />}
              {p.discount > 0 && <KV k="Coupon discount" v={`- ${inr(p.discount)}`} />}
              <KV k="GST (18%)" v={inr(p.gst)} />
              <Divider />
              <KV k="To pay" v={inr(p.total)} bold />
            </Card>

            <Press testID="checkout-policy-toggle" onPress={() => setShowPolicy(!showPolicy)} style={styles.policy}>
              <Row><Icon name="information-circle-outline" size={18} color={colors.onSurfaceTertiary} /><T v="bodyMedium" style={{ flex: 1 }}>Cancellation policy</T>
                <Icon name={showPolicy ? "chevron-up" : "chevron-down"} size={18} color={colors.muted} /></Row>
              {showPolicy && (policy.data?.rules || []).map((r: string) => <T key={r} v="caption">{`•  ${t(r)}`}</T>)}
            </Press>
          </KeyboardAwareScrollView>
          <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
            <View style={{ flex: 1 }}><T v="caption">Total</T><T v="title" testID="checkout-total">{inr(p.total)}</T></View>
            <Button testID="checkout-place-order-btn" variant="accent" disabled={disabled} loading={busy} onPress={place}
              title={pay === "cod" ? "Confirm booking" : `${t("Pay")} ${inr(p.total)}`} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  stepper: { gap: 4, borderWidth: 1, borderColor: colors.brand, borderRadius: radius.sm + 2, paddingHorizontal: 2 },
  stepBtn: { width: 30, height: 32, alignItems: "center", justifyContent: "center" },
  addr: { width: 150, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 2 },
  newAddr: { width: 96, alignItems: "center", justifyContent: "center", borderStyle: "dashed", borderColor: colors.brand },
  sel: { borderColor: colors.brand, backgroundColor: colors.brandTertiary },
  mode: { flex: 1, gap: 2, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  day: { width: 58, alignItems: "center", paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  slot: { height: 36, paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, justifyContent: "center" },
  couponInput: { flex: 1, height: 44, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, fontFamily: fonts.textMedium, fontSize: 15, color: colors.onSurface, letterSpacing: 1 },
  cchip: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.brandSecondary, backgroundColor: colors.amberTint, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  pay: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, minHeight: 52 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderStrong },
  policy: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary },
  bar: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surfaceSecondary },
});
