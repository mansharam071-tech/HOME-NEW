import React from "react";
import { Platform } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useAuth } from "@/src/auth";
import { useLang } from "@/src/i18n";
import { usesNativeTabs } from "@/src/navigation";
import { colors, fonts } from "@/src/theme";

const TABS = [
  { name: "home", label: "Home", sf: "house.fill", icon: "home", iconOff: "home-outline" },
  { name: "bookings", label: "Bookings", sf: "calendar", icon: "calendar", iconOff: "calendar-outline" },
  { name: "wallet", label: "Wallet", sf: "wallet.pass.fill", icon: "wallet", iconOff: "wallet-outline" },
  { name: "profile", label: "Profile", sf: "person.crop.circle.fill", icon: "person-circle", iconOff: "person-circle-outline" },
] as const;

export default function TabsLayout() {
  const { session, ready } = useAuth();
  const { t } = useLang();
  if (ready && !session) return <Redirect href="/login" />;

  if (usesNativeTabs) {
    return (
      <NativeTabs tintColor={colors.brand}>
        {TABS.map((tb) => (
          <NativeTabs.Trigger key={tb.name} name={tb.name}>
            <NativeTabs.Trigger.Icon sf={tb.sf as any} />
            <NativeTabs.Trigger.Label>{t(tb.label)}</NativeTabs.Trigger.Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.brand,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { backgroundColor: colors.surfaceSecondary, borderTopColor: colors.border, ...(Platform.OS === "web" ? { height: 64 } : {}) },
      tabBarItemStyle: { alignSelf: "center" },
      tabBarLabelStyle: { fontFamily: fonts.textMedium, fontSize: 11 },
    }}>
      {TABS.map((tb) => (
        <Tabs.Screen key={tb.name} name={tb.name} options={{
          title: t(tb.label),
          tabBarButtonTestID: `tab-${tb.name}`,
          tabBarIcon: ({ focused, color }) => <Ionicons name={(focused ? tb.icon : tb.iconOff) as any} size={22} color={color} />,
        }} />
      ))}
    </Tabs>
  );
}
