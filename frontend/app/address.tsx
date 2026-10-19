import React, { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, errMsg } from "@/src/api";
import { useCart } from "@/src/cart";
import { useGps } from "@/src/gps";
import { Button, Chip, Input, Row, ScreenHeader, T, useToast } from "@/src/ui";
import { colors, spacing } from "@/src/theme";

export default function AddAddress() {
  const params = useLocalSearchParams<{ pincode?: string; lat?: string; lng?: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const toast = useToast();
  const { setAddress } = useCart();
  const [f, setF] = useState<any>({
    label: "Home", line: "", pincode: params.pincode || "", landmark: "",
    location: params.lat ? { lat: Number(params.lat), lng: Number(params.lng) } : null,
  });
  const [busy, setBusy] = useState(false);
  const gps = useGps(async (pos) => {
    try {
      const d = await api("/locate", { params: pos });
      setF((x: any) => ({ ...x, location: pos, pincode: d.pincode || x.pincode }));
      toast(`Detected near ${d.city}`);
    } catch (e) { toast(errMsg(e), "error"); }
  });
  const save = async () => {
    setBusy(true);
    try {
      const d = await api("/customer/addresses", { method: "POST", body: f });
      toast(d.serviceable ? "Address saved" : "Saved, but this pincode isn't serviceable yet", d.serviceable ? "success" : "error");
      setAddress(d);
      router.canGoBack() ? router.back() : router.replace("/(tabs)/home");
    } catch (e) { toast(errMsg(e), "error"); setBusy(false); }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <ScreenHeader back title="Add address" />
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + spacing.xl }}>
        <Row>
          {["Home", "Office", "Other"].map((l) => <Chip key={l} testID={`address-label-${l.toLowerCase()}`} label={l} active={f.label === l} onPress={() => setF({ ...f, label: l })} />)}
        </Row>
        <Button testID="address-gps-btn" variant="outline" icon="locate" title="Detect via GPS" loading={gps.busy} onPress={gps.start} />
        {f.location && <T v="caption" color="#15803D" testID="address-gps-detected">{`GPS: ${f.location.lat.toFixed(4)}, ${f.location.lng.toFixed(4)}`}</T>}
        <Input testID="address-line-input" label="Address" placeholder="House / flat, street, area" value={f.line} onChangeText={(v) => setF({ ...f, line: v })} autoComplete="street-address" />
        <Input testID="address-pincode-input" label="Pincode" placeholder="Pincode (e.g. 226001)" keyboardType="number-pad" maxLength={6}
          value={f.pincode} onChangeText={(v) => setF({ ...f, pincode: v.replace(/\D/g, "") })} />
        <Input testID="address-landmark-input" label="Landmark" placeholder="Landmark" value={f.landmark} onChangeText={(v) => setF({ ...f, landmark: v })} />
        <Button testID="address-save-btn" title="Save address" disabled={!f.line || f.pincode.length !== 6} loading={busy} onPress={save} />
      </KeyboardAwareScrollView>
      {gps.sheet}
    </View>
  );
}
