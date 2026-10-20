import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Power,
  IndianRupee,
  Briefcase,
  AlertTriangle,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  X,
  Volume2,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

export const PDashboard: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const partnerId = "usr_demo_partner";
  const partner = store.users.find((u) => u.id === partnerId) || store.users.find((u) => u.role === "partner");

  const [online, setOnline] = useState(partner?.is_online ?? true);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Find incoming offer or active job assigned to this partner (direct or multi-provider assignment)
  const activeJob = store.bookings.find(
    (b) =>
      ["assigned", "en_route", "in_progress"].includes(b.status) &&
      (b.partner_id === partner?.id ||
        b.partner_assignments?.some(
          (a) => a.partner_id === partner?.id && ["assigned", "en_route", "in_progress"].includes(a.status)
        ))
  );

  const myActiveAssignment = activeJob?.partner_assignments?.find((a) => a.partner_id === partner?.id);
  const otherAssignments = activeJob?.partner_assignments?.filter((a) => a.partner_id !== partner?.id) || [];

  // New pending jobs in city looking for a technician
  const incomingOffer = store.bookings.find(
    (b) =>
      b.status === "pending" &&
      b.city_id === partner?.city_id &&
      (!b.rejected_by || !b.rejected_by.includes(partner?.id || ""))
  );

  useEffect(() => {
    if (incomingOffer && online && countdown === null) {
      setCountdown(15);
    }
  }, [incomingOffer, online, countdown]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      if (incomingOffer && partner) {
        storeApi.partnerDeclineJob(incomingOffer.id, partner.id);
        toast.info("Job timed out and reassigned");
      }
      setCountdown(null);
      return;
    }
    const timer = setInterval(() => setCountdown((c) => (c ? c - 1 : null)), 1000);
    return () => clearInterval(timer);
  }, [countdown, incomingOffer, partner]);

  const handleToggleOnline = () => {
    const next = !online;
    setOnline(next);
    if (partner) {
      storeApi.updateUser({ id: partner.id, is_online: next });
    }
    toast.success(next ? "You are now ONLINE. Ready for jobs." : "You are now OFFLINE.");
  };

  const handleAcceptJob = () => {
    if (!incomingOffer || !partner) return;
    storeApi.partnerAcceptJob(incomingOffer.id, partner.id);
    setCountdown(null);
    toast.success(`Accepted Booking #${incomingOffer.booking_no}!`);
    nav(`/partner/job/${incomingOffer.id}`);
  };

  const handleDeclineJob = () => {
    if (!incomingOffer || !partner) return;
    storeApi.partnerDeclineJob(incomingOffer.id, partner.id);
    setCountdown(null);
    toast.info("Declined job offer");
  };

  const isCodLimitExceeded = (partner?.cod_cash || 0) >= (partner?.cod_limit || 3000);

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F4F5F7]">
      {/* Header with Online / Offline Toggle */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0F172A] px-5 py-3.5 text-white shadow-md">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F59E0B]">
            SMARTFIX Pro
          </span>
          <h2 className="font-heading text-sm font-extrabold">{partner?.name}</h2>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
            online
              ? "bg-[#22C55E] text-slate-950 shadow-md ring-2 ring-emerald-400"
              : "bg-slate-700 text-slate-300"
          }`}
          data-testid="partner-online-toggle"
        >
          <Power className="h-3.5 w-3.5" />
          <span>{online ? "ONLINE" : "OFFLINE"}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* COD Warning if exceeding limit */}
        {isCodLimitExceeded && (
          <div className="flex items-start gap-2.5 rounded-2xl bg-rose-50 p-3.5 border border-rose-200 text-rose-900">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">COD Cash Limit Reached ({inr(partner?.cod_cash || 0)})</p>
              <p className="text-slate-600 mt-0.5">
                Deposit cash with operations or bank transfer to unlock more cash-on-delivery jobs.
              </p>
            </div>
          </div>
        )}

        {/* 15-Second Urgent Job Alert Modal / Card */}
        {incomingOffer && online && countdown !== null && (
          <div className="overflow-hidden rounded-3xl border-2 border-[#F59E0B] bg-white p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 font-bold text-amber-900 uppercase">
                <Volume2 className="h-3.5 w-3.5 animate-pulse text-amber-600" /> New Job Offer
              </span>
              <span className="flex items-center gap-1 font-mono text-sm font-extrabold text-rose-600">
                <Clock className="h-4 w-4" /> {countdown}s
              </span>
            </div>

            <div className="mt-3.5">
              <h3 className="font-heading text-base font-extrabold text-slate-900 leading-snug">
                {incomingOffer.lines[0]?.name || "Home Service"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {incomingOffer.address.line}, {incomingOffer.city_name}
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs">
              <span className="text-slate-600">Your Net Earning:</span>
              <span className="font-heading text-base font-extrabold text-emerald-700">
                {inr(incomingOffer.partner_earning)}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDeclineJob}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-300 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100"
                data-testid="partner-decline-job-btn"
              >
                <X className="h-4 w-4" /> Decline
              </button>
              <button
                onClick={handleAcceptJob}
                className="flex items-center justify-center gap-1 rounded-xl bg-[#22C55E] py-3 text-xs font-extrabold text-slate-950 shadow-md hover:bg-emerald-500"
                data-testid="partner-accept-job-btn"
              >
                <Check className="h-4 w-4" /> Accept Job
              </button>
            </div>
          </div>
        )}

        {/* Current Active Job Card */}
        {activeJob ? (
          <div
            onClick={() => nav(`/partner/job/${activeJob.id}`)}
            className="overflow-hidden rounded-3xl border-2 border-[#1E3A8A] bg-white p-5 shadow-md cursor-pointer hover:shadow-lg transition-all space-y-3"
            data-testid="partner-active-job-card"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Active Job · #{activeJob.booking_no}
                </span>
                {activeJob.is_multi_provider && (
                  <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-extrabold text-purple-900">
                    Multi-Service
                  </span>
                )}
              </div>
              <span className="font-bold text-xs uppercase text-blue-700">
                {myActiveAssignment?.status || activeJob.status.replace("_", " ")}
              </span>
            </div>

            {/* Auto-Transfer Notice if applicable */}
            {otherAssignments.length > 0 && (
              <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900 leading-snug">
                <span className="font-bold block">⚡ Multi-Service Auto-Transfer:</span>
                You are registered for <b>{myActiveAssignment?.category_name || "your trade"}</b>. Other services ({otherAssignments.map(a => a.category_name).join(", ")}) were auto-transferred to {otherAssignments.map(a => a.partner_name).join(", ")}.
              </div>
            )}

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Assigned Services:</span>
              <h3 className="font-heading text-base font-extrabold text-slate-900 mt-0.5">
                {myActiveAssignment
                  ? myActiveAssignment.service_lines.map((l) => l.name).join(" + ")
                  : activeJob.lines[0]?.name}
              </h3>
            </div>

            <div className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{activeJob.address.line}, {activeJob.address.city}</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Your Net Share</span>
                <p className="font-heading text-base font-extrabold text-emerald-700">
                  {inr(myActiveAssignment ? myActiveAssignment.partner_earning : activeJob.partner_earning)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nav(`/partner/job/${activeJob.id}`);
                }}
                className="flex items-center gap-1 rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Open Job <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 text-center shadow-2xs">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400 mb-2">
              <Briefcase className="h-6 w-6" />
            </div>
            <h4 className="font-heading text-sm font-bold text-slate-800">
              {online ? "Waiting for new orders..." : "You are currently Offline"}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {online
                ? "Stay on this screen. Orders matching your skills will alert you instantly."
                : "Switch to Online above to receive customer job dispatches."}
            </p>
          </div>
        )}

        {/* Today's KPI Counters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <Briefcase className="h-4 w-4 text-[#1E3A8A]" /> Jobs Completed
            </div>
            <p className="font-heading text-2xl font-extrabold text-slate-900 mt-2">
              {partner?.jobs_done || 0}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">★ {partner?.rating || 4.8} rating</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
              <IndianRupee className="h-4 w-4 text-emerald-600" /> Pending Payout
            </div>
            <p className="font-heading text-2xl font-extrabold text-slate-900 mt-2">
              {inr(partner?.pending_earnings || 0)}
            </p>
            <span className="text-[10px] text-slate-400">Next settlement Tuesday</span>
          </div>
        </div>

        {/* Shift Timings & Wallet Quick Overview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Scheduled Shift:</span>
            <span className="font-bold text-slate-800">
              {partner?.shift?.start || "09:00"} - {partner?.shift?.end || "19:00"} (Weekly Off: {partner?.shift?.off_days?.join(", ") || "Sun"})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">COD Cash in Hand:</span>
            <span className={`font-bold ${isCodLimitExceeded ? "text-rose-600" : "text-slate-800"}`}>
              {inr(partner?.cod_cash || 0)} / {inr(partner?.cod_limit || 3000)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">KYC Status:</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
              {partner?.kyc_status || "Approved"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
