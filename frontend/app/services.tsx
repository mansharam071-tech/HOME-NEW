import React from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { errMsg, inr, useApi } from "@/src/api";
import { CartBar, useCart } from "@/src/cart";
import { useLang } from "@/src/i18n";
import { Chip, ChipRow, Empty, ErrorBox, Icon, Press, Row, ScreenHeader, Skeleton, T, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

export default function Services() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { t } = useLang();
  const { add } = useCart();
  const { category_id, q } = useLocalSearchParams<{ category_id?: string; q?: string }>();
  const list = useApi<any[]>("/catalog/services", { category_id, q });
  const home = useApi<any>("/catalog/home");
  const cats = home.data?.categories || [];
  const title = q ? t(`Results for "${q}"`) : cats.find((c: any) => c.id === category_id)?.name || "All services";
  const addItem = async (id: string) => { try { await add(id); toast("Added to cart"); } catch (e) { toast(errMsg(e), "error"); } };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title={title} />
      <ChipRow>
        <Chip testID="services-chip-all" label="All services" active={!category_id && !q} onPress={() => router.setParams({ category_id: undefined, q: undefined })} />
        {cats.map((c: any) => <Chip key={c.id} testID={`services-chip-${c.id}`} label={c.name} active={c.id === category_id} onPress={() => router.setParams({ category_id: c.id, q: undefined })} />)}
      </ChipRow>
      {list.loading && !list.data ? <View style={{ padding: spacing.lg, gap: spacing.md }}>{[0, 1, 2].map((i) => <Skeleton key={i} h={120} />)}</View> :
        list.error && !list.data ? <View style={{ padding: spacing.lg }}><ErrorBox text={list.error} onRetry={list.reload} /></View> : (
          <FlatList data={list.data || []} keyExtractor={(s) => s.id} testID="services-list"
            contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md, paddingBottom: insets.bottom + 96 }}
            ListEmptyComponent={<Empty text="No services match your search" icon="search-outline" testID="services-empty" />}
            renderItem={({ item: s }) => (
              <View style={styles.card}>
                <Press testID={`service-card-${s.id}`} onPress={() => router.push(`/service/${s.id}`)} style={{ flex: 1, gap: 4 }}>
                  <T v="subtitle" numberOfLines={2}>{s.name}</T>
                  <Row style={{ gap: spacing.md }}>
                    <Row style={{ gap: 3 }}><Icon name="star" size={12} color={colors.brandSecondary} /><T v="caption">{`${s.rating} (${(s.reviews_count / 1000).toFixed(1)}k)`}</T></Row>
                    <Row style={{ gap: 3 }}><Icon name="time-outline" size={12} color={colors.muted} /><T v="caption">{`${s.duration_min} min`}</T></Row>
                  </Row>
                  <T v="bodyMedium">{`${t("Starts at")} ${inr(s.price)}`}</T>
                  {s.inclusions.slice(0, 2).map((x: string) => (
                    <Row key={x} style={{ gap: 4, alignItems: "flex-start" }}><Icon name="checkmark" size={14} color={colors.success} /><T v="caption" style={{ flex: 1 }} numberOfLines={1}>{x}</T></Row>
                  ))}
                </Press>
                <View style={{ width: 100, alignItems: "center" }}>
                  <Image source={{ uri: s.image }} style={styles.img} contentFit="cover" transition={200} />
                  <Press testID={`service-add-${s.id}`} onPress={() => addItem(s.id)} style={styles.add}>
                    <T v="label" color={colors.brand}>Add</T><Icon name="add" size={14} color={colors.brand} />
                  </Press>
                </View>
              </View>
            )} />
        )}
      <CartBar testID="services-view-cart-btn" bottom={insets.bottom + spacing.lg} label="Checkout →" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border },
  img: { width: 100, height: 84, borderRadius: radius.md },
  add: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: -16, height: 34, paddingHorizontal: 14, borderRadius: radius.sm + 2, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.brand, elevation: 2, shadowColor: colors.onSurface, shadowOpacity: 0.1, shadowRadius: 4 },
});
