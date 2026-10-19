import React, { useEffect, useRef, useState } from "react";
import { Dimensions, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, inr, useApi } from "@/src/api";
import { useAuth } from "@/src/auth";
import { CartBar, useCart } from "@/src/cart";
import { useGps } from "@/src/gps";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import VoiceButton from "@/src/VoiceButton";
import { Button, Icon, IconBtn, IconName, Press, Row, Sheet, Skeleton, T, useToast } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

export const CAT_ICON: Record<string, IconName> = {
  cat_ac: "snow", cat_clean: "sparkles", cat_cleaning: "sparkles", cat_elec: "flash", cat_electric: "flash", cat_plumb: "water", cat_plumbing: "water",
  cat_salon: "cut", cat_paint: "color-palette", cat_pest: "bug", cat_appliance: "tv", cat_appl: "tv",
};
export const catIcon = (id: string): IconName => CAT_ICON[id] || "construct";

const W = Dimensions.get("window").width;

const LocationSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { setAddress, address } = useCart();
  const toast = useToast();
  const router = useRouter();
  const { data } = useApi<any[]>(open ? "/customer/addresses" : null);
  const gps = useGps(async (pos) => {
    try {
      const d = await api("/locate", { params: pos });
      toast(d.serviceable ? `You're in ${d.city} (${d.pincode}). Add this as an address.` : `Nearest service city is ${d.city} (${d.distance_km} km away)`, d.serviceable ? "success" : "error");
      onClose();
      router.push({ pathname: "/address", params: { pincode: d.pincode || "", lat: String(pos.lat), lng: String(pos.lng) } });
    } catch (e) { toast(errMsg(e), "error"); }
  });
  return (
    <>
      <Sheet open={open} onClose={onClose} title="Choose service location" testID="location-sheet">
        <Button testID="location-use-gps-btn" variant="outline" icon="locate" title="Use current location (GPS)" loading={gps.busy} onPress={gps.start} />
        {(data || []).map((a) => (
          <Press key={a.id} testID={`location-address-${a.id}`} onPress={() => { setAddress(a); onClose(); }}
            style={[styles.addr, address?.id === a.id && { borderColor: colors.brand, backgroundColor: colors.brandTertiary }]}>
            <Icon name={a.label === "Office" ? "briefcase-outline" : "home-outline"} size={18} color={colors.brand} />
            <View style={{ flex: 1 }}><T v="bodyMedium">{`${a.label} · ${a.pincode}`}</T><T v="caption" numberOfLines={1}>{a.line}</T></View>
          </Press>
        ))}
        <Button testID="location-add-address-link" variant="ghost" title="+ Add new address / pincode" onPress={() => { onClose(); router.push("/address"); }} />
      </Sheet>
      {gps.sheet}
    </>
  );
};

const Banners = ({ banners }: { banners: any[] }) => {
  const router = useRouter();
  const ref = useRef<ScrollView>(null);
  const [i, setI] = useState(0);
  const bw = W - spacing.lg * 2;
  useEffect(() => {
    if (banners.length < 2) return;
    const tm = setInterval(() => setI((x) => {
      const n = (x + 1) % banners.length;
      ref.current?.scrollTo({ x: n * (bw + spacing.md), animated: true });
      return n;
    }), 4000);
    return () => clearInterval(tm);
  }, [banners.length, bw]);
  if (!banners.length) return null;
  return (
    <View testID="home-banner-slider">
      <ScrollView ref={ref} horizontal pagingEnabled={false} snapToInterval={bw + spacing.md} decelerationRate="fast" showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / (bw + spacing.md)))}>
        {banners.map((b) => (
          <Press key={b.id} testID={`home-banner-${b.id}`} onPress={() => router.push({ pathname: "/services", params: { category_id: b.category_id } })} style={[styles.banner, { width: bw }]}>
            <Image source={{ uri: b.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
            <LinearGradient colors={["rgba(15,23,42,0.92)", "rgba(15,23,42,0.1)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[StyleSheet.absoluteFill, { padding: spacing.lg, justifyContent: "center" }]}>
              <T v="title" color={colors.onBrand} style={{ maxWidth: 210 }}>{b.title}</T>
              <T v="caption" color="rgba(255,255,255,0.85)" style={{ marginTop: 2 }}>{b.subtitle}</T>
              {b.code ? <View style={styles.code}><T v="mono" color={colors.onBrandSecondary}>{b.code}</T></View> : null}
            </LinearGradient>
          </Press>
        ))}
      </ScrollView>
      <Row style={{ justifyContent: "center", gap: 6, marginTop: spacing.sm }}>
        {banners.map((b, k) => <View key={b.id} style={[styles.dot, k === i && { width: 18, backgroundColor: colors.brand }]} />)}
      </Row>
    </View>
  );
};

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  const { session } = useAuth();
  const { address, add, refresh } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const home = useApi<any>("/catalog/home");
  const bookings = useApi<any[]>("/customer/bookings");
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  const past = (bookings.data || []).filter((b) => b.status === "completed").slice(0, 3);
  const d = home.data;
  const addItem = async (id: string) => { try { await add(id); toast("Added to cart"); } catch (e) { toast(errMsg(e), "error"); } };
  const rebook = async (id: string) => {
    try { await api(`/customer/bookings/${id}/rebook`, { method: "POST" }); await refresh(); toast("Added previous services to cart"); } catch (e) { toast(errMsg(e), "error"); }
  };
  const first = session?.user?.name?.split(" ")[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Row>
          <Press testID="home-location-selector" onPress={() => setOpen(true)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Icon name="location" size={22} color={colors.brandSecondary} />
            <View style={{ flex: 1 }}>
              <Row style={{ gap: 4 }}><T v="subtitle" color={colors.onBrand}>{address?.label || "Set location"}</T><Icon name="chevron-down" size={16} color={colors.onBrand} /></Row>
              <T v="caption" color="rgba(255,255,255,0.75)" numberOfLines={1}>{address ? `${address.line} · ${address.pincode}` : t("Tap to detect via GPS")}</T>
            </View>
          </Press>
          <IconBtn testID="home-help-btn" name="help-buoy-outline" color={colors.onBrand} bg="rgba(255,255,255,0.12)" onPress={() => router.push("/support")} />
        </Row>
        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput testID="home-search-input" value={q} onChangeText={setQ} placeholder={t("Search 'AC repair', 'cleaning'…")} placeholderTextColor={colors.muted}
            style={styles.searchInput} returnKeyType="search" onSubmitEditing={() => q.trim() && router.push({ pathname: "/services", params: { q: q.trim() } })} />
          {q ? <Icon testID="home-search-go" name="arrow-forward-circle" size={24} color={colors.brand} onPress={() => router.push({ pathname: "/services", params: { q: q.trim() } })} /> : null}
          <VoiceButton testID="home-voice-search-btn" size={34} onText={(txt) => { const s = txt.replace(/[.?!]+$/, "").trim(); setQ(s); router.push({ pathname: "/services", params: { q: s } }); }} />
        </View>
      </View>
      <ScrollView contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: bottomChrome + 96, gap: spacing.xl }}
        refreshControl={<RefreshControl refreshing={home.refreshing} onRefresh={() => { home.refresh(); bookings.reload(); refresh(); }} tintColor={colors.brand} />}>
        {!d ? <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}><Skeleton h={150} /><Skeleton h={180} /></View> : (
          <>
            <Banners banners={d.banners} />
            <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
              <T v="title">{`${t("Hi")} ${first || t("there")}${t(", what do you need?")}`}</T>
              <View style={styles.grid} testID="home-category-grid">
                {d.categories.map((c: any) => (
                  <Press key={c.id} testID={`category-${c.id}`} onPress={() => router.push({ pathname: "/services", params: { category_id: c.id } })} style={styles.cat}>
                    <View style={styles.catIcon}><Icon name={catIcon(c.id)} size={26} color={colors.brand} /></View>
                    <T v="caption" color={colors.onSurfaceTertiary} style={{ textAlign: "center", fontSize: 11 }} numberOfLines={2}>{c.name}</T>
                  </Press>
                ))}
              </View>
            </View>
            <View style={{ gap: spacing.md }}>
              <T v="title" style={{ paddingHorizontal: spacing.lg }}>Trending near you</T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }} testID="home-trending-list">
                {d.trending.map((s: any) => (
                  <View key={s.id} style={styles.mini}>
                    <Press testID={`trending-card-${s.id}`} onPress={() => router.push(`/service/${s.id}`)}>
                      <Image source={{ uri: s.image }} style={{ height: 96, width: "100%" }} contentFit="cover" transition={200} />
                    </Press>
                    <View style={{ padding: spacing.sm, gap: 4 }}>
                      <T v="bodyMedium" numberOfLines={2} style={{ fontSize: 13, height: 38 }}>{s.name}</T>
                      <Row style={{ gap: 3 }}><Icon name="star" size={12} color={colors.brandSecondary} /><T v="caption">{String(s.rating)}</T></Row>
                      <Row style={{ justifyContent: "space-between" }}>
                        <T v="bodyMedium">{inr(s.price)}</T>
                        <Press testID={`trending-add-${s.id}`} onPress={() => addItem(s.id)} style={styles.addBtn}><T v="label" color={colors.brand} style={{ fontSize: 11 }}>Add</T><Icon name="add" size={12} color={colors.brand} /></Press>
                      </Row>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
            {past.length > 0 && (
              <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
                <T v="title">Book again</T>
                {past.map((b) => (
                  <View key={b.id} style={styles.again}>
                    <Image source={{ uri: b.lines[0]?.image }} style={{ width: 48, height: 48, borderRadius: radius.md }} contentFit="cover" />
                    <View style={{ flex: 1 }}>
                      <T v="bodyMedium" numberOfLines={1}>{b.lines.map((l: any) => l.name).join(", ")}</T>
                      <T v="caption">{`${inr(b.pricing.total)} · ${b.booking_no}`}</T>
                    </View>
                    <Button small variant="outline" icon="refresh" title="Re-book" onPress={() => rebook(b.id)} testID={`rebook-${b.id}`} />
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      <CartBar testID="home-view-cart-btn" bottom={bottomChrome + spacing.lg} />
      <LocationSheet open={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: colors.brand, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
  search: { flexDirection: "row", alignItems: "center", gap: spacing.sm, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, height: 48, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  banner: { height: 150, borderRadius: radius.lg, overflow: "hidden" },
  code: { alignSelf: "flex-start", marginTop: spacing.sm, backgroundColor: colors.brandSecondary, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  grid: { flexDirection: "row", flexWrap: "wrap", rowGap: spacing.lg },
  cat: { width: (W - spacing.lg * 2) / 4, alignItems: "center", gap: 6 },
  catIcon: { width: 60, height: 60, borderRadius: radius.lg, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  mini: { width: 160, borderRadius: radius.lg, overflow: "hidden", backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 2, borderWidth: 1, borderColor: colors.brand, borderRadius: radius.sm + 2, paddingHorizontal: 10, height: 30 },
  again: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
  addr: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, minHeight: 56 },
});
