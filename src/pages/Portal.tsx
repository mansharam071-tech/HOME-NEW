import React from "react";
import { Link } from "react-router-dom";
import {
  Smartphone,
  HardHat,
  LayoutDashboard,
  ArrowUpRight,
  Database,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { storeApi } from "@/lib/store";
import { toast } from "sonner";

const MODS = [
  {
    to: "/app",
    icon: Smartphone,
    tag: "Module 01",
    title: "Customer App",
    desc: "Discover services, multi-category cart, instant booking, live technician map tracking, extra-charge approvals, wallet cashback & GST tax invoices.",
    cred: "Mobile OTP login · Demo: 9999999999 (OTP: 1234)",
    tid: "portal-customer-link",
    accent: "hover:border-blue-500",
    badge: "Consumer Mobile View",
  },
  {
    to: "/partner",
    icon: HardHat,
    tag: "Module 02",
    title: "Partner App",
    desc: "KYC document uploads, shift availability, 15-sec incoming job alerts, start OTP & end OTP validation, extra parts requests, earnings & SOS emergency siren.",
    cred: "Mobile OTP login · Demo: 9000000001 (OTP: 1234)",
    tid: "portal-partner-link",
    accent: "hover:border-amber-500",
    badge: "Technician Mobile View",
  },
  {
    to: "/admin",
    icon: LayoutDashboard,
    tag: "Module 03",
    title: "Admin Console",
    desc: "Executive KPIs, live dispatch control room, manual technician reassignment, interactive geofencing & surge pricing, KYC queue, and financial settlements.",
    cred: "Email + password · admin@example.com (admin123)",
    tid: "portal-admin-link",
    accent: "hover:border-emerald-500",
    badge: "Operations Web Console",
  },
];

export const Portal: React.FC = () => {
  const handleResetData = () => {
    storeApi.resetDatabase();
    toast.success("Database restored to pristine initial seed state!");
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white phone-bg">
      <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        {/* Header Tag */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F59E0B]">
            <Database className="h-3.5 w-3.5" /> One Unified State · 3 Native Modules
          </div>

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Demo State
          </button>
        </div>

        {/* Hero Title */}
        <div className="mt-8">
          <h1 className="font-heading max-w-3xl text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl text-white">
            SMARTFIX <span className="text-[#F59E0B]">ecosystem</span> for verified home services.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-slate-400 leading-relaxed">
            Every booking, status change, OTP verification, and extra charge syncs in real time across the Customer, Technician, and Operations Console. Tap any module to launch.
          </p>
        </div>

        {/* 3 Module Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {MODS.map((m, i) => (
            <Link
              key={m.to}
              to={m.to}
              data-testid={m.tid}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-7 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${m.accent}`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    {m.tag}
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-slate-600 transition-colors group-hover:text-[#F59E0B]" />
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-800 text-[#F59E0B] group-hover:bg-[#F59E0B] group-hover:text-slate-950 transition-colors shadow-md">
                    <m.icon className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-300 uppercase">
                    {m.badge}
                  </span>
                </div>

                <h2 className="font-heading mt-5 text-2xl font-bold text-white group-hover:text-[#F59E0B] transition-colors">
                  {m.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{m.desc}</p>
              </div>

              <div className="mt-8 rounded-xl bg-slate-800/90 p-3 font-mono text-[11px] text-slate-300 border border-slate-700/60">
                {m.cred}
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8">
          <h3 className="font-heading text-lg font-bold text-white mb-4">Core Ecosystem Capabilities Ported</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs text-slate-400">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Two-way OTP verification (Start OTP + End OTP with fraud prevention)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Real-time dynamic surge pricing & interactive Leaflet geofencing</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Extra charge requests with instant customer approval & tax invoice</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Emergency SOS siren dispatcher with live GPS coordinates</span>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          SMARTFIX Home Service Ecosystem · Fully synced local runtime · Demo mode active
        </p>
      </div>
    </div>
  );
};
