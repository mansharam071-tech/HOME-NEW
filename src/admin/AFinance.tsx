import React, { useState } from "react";
import { Wallet, IndianRupee, Play, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr, fmtDT, fmtDate } from "@/lib/utils";
import { toast } from "sonner";

export const AFinance: React.FC = () => {
  const store = useStore();
  const [busy, setBusy] = useState(false);

  const settlements = store.settlements;
  const payouts = store.payoutRequests;
  const penalties = store.penalties;

  const totalGross = settlements.reduce((acc, s) => acc + s.gross_value, 0);
  const totalCommission = settlements.reduce((acc, s) => acc + s.commission_total, 0);
  const totalNetReleased = settlements
    .filter((s) => s.status === "released")
    .reduce((acc, s) => acc + s.net_payable, 0);

  const handleGenerateSettlements = () => {
    setBusy(true);
    setTimeout(() => {
      const count = storeApi.adminGenerateWeeklySettlements();
      toast.success(
        count > 0
          ? `Generated ${count} new weekly settlements for active technicians!`
          : "All completed jobs are already settled!"
      );
      setBusy(false);
    }, 400);
  };

  const handleReleaseSettlement = (id: string) => {
    storeApi.adminReleaseSettlement(id);
    toast.success("Settlement funds released to partner account!");
  };

  const handleMarkPayoutPaid = (id: string) => {
    storeApi.adminMarkPayoutPaid(id);
    toast.success("Bank payout transfer marked as completed!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-slate-900">Financial Ledger & Payouts</h2>
          <p className="text-xs text-slate-500">Calculate platform commission splits, run batch settlements, and approve withdrawals</p>
        </div>

        <button
          onClick={handleGenerateSettlements}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#172554] disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" /> Generate Weekly Settlements
        </button>
      </div>

      {/* Top Financial Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Gross GMV</span>
          <p className="font-heading text-2xl font-extrabold text-slate-900 mt-2">{inr(totalGross)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">From completed customer bookings</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Take (18%)</span>
          <p className="font-heading text-2xl font-extrabold text-emerald-700 mt-2">{inr(totalCommission)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Retained platform net margin</span>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disbursed to Technicians</span>
          <p className="font-heading text-2xl font-extrabold text-slate-900 mt-2">{inr(totalNetReleased)}</p>
          <span className="text-[11px] text-slate-500 mt-1 block">Total payouts released</span>
        </div>
      </div>

      {/* Pending Payout Requests if any */}
      {payouts.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-5 shadow-2xs space-y-3">
          <h3 className="font-heading text-sm font-bold text-amber-900">
            Pending Technician Withdrawal Requests ({payouts.filter((p) => p.status === "pending").length})
          </h3>
          <div className="space-y-2">
            {payouts.map((po) => (
              <div key={po.id} className="flex items-center justify-between rounded-xl bg-white p-3 border border-amber-200 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{po.partner_name} - {inr(po.amount)}</p>
                  <p className="text-slate-500 text-[11px]">
                    Bank: {po.bank.bank_name} ({po.bank.account_no}) · Requested {fmtDT(po.created_at)}
                  </p>
                </div>
                {po.status === "pending" ? (
                  <button
                    onClick={() => handleMarkPayoutPaid(po.id)}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-2xs"
                  >
                    Mark Paid & Disbursed
                  </button>
                ) : (
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    Paid
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlements Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-heading text-sm font-bold text-slate-900">Weekly Partner Settlements Ledger</h3>
          <span className="text-xs text-slate-500">{settlements.length} statements generated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Partner</th>
                <th className="p-3">Period</th>
                <th className="p-3">Jobs Done</th>
                <th className="p-3">Gross Value</th>
                <th className="p-3">Commission (18%)</th>
                <th className="p-3">Penalties / Deductions</th>
                <th className="p-3">Net Payout</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{s.partner_name}</td>
                  <td className="p-3 text-slate-600">
                    {fmtDate(s.period_start)} - {fmtDate(s.period_end)}
                  </td>
                  <td className="p-3 font-semibold text-slate-800">{s.jobs_count} orders</td>
                  <td className="p-3 text-slate-700">{inr(s.gross_value)}</td>
                  <td className="p-3 text-emerald-700 font-medium">-{inr(s.commission_total)}</td>
                  <td className="p-3 text-rose-700 font-medium">-{inr(s.penalties)}</td>
                  <td className="p-3 font-bold text-slate-900 font-heading text-sm">
                    {inr(s.net_payable)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        s.status === "released" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {s.status === "generated" && (
                      <button
                        onClick={() => handleReleaseSettlement(s.id)}
                        className="rounded-lg bg-[#1E3A8A] px-3 py-1 font-bold text-white hover:bg-[#172554] shadow-2xs"
                      >
                        Release Payout
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
