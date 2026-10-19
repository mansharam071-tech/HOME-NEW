import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApi } from "@/src/api";
import { Empty, ErrorBox, ScreenHeader, Skeleton } from "@/src/ui";
import { colors, spacing } from "@/src/theme";
import { AlertCard } from "./(tabs)/home";

export default function Alerts() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refresh, reload } = useApi<any[]>("/admin/alerts", undefined, 10000);
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Notifications & red alerts" subtitle={data ? `${data.length}` : undefined} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + spacing.xl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}>
        {loading && !data ? [0, 1, 2].map((i) => <Skeleton key={i} h={80} />) : error && !data ? <ErrorBox text={error} onRetry={reload} /> :
          !data?.length ? <Empty text="All clear" icon="checkmark-done-circle-outline" testID="alerts-empty" /> :
            data.map((a) => <AlertCard key={a.id} a={a} onDone={reload} />)}
      </ScrollView>
    </View>
  );
}
