import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getLocale } from "./i18n";
import { BookingStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const inr = (n: number | string | undefined | null): string => {
  const val = Number(n || 0);
  const prefix = val < 0 ? "-₹" : "₹";
  return prefix + Math.abs(val).toLocaleString("en-IN", { maximumFractionDigits: 2 });
};

export const fmtDT = (s?: string | null): string => {
  if (!s) return "-";
  try {
    return new Date(s).toLocaleString(getLocale(), {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
};

export const fmtDate = (s?: string | null): string => {
  if (!s) return "-";
  try {
    const d = s.includes("T") ? new Date(s) : new Date(`${s}T00:00:00`);
    return d.toLocaleDateString(getLocale(), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

export const STATUS: Record<
  BookingStatus,
  { label: string; cls: string; dot: string }
> = {
  payment_pending: {
    label: "Payment Pending",
    cls: "bg-orange-100 text-orange-800 border-orange-200",
    dot: "bg-orange-500",
  },
  pending: {
    label: "Pending",
    cls: "bg-yellow-100 text-yellow-800 border-yellow-200",
    dot: "bg-yellow-500",
  },
  assigned: {
    label: "Assigned",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
    dot: "bg-blue-500",
  },
  en_route: {
    label: "En Route",
    cls: "bg-indigo-100 text-indigo-800 border-indigo-200",
    dot: "bg-indigo-500",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  completed: {
    label: "Completed",
    cls: "bg-green-100 text-green-800 border-green-200",
    dot: "bg-green-500",
  },
  cancelled: {
    label: "Cancelled",
    cls: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

export const getGPS = (): Promise<{ lat: number; lng: number }> =>
  new Promise((res, rej) => {
    if (!navigator.geolocation) {
      return rej(new Error("GPS not supported"));
    }
    navigator.geolocation.getCurrentPosition(
      (p) => res({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => rej(new Error("Location permission denied")),
      { timeout: 8000 }
    );
  });

export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
