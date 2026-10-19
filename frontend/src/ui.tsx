import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps,
  TextProps, View, ViewStyle, StyleProp,
} from "react-native";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { colors, fonts, radius, spacing, type } from "./theme";
import { useLang } from "./i18n";

export type IconName = React.ComponentProps<typeof Ionicons>["name"];
export const Icon = Ionicons;

/* ---------- Text ---------- */
type V = "display" | "title" | "subtitle" | "body" | "bodyMedium" | "caption" | "label" | "mono";
const VS: Record<V, any> = {
  display: { fontFamily: fonts.display, fontSize: type["2xl"], lineHeight: 32 },
  title: { fontFamily: fonts.display, fontSize: type.xl, lineHeight: 28 },
  subtitle: { fontFamily: fonts.display, fontSize: type.lg, lineHeight: 22 },
  body: { fontFamily: fonts.text, fontSize: type.base, lineHeight: 20 },
  bodyMedium: { fontFamily: fonts.textMedium, fontSize: type.base, lineHeight: 20 },
  caption: { fontFamily: fonts.text, fontSize: type.sm, lineHeight: 17, color: colors.muted },
  label: { fontFamily: fonts.textMedium, fontSize: 11, lineHeight: 15, letterSpacing: 0.6, textTransform: "uppercase", color: colors.muted },
  mono: { fontFamily: fonts.textMedium, fontSize: type.sm, letterSpacing: 0.5 },
};
export const T = ({ v = "body", color, style, children, ...p }: TextProps & { v?: V; color?: string }) => {
  const { t } = useLang();
  const kids = typeof children === "string" ? t(children) : children;
  return <Text {...p} style={[{ color: colors.onSurface }, VS[v], color ? { color } : null, style]}>{kids}</Text>;
};

/* ---------- Pressable with scale ---------- */
export const Press = ({ style, children, onPress, disabled, testID, hitSlop = 8 }: any) => {
  const s = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(s, { toValue: v, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  return (
    <Pressable testID={testID} onPress={onPress} disabled={disabled} hitSlop={hitSlop} onPressIn={() => to(0.97)} onPressOut={() => to(1)}>
      <Animated.View style={[style, { transform: [{ scale: s }] }, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
};

/* ---------- Button ---------- */
type BV = "primary" | "accent" | "success" | "danger" | "outline" | "ghost";
const BC: Record<BV, { bg: string; fg: string; border?: string }> = {
  primary: { bg: colors.brand, fg: colors.onBrand },
  accent: { bg: colors.brandSecondary, fg: colors.onBrandSecondary },
  success: { bg: colors.success, fg: colors.onSuccess },
  danger: { bg: colors.error, fg: colors.onError },
  outline: { bg: colors.surfaceSecondary, fg: colors.onSurface, border: colors.borderStrong },
  ghost: { bg: "transparent", fg: colors.brand },
};
export const Button = ({ title, onPress, variant = "primary", icon, loading, disabled, small, testID, style }: {
  title: string; onPress?: () => void; variant?: BV; icon?: IconName; loading?: boolean; disabled?: boolean; small?: boolean; testID?: string; style?: StyleProp<ViewStyle>;
}) => {
  const c = BC[variant];
  return (
    <Press testID={testID} onPress={onPress} disabled={disabled || loading}
      style={[styles.btn, small && styles.btnSm, { backgroundColor: c.bg, borderColor: c.border || c.bg }, style]}>
      {loading ? <ActivityIndicator color={c.fg} /> : (
        <>
          {icon && <Ionicons name={icon} size={small ? 14 : 18} color={c.fg} />}
          <T v="bodyMedium" color={c.fg} style={small ? { fontSize: 12 } : null}>{title}</T>
        </>
      )}
    </Press>
  );
};

export const IconBtn = ({ name, onPress, testID, color = colors.onSurface, badge, bg = colors.surfaceSecondary }: any) => (
  <Press testID={testID} onPress={onPress} style={[styles.iconBtn, { backgroundColor: bg }]}>
    <Ionicons name={name} size={20} color={color} />
    {badge ? <View style={styles.badge}><Text style={styles.badgeTxt}>{badge > 99 ? "99+" : badge}</Text></View> : null}
  </Press>
);

/* ---------- Card ---------- */
export const Card = ({ children, style, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) => (
  <View testID={testID} style={[styles.card, style]}>{children}</View>
);

/* ---------- Chip ---------- */
export const Chip = ({ label, active, onPress, testID, count }: { label: string; active?: boolean; onPress?: () => void; testID?: string; count?: number }) => {
  const { t } = useLang();
  return (
    <Pressable testID={testID} onPress={onPress} hitSlop={6}
      style={[styles.chip, active ? { backgroundColor: colors.brand, borderColor: colors.brand } : null]}>
      <Text numberOfLines={1} style={[styles.chipTxt, { color: active ? colors.onBrand : colors.onSurfaceTertiary }]}>
        {t(label)}{count !== undefined ? `  ${count}` : ""}
      </Text>
    </Pressable>
  );
};

export const ChipRow = ({ children }: { children: React.ReactNode }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}
    contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "center" }}>
    {children}
  </ScrollView>
);

/* ---------- Segmented ---------- */
export const Segmented = ({ options, value, onChange, testID }: { options: { k: string; label: string }[]; value: string; onChange: (k: string) => void; testID?: string }) => (
  <View style={styles.seg} testID={testID}>
    {options.map((o) => (
      <Pressable key={o.k} testID={`${testID}-${o.k}`} onPress={() => onChange(o.k)} style={[styles.segItem, value === o.k && styles.segActive]}>
        <T v="bodyMedium" color={value === o.k ? colors.brand : colors.muted} style={{ fontSize: 13 }}>{o.label}</T>
      </Pressable>
    ))}
  </View>
);

/* ---------- Switch ---------- */
export const Toggle = ({ value, onChange, testID }: { value: boolean; onChange: (v: boolean) => void; testID?: string }) => {
  const a = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => { Animated.timing(a, { toValue: value ? 1 : 0, duration: 160, useNativeDriver: false }).start(); }, [value, a]);
  return (
    <Pressable testID={testID} onPress={() => onChange(!value)} hitSlop={10} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Animated.View style={[styles.sw, { backgroundColor: a.interpolate({ inputRange: [0, 1], outputRange: [colors.borderStrong, colors.success] }) }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [2, 22] }) }] }]} />
      </Animated.View>
    </Pressable>
  );
};

/* ---------- Status badge ---------- */
export const STATUS: Record<string, { label: string; bg: string; fg: string }> = {
  payment_pending: { label: "Payment Pending", bg: "#FFEDD5", fg: "#9A3412" },
  pending: { label: "Pending", bg: "#FEF9C3", fg: "#854D0E" },
  assigned: { label: "Assigned", bg: colors.brandTertiary, fg: colors.brand },
  en_route: { label: "En Route", bg: "#E0E7FF", fg: "#3730A3" },
  in_progress: { label: "In Progress", bg: "#FEF3C7", fg: "#92400E" },
  completed: { label: "Completed", bg: "#DCFCE7", fg: "#166534" },
  cancelled: { label: "Cancelled", bg: "#FEE2E2", fg: "#B91C1C" },
  approved: { label: "approved", bg: "#DCFCE7", fg: "#166534" },
  rejected: { label: "rejected", bg: "#FEE2E2", fg: "#B91C1C" },
  resubmit: { label: "resubmit", bg: "#FEF3C7", fg: "#92400E" },
  not_submitted: { label: "not submitted", bg: colors.surfaceTertiary, fg: colors.muted },
};
export const Badge = ({ status, testID }: { status: string; testID?: string }) => {
  const s = STATUS[status] || { label: status, bg: colors.surfaceTertiary, fg: colors.muted };
  return <View testID={testID} style={[styles.badgePill, { backgroundColor: s.bg }]}><T v="label" color={s.fg} style={{ fontSize: 10 }}>{s.label}</T></View>;
};

/* ---------- Input ---------- */
export const Input = ({ label, style, testID, ...p }: TextInputProps & { label?: string; testID?: string }) => {
  const { t } = useLang();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <T v="label">{label}</T> : null}
      <TextInput testID={testID} placeholderTextColor={colors.muted} {...p}
        placeholder={p.placeholder ? t(p.placeholder) : undefined}
        onFocus={(e) => { setFocus(true); p.onFocus?.(e); }} onBlur={(e) => { setFocus(false); p.onBlur?.(e); }}
        style={[styles.input, focus && { borderColor: colors.brand }, p.multiline && { height: 96, textAlignVertical: "top", paddingTop: 10 }, style]} />
    </View>
  );
};

/* ---------- States ---------- */
export const Skeleton = ({ h = 80, style }: { h?: number; style?: StyleProp<ViewStyle> }) => {
  const a = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0.5, duration: 700, useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, [a]);
  return <Animated.View style={[{ height: h, borderRadius: radius.md, backgroundColor: colors.border, opacity: a }, style]} />;
};

export const Empty = ({ text, icon = "file-tray-outline", testID }: { text: string; icon?: IconName; testID?: string }) => (
  <View testID={testID} style={styles.empty}>
    <View style={styles.emptyIcon}><Ionicons name={icon} size={28} color={colors.brand} /></View>
    <T v="body" color={colors.muted} style={{ textAlign: "center" }}>{text}</T>
  </View>
);

export const ErrorBox = ({ text, onRetry }: { text: string; onRetry: () => void }) => (
  <Card style={{ alignItems: "center", gap: spacing.md, backgroundColor: colors.errorTint, borderColor: "#FECACA" }} testID="error-box">
    <Ionicons name="cloud-offline-outline" size={28} color={colors.error} />
    <T v="bodyMedium">Failed to load</T>
    <T v="caption" style={{ textAlign: "center" }}>{text}</T>
    <Button small title="Retry" variant="outline" icon="refresh" onPress={onRetry} testID="error-retry-btn" />
  </Card>
);

/* ---------- Headers ---------- */
export const ScreenHeader = ({ title, subtitle, right, back }: { title: string; subtitle?: string; right?: React.ReactNode; back?: boolean }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  return (
    <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
      {back && <IconBtn testID="header-back-btn" name="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />}
      <View style={{ flex: 1 }}>
        <T v="title" numberOfLines={1} testID="screen-title">{title}</T>
        {subtitle ? <T v="caption" numberOfLines={1}>{subtitle}</T> : null}
      </View>
      {right}
    </View>
  );
};

/* ---------- Bottom sheet ---------- */
export const Sheet = ({ open, onClose, title, children, testID, form }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode; testID?: string; form?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const Scroll: any = form ? KeyboardAwareScrollView : ScrollView;
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={styles.sheetWrap}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} testID={testID ? `${testID}-backdrop` : undefined}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }]} />
        </Pressable>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg, marginTop: insets.top + 40 }]} testID={testID}>
          <View style={styles.handle} />
          <View style={styles.sheetHead}>
            <T v="subtitle" style={{ flex: 1 }} numberOfLines={2}>{title || ""}</T>
            <IconBtn testID={testID ? `${testID}-close` : "sheet-close"} name="close" onPress={onClose} bg={colors.surfaceTertiary} />
          </View>
          <Scroll contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.md }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            {children}
          </Scroll>
        </View>
      </View>
    </Modal>
  );
};

/* ---------- Toast ---------- */
const ToastCtx = createContext<(msg: string, kind?: "success" | "error") => void>(() => {});
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLang();
  const [msg, setMsg] = useState<{ text: string; kind: string } | null>(null);
  const a = useRef(new Animated.Value(0)).current;
  const timer = useRef<any>(null);
  const show = useCallback((text: string, kind: "success" | "error" = "success") => {
    setMsg({ text, kind });
    clearTimeout(timer.current);
    Animated.spring(a, { toValue: 1, useNativeDriver: true }).start();
    timer.current = setTimeout(() => Animated.timing(a, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setMsg(null)), 2600);
  }, [a]);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      {msg && (
        <Animated.View pointerEvents="none" testID="toast"
          style={[styles.toast, { top: insets.top + spacing.sm, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
          <Ionicons name={msg.kind === "error" ? "alert-circle" : "checkmark-circle"} size={20} color={msg.kind === "error" ? colors.error : colors.success} />
          <Text style={styles.toastTxt} testID="toast-text">{t(msg.text)}</Text>
        </Animated.View>
      )}
    </ToastCtx.Provider>
  );
};
export const useToast = () => useContext(ToastCtx);

export const Row = ({ children, style, testID }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; testID?: string }) => (
  <View testID={testID} style={[{ flexDirection: "row", alignItems: "center", gap: spacing.sm }, style]}>{children}</View>
);
export const Divider = () => <View style={{ height: 1, backgroundColor: colors.divider }} />;
export const KV = ({ k, v, bold }: { k: string; v: any; bold?: boolean }) => (
  <Row style={{ justifyContent: "space-between", paddingVertical: 6 }}>
    <T v={bold ? "bodyMedium" : "body"} color={bold ? colors.onSurface : colors.onSurfaceTertiary} style={{ flexShrink: 1 }}>{k}</T>
    <T v={bold ? "subtitle" : "bodyMedium"}>{String(v)}</T>
  </Row>
);

const styles = StyleSheet.create({
  btn: { minHeight: 48, borderRadius: radius.md, paddingHorizontal: spacing.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, borderWidth: 1 },
  btnSm: { minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.sm + 2, gap: 6 },
  iconBtn: { width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  badge: { position: "absolute", top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.error, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeTxt: { color: colors.onError, fontSize: 10, fontFamily: fonts.textMedium },
  card: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, shadowColor: colors.onSurface, shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  chipRow: { height: 56, flexGrow: 0 },
  chip: { height: 36, flexShrink: 0, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, justifyContent: "center" },
  chipTxt: { fontFamily: fonts.textMedium, fontSize: 13 },
  seg: { flexDirection: "row", backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, padding: 4 },
  segItem: { flex: 1, height: 36, alignItems: "center", justifyContent: "center", borderRadius: radius.sm + 2 },
  segActive: { backgroundColor: colors.surfaceSecondary, shadowColor: colors.onSurface, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sw: { width: 46, height: 26, borderRadius: 13, justifyContent: "center" },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.surfaceSecondary },
  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, alignSelf: "flex-start" },
  input: { minHeight: 48, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSecondary, paddingHorizontal: spacing.md, fontFamily: fonts.text, fontSize: 15, color: colors.onSurface },
  empty: { alignItems: "center", gap: spacing.md, paddingVertical: spacing["2xl"] },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surfaceSecondary, borderTopLeftRadius: radius.lg + 4, borderTopRightRadius: radius.lg + 4, maxHeight: "90%" },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, alignSelf: "center", marginTop: spacing.sm },
  sheetHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  toast: { position: "absolute", left: spacing.lg, right: spacing.lg, flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceInverse, borderRadius: radius.md, padding: spacing.md, elevation: 6, shadowColor: colors.onSurface, shadowOpacity: 0.2, shadowRadius: 12 },
  toastTxt: { color: colors.onSurfaceInverse, fontFamily: fonts.textMedium, fontSize: 14, flex: 1 },
});
