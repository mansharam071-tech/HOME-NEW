import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Star, Plus, Check } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { Service } from "@/lib/types";
import { toast } from "sonner";

export const CServices: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const initialCat = params.get("category") || store.categories[0]?.id || "cat_ac";
  const searchQuery = params.get("q")?.toLowerCase() || "";
  const [selectedCat, setSelectedCat] = useState<string>(initialCat);

  const activeCity = store.cities.find((c) => c.id === store.cart.cityId) || store.cities[0];
  const isServiceAvailableInCurrentCity = (serviceId: string) => {
    if (!activeCity) return true;
    return !(activeCity.disabled_service_ids || []).includes(serviceId);
  };

  const filteredServices = store.services.filter((s) => {
    if (searchQuery) {
      return (
        s.name.toLowerCase().includes(searchQuery) ||
        s.category_id.toLowerCase().includes(searchQuery)
      );
    }
    return s.category_id === selectedCat;
  });

  const cartServiceIds = new Set(store.cart.items.map((i) => i.service.id));

  const handleAdd = (s: Service) => {
    if (!isServiceAvailableInCurrentCity(s.id)) {
      toast.error(`"${s.name}" is currently unavailable in ${activeCity?.city_name || "your city"}`);
      return;
    }
    storeApi.addToCart(s);
    toast.success(`${s.name} added to cart!`);
  };

  return (
    <div className="flex-1 pb-20 text-slate-900 bg-[#F8FAFC]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-white px-4 py-3 border-b border-slate-200/80 shadow-2xs">
        <button
          onClick={() => nav(-1)}
          className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
          data-testid="services-back-btn"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-base font-bold text-slate-900">
          {searchQuery ? `Search: "${searchQuery}"` : t(store.categories.find((c) => c.id === selectedCat)?.name || "Services")}
        </h2>
        <div className="w-8" />
      </div>

      {/* Category Pills horizontal bar if not global search */}
      {!searchQuery && (
        <div className="sticky top-12 z-20 flex gap-2 overflow-x-auto no-scrollbar bg-white px-4 py-2.5 border-b border-slate-100 shadow-2xs">
          {store.categories.map((c) => {
            const active = c.id === selectedCat;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.id)}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-[#1E3A8A] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t(c.name)}
              </button>
            );
          })}
        </div>
      )}

      {/* Service List */}
      <div className="p-4 space-y-3.5">
        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            {t("No services match your search")}
          </div>
        ) : (
          filteredServices.map((s) => {
            const inCart = cartServiceIds.has(s.id);
            const isAvailable = isServiceAvailableInCurrentCity(s.id);
            return (
              <div
                key={s.id}
                onClick={() => nav(`/app/service/${s.id}`)}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:border-[#1E3A8A]/30 cursor-pointer"
                data-testid={`service-card-${s.id}`}
              >
                <div className="flex gap-3.5 p-3.5">
                  <img
                    src={s.image}
                    alt={s.name}
                    className="h-24 w-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{s.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({s.reviews_count.toLocaleString()} reviews)
                      </span>
                    </div>

                    <h3 className="font-heading text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                      {s.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">{s.duration_min} mins · Safe at home</p>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="font-heading text-base font-extrabold text-[#1E3A8A]">
                        {inr(s.price)}
                      </div>

                      {isAvailable ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(s);
                          }}
                          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                            inCart
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-[#1E3A8A] text-white hover:bg-[#172554] shadow-xs"
                          }`}
                          data-testid={`add-service-btn-${s.id}`}
                        >
                          {inCart ? (
                            <>
                              <Check className="h-3 w-3" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="h-3 w-3" /> {t("Add")}
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-400 cursor-not-allowed">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {!isAvailable && (
                      <p className="mt-1 text-[10px] font-bold text-rose-600">
                        • Not serving in {activeCity?.city_name}
                      </p>
                    )}
                  </div>
                </div>

                {s.inclusions.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-3.5 py-2 text-[11px] text-slate-600 flex items-center gap-2">
                    <span className="font-bold text-slate-700">Includes:</span>
                    <span className="truncate">{s.inclusions.join(" • ")}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
