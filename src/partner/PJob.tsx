import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  MessageSquare,
  KeyRound,
  Plus,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { TrackMap } from "@/components/common/Maps";
import { ChatDialog, CallButton } from "@/components/common/BookingTools";
import { inr, fmtDT } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const PJob: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const store = useStore();

  const partnerId = "usr_demo_partner";
  const booking = store.bookings.find((b) => b.id === id) || store.bookings[0];
  const customer = store.users.find((u) => u.id === booking?.customer_id);

  const myAssignment = booking?.partner_assignments?.find((a) => a.partner_id === partnerId);
  const otherAssignments = booking?.partner_assignments?.filter((a) => a.partner_id !== partnerId) || [];
  const currentStatus = myAssignment ? myAssignment.status : (booking?.status || "pending");
  const currentStartOtp = myAssignment ? myAssignment.start_otp : booking?.start_otp;
  const currentEndOtp = myAssignment ? myAssignment.end_otp : booking?.end_otp;
  const currentEarnings = myAssignment ? myAssignment.partner_earning : (booking?.partner_earning || 0);
  const currentServices = myAssignment ? myAssignment.service_lines : (booking?.lines || []);

  const [chatOpen, setChatOpen] = useState(false);
  const [startOtp, setStartOtp] = useState("");
  const [endOtp, setEndOtp] = useState("");
  const [extraItem, setExtraItem] = useState("");
  const [extraAmount, setExtraAmount] = useState<number>(350);
  const [extraModalOpen, setExtraModalOpen] = useState(false);

  if (!booking) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <p className="text-sm text-slate-500">Booking not found</p>
      </div>
    );
  }

  const handleStartNav = () => {
    storeApi.startNavigation(booking.id, partnerId);
    toast.success("Navigation started! Customer has been notified.");
  };

  const handleMarkArrived = () => {
    storeApi.markArrived(booking.id, partnerId);
    toast.success("Marked arrived! Please ask customer for Start OTP.");
  };

  const handleVerifyStartOtp = () => {
    try {
      storeApi.verifyStartOtp(booking.id, startOtp.trim(), partnerId);
      toast.success("Start OTP verified! You may now begin your service.");
      setStartOtp("");
    } catch (e: any) {
      toast.error(e.message || "Invalid Start OTP");
    }
  };

  const handleVerifyEndOtp = () => {
    try {
      storeApi.verifyEndOtp(booking.id, endOtp.trim(), partnerId);
      toast.success("End OTP verified! Your service completed and payout credited.");
      setEndOtp("");
    } catch (e: any) {
      toast.error(e.message || "Invalid End OTP");
    }
  };

  const handleAddExtra = () => {
    if (!extraItem.trim() || extraAmount <= 0) {
      toast.error("Please enter valid item name and amount");
      return;
    }
    storeApi.addExtraCharge(booking.id, extraItem.trim(), extraAmount);
    toast.success("Extra charge sent to customer for approval!");
    setExtraItem("");
    setExtraModalOpen(false);
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F4F5F7]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0F172A] px-4 py-3.5 text-white shadow-md">
        <button
          onClick={() => nav("/partner")}
          className="rounded-full p-1.5 text-slate-300 hover:bg-slate-800"
          data-testid="partner-job-back-btn"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="font-heading text-sm font-extrabold">Job #{booking.booking_no}</h2>
          <p className="text-[10px] text-[#F59E0B] uppercase font-bold tracking-wider">
            {booking.status.replace("_", " ")}
          </p>
        </div>
        <div className="w-8" />
      </div>

      {/* Map view for navigation & arrival */}
      {["assigned", "en_route"].includes(booking.status) && (
        <div className="relative h-60 w-full bg-slate-200">
          <TrackMap
            dest={booking.address.location}
            partner={booking.partner_origin || { lat: 26.852, lng: 80.948 }}
            className="h-full w-full"
          />
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between rounded-xl bg-white/95 p-2.5 shadow-md backdrop-blur-xs text-xs">
            <span className="font-bold text-slate-800 truncate">{booking.address.line}</span>
            <span className="font-mono font-bold text-[#1E3A8A] shrink-0">~12 min</span>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Customer Profile & Communication */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-slate-950 font-heading font-extrabold text-base">
                {customer?.name?.[0] || "C"}
              </div>
              <div>
                <h4 className="font-heading text-sm font-extrabold text-slate-900">
                  {customer?.name || "Customer"}
                </h4>
                <p className="text-xs text-slate-500">
                  {booking.payment_method === "cod" ? "Cash on Delivery (Collect cash)" : "Prepaid Online"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
              <CallButton booking={booking} className="h-9 px-3 text-xs" />
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              {booking.address.line}, {booking.address.city} - {booking.address.pincode}
            </p>
          </div>
        </div>

        {/* Multi-Service Auto-Transfer Information Banner */}
        {booking.is_multi_provider && (
          <div className="rounded-3xl border border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A]">
                <ShieldAlert className="h-4 w-4 text-[#F59E0B]" /> Multi-Service Split Order
              </span>
              <span className="rounded-full bg-[#1E3A8A] text-white px-2 py-0.5 text-[10px] font-bold">
                Your Role: {myAssignment?.category_name || "Specialist"}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-snug">
              You are assigned to <b>{currentServices.map(s => s.name).join(", ")}</b>.
            </p>
            {otherAssignments.length > 0 && (
              <div className="rounded-xl bg-white/80 p-2 border border-blue-100 text-[11px] text-slate-600">
                <span className="font-bold text-amber-800">⚡ Auto-Transfer Log:</span> Because you are registered for {myAssignment?.category_name || "your trade"} only, other service(s) ({otherAssignments.map(a => a.category_name).join(", ")}) were auto-transferred to verified partner {otherAssignments.map(a => a.partner_name).join(", ")}.
              </div>
            )}
          </div>
        )}

        {/* Action Flow Cards depending on Job State */}
        {currentStatus === "assigned" && (
          <div className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm text-center space-y-3">
            <p className="text-xs text-slate-600">
              Job accepted! Tap below when you are ready to start travelling to customer location.
            </p>
            <button
              onClick={handleStartNav}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1E3A8A] py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-[#172554] active:scale-98"
              data-testid="partner-start-nav-btn"
            >
              <Navigation className="h-4 w-4" /> Start Navigation
            </button>
          </div>
        )}

        {currentStatus === "en_route" && (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Arrived at customer door?</span>
              <button
                onClick={handleMarkArrived}
                className="rounded-lg bg-slate-100 px-3 py-1 font-bold text-slate-700 hover:bg-slate-200"
              >
                Mark Arrived
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter 4-Digit Customer Start OTP:
              </label>
              <div className="flex gap-2">
                <Input
                  value={startOtp}
                  onChange={(e) => setStartOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder={`Demo OTP: ${currentStartOtp || "1234"}`}
                  maxLength={4}
                  className="font-mono text-center text-lg tracking-widest font-extrabold"
                  data-testid="partner-start-otp-input"
                />
                <button
                  onClick={handleVerifyStartOtp}
                  disabled={startOtp.length !== 4}
                  className="rounded-xl bg-[#22C55E] px-5 text-xs font-extrabold text-slate-950 disabled:opacity-50"
                  data-testid="partner-verify-start-otp-btn"
                >
                  Verify & Start
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStatus === "in_progress" && (
          <div className="rounded-3xl border border-amber-300 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-heading text-xs font-bold uppercase text-amber-800">
                <Clock className="h-4 w-4 text-amber-500 animate-spin" /> Service In Progress
              </span>
              <button
                onClick={() => setExtraModalOpen(true)}
                className="flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border border-amber-200 hover:bg-amber-100"
                data-testid="partner-add-extra-btn"
              >
                <Plus className="h-3.5 w-3.5" /> Add Extra Charge
              </button>
            </div>

            {/* List existing extras */}
            {booking.extras?.length > 0 && (
              <div className="rounded-2xl bg-slate-50 p-3 space-y-2 text-xs">
                <p className="font-bold text-slate-700 uppercase text-[10px]">Extra Charges:</p>
                {booking.extras.map((e) => (
                  <div key={e.id} className="flex justify-between items-center text-slate-700">
                    <span>{e.item} ({inr(e.amount)})</span>
                    <span
                      className={`font-bold uppercase text-[10px] rounded px-1.5 py-0.5 ${
                        e.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : e.status === "declined"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-3">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Enter Customer End OTP to complete job:
              </label>
              <div className="flex gap-2">
                <Input
                  value={endOtp}
                  onChange={(e) => setEndOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder={`Demo OTP: ${currentEndOtp || "1234"}`}
                  maxLength={4}
                  className="font-mono text-center text-lg tracking-widest font-extrabold"
                  data-testid="partner-end-otp-input"
                />
                <button
                  onClick={handleVerifyEndOtp}
                  disabled={endOtp.length !== 4}
                  className="rounded-xl bg-[#22C55E] px-5 text-xs font-extrabold text-slate-950 disabled:opacity-50"
                  data-testid="partner-complete-job-btn"
                >
                  Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStatus === "completed" && (
          <div className="rounded-3xl border border-emerald-300 bg-white p-5 shadow-sm text-center space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-slate-900">Your Service Finished!</h3>
            <p className="text-xs text-slate-500">
              Your earning of <b className="text-emerald-700">{inr(currentEarnings)}</b> has been added to your pending settlements.
            </p>
            {booking.payment_method === "cod" && (
              <div className="rounded-xl bg-amber-50 p-2.5 text-xs text-amber-900 font-bold border border-amber-200">
                Cash on Delivery: Please collect {inr(booking.pricing.total)} in cash from customer.
              </div>
            )}
            <button
              onClick={() => nav("/partner")}
              className="w-full rounded-2xl bg-[#0F172A] py-3 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
            >
              Return to Pro Dashboard
            </button>
          </div>
        )}

        {/* Job Details Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Your Assigned Service Inclusions
          </h4>
          <div className="space-y-1.5 text-xs text-slate-700">
            {currentServices.map((l, i) => (
              <div key={i} className="flex justify-between font-medium">
                <span>{l.name} x {l.qty}</span>
                <span>{inr(l.line_total)}</span>
              </div>
            ))}
          </div>

          {otherAssignments.length > 0 && (
            <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-600 block">Other services in this booking (Auto-Transferred):</span>
              {otherAssignments.map((a) => (
                <div key={a.id} className="flex justify-between">
                  <span>• {a.service_lines.map(l => l.name).join(", ")}</span>
                  <span className="text-[#1E3A8A] font-medium">{a.partner_name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Gross Total (Entire Order):</span>
              <span className="font-semibold text-slate-800">{inr(booking.pricing.total)}</span>
            </div>

            <div className="border-t border-slate-200 pt-1.5 flex justify-between font-extrabold text-emerald-700 text-sm">
              <span>Your Portion Net Payout:</span>
              <span>{inr(currentEarnings)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Dialog */}
      <ChatDialog
        booking={booking}
        open={chatOpen}
        onOpenChange={setChatOpen}
        me="partner"
      />

      {/* Add Extra Charge Dialog */}
      <Dialog open={extraModalOpen} onOpenChange={setExtraModalOpen}>
        <DialogContent className="max-w-xs" onClose={() => setExtraModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Extra Spare / Labor</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700">Spare Part / Extra Work Item</label>
              <Input
                value={extraItem}
                onChange={(e) => setExtraItem(e.target.value)}
                placeholder="e.g. Copper Pipe Extension (3 ft)"
                className="mt-1"
                data-testid="partner-extra-item-input"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">Amount (₹)</label>
              <Input
                type="number"
                value={extraAmount}
                onChange={(e) => setExtraAmount(Number(e.target.value))}
                className="mt-1"
                data-testid="partner-extra-amount-input"
              />
            </div>
            <button
              onClick={handleAddExtra}
              className="mt-2 w-full rounded-xl bg-[#1E3A8A] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#172554]"
              data-testid="partner-extra-submit-btn"
            >
              Send Request to Customer
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
