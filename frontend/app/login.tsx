import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth";
import { errMsg } from "@/src/api";
import { Button, Icon, Input, T } from "@/src/ui";
import { colors, radius, spacing } from "@/src/theme";

const HERO = "https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80";

export default function Login() {
  const { login, session } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  if (session) return <Redirect href="/(tabs)/home" />;

  const submit = async () => {
    if (!email.trim() || !pw) return setErr("Enter email and password");
    setBusy(true); setErr("");
    try { await login(email.trim(), pw); } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + spacing.xl }}>
        <View style={styles.hero}>
          <Image source={{ uri: HERO }} style={StyleSheet.absoluteFill} contentFit="cover" transition={300} />
          <LinearGradient colors={["rgba(15,23,42,0.35)", "rgba(30,58,138,0.85)", colors.surface]} locations={[0, 0.65, 1]} style={StyleSheet.absoluteFill} />
          <View style={{ paddingTop: insets.top + spacing.xl, paddingHorizontal: spacing.xl, gap: spacing.sm }}>
            <View style={styles.logo}><Icon name="construct" size={22} color={colors.onBrandSecondary} /></View>
            <T v="display" color={colors.onBrand} style={{ fontSize: 30, lineHeight: 38 }}>
              Home<T v="display" color={colors.brandSecondary} style={{ fontSize: 30, lineHeight: 38 }}>Serve</T>
            </T>
            <T v="label" color={colors.brandTertiary}>HomeServe Ops</T>
          </View>
        </View>
        <View style={styles.form}>
          <T v="title">Admin console</T>
          <T v="body" color={colors.muted}>Manage bookings, partners, cities and payouts on the go.</T>
          <Input testID="admin-login-email" label="Email" placeholder="admin@homeserve.in" value={email} onChangeText={setEmail}
            autoCapitalize="none" keyboardType="email-address" autoComplete="email" returnKeyType="next" />
          <View>
            <Input testID="admin-login-password" label="Password" placeholder="••••••••" value={pw} onChangeText={setPw}
              secureTextEntry={!show} returnKeyType="go" onSubmitEditing={submit} style={{ paddingRight: 48 }} />
            <Icon testID="toggle-password-visibility" name={show ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted}
              style={styles.eye} onPress={() => setShow(!show)} />
          </View>
          {err ? <View style={styles.err} testID="admin-login-error"><Icon name="alert-circle" size={16} color={colors.error} /><T v="body" color={colors.error} style={{ flex: 1 }}>{err}</T></View> : null}
          <Button testID="admin-login-submit" title="Sign in" icon="log-in-outline" loading={busy} onPress={submit} style={{ marginTop: spacing.sm }} />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 280, overflow: "hidden" },
  logo: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  form: { marginTop: -24, marginHorizontal: spacing.lg, padding: spacing.xl, gap: spacing.md, backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  eye: { position: "absolute", right: 14, bottom: 14 },
  err: { flexDirection: "row", gap: spacing.sm, alignItems: "center", backgroundColor: colors.errorTint, padding: spacing.md, borderRadius: radius.md },
});
