import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { api } from "./api";
import { useAuth } from "./auth";
import { useLang } from "./i18n";
import { Icon, Press, T } from "./ui";
import { colors, radius, spacing } from "./theme";

type Cart = {
  count: number; address: any; setAddress: (a: any) => void;
  refresh: () => Promise<void>; add: (service_id: string, addon_ids?: string[], qty?: number) => Promise<void>;
};
const CartCtx = createContext<Cart>({} as any);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [count, setCount] = useState(0);
  const [address, setAddress] = useState<any>(null);
  const refresh = useCallback(async () => {
    if (!session) return;
    try {
      const d = await api("/customer/cart");
      setCount(d.items.reduce((a: number, i: any) => a + i.qty, 0));
      setAddress((x: any) => x || d.address);
    } catch { /* offline: keep last known */ }
  }, [session]);
  useEffect(() => {
    if (session) refresh();
    else { setCount(0); setAddress(null); }
  }, [session, refresh]);
  const add = async (service_id: string, addon_ids: string[] = [], qty = 1) => {
    await api("/customer/cart/items", { method: "POST", body: { service_id, qty, addon_ids } });
    await refresh();
  };
  return <CartCtx.Provider value={{ count, address, setAddress, refresh, add }}>{children}</CartCtx.Provider>;
};

export const useCart = () => useContext(CartCtx);

export const CartBar = ({ bottom, testID, label = "View cart →" }: { bottom: number; testID: string; label?: string }) => {
  const { count } = useCart();
  const { t } = useLang();
  const router = useRouter();
  if (!count) return null;
  return (
    <Press testID={testID} onPress={() => router.push("/checkout")} style={[styles.bar, { bottom }]}>
      <Icon name="cart" size={20} color={colors.onBrandSecondary} />
      <T v="bodyMedium" color={colors.onBrandSecondary} style={{ flex: 1 }}>{`${count} ${t("item(s) in cart")}`}</T>
      <T v="bodyMedium" color={colors.onBrandSecondary}>{label}</T>
    </Press>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: "absolute", left: spacing.lg, right: spacing.lg, minHeight: 52, borderRadius: radius.lg, backgroundColor: colors.brandSecondary,
    flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg,
    shadowColor: colors.onSurface, shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
});
