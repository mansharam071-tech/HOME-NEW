import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  Star,
  CheckCircle,
  Clock,
  Sparkles,
  FileText,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { TrackMap } from "@/components/common/Maps";
import { StatusBadge } from "@/components/common/Shared";
import { ChatDialog, CallButton, InvoiceDialog } from "@/components/common/BookingTools";
import { inr, fmtDT } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const CTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const store = useStore();

  const booking = store.bookings.find((b) => b.id === id) || store.bookings[0];
  const partner = store.users.find((u) => u.id === booking?.partner_id);

  const [chatOpen, setChatOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [tipVal, setTipVal] = useState(0);

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">Booking not found</p>
      </div>
    );
  }

  const handleApproveExtra = (extraId: string) => {
    storeApi.respondExtraCharge(booking.id, extraId, true);
    toast.success("Extra charge approved and added to your bill!");
  };

  const handleDeclineExtra = (extraId: string) => {
    storeApi.respondExtraCharge(booking.id, extraId, false);
    toast.info("Extra charge declined");
  };

  const handleSubmitRating = () => {
    storeApi.rateBooking(booking.id, ratingVal, reviewText, tipVal);
    toast.success("Thank you for your rating!");
    setRatingOpen(false);
  };

  const pendingExtras = booking.extras?.filter((e) => e.status === "pending") || [];

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F8FAFC]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200/80 shadow-2xs">
        <button
          onClick={() => nav("/app/bookings")}
          className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
          data-testid="tracking-back-btn"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="font-heading text-sm font-bold text-slate-900">
            Booking #{booking.booking_no}
          </h2>
          <p className="text-[10px] text-slate-400">{booking.city_name} · {booking.mode}</p>
        </div>
        <button
          onClick={() => setInvoiceOpen(true)}
          className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
          title="Tax Invoice"
        >
          <FileText className="h-5 w-5" />
        </button>
      </div>

      {/* Map Section for active bookings */}
      {["assigned", "en_route", "in_progress"].includes(booking.status) ? (
        <div className="relative h-64 w-full bg-slate-200">
          <TrackMap
            dest={booking.address.location}
            partner={partner?.location || booking.partner_origin}
            className="h-full w-full"
            testid="tracking-map"
          />
          <div className="absolute top-3 left-3 z-20 rounded-full bg-white/95 px-3 py-1 shadow-md text-xs font-bold text-slate-800 flex items-center gap-1.5 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            Live Technician GPS
          </div>
        </div>
      ) : (
        <div className="bg-[#1E3A8A] px-6 py-8 text-white text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#F59E0B] mb-2">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h3 className="font-heading text-lg font-bold">
            {booking.status === "completed" ? "Service Completed Successfully" : "Booking Status"}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            {booking.status === "completed"
              ? "Your technician has concluded the job. A 30-day warranty is active."
              : `Current Status: ${booking.status}`}
          </p>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Multi-Provider Smart Dispatch Banner */}
        {booking.is_multi_provider && booking.partner_assignments && booking.partner_assignments.length > 1 && (
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#1E3A8A]">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Multi-Service Smart Dispatch
              </span>
              <span className="rounded-full bg-[#1E3A8A] px-2 py-0.5 text-[10px] font-bold text-white">
                {booking.partner_assignments.length} Technicians
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              Because your order combines different trades (e.g. Electrician & Cleaning), specialized certified professionals have been assigned for each service.
            </p>
          </div>
        )}

        {/* Multi-Provider Assignments List */}
        {booking.is_multi_provider && booking.partner_assignments && booking.partner_assignments.length > 0 ? (
          <div className="space-y-3">
            {booking.partner_assignments.map((asgn, idx) => (
              <div
                key={asgn.id || idx}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3"
              >
                {/* Auto-Transfer Notice if applicable */}
                {asgn.is_transferred && (
                  <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-amber-900 text-[11px] leading-tight">
                    <Sparkles className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-950">⚡ Auto-Transferred to Registered Specialist</p>
                      <p className="text-amber-800 mt-0.5">
                        {asgn.transfer_reason || "Primary technician is not registered for this trade. Auto-routed to verified specialist."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Technician Profile Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#1E3A8A] text-white font-heading font-extrabold text-base">
                      {asgn.partner_name?.[0] || "P"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading text-sm font-bold text-slate-900">
                          {asgn.partner_name}
                        </h4>
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-extrabold text-blue-900">
                          {asgn.category_name} Specialist
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center text-amber-600 font-bold">
                          <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {asgn.partner_rating || 4.8}
                        </span>
                        <span>•</span>
                        <StatusBadge status={asgn.status} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setChatOpen(true)}
                      className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      title="Chat"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </button>
                    <CallButton booking={booking} className="h-8 px-2.5 text-[11px]" />
                  </div>
                </div>

                {/* Assigned Services for this technician */}
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                    Services Handled by {asgn.partner_name}:
                  </span>
                  <div className="space-y-1">
                    {asgn.service_lines.map((l, i) => (
                      <div key={i} className="flex justify-between font-medium text-slate-800">
                        <span>• {l.name} x {l.qty}</span>
                        <span className="font-bold text-[#1E3A8A]">{inr(l.line_total)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific OTPs for this technician */}
                {asgn.status === "assigned" || asgn.status === "en_route" ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-2.5 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 block">
                      Start Service OTP for {asgn.partner_name}
                    </span>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="font-mono text-xl font-extrabold text-[#1E3A8A] tracking-widest bg-white px-3 py-0.5 rounded-lg border border-blue-200">
                        {asgn.start_otp}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Share upon arrival of this specialist
                    </p>
                  </div>
                ) : asgn.status === "in_progress" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      End Service OTP for {asgn.partner_name}
                    </span>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="font-mono text-xl font-extrabold text-[#F59E0B] tracking-widest bg-white px-3 py-0.5 rounded-lg border border-amber-200">
                        {asgn.end_otp}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Share when {asgn.category_name} service is finished
                    </p>
                  </div>
                ) : asgn.status === "completed" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-2 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    {asgn.category_name} Completed & Verified
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          /* Single Provider Fallback */
          <>
            {/* OTP Cards for Technician Verification */}
            {booking.status === "en_route" || booking.status === "assigned" ? (
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Share with technician upon arrival
                </span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Start Service OTP:</span>
                  <span className="font-mono text-2xl font-extrabold text-[#1E3A8A] tracking-widest bg-white px-3 py-0.5 rounded-xl border border-blue-200">
                    {booking.start_otp}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Only share this code after the professional reaches your home.
                </p>
              </div>
            ) : booking.status === "in_progress" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Service In Progress
                </span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">Job End OTP:</span>
                  <span className="font-mono text-2xl font-extrabold text-[#F59E0B] tracking-widest bg-white px-3 py-0.5 rounded-xl border border-amber-200">
                    {booking.end_otp}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-500">
                  Share this final code ONLY once you are completely satisfied with the work done.
                </p>
              </div>
            ) : null}

            {/* Technician Profile Card */}
            {partner ? (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#1E3A8A] text-white font-heading font-extrabold text-base">
                      {partner.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading text-sm font-bold text-slate-900">{partner.name}</h4>
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                          Verified
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center text-amber-600 font-bold">
                          <Star className="h-3 w-3 fill-amber-400 mr-0.5" /> {partner.rating || 4.8}
                        </span>
                        <span>•</span>
                        <span>{partner.jobs_done || 40}+ jobs completed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatOpen(true)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      title="In-app chat"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <CallButton booking={booking} className="h-9 px-3 text-xs" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs text-center text-xs text-slate-500">
                Searching nearby verified professionals in {booking.city_name}...
              </div>
            )}
          </>
        )}

        {/* Rate & Review Button for completed bookings */}
        {booking.status === "completed" && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs text-center space-y-2">
            <h4 className="font-heading text-sm font-bold text-slate-900">
              {booking.rating ? `You rated this ${booking.rating} ★` : "How was your service?"}
            </h4>
            <p className="text-xs text-slate-500">
              {booking.review ? `"${booking.review}"` : "Leave a rating and tip for your technician."}
            </p>
            <button
              onClick={() => setRatingOpen(true)}
              className="mt-1 rounded-xl bg-[#1E3A8A] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#172554]"
            >
              {booking.rating ? "Update Rating" : "Rate & Add Tip"}
            </button>
          </div>
        )}

        {/* Service Details & Pricing Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Booking Details
          </h4>
          <div className="space-y-2">
            {booking.lines.map((l, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="font-medium text-slate-800">
                  {l.name} x {l.qty}
                </span>
                <span className="font-bold text-slate-900">{inr(l.line_total)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Status</span>
              <StatusBadge status={booking.status} />
            </div>
            <div className="flex justify-between">
              <span>Payment Mode</span>
              <span className="font-semibold uppercase">{booking.payment_method}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold border-t border-slate-100 pt-2 text-sm">
              <span>Total Amount</span>
              <span className="text-[#1E3A8A] font-heading">{inr(booking.pricing.total)}</span>
            </div>
          </div>
        </div>

        {/* Timeline Log */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Service Progress
          </h4>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {booking.timeline.map((item, idx) => (
              <div key={idx} className="relative text-xs">
                <div className="absolute -left-6 top-0.5 h-4 w-4 rounded-full border-2 border-white bg-[#1E3A8A] shadow-xs" />
                <p className="font-bold capitalize text-slate-900">{item.status.replace("_", " ")}</p>
                {item.note && <p className="text-slate-500 mt-0.5">{item.note}</p>}
                <p className="text-[10px] text-slate-400 mt-0.5">{fmtDT(item.at)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Dialog */}
      <ChatDialog
        booking={booking}
        open={chatOpen}
        onOpenChange={setChatOpen}
        me="customer"
      />

      {/* Tax Invoice Dialog */}
      <InvoiceDialog
        booking={booking}
        open={invoiceOpen}
        onOpenChange={setInvoiceOpen}
      />

      {/* Rating & Tip Dialog */}
      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}>
        <DialogContent className="max-w-xs text-center" onClose={() => setRatingOpen(false)}>
          <DialogHeader>
            <DialogTitle>Rate Your Technician</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setRatingVal(st)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-7 w-7 ${
                      st <= ratingVal ? "fill-amber-400" : "fill-slate-100 text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block text-left mb-1">
                Add an optional tip (100% goes to partner):
              </label>
              <div className="flex gap-2">
                {[0, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTipVal(amt)}
                    className={`flex-1 rounded-xl py-2 text-xs font-bold border ${
                      tipVal === amt
                        ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {amt === 0 ? "No Tip" : inr(amt)}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write a brief feedback..."
              className="h-20 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#1E3A8A]"
            />

            <button
              onClick={handleSubmitRating}
              className="w-full rounded-xl bg-[#1E3A8A] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#172554]"
            >
              Submit Review
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
