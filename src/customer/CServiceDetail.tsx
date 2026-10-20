import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, ShieldCheck, Check, X, Plus, AlertCircle } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Addon } from "@/lib/types";
import { toast } from "sonner";

export const CServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const store = useStore();
  const { t } = useLang();

  const service = store.services.find((s) => s.id === id) || store.services[0];
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addonsTotal = selectedAddons.reduce((acc, a) => acc + a.price, 0);
  const totalPrice = service.price + addonsTotal;

  const activeCity = store.cities.find((c) => c.id === store.cart.cityId) || store.cities[0];
  const isAvailableInCity = !(activeCity?.disabled_service_ids || []).includes(service.id);

  const handleBookNow = () => {
    if (!isAvailableInCity) {
      toast.error(`"${service.name}" is currently unavailable in ${activeCity?.city_name || "your city"}`);
      return;
    }
    storeApi.addToCart(service, selectedAddons, 1);
    toast.success("Added to cart! Proceeding to checkout...");
    nav("/app/checkout");
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-white">
      {/* Top Floating Back Button */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-900">
        <img
          src={service.image}
          alt={service.name}
          className="h-full w-full object-cover opacity-90"
        />
        <button
          onClick={() => nav(-1)}
          className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md backdrop-blur-md hover:bg-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="-mt-6 rounded-t-3xl bg-white px-5 pt-6 space-y-6">
        {/* City Availability Alert if paused in active city */}
        {!isAvailableInCity && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold">Currently Unavailable in {activeCity?.city_name}</p>
              <p className="text-rose-700 mt-0.5">
                This service is temporarily disabled or not serviceable in {activeCity?.city_name}. You can switch your city from the home screen or explore other available services.
              </p>
            </div>
          </div>
        )}

        {/* Main Title & Rating */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 mb-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{service.rating}</span>
            <span className="text-slate-400 font-normal">
              ({service.reviews_count.toLocaleString()} reviews)
            </span>
          </div>
          <h1 className="font-heading text-xl font-extrabold text-slate-900 leading-tight">
            {service.name}
          </h1>

          <div className="mt-2.5 flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" /> {service.duration_min} mins
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> 30-day warranty
            </span>
          </div>
        </div>

        {/* Addons Section */}
        {service.addons.length > 0 && (
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4">
            <h3 className="font-heading text-sm font-bold text-slate-900 mb-3">
              Frequently Added Add-ons
            </h3>
            <div className="space-y-2.5">
              {service.addons.map((a) => {
                const selected = selectedAddons.some((x) => x.id === a.id);
                return (
                  <div
                    key={a.id}
                    onClick={() => toggleAddon(a)}
                    className={`flex items-center justify-between rounded-xl p-2.5 border transition-all cursor-pointer ${
                      selected
                        ? "border-[#1E3A8A] bg-blue-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{a.name}</p>
                      <p className="text-xs font-extrabold text-[#1E3A8A]">{inr(a.price)}</p>
                    </div>
                    <div
                      className={`grid h-6 w-6 place-items-center rounded-lg border text-xs ${
                        selected
                          ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                          : "border-slate-300 text-transparent"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* What's Included */}
        <div>
          <h3 className="font-heading text-sm font-bold text-slate-900 mb-2.5">
            {t("What's included")}
          </h3>
          <div className="space-y-2">
            {service.inclusions.map((inc, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                <div className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                  <Check className="h-2.5 w-2.5" />
                </div>
                <span>{inc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What's Excluded */}
        {service.exclusions.length > 0 && (
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900 mb-2.5">
              What's excluded
            </h3>
            <div className="space-y-2">
              {service.exclusions.map((exc, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs text-slate-500">
                  <div className="grid h-4 w-4 place-items-center rounded-full bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                    <X className="h-2.5 w-2.5" />
                  </div>
                  <span>{exc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequently Paired / Multi-Service Suggestion Card */}
        {(() => {
          const pairedService =
            service.category_id === "cat_elec"
              ? store.services.find((s) => s.id === "serv_clean_03") || store.services.find((s) => s.category_id === "cat_clean")
              : store.services.find((s) => s.id === "serv_elec_01") || store.services.find((s) => s.category_id === "cat_elec");

          if (!pairedService || pairedService.id === service.id) return null;
          const isPairedInCart = store.cart.items.some((i) => i.service.id === pairedService.id);

          return (
            <div className="rounded-2xl border-2 border-dashed border-[#1E3A8A]/30 bg-blue-50/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E3A8A]">
                  ✨ Multi-Service Combo (1 Order)
                </span>
                <span className="text-[10px] bg-[#1E3A8A] text-white px-2 py-0.5 rounded-full font-bold">
                  Auto-Dispatched
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1">
                Frequently Booked Together: {pairedService.name}
              </p>
              <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                Want both done today? Book together in one checkout. If your service provider isn't registered for both trades, the other service will auto-transfer to a verified specialist provider!
              </p>
              <div className="flex items-center justify-between bg-white rounded-xl p-2.5 border border-blue-200">
                <div className="flex items-center gap-2.5">
                  <img
                    src={pairedService.image}
                    alt={pairedService.name}
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">{pairedService.name}</p>
                    <p className="text-xs font-extrabold text-[#1E3A8A]">{inr(pairedService.price)}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (isPairedInCart) {
                      toast.info(`${pairedService.name} is already in your cart`);
                    } else {
                      storeApi.addToCart(pairedService);
                      toast.success(`Added ${pairedService.name} to multi-service cart!`);
                    }
                  }}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    isPairedInCart
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-[#1E3A8A] text-white hover:bg-[#172554] shadow-xs"
                  }`}
                  data-testid="add-paired-service-btn"
                >
                  {isPairedInCart ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" /> + Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })()}

        {/* Customer Reviews */}
        {service.reviews.length > 0 && (
          <div>
            <h3 className="font-heading text-sm font-bold text-slate-900 mb-2.5">
              Verified Customer Reviews
            </h3>
            <div className="space-y-2.5">
              {service.reviews.map((rev, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{rev.name}</span>
                    <div className="flex items-center text-amber-500 text-xs">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span className="ml-1 font-bold">{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 italic">"{rev.text}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-4 py-3 shadow-lg md:absolute">
        <div className="mx-auto flex max-w-sm items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Price</p>
            <p className="font-heading text-base font-extrabold text-[#1E3A8A]">{inr(totalPrice)}</p>
          </div>

          <div className="flex items-center gap-2">
            {isAvailableInCity ? (
              <>
                <button
                  onClick={() => {
                    storeApi.addToCart(service, selectedAddons, 1);
                    toast.success(`${service.name} added! You can now add more services.`);
                  }}
                  className="rounded-xl border border-[#1E3A8A] bg-blue-50/80 px-3 py-2.5 text-xs font-bold text-[#1E3A8A] hover:bg-blue-100 transition-all"
                  data-testid="service-add-to-cart-btn"
                >
                  + Add to Cart
                </button>
                <button
                  onClick={handleBookNow}
                  className="flex items-center gap-1 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#172554] active:scale-95 transition-all"
                  data-testid="service-book-now-btn"
                >
                  Book Now →
                </button>
              </>
            ) : (
              <button
                disabled
                className="rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 cursor-not-allowed"
                data-testid="service-unavailable-btn"
              >
                Unavailable in {activeCity?.city_name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
