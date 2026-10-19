import React from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { AuthProvider } from "@/src/auth";
import { ToastProvider } from "@/src/ui";
import { colors } from "@/src/theme";

export default function RootLayout() {
  // Pre-warm icon + text fonts so icons render on first paint (Expo Go Android fix)
  const [loaded] = useFonts({
    Ionicons: require("../assets/fonts/Ionicons.ttf"),
    "Mukta-Regular": require("../assets/fonts/Mukta-Regular.ttf"),
    "Mukta-Medium": require("../assets/fonts/Mukta-Medium.ttf"),
    "Hind-Regular": require("../assets/fonts/Hind-Regular.ttf"),
    "Hind-Medium": require("../assets/fonts/Hind-Medium.ttf"),
  });
  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color={colors.brand} /></View>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <AuthProvider>
            <ToastProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.surface } }} />
            </ToastProvider>
          </AuthProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
