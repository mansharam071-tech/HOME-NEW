import React, { useState } from "react";
import { ArrowLeft, Wallet, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore, storeApi } from "@/lib/store";
import { inr, fmtDT } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const CWallet: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const customerId = "usr_demo_customer";
  const user = store.users.find((u) => u.id === customerId);

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(500);

  const txns = store.walletTxns.filter((w) => w.user_id === customerId);

  const handleTopUp = () => {
    storeApi.topUpWallet(customerId, topUpAmount);
    toast.success(`Added ${inr(topUpAmount)} to your wallet!`);
    setTopUpOpen(false);
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200/80 shadow-2xs">
        <button
          onClick={() => nav("/app")}
          className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-base font-bold text-slate-900">{t("Wallet")}</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Wallet Balance Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1e40af] to-[#172554] p-6 text-white shadow-lg">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              SMARTFIX Cash Balance
            </span>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              <ShieldCheck className="h-3 w-3" /> 100% Safe
            </span>
          </div>

          <div className="relative z-10 mt-3">
            <h1 className="font-heading text-3xl font-extrabold text-white">
              {inr(user?.wallet_balance || 0)}
            </h1>
            <p className="mt-1 text-xs text-blue-100">
              Earn 5% automatic cashback into your wallet on every completed service!
            </p>
          </div>

          <div className="relative z-10 mt-5 flex gap-2">
            <button
              onClick={() => setTopUpOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#F59E0B] px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-md hover:bg-[#D97706]"
              data-testid="wallet-add-money-btn"
            >
              <Plus className="h-3.5 w-3.5" /> Add Money
            </button>
          </div>
        </div>

        {/* Quick Top-up Suggestions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2.5">
          <h4 className="text-xs font-bold text-slate-700">Quick Recharge via Demo UPI</h4>
          <div className="grid grid-cols-3 gap-2">
            {[200, 500, 1000].map((amt) => (
              <button
                key={amt}
                onClick={() => {
                  storeApi.topUpWallet(customerId, amt);
                  toast.success(`Recharged ${inr(amt)}!`);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800 hover:border-[#1E3A8A] hover:bg-blue-50/50"
              >
                +{inr(amt)}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Transaction History
          </h4>

          {txns.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No wallet transactions yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {txns.map((t) => (
                <div key={t.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`grid h-8 w-8 place-items-center rounded-full text-xs ${
                        t.type === "credit"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {t.type === "credit" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t.reason}</p>
                      <p className="text-[10px] text-slate-400">{fmtDT(t.created_at)}</p>
                    </div>
                  </div>
                  <span
                    className={`font-heading text-xs font-bold ${
                      t.type === "credit" ? "text-emerald-700" : "text-slate-800"
                    }`}
                  >
                    {t.type === "credit" ? `+${inr(t.amount)}` : `-${inr(t.amount)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Up Dialog */}
      <Dialog open={topUpOpen} onOpenChange={setTopUpOpen}>
        <DialogContent className="max-w-xs" onClose={() => setTopUpOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Money to Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700">Enter Amount (₹)</label>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Math.max(10, Number(e.target.value)))}
                className="mt-1 h-12 w-full rounded-xl border border-slate-200 px-3 text-lg font-bold text-slate-900"
              />
            </div>
            <button
              onClick={handleTopUp}
              className="w-full rounded-xl bg-[#1E3A8A] py-3 text-xs font-bold text-white shadow-md hover:bg-[#172554]"
            >
              Confirm UPI Recharge ({inr(topUpAmount)})
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
