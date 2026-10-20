import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  CreditCard,
  Wallet,
  Banknote,
  ShieldCheck,
  Check,
  FileText,
  Receipt,
  Info,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Address } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const CCheckout: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();

  const customerId = "usr_demo_customer";
  const customer = store.users.find((u) => u.id === customerId);

  const [mode, setMode] = useState<"instant" | "scheduled">("instant");
  const [slotDate, setSlotDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [slotTime, setSlotTime] = useState<string>("10:00 AM - 12:00 PM");
  const [couponInput, setCouponInput] = useState<string>(store.cart.couponCode || "");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wallet" | "cod">("upi");
  const [busy, setBusy] = useState(false);

  // Address
  const userAddresses = store.addresses.filter((a) => a.user_id === customerId);
  const [selectedAddrId, setSelectedAddrId] = useState<string>(
    userAddresses.find((a) => a.is_default)?.id || userAddresses[0]?.id || ""
  );
  const [addAddrOpen, setAddAddrOpen] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "Home", line: "", pincode: "226001", city: "Lucknow" });

  const activeAddress = userAddresses.find((a) => a.id === selectedAddrId) || userAddresses[0];

  const currentCity = store.cities.find((c) => c.id === store.cart.cityId) || store.cities[0];
  // Invoice type is set exclusively by Admin Panel per city (Customer cannot choose/override)
  const isGstInvoice = Boolean(
    currentCity?.enable_gst_invoice ?? currentCity?.customer_settings?.enable_gst ?? true
  );

  const pricing = storeApi.calculatePricing(
    store.cart.items,
    store.cart.cityId,
    store.cart.couponCode,
    isGstInvoice
  );

  const handleApplyCoupon = (code: string) => {
    try {
      storeApi.applyCoupon(code);
      setCouponInput(code);
      toast.success(`Coupon ${code} applied!`);
    } catch (e: any) {
      toast.error(e.message || "Failed to apply coupon");
    }
  };

  const handleRemoveCoupon = () => {
    storeApi.removeCoupon();
    setCouponInput("");
    toast.info("Coupon removed");
  };

  const handleSaveNewAddress = () => {
    if (!newAddr.line.trim()) {
      toast.error("Please enter street address");
      return;
    }
    const created: Address = {
      id: `addr_${Date.now()}`,
      user_id: customerId,
      label: newAddr.label,
      line: newAddr.line,
      pincode: newAddr.pincode,
      city: newAddr.city,
      location: { lat: 26.8467, lng: 80.9462 },
      is_default: false,
      created_at: new Date().toISOString(),
    };
    storeApi.saveAddress(created);
    setSelectedAddrId(created.id);
    setAddAddrOpen(false);
    toast.success("New address saved!");
  };

  const handlePlaceBooking = () => {
    if (store.cart.items.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!activeAddress) {
      toast.error("Please add a service delivery address");
      return;
    }

    if (paymentMethod === "wallet" && (customer?.wallet_balance || 0) < pricing.total) {
      toast.error(`Insufficient wallet balance (${inr(customer?.wallet_balance || 0)}). Please top up or choose UPI.`);
      return;
    }

    const currentCity = store.cities.find((c) => c.id === store.cart.cityId);
    const disabledItems = store.cart.items.filter((item) =>
      (currentCity?.disabled_service_ids || []).includes(item.service.id)
    );
    if (disabledItems.length > 0) {
      toast.error(
        `"${disabledItems.map((d) => d.service.name).join(", ")}" is currently not serviceable in ${currentCity?.city_name}. Please remove it to proceed.`
      );
      return;
    }

    setBusy(true);
    setTimeout(() => {
      try {
        const booking = storeApi.createBooking({
          customerId,
          items: store.cart.items,
          address: activeAddress,
          cityId: store.cart.cityId,
          mode,
          slotDate,
          slotTime: mode === "instant" ? "ASAP (30-45 min)" : slotTime,
          paymentMethod,
          couponCode: store.cart.couponCode,
          forceGstInvoice: isGstInvoice,
        });

        toast.success(`Booking ${booking.booking_no} confirmed! Professional dispatched.`);
        nav(`/app/booking/${booking.id}`);
      } catch (e: any) {
        toast.error(e.message || "Booking creation failed");
      }
      setBusy(false);
    }, 600);
  };

  if (store.cart.items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white">
        <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
          <Ticket className="h-10 w-10" />
        </div>
        <h2 className="font-heading text-lg font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="mt-1 text-xs text-slate-500 max-w-xs">
          Explore our certified home services and add items to your cart.
        </p>
        <button
          onClick={() => nav("/app/services")}
          className="mt-6 rounded-xl bg-[#1E3A8A] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#172554]"
        >
          Browse Services
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-28 text-slate-900 bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200/80 shadow-2xs">
        <button
          onClick={() => nav(-1)}
          className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
          data-testid="checkout-back-btn"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-base font-bold text-slate-900">Checkout</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Multi-Service Auto-Transfer Smart Alert if multiple categories */}
        {(() => {
          const categoryIds = Array.from(new Set(store.cart.items.map((i) => i.service.category_id)));
          if (categoryIds.length <= 1) return null;
          return (
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-white p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A]">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Multi-Service Smart Dispatch Active
                </span>
                <span className="rounded-full bg-[#1E3A8A] text-white px-2 py-0.5 text-[10px] font-extrabold">
                  {categoryIds.length} Trades
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-snug">
                You are booking multiple services across <strong>{categoryIds.map(c => store.categories.find(cat => cat.id === c)?.name || c).join(" & ")}</strong>.
              </p>
              <div className="mt-2 rounded-xl bg-white/90 p-2 border border-indigo-100 flex items-start gap-2 text-[11px] text-slate-600">
                <Info className="h-4 w-4 text-[#1E3A8A] shrink-0 mt-0.5" />
                <span>
                  <strong>Auto-Transfer Guarantee:</strong> If the primary service provider is not registered in both services (e.g. Electrician vs Cleaning), the other service will automatically transfer to a verified specialist provider!
                </span>
              </div>
            </div>
          );
        })()}

        {/* Cart Items List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
              Selected Services ({store.cart.items.reduce((a, b) => a + b.qty, 0)})
            </h3>
            <button
              onClick={() => nav("/app/services")}
              className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> + Add More Services
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {store.cart.items.map((item, idx) => {
              const catName = store.categories.find((c) => c.id === item.service.category_id)?.name || "Service";
              return (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                        {catName}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">{item.service.name}</p>
                    <p className="text-xs font-extrabold text-[#1E3A8A] mt-0.5">{inr(item.service.price)}</p>
                    {item.addons.length > 0 && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        + Addons: {item.addons.map((a) => a.name).join(", ")} ({inr(item.addons.reduce((s, a) => s + a.price, 0))})
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
                    <button
                      onClick={() => storeApi.updateCartQty(item.service.id, -1)}
                      className="text-slate-600 hover:text-rose-600 p-0.5"
                    >
                      {item.qty === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    </button>
                    <span className="w-4 text-center text-xs font-bold text-slate-800">{item.qty}</span>
                    <button
                      onClick={() => storeApi.updateCartQty(item.service.id, 1)}
                      className="text-slate-600 hover:text-[#1E3A8A] p-0.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Address Selector */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
              Service Address
            </h3>
            <button
              onClick={() => setAddAddrOpen(true)}
              className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add New
            </button>
          </div>

          <div className="space-y-2">
            {userAddresses.map((addr) => {
              const selected = addr.id === selectedAddrId;
              return (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddrId(addr.id)}
                  className={`flex items-start gap-3 rounded-xl p-3 border transition-all cursor-pointer ${
                    selected ? "border-[#1E3A8A] bg-blue-50/50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className={`mt-0.5 rounded-full p-1 text-white ${selected ? "bg-[#1E3A8A]" : "bg-slate-300"}`}>
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-900">{addr.label}</p>
                    <p className="text-slate-600 mt-0.5 leading-snug">{addr.line}, {addr.city} - {addr.pincode}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Slot / Booking Mode */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Timing & Arrival
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("instant")}
              className={`rounded-xl p-2.5 text-center border text-xs font-bold transition-all ${
                mode === "instant" ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]" : "border-slate-200 text-slate-700 bg-white"
              }`}
            >
              🚀 Instant (30-45m)
            </button>
            <button
              type="button"
              onClick={() => setMode("scheduled")}
              className={`rounded-xl p-2.5 text-center border text-xs font-bold transition-all ${
                mode === "scheduled" ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]" : "border-slate-200 text-slate-700 bg-white"
              }`}
            >
              📅 Schedule Slot
            </button>
          </div>

          {mode === "scheduled" && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Date</label>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase">Time Slot</label>
                <select
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold"
                >
                  <option value="09:00 AM - 11:00 AM">9:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 01:00 PM">11:00 AM - 1:00 PM</option>
                  <option value="02:00 PM - 04:00 PM">2:00 PM - 4:00 PM</option>
                  <option value="04:00 PM - 06:00 PM">4:00 PM - 6:00 PM</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Coupons Section */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5" /> Coupon & Offers
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="h-10 flex-1 rounded-xl border border-slate-200 px-3 text-xs font-mono font-bold uppercase text-slate-800 placeholder:text-slate-400"
            />
            {store.cart.couponCode ? (
              <button
                onClick={handleRemoveCoupon}
                className="rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-700"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={() => handleApplyCoupon(couponInput)}
                disabled={!couponInput.trim()}
                className="rounded-xl bg-[#1E3A8A] px-4 text-xs font-bold text-white disabled:opacity-50"
              >
                Apply
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {store.coupons.map((c) => (
              <button
                key={c.id}
                onClick={() => handleApplyCoupon(c.code)}
                className="rounded-lg border border-dashed border-amber-300 bg-amber-50/70 px-2 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100"
              >
                {c.code} · {c.discount_type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Payment Option
          </h3>
          <div className="space-y-2">
            {[
              { id: "upi", label: "Instant UPI (GPay / PhonePe / Paytm)", icon: ShieldCheck, badge: "Instant" },
              { id: "card", label: "Credit / Debit Card", icon: CreditCard },
              {
                id: "wallet",
                label: `SMARTFIX Wallet (Balance: ${inr(customer?.wallet_balance || 0)})`,
                icon: Wallet,
                badge: (customer?.wallet_balance || 0) >= pricing.total ? "Available" : "Low Balance",
              },
              { id: "cod", label: "Cash on Delivery (Pay after service)", icon: Banknote },
            ].map((p) => {
              const active = paymentMethod === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setPaymentMethod(p.id as any)}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-all cursor-pointer ${
                    active ? "border-[#1E3A8A] bg-blue-50/50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <p.icon className={`h-4 w-4 ${active ? "text-[#1E3A8A]" : "text-slate-400"}`} />
                    <span className="text-xs font-bold text-slate-800">{p.label}</span>
                  </div>
                  {p.badge && (
                    <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${p.badge === "Low Balance" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-800"}`}>
                      {p.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Itemized Bill Details (Admin Configured per city) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-heading font-bold uppercase tracking-wider text-slate-400">
                Bill Breakdown
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                City: {currentCity?.city_name}
              </p>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                pricing.is_gst_invoice
                  ? "bg-blue-100 text-[#1E3A8A] ring-1 ring-blue-300"
                  : "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
              }`}
            >
              {pricing.is_gst_invoice
                ? `Tax Invoice (${currentCity?.gst_rate || 18}% GST)`
                : "Non-GST Bill of Supply (0% Tax)"}
            </span>
          </div>

          {/* Base Price */}
          <div className="flex justify-between text-slate-700">
            <span className="flex items-center gap-1">
              Base Price (Service Charges)
            </span>
            <span className="font-semibold text-slate-900">{inr(pricing.base_price)}</span>
          </div>

          {/* Add-ons */}
          {pricing.addons_total > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Selected Add-ons</span>
              <span className="font-semibold">{inr(pricing.addons_total)}</span>
            </div>
          )}

          {/* Platform Fee ("platefees") */}
          <div className="flex justify-between text-slate-700">
            <span className="flex items-center gap-1">
              Platform Fee (platefees)
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1 py-0.2 rounded">
                Verified Tech + Insurance
              </span>
            </span>
            <span className="font-semibold text-slate-900">
              {pricing.platform_fee > 0 ? inr(pricing.platform_fee) : <span className="text-emerald-700 font-bold">FREE (City Offer)</span>}
            </span>
          </div>

          {/* Demand Surge */}
          {pricing.surge_amount > 0 && (
            <div className="flex justify-between text-amber-700">
              <span>Demand / Weather Surge ({pricing.surge_multiplier}x)</span>
              <span className="font-semibold">+{inr(pricing.surge_amount)}</span>
            </div>
          )}

          {/* Coupon Discount */}
          {pricing.discount > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Voucher Savings ({pricing.coupon_code})</span>
              <span>-{inr(pricing.discount)}</span>
            </div>
          )}

          {/* GST Calculation / Non-GST breakdown */}
          {pricing.is_gst_invoice ? (
            <div className="rounded-xl bg-blue-50/60 p-2.5 space-y-1.5 border border-blue-100 text-[11px]">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Taxable Value:</span>
                <span>{inr(pricing.taxable)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>CGST ({(currentCity?.gst_rate || 18) / 2}%):</span>
                <span>+{inr(pricing.cgst)}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-medium">
                <span>SGST ({(currentCity?.gst_rate || 18) / 2}%):</span>
                <span>+{inr(pricing.sgst)}</span>
              </div>
              <div className="border-t border-blue-200/60 pt-1 flex justify-between font-bold text-blue-900">
                <span>Total GST ({currentCity?.gst_rate || 18}%):</span>
                <span>+{inr(pricing.gst_amount)}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50/60 p-2.5 flex justify-between items-center border border-emerald-100 text-[11px]">
              <span className="text-emerald-800 font-medium">
                GST on Supply (Non-GST / Bill of Supply):
              </span>
              <span className="font-bold text-emerald-700">₹0.00 (Exempt)</span>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
            <div>
              <span>To Pay</span>
              <p className="text-[10px] text-slate-400 font-normal">
                {pricing.is_gst_invoice ? "Inclusive of all GST & Platefees" : "Total Non-GST Payable"}
              </p>
            </div>
            <span className="text-base text-[#1E3A8A] font-heading">{inr(pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Sticky Place Order Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-5 py-3 shadow-xl md:absolute">
        <div className="mx-auto flex max-w-sm items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Grand Total</p>
            <p className="font-heading text-lg font-extrabold text-[#1E3A8A]">{inr(pricing.total)}</p>
          </div>
          <button
            onClick={handlePlaceBooking}
            disabled={busy}
            className="rounded-xl bg-[#F59E0B] px-6 py-3 text-sm font-extrabold text-slate-950 shadow-md hover:bg-[#D97706] active:scale-95 transition-all disabled:opacity-50"
            data-testid="customer-place-order-btn"
          >
            {busy ? "Placing Booking..." : "Place Booking"}
          </button>
        </div>
      </div>

      {/* Add Address Modal */}
      <Dialog open={addAddrOpen} onOpenChange={setAddAddrOpen}>
        <DialogContent className="max-w-sm" onClose={() => setAddAddrOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Service Address</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-600">Address Label</label>
              <div className="mt-1 flex gap-2">
                {["Home", "Office", "Other"].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewAddr({ ...newAddr, label: lbl })}
                    className={`flex-1 rounded-lg border py-1.5 text-xs font-bold ${
                      newAddr.label === lbl ? "border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600">Flat / House / Street Address</label>
              <Input
                value={newAddr.line}
                onChange={(e) => setNewAddr({ ...newAddr, line: e.target.value })}
                placeholder="e.g. Flat 302, Green Valley Apartments"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-600">City</label>
                <Input
                  value={newAddr.city}
                  onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Pincode</label>
                <Input
                  value={newAddr.pincode}
                  onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <button
              onClick={handleSaveNewAddress}
              className="mt-4 w-full rounded-xl bg-[#1E3A8A] py-3 text-xs font-bold text-white shadow-sm hover:bg-[#172554]"
            >
              Save Address
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
