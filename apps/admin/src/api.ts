import { useCallback, useEffect, useRef, useState } from "react";

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;
export const setToken = (t: string | null) => { token = t; };
export const setUnauthorizedHandler = (fn: () => void) => { onUnauthorized = fn; };

export class ApiError extends Error {
  status: number;
  constructor(msg: string, status: number) { super(msg); this.status = status; }
}

type Opts = { method?: string; body?: any; params?: Record<string, any> };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const qs = opts.params
    ? "?" + Object.entries(opts.params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join("&")
    : "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}${qs}`, {
      method: opts.method || "GET", headers, body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    throw new ApiError("Network error – check your internet connection", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && token && onUnauthorized) onUnauthorized();
    const d = data?.detail;
    const msg = typeof d === "string" ? d : Array.isArray(d) ? d.map((x: any) => x?.msg).join(" ") : "Something went wrong";
    throw new ApiError(msg, res.status);
  }
  return data as T;
}

export const errMsg = (e: any) => (e?.message as string) || "Something went wrong";

export const inr = (n: any) => (Number(n) < 0 ? "-₹" : "₹") + Math.abs(Number(n || 0)).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const fmtDT = (s?: string | null, lang = "en") =>
  s ? new Date(s).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "-";
export const fmtDate = (s?: string | null, lang = "en") =>
  s ? new Date(`${s.slice(0, 10)}T00:00:00`).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";

/** Fetch + poll helper. Returns data, loading, error, reload. */
export function useApi<T = any>(path: string | null, params?: Record<string, any>, pollMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const reqId = useRef(0);
  const key = JSON.stringify(params || {});
  const load = useCallback(async (manual = false) => {
    if (!path) return;
    const id = ++reqId.current;
    if (manual) setRefreshing(true);
    try {
      const d = await api<T>(path, { params });
      if (id === reqId.current) { setData(d); setError(null); }
    } catch (e) {
      if (id === reqId.current) setError(errMsg(e));
    } finally {
      if (id === reqId.current) { setLoading(false); setRefreshing(false); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);
  useEffect(() => {
    load();
    if (!pollMs) return;
    const t = setInterval(() => load(), pollMs);
    return () => clearInterval(t);
  }, [load, pollMs]);
  return { data, error, loading, refreshing, reload: load, refresh: () => load(true), setData };
}
