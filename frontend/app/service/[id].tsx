import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { errMsg, inr, useApi } from "@/src/api";
import { useCart } from "@/src/cart";
import { useLang } from "@/src/i18n";
import { Button, ErrorBox, Icon, IconBtn, Press, Row, Skeleton, T, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

export default function ServiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  const { address, add, count } = useCart();
  const { data: s, error, reload } = useApi<any>(`/catalog/services/${id}`, { pincode: address?.pincode });
  const [qty, setQty] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)/home"));

  if (!s) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top + spacing.lg, padding: spacing.lg, gap: spacing.md }}>
        {error ? <ErrorBox text={error} onRetry={reload} /> : <><Skeleton h={220} /><Skeleton h={120} /></>}
      </View>
    );
  }
  const unit = s.city_price || s.price;
  const total = (unit + s.addons.filter((a: any) => addons.includes(a.id)).reduce((x: number, a: any) => x + a.price, 0)) * qty;
  const toggle = (aid: string) => setAddons((x) => (x.includes(aid) ? x.filter((y) => y !== aid) : [...x, aid]));
  const addToCart = async () => {
    setBusy(true);
    try { await add(s.id, addons, qty); setAdded(true); toast("Added to cart"); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={{ height: 260 }}>
          <Image source={{ uri: s.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          <View style={{ position: "absolute", top: insets.top + spacing.sm, left: spacing.lg }}>
            <IconBtn testID="service-detail-back-btn" name="chevron-back" onPress={back} />
          </View>
        </View>
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          <View style={{ gap: 6 }}>
            <T v="display" testID="service-detail-name">{s.name}</T>
            <Row style={{ gap: spacing.md }}>
              <Row style={{ gap: 4 }}><Icon name="star" size={14} color={colors.brandSecondary} /><T v="body" color={colors.onSurfaceTertiary}>{`${s.rating} · ${s.reviews_count.toLocaleString("en-IN")} ${t("reviews")}`}</T></Row>
              <Row style={{ gap: 4 }}><Icon name="time-outline" size={14} color={colors.muted} /><T v="body" color={colors.onSurfaceTertiary}>{`${s.duration_min} min`}</T></Row>
            </Row>
            <Row><T v="title">{inr(unit)}</T>{s.city_price ? <T v="caption" style={{ textDecorationLine: "line-through" }}>{inr(s.price)}</T> : null}</Row>
          </View>
          <View style={[styles.box, { backgroundColor: colors.successTint, borderColor: "#BBF7D0" }]}>
            <T v="subtitle">What's included</T>
            {s.inclusions.map((x: string) => <Row key={x} style={{ alignItems: "flex-start" }}><Icon name="checkmark-circle" size={16} color={colors.success} /><T v="body" style={{ flex: 1 }}>{x}</T></Row>)}
          </View>
          <View style={[styles.box, { backgroundColor: colors.errorTint, borderColor: "#FECACA" }]}>
            <T v="subtitle">Not included</T>
            {s.exclusions.map((x: string) => <Row key={x} style={{ alignItems: "flex-start" }}><Icon name="close-circle" size={16} color={colors.error} /><T v="body" style={{ flex: 1 }}>{x}</T></Row>)}
          </View>
          {s.addons.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <T v="subtitle">Add-ons</T>
              {s.addons.map((a: any) => {
                const on = addons.includes(a.id);
                return (
                  <Press key={a.id} testID={`addon-${a.id}`} onPress={() => toggle(a.id)} style={[styles.addon, on && { borderColor: colors.brand, backgroundColor: colors.brandTertiary }]}>
                    <View style={[styles.check, on && { backgroundColor: colors.brand, borderColor: colors.brand }]}>{on && <Icon name="checkmark" size={14} color={colors.onBrand} />}</View>
                    <T v="body" style={{ flex: 1 }}>{a.name}</T>
                    <T v="bodyMedium">{`+${inr(a.price)}`}</T>
                  </Press>
                );
              })}
            </View>
          )}
          <Row style={[styles.addon, { justifyContent: "space-between" }]}>
            <T v="bodyMedium">Quantity</T>
            <Row style={{ gap: spacing.md }}>
              <IconBtn testID="qty-minus-btn" name="remove" onPress={() => setQty((q) => Math.max(1, q - 1))} />
              <T v="subtitle" testID="qty-value" style={{ minWidth: 20, textAlign: "center" }}>{String(qty)}</T>
              <IconBtn testID="qty-plus-btn" name="add" color={colors.brand} onPress={() => setQty((q) => q + 1)} />
            </Row>
          </Row>
          {s.reviews?.length > 0 && (
            <View style={{ gap: spacing.sm }}>
              <T v="subtitle">Customer reviews</T>
              {s.reviews.map((r: any) => (
                <View key={r.name} style={styles.review}>
                  <Row><T v="bodyMedium">{r.name}</T><Row style={{ gap: 1 }}>{Array.from({ length: r.rating }).map((_, i) => <Icon key={i} name="star" size={12} color={colors.brandSecondary} />)}</Row></Row>
                  <T v="body" color={colors.onSurfaceTertiary}>{r.text}</T>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      <View style={[styles.bar, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={{ flex: 1 }}>
          <T v="caption">{`${qty} ${t("× item")}${addons.length ? ` ${t("+ add-ons")}` : ""}`}</T>
          <T v="title" testID="service-detail-total">{inr(total)}</T>
        </View>
        {added || count > 0 ? (
          <Row>
            {!added && <Button variant="outline" title="Add" loading={busy} onPress={addToCart} testID="service-detail-add-btn" />}
            <Button variant="accent" title="Proceed to Checkout" onPress={() => router.push("/checkout")} testID="service-detail-checkout-btn" />
          </Row>
        ) : <Button title="Add to cart" icon="cart-outline" loading={busy} onPress={addToCart} testID="service-detail-add-btn" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { gap: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  addon: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, minHeight: 52 },
  check: { width: 24, height: 24, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong, alignItems: "center", justifyContent: "center" },
  review: { gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary },
  bar: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surfaceSecondary },
});
