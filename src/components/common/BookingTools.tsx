import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmtDT, inr } from "@/lib/utils";
import { Booking } from "@/lib/types";
import { Phone, Send, Printer, ShieldCheck } from "lucide-react";

export const ChatDialog: React.FC<{
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  me: "customer" | "partner";
}> = ({ booking, open, onOpenChange, me }) => {
  const [msgs, setMsgs] = useState<
    { id: string; sender: "customer" | "partner"; text: string; time: string }[]
  >([
    {
      id: "m1",
      sender: "partner",
      text: "Hello! I am on my way to your address.",
      time: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    {
      id: "m2",
      sender: "customer",
      text: "Thanks, please ring the calling bell once at the gate.",
      time: new Date(Date.now() - 3 * 60000).toISOString(),
    },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    const newMsg = {
      id: `msg_${Date.now()}`,
      sender: me,
      text: text.trim(),
      time: new Date().toISOString(),
    };
    setMsgs((m) => [...m, newMsg]);
    setText("");

    // Simulate instant reply if customer is speaking to partner
    if (me === "customer") {
      setTimeout(() => {
        setMsgs((m) => [
          ...m,
          {
            id: `msg_p_${Date.now()}`,
            sender: "partner",
            text: "Got it! Arriving in 5 minutes.",
            time: new Date().toISOString(),
          },
        ]);
      }, 1500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Chat · Booking #{booking.booking_no}</DialogTitle>
        </DialogHeader>
        <div className="flex h-72 flex-col gap-2 overflow-y-auto rounded-2xl bg-slate-50 p-3 border border-slate-100">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                m.sender === me
                  ? "self-end bg-[#1E3A8A] text-white"
                  : "self-start bg-white text-slate-800 border border-slate-100"
              }`}
            >
              {m.text}
              <div
                className={`mt-1 text-[10px] ${
                  m.sender === me ? "text-blue-200" : "text-slate-400"
                }`}
              >
                {fmtDT(m.time)}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            data-testid="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type a message..."
            className="h-10 text-sm"
          />
          <Button
            data-testid="chat-send-btn"
            onClick={send}
            size="sm"
            className="bg-[#1E3A8A] h-10 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const CallButton: React.FC<{
  booking: Booking;
  className?: string;
  label?: string;
}> = ({ booking, className, label = "Call" }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        data-testid="masked-call-btn"
        variant="outline"
        onClick={() => setOpen(true)}
        className={className}
      >
        <Phone className="mr-1.5 h-4 w-4 text-emerald-600" />
        {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-xs text-center"
          onClose={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Number Masked Call</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Phone className="h-6 w-6" />
            </div>
            <p className="text-2xl font-bold tracking-wide text-[#1E3A8A]">+91 080 4719 3200</p>
            <div className="rounded-xl bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-900">
              When prompted, dial PIN: <b className="font-mono text-sm">{booking.start_otp || "4829"}</b>
            </div>
            <p className="text-xs text-slate-500">
              Your real mobile number remains private and secure under SMARTFIX SafeConnect.
            </p>
            <a
              href="tel:08047193200"
              className="mt-2 block w-full rounded-xl bg-[#22C55E] py-2.5 font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
            >
              Dial Now
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const InvoiceDialog: React.FC<{
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ booking, open, onOpenChange }) => {
  const p = booking.pricing;

  const handlePrint = () => {
    window.print();
  };

  const isGst = p.is_gst_invoice ?? (booking.invoice_type === "gst_tax_invoice");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6" onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {isGst ? "Tax Invoice (GST)" : "Non-GST / Bill of Supply"}
              </DialogTitle>
              <span className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 mt-1 inline-block ${isGst ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800"}`}>
                {isGst ? "GST Tax Invoice (Sec 31)" : "Bill of Supply (Sec 31(3)(c))"}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 text-sm" id="invoice-print">
          <div className="flex justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="font-heading font-extrabold text-base text-[#1E3A8A]">SMARTFIX Services Pvt Ltd</p>
              {isGst ? (
                <>
                  <p className="text-xs font-semibold text-slate-700">GSTIN: 09AAACS1234F1Z8</p>
                  <p className="text-xs text-slate-500">Tax Invoice / Original for Recipient</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-emerald-700">Non-GST Retail Bill / Supply</p>
                  <p className="text-xs text-slate-500">Exempt from Tax under Section 31(3)(c)</p>
                </>
              )}
              <p className="text-xs text-slate-500">Hazratganj, Lucknow, UP - 226001</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-xs font-bold text-slate-800">
                {booking.invoice_no || (isGst ? `GST/2026/${booking.booking_no.slice(-5)}` : `BILL/2026/${booking.booking_no.slice(-5)}`)}
              </p>
              <p className="text-xs text-slate-500">{fmtDT(booking.completed_at || booking.created_at)}</p>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800 mt-1">
                <ShieldCheck className="h-3 w-3" /> Paid ({booking.payment_method.toUpperCase()})
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Billed To (Customer)</p>
            <p className="font-semibold text-slate-900">{booking.address.label} - {booking.address.city}</p>
            <p className="text-xs text-slate-600">{booking.address.line}, {booking.address.pincode}</p>
          </div>

          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5">Service Item</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booking.lines.map((l, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-medium text-slate-900">
                      {l.name}
                      {l.addons.length > 0 && (
                        <div className="text-[10px] text-slate-500">
                          + {l.addons.map((a) => a.name).join(", ")}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 text-center">{l.qty}</td>
                    <td className="p-2.5 text-right font-medium">{inr(l.line_total)}</td>
                  </tr>
                ))}
                {booking.extras?.map((e) => (
                  <tr key={e.id} className="bg-amber-50/40">
                    <td className="p-2.5 text-slate-800 font-medium">Extra: {e.item}</td>
                    <td className="p-2.5 text-center">1</td>
                    <td className="p-2.5 text-right font-medium">{inr(e.amount)}</td>
                  </tr>
                ))}
                {(p.platform_fee || 0) > 0 && (
                  <tr className="bg-slate-50/70">
                    <td className="p-2.5 text-slate-800 font-medium">
                      Platform Fee (platefees)
                      <div className="text-[10px] text-slate-400">Convenience, safety & technician guarantee</div>
                    </td>
                    <td className="p-2.5 text-center">1</td>
                    <td className="p-2.5 text-right font-medium">{inr(p.platform_fee)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-1.5 border-t border-slate-200 pt-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Base Service Subtotal</span>
              <span>{inr(p.subtotal)}</span>
            </div>
            {p.surge_amount > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Peak / Demand Surge ({p.surge_multiplier}x)</span>
                <span>+{inr(p.surge_amount)}</span>
              </div>
            )}
            {p.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount ({p.coupon_code || "PROMO"})</span>
                <span>-{inr(p.discount)}</span>
              </div>
            )}
            {(p.platform_fee || 0) > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Platform Fee (platefees)</span>
                <span>+{inr(p.platform_fee)}</span>
              </div>
            )}

            {isGst ? (
              <>
                <div className="flex justify-between text-slate-700 font-medium pt-1 border-t border-slate-100">
                  <span>Taxable Value:</span>
                  <span>{inr(p.taxable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>CGST (9%):</span>
                  <span>+{inr(p.cgst)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SGST (9%):</span>
                  <span>+{inr(p.sgst)}</span>
                </div>
                <div className="flex justify-between text-blue-900 font-bold">
                  <span>Total GST ({((p.gst_rate || 0.18) * 100).toFixed(0)}%):</span>
                  <span>+{inr(p.gst_amount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-emerald-700 font-medium pt-1 border-t border-slate-100">
                <span>GST (Non-GST / Bill of Supply):</span>
                <span>₹0.00 (Exempt)</span>
              </div>
            )}

            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
              <span>Total Paid</span>
              <span className="text-[#1E3A8A] text-base">{inr(p.total)}</span>
            </div>

            <p className="text-[10px] text-slate-400 text-center pt-2 italic">
              {isGst
                ? "This is a computer generated Tax Invoice issued under Rule 46 of CGST Rules 2017."
                : "Non-GST Bill of Supply issued under Section 31(3)(c) of CGST Act. No Input Tax Credit applicable."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
