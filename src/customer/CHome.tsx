import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  Mic,
  Star,
  Plus,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  RotateCcw,
  Check,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { CatIcon } from "@/components/common/Shared";
import { inr } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Service } from "@/lib/types";
import { toast } from "sonner";

export const CHome: React.FC = () => {
  const store = useStore();
  const { t, lang, setLang } = useLang();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCityId, setSelectedCityId] = useState(store.cart.cityId || "city_lucknow");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const activeCity = store.cities.find((c) => c.id === selectedCityId) || store.cities[0];
  const cartTotalCount = store.cart.items.reduce((acc, i) => acc + i.qty, 0);

  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);
    store.cart.cityId = cityId;
    toast.success(`Switched location to ${store.cities.find((c) => c.id === cityId)?.city_name}`);
  };

  const handleAddToCart = (e: React.MouseEvent, service: Service) => {
    e.stopPropagation();
    storeApi.addToCart(service);
    toast.success(`${service.name} added to cart`);
  };

  const copyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const trendingServices = store.services.filter((s) => s.trending);
  const recentBookings = store.bookings
    .filter((b) => b.customer_id === "usr_demo_customer" && b.status === "completed")
    .slice(0, 1);

  return (
    <div className="flex-1 pb-24 text-slate-900">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 px-4 pt-2 pb-3 backdrop-blur-md border-b border-slate-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-[#1E3A8A]">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {t("Choose service location")}
                </span>
              </div>
              <select
                value={selectedCityId}
                onChange={(e) => handleCityChange(e.target.value)}
                className="bg-transparent font-heading font-extrabold text-sm text-slate-900 outline-none cursor-pointer pr-2"
              >
                {store.cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.city_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
              title="Toggle Hindi/English"
            >
              {lang === "en" ? "हिन्दी" : "EN"}
            </button>

            {/* Cart Button */}
            <Link
              to="/app/checkout"
              className="relative grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-800 hover:bg-slate-200"
              data-testid="customer-header-cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {cartTotalCount > 0 && (
                <span className="absolute -top-1 -right-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-[#F59E0B] px-1 text-[10px] font-bold text-slate-950">
                  {cartTotalCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-3 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) {
                nav(`/app/services?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            placeholder={t("Search 'AC repair', 'cleaning'…")}
            className="h-10 w-full rounded-2xl bg-slate-100 pl-10 pr-10 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            data-testid="customer-search-input"
          />
          <button
            onClick={() => {
              toast.info(t("Listening… say a service name"));
              setTimeout(() => {
                setQuery("AC Service");
                nav("/app/services?q=AC");
              }, 1200);
            }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-[#1E3A8A]"
            title="Voice search"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 space-y-5">
        {/* Active Surge Warning if active in current city */}
        {activeCity.surge_pricing.is_active && (
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-3 border border-amber-200/80 text-amber-900">
            <Sparkles className="h-4 w-4 text-[#F59E0B] shrink-0" />
            <p className="text-xs font-medium leading-tight">
              High demand in {activeCity.city_name} right now. {activeCity.surge_pricing.reason} (
              {activeCity.surge_pricing.multiplier}x surge applies).
            </p>
          </div>
        )}

        {/* Promo Banners Carousel */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 snap-x">
          {store.banners.map((bn) => (
            <div
              key={bn.id}
              className="relative min-w-[280px] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-[#172554] p-4 text-white shadow-md flex flex-col justify-between"
            >
              <div className="relative z-10">
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Featured Offer
                </span>
                <h4 className="font-heading mt-2 text-base font-bold leading-tight">{t(bn.title)}</h4>
                <p className="mt-1 text-xs text-blue-100">{t(bn.subtitle)}</p>
              </div>

              {bn.code && (
                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => copyCoupon(bn.code!)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-mono font-bold hover:bg-white/25 transition-colors"
                  >
                    {copiedCode === bn.code ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        Code: <span className="text-[#F59E0B]">{bn.code}</span>
                      </>
                    )}
                  </button>
                  <Link
                    to={`/app/services?category=${bn.category_id}`}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-0.5"
                  >
                    Book <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Multi-Service Combo Highlight Banner */}
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A]">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" /> Multi-Service Combo Booking
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
              Smart Auto-Transfer
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Need Fan Installation AND Bathroom Cleaning? Book both in 1 single order! If a provider isn't registered for both trades, the other service automatically transfers to a certified specialist.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                const fan = store.services.find((s) => s.id === "serv_elec_01");
                const bath = store.services.find((s) => s.id === "serv_clean_03");
                if (fan) storeApi.addToCart(fan);
                if (bath) storeApi.addToCart(bath);
                toast.success("Added Fan Installation + Bathroom Cleaning to cart!");
                nav("/app/checkout");
              }}
              className="flex-1 rounded-xl bg-[#1E3A8A] py-2 text-center text-xs font-bold text-white shadow-xs hover:bg-[#172554] transition-all"
              data-testid="one-click-combo-btn"
            >
              1-Click Combo: Fan + Bathroom Cleaning ({inr(149 + 449)})
            </button>
            <Link
              to="/app/services"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Custom Mix
            </Link>
          </div>
        </div>

        {/* Categories Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-base font-extrabold text-slate-900">
              {t("All services")}
            </h3>
            <Link
              to="/app/services"
              className="text-xs font-bold text-[#1E3A8A] hover:underline flex items-center"
            >
              See all <ArrowRight className="h-3 w-3 ml-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {store.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => nav(`/app/services?category=${cat.id}`)}
                className="group flex flex-col items-center rounded-2xl p-2 transition-all hover:bg-slate-100/80 active:scale-95"
                data-testid={`category-btn-${cat.id}`}
              >
                <div className="relative mb-1.5 grid h-13 w-13 place-items-center rounded-2xl bg-blue-50 text-[#1E3A8A] group-hover:bg-[#1E3A8A] group-hover:text-white transition-colors shadow-2xs">
                  <CatIcon name={cat.icon} className="h-6 w-6" />
                </div>
                <span className="text-center text-[11px] font-semibold text-slate-700 leading-tight">
                  {t(cat.name)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Book Again Quick Tile */}
        {recentBookings.length > 0 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <RotateCcw className="h-3.5 w-3.5 text-[#1E3A8A]" /> {t("Book again")}
              </span>
              <span className="text-[10px] text-slate-400">Completed previously</span>
            </div>
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {b.lines[0]?.name || "Home Service"}
                  </p>
                  <p className="text-[11px] text-slate-500">{inr(b.pricing.total)}</p>
                </div>
                <button
                  onClick={() => {
                    const serv = store.services.find((s) => s.id === b.lines[0]?.service_id);
                    if (serv) {
                      storeApi.addToCart(serv);
                      toast.success(t("Added previous services to cart"));
                      nav("/app/checkout");
                    }
                  }}
                  className="rounded-xl bg-[#1E3A8A] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#172554]"
                >
                  {t("Re-book")}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Trending Services */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-base font-extrabold text-slate-900">
              {t("Trending near you")}
            </h3>
            <span className="text-xs font-medium text-slate-400">Top rated</span>
          </div>

          <div className="space-y-3">
            {trendingServices.map((serv) => (
              <div
                key={serv.id}
                onClick={() => nav(`/app/service/${serv.id}`)}
                className="flex items-center gap-3.5 rounded-2xl border border-slate-200/70 bg-white p-3 shadow-2xs hover:border-[#1E3A8A]/40 transition-all cursor-pointer"
                data-testid={`trending-service-${serv.id}`}
              >
                <img
                  src={serv.image}
                  alt={serv.name}
                  className="h-20 w-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span>{serv.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({serv.reviews_count.toLocaleString()})
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900 leading-snug truncate">
                    {serv.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{serv.duration_min} mins</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-heading text-sm font-extrabold text-[#1E3A8A]">
                      {inr(serv.price)}
                    </span>
                    <button
                      onClick={(e) => handleAddToCart(e, serv)}
                      className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 hover:bg-[#1E3A8A] hover:text-white transition-colors"
                      data-testid={`add-trending-${serv.id}`}
                    >
                      <Plus className="h-3 w-3" /> {t("Add")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Cart Pill Bar */}
      {cartTotalCount > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-40 px-4 md:absolute md:bottom-16">
          <div className="mx-auto flex max-w-sm items-center justify-between rounded-2xl bg-[#1E3A8A] px-4 py-3 text-white shadow-xl animate-in slide-in-from-bottom duration-200">
            <div>
              <p className="text-xs font-bold">
                {cartTotalCount} {t("item(s) in cart")}
              </p>
              <p className="text-[11px] text-blue-200">Instant doorstep booking</p>
            </div>
            <Link
              to="/app/checkout"
              className="flex items-center gap-1 rounded-xl bg-[#F59E0B] px-3.5 py-1.5 text-xs font-extrabold text-slate-950 shadow-sm hover:bg-[#D97706]"
              data-testid="customer-floating-cart-btn"
            >
              {t("View cart →")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
