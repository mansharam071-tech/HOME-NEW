import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { storage } from "@/src/utils/storage";
import { api, setToken, setUnauthorizedHandler } from "./api";
import { LangProvider } from "./i18n";
import { ActivityIndicator, View } from "react-native";
import { colors } from "./theme";

const KEY = "hs_admin";
type Session = { token: string; user: any } | null;

const AuthCtx = createContext<{
  session: Session; ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleLang: () => Promise<void>;
}>({ session: null, ready: false, login: async () => {}, logout: async () => {}, toggleLang: async () => {} });

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

  const login = async (email: string, password: string) => {
    const d = await api("/auth/admin/login", { method: "POST", body: { email, password } });
    if (d.user?.role !== "admin") throw new Error("Not an admin account");
    await persist({ token: d.token, user: d.user });
  };
  const logout = () => persist(null);
  const toggleLang = async () => {
    if (!session) return;
    const user = await api("/auth/me", { method: "PUT", body: { language: session.user?.language === "hi" ? "en" : "hi" } });
    await persist({ ...session, user });
  };

  return (
    <AuthCtx.Provider value={{ session, ready, login, logout, toggleLang }}>
      <LangProvider lang={session?.user?.language || "en"}>
        {ready ? children : <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface }}><ActivityIndicator color={colors.brand} /></View>}
      </LangProvider>
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
