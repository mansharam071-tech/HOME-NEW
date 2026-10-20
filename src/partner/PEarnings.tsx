import React, { useState } from "react";
import { ArrowLeft, IndianRupee, ArrowDownLeft, Landmark, FileText, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore, storeApi } from "@/lib/store";
import { inr, fmtDT, fmtDate } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const PEarnings: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const partnerId = "usr_demo_partner";
  const partner = store.users.find((u) => u.id === partnerId);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState<number>(1000);

  const settlements = store.settlements.filter((s) => s.partner_id === partnerId);
  const payouts = store.payoutRequests.filter((p) => p.partner_id === partnerId);

  const handleWithdraw = () => {
    try {
      storeApi.requestWithdrawal(partnerId, withdrawAmt);
      toast.success(`Withdrawal request of ${inr(withdrawAmt)} submitted to operations.`);
      setWithdrawOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit withdrawal");
    }
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F4F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0F172A] px-4 py-3.5 text-white shadow-md">
        <button onClick={() => nav("/partner")} className="rounded-full p-1.5 text-slate-300 hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-sm font-extrabold">{t("Earnings")} & Payouts</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Main Earnings Card */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 text-white shadow-lg">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
            Withdrawable Balance
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-white mt-1">
            {inr(partner?.wallet_balance || 0)}
          </h1>

          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-700/80 pt-3 text-xs">
            <div>
              <span className="text-slate-400">Pending Settlement:</span>
              <p className="font-heading font-extrabold text-amber-400 text-sm mt-0.5">
                {inr(partner?.pending_earnings || 0)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">COD in Hand:</span>
              <p className="font-heading font-extrabold text-slate-200 text-sm mt-0.5">
                {inr(partner?.cod_cash || 0)}
              </p>
            </div>
          </div>

          <button
            onClick={() => setWithdrawOpen(true)}
            className="mt-5 w-full rounded-2xl bg-[#F59E0B] py-3 text-xs font-extrabold text-slate-950 shadow-md hover:bg-[#D97706]"
          >
            Request Bank Withdrawal
          </button>
        </div>

        {/* City Partner Model Policy Card */}
        {(() => {
          const partnerCity = store.cities.find((c) => c.id === partner?.city_id) || store.cities[0];
          const isDailySub = partnerCity?.partner_model === "daily_subscription";

          return (
            <div className={`rounded-3xl border p-5 shadow-2xs space-y-2.5 ${isDailySub ? "border-amber-200 bg-amber-50/60" : "border-blue-200 bg-blue-50/60"}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  City Operational Policy · {partnerCity?.city_name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDailySub ? "bg-amber-200 text-amber-900" : "bg-blue-200 text-blue-900"}`}>
                  {isDailySub ? "Daily Subscription" : "% Commission Model"}
                </span>
              </div>

              {isDailySub ? (
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-amber-950">
                    Unlimited Orders with Daily Pass (₹{partnerCity?.partner_daily_subscription_fee || 49}/day)
                  </h4>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    In <b>{partnerCity?.city_name}</b>, you pay a flat daily subscription fee of ₹{partnerCity?.partner_daily_subscription_fee || 49}. <b>0% commission is deducted</b> from your jobs—you receive 100% of order totals!
                  </p>
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Daily Pass Status: Active (Valid for 24 Hours)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-blue-950">
                    Pay-as-you-Earn ({partnerCity?.partner_commission_pct || 15}% Commission)
                  </h4>
                  <p className="text-xs text-blue-800/90 mt-1 leading-relaxed">
                    In <b>{partnerCity?.city_name}</b>, platform fee of <b>{partnerCity?.partner_commission_pct || 15}%</b> is deducted on the total invoice of each completed booking. No daily subscription required.
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Bank Account Details */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Landmark className="h-4 w-4 text-[#1E3A8A]" /> Linked Bank Account
          </div>
          <div className="rounded-2xl bg-slate-50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Holder:</span>
              <span className="font-bold text-slate-800">{partner?.bank?.holder || partner?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Bank Name:</span>
              <span className="font-bold text-slate-800">{partner?.bank?.bank_name || "State Bank of India"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Account Number:</span>
              <span className="font-mono font-bold text-slate-800">{partner?.bank?.account_no || "XXXXXX0001"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IFSC Code:</span>
              <span className="font-mono font-bold text-slate-800">{partner?.bank?.ifsc || "SBIN0001234"}</span>
            </div>
          </div>
        </div>

        {/* Weekly Settlement Reports */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Weekly Settlement Statements
          </h4>
          {settlements.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-3">No settlements generated yet.</p>
          ) : (
            <div className="space-y-3">
              {settlements.map((st) => (
                <div key={st.id} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Period: {fmtDate(st.period_start)} - {fmtDate(st.period_end)}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        st.status === "released" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {st.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-500">
                    <div>Gross Jobs: {inr(st.gross_value)} ({st.jobs_count} orders)</div>
                    <div>Commission (18%): -{inr(st.commission_total)}</div>
                    <div>Tips: +{inr(st.tips)}</div>
                    <div>Penalties: -{inr(st.penalties)}</div>
                  </div>
                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900">
                    <span>Net Paid:</span>
                    <span className="text-emerald-700 font-extrabold text-sm">{inr(st.net_payable)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="max-w-xs" onClose={() => setWithdrawOpen(false)}>
          <DialogHeader>
            <DialogTitle>Withdraw to Bank</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700">Withdrawal Amount (₹)</label>
              <Input
                type="number"
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(Number(e.target.value))}
                className="mt-1 h-12 text-lg font-bold"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Available: {inr(partner?.wallet_balance || 0)}
              </p>
            </div>
            <button
              onClick={handleWithdraw}
              className="w-full rounded-2xl bg-[#0F172A] py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800"
            >
              Confirm Withdrawal
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
