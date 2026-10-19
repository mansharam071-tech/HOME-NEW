import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg, useApi } from "@/src/api";
import { useAuth } from "@/src/auth";
import { useCart } from "@/src/cart";
import { usesNativeTabs } from "@/src/navigation";
import { Button, Card, Chip, Icon, IconBtn, Input, Press, Row, T, Toggle, useToast } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { session, updateMe, logout } = useAuth();
  const { setAddress, address } = useCart();
  const u = session?.user || {};
  const [name, setName] = useState(u.name || "");
  const [email, setEmail] = useState(u.email || "");
  const [busy, setBusy] = useState(false);
  const addrs = useApi<any[]>("/customer/addresses");
  const bottomChrome = usesNativeTabs ? insets.bottom : 0;
  useEffect(() => { setName(u.name || ""); setEmail(u.email || ""); }, [u.name, u.email]);
  // reload addresses whenever the screen regains focus via router (address added)
  useEffect(() => { addrs.reload(); }, [address?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async (patch: any, msg = "Profile updated") => {
    setBusy(true);
    try { await updateMe(patch); toast(msg); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  const del = async (id: string) => {
    try { await api(`/customer/addresses/${id}`, { method: "DELETE" }); if (address?.id === id) setAddress(null); addrs.reload(); } catch (e) { toast(errMsg(e), "error"); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.lg, gap: spacing.lg, paddingBottom: bottomChrome + spacing.xl }}>
        {!u.name && <View style={styles.onboard} testID="profile-onboard-banner"><Icon name="sparkles" size={18} color="#92400E" /><T v="body" color="#92400E" style={{ flex: 1 }}>Welcome! Add your name and an address to get started.</T></View>}
        <Row style={{ gap: spacing.md }}>
          <View style={styles.avatar}><T v="title" color={colors.onBrand}>{(u.name || "U")[0].toUpperCase()}</T></View>
          <View style={{ flex: 1 }}>
            <T v="title" testID="profile-name">{u.name || "Your name"}</T>
            <T v="caption">{`+91 ${u.phone || ""}`}</T>
          </View>
        </Row>
        <Card style={{ gap: spacing.md }}>
          <Input testID="profile-name-input" label="Full name" placeholder="Full name" value={name} onChangeText={setName} autoComplete="name" />
          <Input testID="profile-email-input" label="Email" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <Button testID="profile-save-btn" title="Save profile" loading={busy} onPress={() => save({ name, email })} />
        </Card>
        <Card style={{ gap: spacing.sm }}>
          <T v="subtitle">Language</T>
          <Row>
            <Chip testID="profile-lang-en" label="English" active={u.language !== "hi"} onPress={() => save({ language: "en" }, "Language updated")} />
            <Chip testID="profile-lang-hi" label="हिंदी" active={u.language === "hi"} onPress={() => save({ language: "hi" }, "Language updated")} />
          </Row>
        </Card>
        <Card style={{ gap: spacing.sm }}>
          <T v="subtitle">Notifications</T>
          {(["push", "sms", "offers"] as const).map((k) => (
            <Row key={k} style={{ justifyContent: "space-between", minHeight: 40 }}>
              <T v="body">{k === "offers" ? "Offers & promotions" : k === "sms" ? "Sms alerts" : "Push alerts"}</T>
              <Toggle testID={`profile-notif-${k}`} value={!!u.notifications?.[k]} onChange={(v) => save({ notifications: { ...u.notifications, [k]: v } })} />
            </Row>
          ))}
        </Card>
        <Card style={{ gap: spacing.sm }}>
          <Row style={{ justifyContent: "space-between" }}>
            <T v="subtitle">Saved addresses</T>
            <Button small variant="ghost" title="+ Add" onPress={() => router.push("/address")} testID="profile-add-address-btn" />
          </Row>
          {(addrs.data || []).map((a) => (
            <View key={a.id} style={styles.addr} testID={`profile-address-${a.id}`}>
              <View style={styles.label}><T v="label" color={colors.onBrand} style={{ fontSize: 10 }}>{a.label}</T></View>
              <View style={{ flex: 1, gap: 2 }}>
                <T v="body">{a.line}</T>
                <T v="caption">{`${a.pincode} · ${a.city}${a.landmark ? ` · ${a.landmark}` : ""}`}</T>
                {address?.id === a.id ? <T v="label" color={colors.success}>Selected</T> :
                  <Press testID={`profile-address-use-${a.id}`} onPress={() => { setAddress(a); toast("Address selected"); }}><T v="bodyMedium" color={colors.brand} style={{ fontSize: 13 }}>Use for booking</T></Press>}
              </View>
              <IconBtn testID={`profile-address-delete-${a.id}`} name="trash-outline" color={colors.muted} onPress={() => del(a.id)} />
            </View>
          ))}
          {addrs.data && !addrs.data.length && <T v="caption">No saved addresses</T>}
        </Card>
        <Press testID="profile-help-btn" onPress={() => router.push("/support")} style={styles.link}>
          <Icon name="help-buoy-outline" size={20} color={colors.brand} /><T v="bodyMedium" style={{ flex: 1 }}>Help & Support</T><Icon name="chevron-forward" size={18} color={colors.muted} />
        </Press>
        <Button testID="customer-logout-btn" variant="outline" icon="log-out-outline" title="Logout" onPress={() => { logout(); router.replace("/login"); }} />
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  onboard: { flexDirection: "row", gap: spacing.sm, alignItems: "center", backgroundColor: colors.amberTint, borderRadius: radius.md, padding: spacing.md },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center" },
  addr: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start", padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary },
  label: { backgroundColor: colors.brand, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2, marginTop: 2 },
  link: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surfaceSecondary, borderWidth: 1, borderColor: colors.border, minHeight: 56 },
});
