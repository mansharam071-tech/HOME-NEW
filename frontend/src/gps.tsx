import React, { useRef, useState } from "react";
import { Linking, Platform, View } from "react-native";
import * as Location from "expo-location";
import { Button, Icon, Sheet, T, useToast } from "./ui";
import { colors, spacing } from "./theme";

type Pos = { lat: number; lng: number };

/** GPS with contextual pre-permission sheet, one re-ask, then Open Settings. */
export function useGps(onPos: (p: Pos) => void) {
  const toast = useToast();
  const [state, setState] = useState<null | "explain" | "blocked">(null);
  const [busy, setBusy] = useState(false);
  const denials = useRef(0);

  const fetchPos = async () => {
    setBusy(true);
    try {
      const p = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      onPos({ lat: p.coords.latitude, lng: p.coords.longitude });
    } catch {
      toast("Could not get your location. Please try again or enter pincode.", "error");
    } finally { setBusy(false); }
  };

  const start = async () => {
    const p = await Location.getForegroundPermissionsAsync();
    if (p.granted) return fetchPos();
    if (p.status === "denied" && (!p.canAskAgain || denials.current >= 2)) return setState("blocked");
    setState("explain");
  };

  const allow = async () => {
    const r = await Location.requestForegroundPermissionsAsync();
    if (r.granted) { setState(null); return fetchPos(); }
    denials.current += 1;
    setState(r.canAskAgain && denials.current < 2 ? "explain" : "blocked");
  };

  const sheet = (
    <Sheet open={!!state} onClose={() => setState(null)} title={state === "blocked" ? "Location permission" : "Allow location access"} testID="location-permission-sheet">
      <View style={{ alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.brandTertiary, alignItems: "center", justifyContent: "center" }}>
          <Icon name="location" size={30} color={colors.brand} />
        </View>
        <T v="body" color={colors.onSurfaceTertiary} style={{ textAlign: "center" }}>
          {state === "blocked" ? "Location permission is off. Enable it in Settings, or type your pincode manually." : "We use your location only to find your address and nearest service city."}
        </T>
      </View>
      {state === "blocked" ? (
        Platform.OS !== "web" && <Button testID="location-open-settings-btn" title="Open Settings" icon="settings-outline" onPress={() => { setState(null); Linking.openSettings(); }} />
      ) : (
        <Button testID="location-allow-btn" title="Allow" icon="locate" onPress={allow} />
      )}
      <Button testID="location-not-now-btn" variant="ghost" title="Not now" onPress={() => setState(null)} />
    </Sheet>
  );

  return { start, sheet, busy };
}
