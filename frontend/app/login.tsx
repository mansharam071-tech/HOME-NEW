import React, { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/src/auth";
import { errMsg } from "@/src/api";
import { useLang } from "@/src/i18n";
import { Button, Icon, T, useToast } from "@/src/ui";
import { colors, fonts, radius, spacing } from "@/src/theme";

export default function Login() {
  const { session, sendOtp, verifyOtp } = useAuth();
  const { t } = useLang();
  const toast = useToast();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  if (session && !busy) return <Redirect href="/(tabs)/home" />;

  const send = async () => {
    setBusy(true);
    try { const d = await sendOtp(phone); toast(`OTP sent · ${d.message}`); setStep("otp"); } catch (e) { toast(errMsg(e), "error"); } finally { setBusy(false); }
  };
  const verify = async () => {
    setBusy(true);
    try {
      const d = await verifyOtp(phone, otp);
      router.replace(d.is_new ? "/(tabs)/profile" : "/(tabs)/home");
    } catch (e) { toast(errMsg(e), "error"); setBusy(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceSecondary }}>
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + spacing.xl }}>
        <LinearGradient colors={[colors.brand, "#172554"]} style={[styles.hero, { paddingTop: insets.top + spacing["2xl"] }]}>
          <View style={styles.blob1} /><View style={styles.blob2} />
          <View style={styles.logo}><Icon name="home" size={22} color={colors.onBrandSecondary} /></View>
          <T v="label" color={colors.brandTertiary}>HomeServe</T>
          <T v="display" color={colors.onBrand} style={{ fontSize: 30, lineHeight: 38, marginTop: spacing.sm }}>Home services, done right.</T>
          <T v="body" color={colors.brandTertiary} style={{ marginTop: spacing.xs }}>Verified professionals at your doorstep in 30 minutes.</T>
        </LinearGradient>
        <View style={styles.panel}>
          {step === "phone" ? (
            <>
              <T v="label">Mobile number</T>
              <View style={styles.phoneBox}>
                <T v="bodyMedium" color={colors.muted}>+91</T>
                <TextInput testID="customer-login-phone-input" value={phone} onChangeText={(v) => setPhone(v.replace(/\D/g, "").slice(0, 10))}
                  keyboardType="number-pad" maxLength={10} placeholder="98XXXXXXXX" placeholderTextColor={colors.muted} style={styles.phoneInput}
                  returnKeyType="done" onSubmitEditing={() => phone.length === 10 && send()} autoComplete="tel" />
              </View>
              <Button testID="customer-login-send-otp-btn" variant="accent" title="Get OTP" disabled={phone.length !== 10} loading={busy} onPress={send} />
            </>
          ) : (
            <>
              <T v="bodyMedium">{`${t("Enter 4-digit OTP sent to")} +91 ${phone}`}</T>
              <TextInput testID="customer-login-otp-input" value={otp} onChangeText={(v) => setOtp(v.replace(/\D/g, "").slice(0, 4))} autoFocus
                keyboardType="number-pad" maxLength={4} style={styles.otp} placeholder="••••" placeholderTextColor={colors.borderStrong}
                returnKeyType="done" onSubmitEditing={() => otp.length === 4 && verify()} autoComplete="sms-otp" textContentType="oneTimeCode" />
              <T v="caption">Demo mode — use OTP 1234</T>
              <Button testID="customer-login-verify-btn" title="Verify & Continue" disabled={otp.length !== 4} loading={busy} onPress={verify} />
              <Button testID="customer-login-change-number" variant="ghost" title="Change number" onPress={() => { setStep("phone"); setOtp(""); }} />
            </>
          )}
          <View style={styles.hint}><Icon name="information-circle-outline" size={16} color={colors.muted} /><T v="caption" style={{ flex: 1 }}>New here? Any valid mobile number creates your account instantly.</T></View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: spacing.xl, paddingBottom: spacing["3xl"], overflow: "hidden" },
  blob1: { position: "absolute", right: -40, top: -30, width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,255,255,0.08)" },
  blob2: { position: "absolute", right: 60, bottom: -60, width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(245,158,11,0.3)" },
  logo: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.brandSecondary, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  panel: { marginTop: -spacing.xl, borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4, backgroundColor: colors.surfaceSecondary, padding: spacing.xl, gap: spacing.md },
  phoneBox: { flexDirection: "row", alignItems: "center", gap: spacing.sm, height: 52, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md },
  phoneInput: { flex: 1, height: 52, fontFamily: fonts.textMedium, fontSize: 17, color: colors.onSurface, letterSpacing: 1 },
  otp: { height: 60, borderRadius: radius.md, borderWidth: 1, borderColor: colors.borderStrong, textAlign: "center", fontFamily: fonts.display, fontSize: 28, letterSpacing: 16, color: colors.onSurface },
  hint: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.surfaceTertiary, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.lg },
});
