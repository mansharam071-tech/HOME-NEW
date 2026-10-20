import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AirVent,
  Sparkles,
  Zap,
  Wrench,
  Scissors,
  PaintRoller,
  Bug,
  WashingMachine,
  Home,
  Wifi,
  BatteryCharging,
  Smartphone,
  HardHat,
  LayoutDashboard,
} from "lucide-react";
import { STATUS } from "@/lib/utils";
import { BookingStatus } from "@/lib/types";

const ICONS: Record<string, React.ElementType> = {
  AirVent,
  Sparkles,
  Zap,
  Wrench,
  Scissors,
  PaintRoller,
  Bug,
  WashingMachine,
};

export const CatIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const IconComp = ICONS[name] || Home;
  return <IconComp className={className} />;
};

export const StatusBadge: React.FC<{ status: BookingStatus | string; testid?: string }> = ({
  status,
  testid,
}) => {
  const s = STATUS[status as BookingStatus] || {
    label: status,
    cls: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span
      data-testid={testid}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

export const PhoneFrame: React.FC<{
  children: React.ReactNode;
  tone?: "light" | "partner";
  testid?: string;
}> = ({ children, tone = "light", testid }) => {
  const loc = useLocation();

  return (
    <div className="min-h-screen w-full bg-[#0B0F19] md:flex md:items-center md:justify-center md:py-6 phone-bg">
      {/* Top Floating Ecosystem Navigation for easy multi-module switching */}
      <div className="hidden lg:flex fixed top-4 z-[999] items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/90 px-4 py-2 shadow-2xl backdrop-blur-md">
        <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">
          SMARTFIX Ecosystem
        </span>
        <div className="h-4 w-px bg-slate-700" />
        <Link
          to="/app"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            loc.pathname.startsWith("/app")
              ? "bg-[#1E3A8A] text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" /> Customer App
        </Link>
        <Link
          to="/partner"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            loc.pathname.startsWith("/partner")
              ? "bg-[#F59E0B] text-slate-900 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <HardHat className="h-3.5 w-3.5" /> Partner App
        </Link>
        <Link
          to="/admin"
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
            loc.pathname.startsWith("/admin")
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Admin Console
        </Link>
        <div className="h-4 w-px bg-slate-700" />
        <Link to="/" className="text-xs text-slate-400 hover:text-white font-medium">
          Portal Home
        </Link>
      </div>

      <div
        data-testid={testid}
        className={`relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden md:h-[860px] md:w-[412px] md:rounded-[2.8rem] md:border-[10px] md:border-slate-800 md:shadow-2xl md:ring-1 md:ring-slate-700/50 ${
          tone === "partner" ? "bg-white" : "bg-[#F8FAFC]"
        }`}
      >
        {/* Android Status Bar */}
        <div className="relative z-40 flex h-10 w-full items-center justify-between px-6 pt-2 text-[12px] font-semibold text-slate-700 select-none">
          <span>9:41</span>
          {/* Front Camera cutout */}
          <div className="absolute left-1/2 top-2 h-4 w-4 -translate-x-1/2 rounded-full bg-slate-900 border border-slate-800 shadow-inner" />
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="text-[10px] font-bold tracking-tight">5G</span>
            <Wifi className="h-3.5 w-3.5" />
            <BatteryCharging className="h-4 w-4 text-emerald-600" />
          </div>
        </div>

        {/* Device screen content */}
        <div className="relative flex-1 flex flex-col overflow-hidden">{children}</div>

        {/* Android Gesture Navigation pill bar */}
        <div className="z-40 flex h-5 w-full items-center justify-center bg-white/80 pb-1 backdrop-blur-xs">
          <div className="h-1 w-32 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
};

export const Stepper: React.FC<{
  steps: string[];
  current: number;
  testid?: string;
}> = ({ steps, current, testid }) => (
  <div data-testid={testid} className="flex items-start">
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={s} className="flex flex-1 flex-col items-center text-center">
          <div className="flex w-full items-center">
            <div
              className={`h-0.5 flex-1 ${
                i === 0 ? "opacity-0" : done || active ? "bg-[#22C55E]" : "bg-slate-200"
              }`}
            />
            <div
              className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors duration-300 ${
                done
                  ? "bg-[#22C55E] text-white"
                  : active
                  ? "bg-[#1E3A8A] text-white ring-4 ring-blue-100"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {done ? "✓" : i + 1}
            </div>
            <div
              className={`h-0.5 flex-1 ${
                i === steps.length - 1 ? "opacity-0" : done ? "bg-[#22C55E]" : "bg-slate-200"
              }`}
            />
          </div>
          <span
            className={`mt-1.5 text-[11px] font-medium leading-tight ${
              active ? "text-[#1E3A8A] font-semibold" : "text-slate-500"
            }`}
          >
            {s}
          </span>
        </div>
      );
    })}
  </div>
);

export const Empty: React.FC<{ text: string; testid?: string }> = ({ text, testid }) => (
  <div
    data-testid={testid}
    className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 bg-slate-50/50"
  >
    {text}
  </div>
);
