import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { api } from "./api";

/** Ask permission (first), fetch native FCM/APNs token, register with backend. Re-run on every app open. */
export async function registerForPush(user_id: string) {
  if (Platform.OS === "web" || !Device.isDevice) return;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;
    const tokenResp = await Notifications.getDevicePushTokenAsync();
    await api("/register-push", { method: "POST", body: { user_id, platform: Platform.OS, device_token: tokenResp.data } });
  } catch {
    // Push is optional — never block the app (e.g. Expo Go has no remote push)
  }
}
