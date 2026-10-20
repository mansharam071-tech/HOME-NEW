import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Map,
  Percent,
  ShieldCheck,
  Users,
  Wallet,
  Bell,
  Search,
  LogOut,
  Siren,
  Smartphone,
  HardHat,
  ArrowUpRight,
  Wrench,
} from "lucide-react";
import { session, storeApi, useStore } from "@/lib/store";
import { fmtDT } from "@/lib/utils";
import { toast } from "sonner";
import { ADashboard } from "./ADashboard";
import { ABookings } from "./ABookings";
import { ACities } from "./ACities";
import { APricing } from "./APricing";
import { AKyc } from "./AKyc";
import { APartners } from "./APartners";
import { AFinance } from "./AFinance";
import { AServices } from "./AServices";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/services", icon: Wrench, label: "Services & Sub-Services" },
  { to: "/admin/cities", icon: Map, label: "Geofencing & Cities" },
  { to: "/admin/bookings", icon: ListChecks, label: "Live Bookings" },
  { to: "/admin/pricing", icon: Percent, label: "Surge & Promos" },
  { to: "/admin/kyc", icon: ShieldCheck, label: "KYC Queue" },
  { to: "/admin/partners", icon: Users, label: "Partners & SOS" },
  { to: "/admin/finance", icon: Wallet, label: "Financials" },
];

export const AdminApp: React.FC = () => {
  const [sess, setSess] = useState(session.get("admin"));
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [globalQuery, setGlobalQuery] = useState("");
  const [alertsOpen, setAlertsOpen] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();
  const store = useStore();

  const activeSos = store.sosAlerts.filter((s) => s.status === "active");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = storeApi.login("admin", email, password);
      const token = `token_admin_${user.id}_${Date.now()}`;
      session.set("admin", { token, user });
      setSess({ token, user });
      toast.success("Welcome, Operations Administrator!");
      nav("/admin");
    } catch (e: any) {
      toast.error(e.message || "Invalid credentials");
    }
  };

  const handleLogout = () => {
    session.clear("admin");
    setSess(null);
    toast.info("Signed out from Admin Console");
  };

  if (!sess) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 phone-bg">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl space-y-4"
          data-testid="admin-login-form"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F59E0B]">
              SMARTFIX Ops Console
            </span>
            <Link to="/" className="text-xs text-[#1E3A8A] font-semibold hover:underline">
              Portal Home
            </Link>
          </div>

          <h1 className="font-heading text-2xl font-extrabold text-slate-900">Administrator Sign In</h1>
          <p className="text-xs text-slate-500">
            Operations control room for live dispatches, partner verification & fraud management.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#1E3A8A] py-3 text-xs font-bold text-white shadow-md hover:bg-[#172554] active:scale-98 transition-all"
          >
            Access Operations Console
          </button>

          <p className="text-center text-[11px] text-slate-400">
            Demo credentials are pre-filled. Tap Access to sign in.
          </p>
        </form>
      </div>
    );
  }

  // Filtered search results
  const searchResults = globalQuery.trim().length >= 2
    ? {
        bookings: store.bookings.filter(
          (b) =>
            b.booking_no.toLowerCase().includes(globalQuery.toLowerCase()) ||
            b.city_name.toLowerCase().includes(globalQuery.toLowerCase())
        ),
        partners: store.users.filter(
          (u) =>
            u.role === "partner" &&
            (u.name.toLowerCase().includes(globalQuery.toLowerCase()) ||
              u.phone.includes(globalQuery))
        ),
      }
    : null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-[#0F172A] text-white hidden md:flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#F59E0B]">
              SMARTFIX Ops
            </span>
            <h1 className="font-heading text-lg font-extrabold text-white mt-1">Control Console</h1>
          </div>

          <nav className="p-4 space-y-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#1E3A8A] text-white shadow-xs"
                      : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }`
                }
              >
                <n.icon className="h-4 w-4" />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Switcher & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/app"
            className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2 text-xs text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <Smartphone className="h-3.5 w-3.5 text-blue-400" /> Customer App
            </span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <Link
            to="/partner"
            className="flex items-center justify-between rounded-xl bg-slate-800/60 px-3 py-2 text-xs text-slate-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <HardHat className="h-3.5 w-3.5 text-amber-400" /> Partner App
            </span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/95 px-6 flex items-center justify-between backdrop-blur-md">
          {/* Global Search */}
          <div className="relative w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search booking #, phone, city..."
              className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:bg-white focus:border-[#1E3A8A]"
            />

            {searchResults && (
              <div className="absolute top-11 left-0 right-0 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl text-xs space-y-1">
                {searchResults.bookings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setGlobalQuery("");
                      nav(`/admin/bookings`);
                    }}
                    className="w-full rounded-lg p-2 text-left hover:bg-slate-50 flex justify-between"
                  >
                    <span>Booking #{b.booking_no} ({b.lines[0]?.name})</span>
                    <span className="font-bold text-[#1E3A8A]">{b.status}</span>
                  </button>
                ))}
                {searchResults.partners.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setGlobalQuery("");
                      nav(`/admin/partners`);
                    }}
                    className="w-full rounded-lg p-2 text-left hover:bg-slate-50 flex justify-between"
                  >
                    <span>Partner: {p.name} (+91 {p.phone})</span>
                    <span className="text-slate-400">★{p.rating}</span>
                  </button>
                ))}
                {searchResults.bookings.length === 0 && searchResults.partners.length === 0 && (
                  <p className="p-3 text-center text-slate-400">No matching records found</p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Live SOS Alerts Icon */}
            <button
              onClick={() => setAlertsOpen(true)}
              className={`relative grid h-10 w-10 place-items-center rounded-xl border transition-all ${
                activeSos.length > 0
                  ? "border-rose-300 bg-rose-50 text-rose-600 animate-pulse"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
              title="Alerts Desk"
            >
              {activeSos.length > 0 ? <Siren className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
              {activeSos.length > 0 && (
                <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs">
                  {activeSos.length}
                </span>
              )}
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2 pl-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#1E3A8A] text-white font-bold text-xs">
                OA
              </div>
              <div className="hidden sm:block text-xs">
                <p className="font-bold text-slate-900 leading-tight">Ops Admin</p>
                <p className="text-[10px] text-slate-500">Super User</p>
              </div>
            </div>
          </div>
        </header>

        {/* Sub-header Navigation Bar for mobile screens */}
        <div className="flex md:hidden overflow-x-auto no-scrollbar border-b border-slate-200 bg-white px-3 py-2 gap-2 shrink-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold ${
                  isActive ? "bg-[#1E3A8A] text-white" : "bg-slate-100 text-slate-600"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </div>

        {/* Content Body */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route index element={<ADashboard />} />
            <Route path="services" element={<AServices />} />
            <Route path="cities" element={<ACities />} />
            <Route path="bookings" element={<ABookings />} />
            <Route path="pricing" element={<APricing />} />
            <Route path="kyc" element={<AKyc />} />
            <Route path="partners" element={<APartners />} />
            <Route path="finance" element={<AFinance />} />
          </Routes>
        </main>
      </div>

      {/* Alerts Popover Dialog */}
      <Dialog open={alertsOpen} onOpenChange={setAlertsOpen}>
        <DialogContent className="max-w-md" onClose={() => setAlertsOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#1E3A8A]" /> Operations Alert Feed
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2 text-xs max-h-80 overflow-y-auto">
            {activeSos.map((s) => (
              <div key={s.id} className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-900">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1.5">
                    <Siren className="h-4 w-4 text-rose-600" /> SOS: {s.partner_name}
                  </span>
                  <span className="text-[10px] text-slate-500">{fmtDT(s.created_at)}</span>
                </div>
                <p className="mt-1 text-slate-700">Phone: +91 {s.partner_phone}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setAlertsOpen(false);
                      nav("/admin/partners");
                    }}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white"
                  >
                    Resolve in Partners Desk →
                  </button>
                </div>
              </div>
            ))}
            {activeSos.length === 0 && (
              <p className="text-center text-slate-400 py-6">All systems normal. No active SOS sirens.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
