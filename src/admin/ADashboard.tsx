import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  IndianRupee,
  Siren,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr, fmtDT } from "@/lib/utils";
import { StatusBadge } from "@/components/common/Shared";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const ADashboard: React.FC = () => {
  const store = useStore();
  const nav = useNavigate();

  const totalBookings = store.bookings.length;
  const completedBookings = store.bookings.filter((b) => b.status === "completed");
  const activeBookings = store.bookings.filter((b) =>
    ["assigned", "en_route", "in_progress"].includes(b.status)
  );

  const grossRevenue = completedBookings.reduce((acc, b) => acc + b.pricing.total, 0);
  const platformCommission = completedBookings.reduce((acc, b) => acc + b.commission, 0);

  const activeSos = store.sosAlerts.filter((s) => s.status === "active");
  const pendingKyc = store.users.filter(
    (u) => u.role === "partner" && u.kyc_status === "pending"
  );
  const codLimitExceeded = store.users.filter(
    (u) => u.role === "partner" && (u.cod_cash || 0) >= (u.cod_limit || 3000)
  );

  // Chart data: daily booking totals for past 7 days
  const chartData = [
    { day: "Mon", bookings: 18, revenue: 12400 },
    { day: "Tue", bookings: 24, revenue: 16800 },
    { day: "Wed", bookings: 21, revenue: 14200 },
    { day: "Thu", bookings: 28, revenue: 19500 },
    { day: "Fri", bookings: 35, revenue: 25400 },
    { day: "Sat", bookings: 42, revenue: 31200 },
    { day: "Sun", bookings: 38, revenue: 27900 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Urgent Alert Strip if SOS or Critical Warnings exist */}
      {activeSos.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-600 px-5 py-3.5 text-white shadow-lg animate-pulse">
          <div className="flex items-center gap-2.5">
            <Siren className="h-5 w-5" />
            <span className="font-heading font-extrabold text-sm">
              🚨 CRITICAL: {activeSos.length} Active Emergency SOS Alert from Technician!
            </span>
          </div>
          <button
            onClick={() => nav("/admin/partners")}
            className="rounded-xl bg-white px-4 py-1.5 text-xs font-extrabold text-rose-700 shadow-sm hover:bg-rose-50"
          >
            Open Dispatch & Resolve →
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Platform GMV</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-[#1E3A8A]">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading mt-3 text-2xl font-extrabold text-slate-900">
            {inr(grossRevenue)}
          </p>
          <span className="mt-1 flex items-center text-[11px] font-bold text-emerald-600">
            <TrendingUp className="mr-1 h-3 w-3" /> +14.2% vs last week
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Commission Revenue</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading mt-3 text-2xl font-extrabold text-emerald-700">
            {inr(platformCommission)}
          </p>
          <span className="mt-1 text-[11px] text-slate-500">Avg 18% commission cut</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active In-Field Jobs</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-50 text-[#F59E0B]">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading mt-3 text-2xl font-extrabold text-slate-900">
            {activeBookings.length}
          </p>
          <span className="mt-1 text-[11px] text-slate-500">
            {store.bookings.filter((b) => b.status === "en_route").length} en route right now
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">KYC Queue & Fraud</span>
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="font-heading mt-3 text-2xl font-extrabold text-slate-900">
            {pendingKyc.length + codLimitExceeded.length}
          </p>
          <span className="mt-1 text-[11px] text-rose-600 font-bold">
            {pendingKyc.length} pending KYC · {codLimitExceeded.length} COD breach
          </span>
        </div>
      </div>

      {/* Charts & Quick Action Center */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Revenue & Demand Chart */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900">Weekly Demand & GMV</h3>
              <p className="text-xs text-slate-500">Service booking volume across all cities</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [inr(val), "Revenue"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0" }}
                />
                <Bar dataKey="revenue" fill="#1E3A8A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations Actions */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3.5">
          <h3 className="font-heading text-base font-bold text-slate-900">Operations Control</h3>
          <p className="text-xs text-slate-500">Quick shortcuts to high priority administration desks</p>

          <div className="space-y-2.5 pt-1">
            <Link
              to="/admin/bookings"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Live Booking Desk</p>
                <p className="text-[11px] text-slate-500">Reassign technicians or resolve delays</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/kyc"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">KYC Approvals ({pendingKyc.length})</p>
                <p className="text-[11px] text-slate-500">Verify Aadhaar, PAN, DL and police certs</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/cities"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Geofencing & Surge</p>
                <p className="text-[11px] text-slate-500">Map boundary coordinates and demand multipliers</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              to="/admin/finance"
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 hover:bg-slate-100 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">Settlements & Payouts</p>
                <p className="text-[11px] text-slate-500">Release partner bank disbursements</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Live Recent Bookings Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">Recent Live Orders</h3>
            <p className="text-xs text-slate-500">All customer orders flowing across ecosystem</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
          >
            View all orders <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="p-3">Order ID</th>
                <th className="p-3">Service</th>
                <th className="p-3">City</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Technician</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {store.bookings.slice(0, 6).map((b) => {
                const partner = store.users.find((u) => u.id === b.partner_id);
                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-800">#{b.booking_no}</td>
                    <td className="p-3 font-medium text-slate-900">{b.lines[0]?.name}</td>
                    <td className="p-3 text-slate-600">{b.city_name}</td>
                    <td className="p-3 text-slate-700">{b.address.label}</td>
                    <td className="p-3 text-slate-700">{partner?.name || "Unassigned"}</td>
                    <td className="p-3 font-bold text-slate-900">{inr(b.pricing.total)}</td>
                    <td className="p-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
