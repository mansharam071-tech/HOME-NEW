import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { storage } from "@/src/utils/storage";
import { api, setToken, setUnauthorizedHandler } from "./api";
import { LangProvider } from "./i18n";
import { registerForPush } from "./push";
import { colors } from "./theme";

const KEY = "hs_customer";
type Session = { token: string; user: any } | null;

const AuthCtx = createContext<{
  session: Session; ready: boolean;
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, otp: string) => Promise<any>;
  updateMe: (patch: any) => Promise<any>;
  logout: () => Promise<void>;
}>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session>(null);
  const [ready, setReady] = useState(false);

  const persist = useCallback(async (s: Session) => {
    setSession(s);
    setToken(s?.token || null);
    if (s) await storage.setItem(KEY, JSON.stringify(s));
    else await storage.removeItem(KEY);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => { persist(null); });
    storage.getItem(KEY).then((raw) => {
      const s = raw ? JSON.parse(raw) : null;
      setSession(s);
      setToken(s?.token || null);
      setReady(true);
    }).catch(() => setReady(true));
  }, [persist]);

  const sendOtp = (phone: string) => api("/auth/otp/send", { method: "POST", body: { phone, role: "customer" } });
  const verifyOtp = async (phone: string, otp: string) => {
    const d = await api("/auth/otp/verify", { method: "POST", body: { phone, otp, role: "customer" } });
    await persist({ token: d.token, user: d.user });
    return d;
  };
  const updateMe = async (patch: any) => {
    const user = await api("/auth/me", { method: "PUT", body: patch });
    if (session) await persist({ ...session, user });
    return user;
  };
  const logout = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    await persist(null);
  };

  // Register for push on login and on every app open (tokens rotate)
  const uid = session?.user?.id;
  useEffect(() => { if (uid) registerForPush(uid); }, [uid]);

  return (
    <AuthCtx.Provider value={{ session, ready, sendOtp, verifyOtp, updateMe, logout }}>
      <LangProvider lang={session?.user?.language || "en"}>
        {ready ? children : <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}><ActivityIndicator color={colors.brand} /></View>}
      </LangProvider>
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
