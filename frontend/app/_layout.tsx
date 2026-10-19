import React, { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Platform, View } from "react-native";
import * as Notifications from "expo-notifications";
import * as Linking from "expo-linking";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AuthProvider } from "@/src/auth";
import { CartProvider } from "@/src/cart";
import { RazorpayProvider } from "@/src/razorpay";
import { Button, Sheet, T, ToastProvider } from "@/src/ui";
import { storage } from "@/src/utils/storage";
import { colors } from "@/src/theme";

// 1. Foreground push display — module scope
if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// 2. Android channel — module scope, exists before any push arrives
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
  });
}

const openPushUrl = (router: ReturnType<typeof useRouter>, data: any) => {
  const url = data?.deeplink || data?.action_url;
  if (!url) return;
  if (String(url).startsWith("http")) Linking.openURL(url);
  else router.push(url);
};

const PushNudge = ({ open, onDone }: { open: boolean; onDone: () => void }) => {
  const done = async (settings: boolean) => {
    await storage.setItem("pushNudgeAt", String(Date.now()));
    onDone();
    if (settings) Linking.openSettings();
  };
  return (
    <Sheet open={open} onClose={() => done(false)} title="Turn on booking alerts" testID="push-nudge-sheet">
      <T v="body" color={colors.onSurfaceTertiary}>Get notified when your professional is assigned, on the way, or when the job is done. Notifications are off for SMARTFIX.</T>
      <Button testID="push-nudge-settings-btn" title="Open Settings" icon="settings-outline" onPress={() => done(true)} />
      <Button testID="push-nudge-later-btn" variant="ghost" title="Later" onPress={() => done(false)} />
    </Sheet>
  );
};

export default function RootLayout() {
  const router = useRouter();
  const [nudge, setNudge] = useState(false);
  // Pre-warm icon + text fonts so icons render on first paint (Expo Go Android fix)
  const [loaded] = useFonts({
    Ionicons: require("../assets/fonts/Ionicons.ttf"),
    "Mukta-Regular": require("../assets/fonts/Mukta-Regular.ttf"),
    "Mukta-Medium": require("../assets/fonts/Mukta-Medium.ttf"),
    "Hind-Regular": require("../assets/fonts/Hind-Regular.ttf"),
    "Hind-Medium": require("../assets/fonts/Hind-Medium.ttf"),
  });

  useEffect(() => {
    if (Platform.OS === "web") return;
    // 3. Warm tap
    const tapSub = Notifications.addNotificationResponseReceivedListener((response) => {
      openPushUrl(router, response.notification.request.content.data);
    });
    // 4. Cold-start tap
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openPushUrl(router, response.notification.request.content.data);
    });
    // 5. Weekly nudge when permission is permanently denied
    (async () => {
      const { status, canAskAgain } = await Notifications.getPermissionsAsync();
      if (status !== "denied" || canAskAgain) return;
      const last = await storage.getItem("pushNudgeAt");
      if (last && Date.now() - Number(last) <= 7 * 24 * 60 * 60 * 1000) return;
      setNudge(true);
    })();
    return () => tapSub.remove();
  }, [router]);

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.brand} /></View>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <RazorpayProvider>
                  <StatusBar style="dark" />
                  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />
                  <PushNudge open={nudge} onDone={() => setNudge(false)} />
                </RazorpayProvider>
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
