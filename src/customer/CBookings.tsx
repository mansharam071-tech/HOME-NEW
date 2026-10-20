import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, ChevronRight, AlertCircle, FileText } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { StatusBadge } from "@/components/common/Shared";
import { InvoiceDialog } from "@/components/common/BookingTools";
import { inr, fmtDT } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Booking } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const CBookings: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const customerId = "usr_demo_customer";

  const [tab, setTab] = useState<"active" | "past">("active");
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("Change of plans");

  const myBookings = store.bookings.filter((b) => b.customer_id === customerId);
  const activeBookings = myBookings.filter(
    (b) => !["completed", "cancelled"].includes(b.status)
  );
  const pastBookings = myBookings.filter((b) =>
    ["completed", "cancelled"].includes(b.status)
  );

  const displayed = tab === "active" ? activeBookings : pastBookings;

  const handleConfirmCancel = () => {
    if (!cancelModalBooking) return;
    try {
      storeApi.cancelBooking(cancelModalBooking.id, cancelReason);
      toast.success("Booking cancelled. Prepaid amount refunded to SMARTFIX wallet.");
      setCancelModalBooking(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel booking");
    }
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
        <h2 className="font-heading text-base font-bold text-slate-900">{t("Bookings")}</h2>
        <div className="w-8" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
            tab === "active"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
          data-testid="bookings-active-tab"
        >
          Active ({activeBookings.length})
        </button>
        <button
          onClick={() => setTab("past")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition-all ${
            tab === "past"
              ? "border-[#1E3A8A] text-[#1E3A8A]"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
          data-testid="bookings-past-tab"
        >
          History ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="p-4 space-y-3.5">
        {displayed.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 bg-white">
            No {tab} bookings found.
          </div>
        ) : (
          displayed.map((b) => {
            const firstLine = b.lines[0];
            const partner = store.users.find((u) => u.id === b.partner_id);

            return (
              <div
                key={b.id}
                onClick={() => nav(`/app/booking/${b.id}`)}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all hover:border-[#1E3A8A]/40 cursor-pointer"
                data-testid={`booking-card-${b.booking_no}`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 text-xs">
                  <span className="font-mono font-bold text-slate-700">#{b.booking_no}</span>
                  <StatusBadge status={b.status} />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex gap-3">
                    <img
                      src={firstLine?.image || "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400"}
                      alt={firstLine?.name || "Service"}
                      className="h-16 w-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-sm font-bold text-slate-900 leading-snug truncate">
                        {firstLine?.name || "Home Service"}
                      </h4>
                      <p className="text-xs font-extrabold text-[#1E3A8A] mt-0.5">
                        {inr(b.pricing.total)}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{b.slot_date} · {b.slot_time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Partner details if assigned */}
                  {partner && (
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="grid h-6 w-6 place-items-center rounded-full bg-[#1E3A8A] text-white text-[10px] font-bold">
                          {partner.name[0]}
                        </div>
                        <span className="font-medium text-slate-800">{partner.name} (Pro)</span>
                      </div>
                      {["assigned", "en_route", "in_progress"].includes(b.status) && (
                        <span className="font-mono font-bold text-[#1E3A8A] text-xs">
                          OTP: {b.status === "in_progress" ? b.end_otp : b.start_otp}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{b.address.line}, {b.address.city}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <div className="flex items-center gap-2">
                      {b.status === "completed" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvoiceBooking(b);
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </button>
                      )}
                      {!["completed", "cancelled", "in_progress"].includes(b.status) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelModalBooking(b);
                          }}
                          className="text-xs font-semibold text-rose-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => nav(`/app/booking/${b.id}`)}
                      className="flex items-center gap-1 text-xs font-bold text-[#1E3A8A] hover:underline"
                    >
                      {tab === "active" ? "Track Live" : "Details"} <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <InvoiceDialog
          booking={selectedInvoiceBooking}
          open={!!selectedInvoiceBooking}
          onOpenChange={(op) => !op && setSelectedInvoiceBooking(null)}
        />
      )}

      {/* Cancellation Modal */}
      <Dialog open={!!cancelModalBooking} onOpenChange={() => setCancelModalBooking(null)}>
        <DialogContent className="max-w-xs" onClose={() => setCancelModalBooking(null)}>
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Cancel Booking?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-1">
            <p className="text-slate-600">
              Are you sure you want to cancel booking #{cancelModalBooking?.booking_no}?
              {cancelModalBooking?.status === "en_route"
                ? " (Cancellation fee of ₹99 applies as technician is already en route)."
                : " Prepaid amount will be refunded directly to your SMARTFIX wallet."}
            </p>
            <div>
              <label className="font-bold text-slate-700">Select reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              >
                <option value="Change of plans">Change of plans</option>
                <option value="Booked by mistake">Booked by mistake</option>
                <option value="Partner delayed">Technician running late</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2 font-bold text-slate-700"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 rounded-xl bg-rose-600 py-2 font-bold text-white shadow-sm hover:bg-rose-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
