import React, { useState } from "react";
import {
  Plus,
  Trash2,
  MapPin,
  Zap,
  Check,
  Edit2,
  RotateCcw,
  Receipt,
  IndianRupee,
  Calendar,
  Percent,
  Power,
  ShieldCheck,
  FileText,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Layers,
  Sparkles,
  CheckCheck,
  XCircle,
} from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { GeofenceMap } from "@/components/common/Maps";
import { City, CityCustomerSettings, CityPartnerSettings } from "@/lib/types";
import { inr } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const ACities: React.FC = () => {
  const store = useStore();
  const [selectedCityId, setSelectedCityId] = useState<string>(store.cities[0]?.id || "city_lucknow");
  const activeCity = store.cities.find((c) => c.id === selectedCityId) || store.cities[0];

  const [polygon, setPolygon] = useState<[number, number][]>(activeCity?.polygon || []);
  const [pincodesStr, setPincodesStr] = useState(activeCity?.pincodes?.join(", ") || "");

  // City-wise Customer Settings
  const [enableGst, setEnableGst] = useState<boolean>(activeCity?.enable_gst_invoice ?? activeCity?.customer_settings?.enable_gst ?? true);
  const [gstRatePct, setGstRatePct] = useState<number>(activeCity?.gst_rate ?? 18);
  const [enablePlatformFee, setEnablePlatformFee] = useState<boolean>(activeCity?.enable_platform_fee ?? activeCity?.customer_settings?.enable_platform_fee ?? true);
  const [platformFeeAmt, setPlatformFeeAmt] = useState<number>(activeCity?.platform_fee ?? activeCity?.customer_settings?.platform_fee_amount ?? 29);
  const [enableBasePrice, setEnableBasePrice] = useState<boolean>(activeCity?.enable_base_price ?? true);
  const [basePriceAmt, setBasePriceAmt] = useState<number>(activeCity?.base_price ?? 99);

  // City-wise Partner Settings (% Commission vs Daily Subscription)
  const [partnerModelChoice, setPartnerModelChoice] = useState<"commission" | "daily_subscription">(
    activeCity?.partner_model || (activeCity?.partner_settings?.enable_commission ? "commission" : "daily_subscription") || "commission"
  );
  const [commissionRatePct, setCommissionRatePct] = useState<number>(
    activeCity?.partner_commission_pct ?? (activeCity?.partner_settings?.commission_rate ? activeCity.partner_settings.commission_rate * 100 : 15)
  );
  const [dailySubFee, setDailySubFee] = useState<number>(
    activeCity?.partner_daily_subscription_fee ?? activeCity?.partner_settings?.daily_subscription_fee ?? 49
  );

  // Surge state
  const [surgeActive, setSurgeActive] = useState(activeCity?.surge_pricing?.is_active ?? false);
  const [surgeMultiplier, setSurgeMultiplier] = useState(activeCity?.surge_pricing?.multiplier ?? 1.2);
  const [surgeReason, setSurgeReason] = useState(activeCity?.surge_pricing?.reason ?? "Peak Demand");

  // New City Modal
  const [newCityModalOpen, setNewCityModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState("");
  const [newCityState, setNewCityState] = useState("");
  const [newCityLat, setNewCityLat] = useState("19.0760");
  const [newCityLng, setNewCityLng] = useState("72.8777");
  const [newCityPincodes, setNewCityPincodes] = useState("400001, 400050, 400058");
  const [newCityGst, setNewCityGst] = useState(true);
  const [newCityGstRate, setNewCityGstRate] = useState(18);
  const [newCityPlatformFee, setNewCityPlatformFee] = useState(29);
  const [newCityBasePrice, setNewCityBasePrice] = useState(99);
  const [newCityModel, setNewCityModel] = useState<"commission" | "daily_subscription">("commission");
  const [newCityCommission, setNewCityCommission] = useState(15);
  const [newCitySubFee, setNewCitySubFee] = useState(49);

  // City-Level Service Availability Filters & Toggles
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceCatFilter, setServiceCatFilter] = useState("all");

  const isServiceActiveInSelectedCity = (serviceId: string) => {
    if (!activeCity) return true;
    return !(activeCity.disabled_service_ids || []).includes(serviceId);
  };

  const handleToggleCityService = (serviceId: string, currentActive: boolean) => {
    if (!activeCity) return;
    storeApi.adminToggleCityService(activeCity.id, serviceId, !currentActive);
    const s = store.services.find((x) => x.id === serviceId);
    toast.success(
      !currentActive
        ? `"${s?.name || "Service"}" activated in ${activeCity.city_name}`
        : `"${s?.name || "Service"}" disabled in ${activeCity.city_name}`
    );
  };

  const handleToggleAllServicesForCity = (enableAll: boolean) => {
    if (!activeCity) return;
    storeApi.adminToggleAllCityServices(activeCity.id, enableAll);
    toast.success(
      enableAll
        ? `All ${store.services.length} services activated in ${activeCity.city_name}!`
        : `All services paused/disabled in ${activeCity.city_name}!`
    );
  };

  const handleToggleCategoryServicesForCity = (categoryId: string, enableAll: boolean) => {
    if (!activeCity) return;
    storeApi.adminToggleCityCategoryServices(activeCity.id, categoryId, enableAll);
    const cat = store.categories.find((c) => c.id === categoryId);
    toast.success(
      enableAll
        ? `All "${cat?.name}" services enabled in ${activeCity.city_name}`
        : `All "${cat?.name}" services disabled in ${activeCity.city_name}`
    );
  };

  const handleSelectCity = (city: City) => {
    setSelectedCityId(city.id);
    setPolygon(city.polygon);
    setPincodesStr(city.pincodes.join(", "));
    setEnableGst(city.enable_gst_invoice ?? city.customer_settings?.enable_gst ?? true);
    setGstRatePct(city.gst_rate ?? 18);
    setEnablePlatformFee(city.enable_platform_fee ?? city.customer_settings?.enable_platform_fee ?? true);
    setPlatformFeeAmt(city.platform_fee ?? city.customer_settings?.platform_fee_amount ?? 29);
    setEnableBasePrice(city.enable_base_price ?? true);
    setBasePriceAmt(city.base_price ?? 99);
    setPartnerModelChoice(city.partner_model || (city.partner_settings?.enable_commission ? "commission" : "daily_subscription") || "commission");
    setCommissionRatePct(city.partner_commission_pct ?? 15);
    setDailySubFee(city.partner_daily_subscription_fee ?? 49);
    setSurgeActive(city.surge_pricing?.is_active ?? false);
    setSurgeMultiplier(city.surge_pricing?.multiplier ?? 1.2);
    setSurgeReason(city.surge_pricing?.reason ?? "Peak Demand");
  };

  const handleToggleCityActive = (cityId: string, current: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    storeApi.adminToggleCityActive(cityId, !current);
    toast.success(`City status switched to ${!current ? "ACTIVE" : "INACTIVE"}`);
  };

  const handleDeleteCity = (cityId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name} from the ecosystem?`)) {
      storeApi.adminDeleteCity(cityId);
      toast.info(`City "${name}" deleted`);
      if (selectedCityId === cityId && store.cities.length > 1) {
        handleSelectCity(store.cities.find((c) => c.id !== cityId)!);
      }
    }
  };

  const handleSaveAllCitySettings = () => {
    if (!activeCity) return;
    const pins = pincodesStr.split(",").map((p) => p.trim()).filter(Boolean);
    const updated: City = {
      ...activeCity,
      pincodes: pins,
      polygon,
      surge_pricing: {
        is_active: surgeActive,
        multiplier: Number(surgeMultiplier),
        reason: surgeReason,
      },
      enable_gst_invoice: enableGst,
      gst_rate: Number(gstRatePct),
      enable_platform_fee: enablePlatformFee,
      platform_fee: Number(platformFeeAmt),
      enable_base_price: enableBasePrice,
      base_price: Number(basePriceAmt),
      partner_model: partnerModelChoice,
      partner_commission_pct: Number(commissionRatePct),
      partner_daily_subscription_fee: Number(dailySubFee),
      customer_settings: {
        enable_gst: enableGst,
        gst_rate: enableGst ? Number(gstRatePct) : 0,
        enable_platform_fee: enablePlatformFee,
        platform_fee_amount: Number(platformFeeAmt),
        enable_base_price: enableBasePrice,
        base_price_amount: Number(basePriceAmt),
      },
      partner_settings: {
        enable_commission: partnerModelChoice === "commission",
        commission_rate: Number(commissionRatePct) / 100,
        enable_daily_subscription: partnerModelChoice === "daily_subscription",
        daily_subscription_fee: Number(dailySubFee),
      },
    };
    storeApi.adminSaveCity(updated);
    toast.success(`All city settings & toggles saved for ${activeCity.city_name}!`);
  };

  const applyCityPreset = (preset: { name: string; state: string; lat: number; lng: number; pincodes: string }) => {
    setNewCityName(preset.name);
    setNewCityState(preset.state);
    setNewCityLat(preset.lat.toFixed(4));
    setNewCityLng(preset.lng.toFixed(4));
    setNewCityPincodes(preset.pincodes);
  };

  const handleCreateNewCity = () => {
    if (!newCityName.trim() || !newCityState.trim()) {
      toast.error("Please enter city name and state");
      return;
    }
    const lat = Number(newCityLat) || 19.076;
    const lng = Number(newCityLng) || 72.8777;
    const pins = newCityPincodes.split(",").map((p) => p.trim()).filter(Boolean);

    // Initial polygon perimeter around center
    const defaultPoly: [number, number][] = [
      [Number((lat + 0.05).toFixed(4)), Number((lng - 0.05).toFixed(4))],
      [Number((lat + 0.05).toFixed(4)), Number((lng + 0.05).toFixed(4))],
      [Number((lat - 0.05).toFixed(4)), Number((lng + 0.05).toFixed(4))],
      [Number((lat - 0.05).toFixed(4)), Number((lng - 0.05).toFixed(4))],
    ];

    const newCity: City = {
      id: `city_${newCityName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now().toString().slice(-4)}`,
      city_name: newCityName.trim(),
      state: newCityState.trim(),
      is_active: true,
      pincodes: pins,
      center: { lat, lng },
      polygon: defaultPoly,
      surge_pricing: { is_active: false, multiplier: 1.0, reason: "" },
      enable_gst_invoice: newCityGst,
      gst_rate: Number(newCityGstRate),
      enable_platform_fee: true,
      platform_fee: Number(newCityPlatformFee),
      enable_base_price: true,
      base_price: Number(newCityBasePrice),
      base_price_multiplier: 1.0,
      partner_model: newCityModel,
      partner_commission_pct: Number(newCityCommission),
      partner_daily_subscription_fee: Number(newCitySubFee),
      assigned_services: [],
      customer_settings: {
        enable_gst: newCityGst,
        gst_rate: Number(newCityGstRate),
        enable_platform_fee: true,
        platform_fee_amount: Number(newCityPlatformFee),
        enable_base_price: true,
        base_price_amount: Number(newCityBasePrice),
      },
      partner_settings: {
        enable_commission: newCityModel === "commission",
        commission_rate: Number(newCityCommission) / 100,
        enable_daily_subscription: newCityModel === "daily_subscription",
        daily_subscription_fee: Number(newCitySubFee),
      },
      created_at: new Date().toISOString(),
    };

    storeApi.adminSaveCity(newCity);
    handleSelectCity(newCity);
    setNewCityModalOpen(false);
    toast.success(`City "${newCity.city_name}" successfully added to ecosystem!`);
    setNewCityName("");
    setNewCityState("");
  };

  return (
    <div className="space-y-6">
      {/* Title & Add City Action */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-slate-900">
            Geofencing, Cities & Regional Toggles
          </h2>
          <p className="text-xs text-slate-500">
            Manage boundary maps, pincodes, customer GST/platefees toggles, and partner commission/subscription models per city
          </p>
        </div>

        <button
          onClick={() => setNewCityModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#1E3A8A] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#172554] active:scale-98 transition-all"
          data-testid="admin-add-city-btn"
        >
          <Plus className="h-4 w-4" /> Add New City & Boundary Map
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Cities List & City Toggles */}
        <div className="space-y-4">
          {/* Active Cities List with Per-City Toggle */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
                Operational Cities ({store.cities.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-semibold">Har City Toggle</span>
            </div>

            <div className="space-y-2">
              {store.cities.map((c) => {
                const isSelected = c.id === selectedCityId;
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCity(c)}
                    className={`flex items-center justify-between rounded-xl p-3 border transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#1E3A8A] bg-blue-50/70 shadow-xs"
                        : "border-slate-200/80 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-heading text-sm font-bold text-slate-900">{c.city_name}</span>
                        <span className="text-[10px] text-slate-500">({c.state})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span>{c.pincodes.length} pincodes</span>
                        <span>•</span>
                        <span>{c.customer_settings?.enable_gst ? "GST Tax Invoice" : "Non-GST Invoice"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Har City Active/Inactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleCityActive(c.id, c.is_active, e)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase transition-colors ${
                          c.is_active
                            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                            : "bg-slate-200 text-slate-600"
                        }`}
                        title="Toggle City Active/Inactive"
                        data-testid={`city-active-toggle-${c.id}`}
                      >
                        <Power className="h-3 w-3" />
                        <span>{c.is_active ? "Active" : "Paused"}</span>
                      </button>

                      {store.cities.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCity(c.id, c.city_name);
                          }}
                          className="rounded-full p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete City"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* City-wise Customer App Billing Controls */}
          {activeCity && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#1E3A8A]" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
                  Customer Billing Controls · {activeCity.city_name}
                </h3>
              </div>

              {/* GST Tax Invoice vs Non-GST Invoice Toggle */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">GST Tax Invoice Calculation</p>
                    <p className="text-[11px] text-slate-500">
                      {enableGst
                        ? `Tax Invoice: ${gstRatePct}% GST (${gstRatePct / 2}% CGST + ${gstRatePct / 2}% SGST)`
                        : "Non-GST: 0% GST billing with Non-GST bill of supply"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableGst}
                    onChange={(e) => setEnableGst(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1E3A8A] cursor-pointer"
                    data-testid="city-toggle-gst"
                  />
                </div>

                {enableGst && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      GST Rate Percentage (%)
                    </label>
                    <div className="flex items-center gap-2">
                      {[5, 12, 18, 28].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setGstRatePct(rate)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                            gstRatePct === rate
                              ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                      <Input
                        type="number"
                        value={gstRatePct}
                        onChange={(e) => setGstRatePct(Number(e.target.value))}
                        className="h-8 text-xs font-bold w-16"
                      />
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-bold">
                  Active Mode:{" "}
                  <span className={enableGst ? "text-emerald-700" : "text-amber-700"}>
                    {enableGst ? `Tax Invoice with GST (${gstRatePct}%)` : "Non-GST Bill of Supply (0% Tax)"}
                  </span>
                </div>
              </div>

              {/* Platform Fee ("platefees") Toggle & Amount */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Platform Fee (Platefees)</p>
                    <p className="text-[11px] text-slate-500">Customer app convenience / platefees charge</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enablePlatformFee}
                    onChange={(e) => setEnablePlatformFee(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1E3A8A] cursor-pointer"
                    data-testid="city-toggle-platform-fee"
                  />
                </div>

                {enablePlatformFee && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Platform Fee Amount (₹)
                    </label>
                    <Input
                      type="number"
                      value={platformFeeAmt}
                      onChange={(e) => setPlatformFeeAmt(Number(e.target.value))}
                      className="h-9 text-xs font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Base Price / Minimum Fare Toggle & Amount */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Base Price / Minimum Visit Fare</p>
                    <p className="text-[11px] text-slate-500">Minimum technician inspection charge</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableBasePrice}
                    onChange={(e) => setEnableBasePrice(e.target.checked)}
                    className="h-4 w-4 rounded accent-[#1E3A8A] cursor-pointer"
                    data-testid="city-toggle-base-price"
                  />
                </div>

                {enableBasePrice && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Base Visit Fare (₹)
                    </label>
                    <Input
                      type="number"
                      value={basePriceAmt}
                      onChange={(e) => setBasePriceAmt(Number(e.target.value))}
                      className="h-9 text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* City-wise Service Provider (Partner) Controls */}
          {activeCity && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3.5">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-[#F59E0B]" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
                  Service Provider Model · {activeCity.city_name}
                </h3>
              </div>

              {/* Segmented Model Switcher: % Commission vs Daily Subscription */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setPartnerModelChoice("commission")}
                  className={`rounded-xl border p-2.5 cursor-pointer text-xs transition-all ${
                    partnerModelChoice === "commission"
                      ? "border-[#1E3A8A] bg-blue-50/80 font-bold text-[#1E3A8A] ring-1 ring-[#1E3A8A]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>% Commission</span>
                    <Percent className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">
                    Platform takes % of total invoice
                  </p>
                </div>

                <div
                  onClick={() => setPartnerModelChoice("daily_subscription")}
                  className={`rounded-xl border p-2.5 cursor-pointer text-xs transition-all ${
                    partnerModelChoice === "daily_subscription"
                      ? "border-amber-600 bg-amber-50/80 font-bold text-amber-900 ring-1 ring-amber-600"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Daily Pass</span>
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-normal mt-1 leading-tight">
                    Flat daily fee, 0% job commission
                  </p>
                </div>
              </div>

              {/* % Commission Details */}
              {partnerModelChoice === "commission" && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Commission Rate (% of Total Invoice)
                  </label>
                  <div className="flex items-center gap-2">
                    {[10, 15, 18, 20].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setCommissionRatePct(rate)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                          commissionRatePct === rate
                            ? "border-[#1E3A8A] bg-[#1E3A8A] text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                    <Input
                      type="number"
                      value={commissionRatePct}
                      onChange={(e) => setCommissionRatePct(Number(e.target.value))}
                      className="h-8 text-xs font-bold w-16"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Partner receives {100 - commissionRatePct}% of invoice, platform deducts {commissionRatePct}%.
                  </p>
                </div>
              )}

              {/* Daily Subscription Details */}
              {partnerModelChoice === "daily_subscription" && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-700 block">
                    Daily Subscription Fee (₹/day)
                  </label>
                  <div className="flex items-center gap-2">
                    {[29, 49, 79, 99].map((fee) => (
                      <button
                        key={fee}
                        type="button"
                        onClick={() => setDailySubFee(fee)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${
                          dailySubFee === fee
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        ₹{fee}
                      </button>
                    ))}
                    <Input
                      type="number"
                      value={dailySubFee}
                      onChange={(e) => setDailySubFee(Number(e.target.value))}
                      className="h-8 text-xs font-bold w-16"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Partner pays ₹{dailySubFee}/day flat to go online and keeps 100% of job earnings!
                  </p>
                </div>
              )}

              <button
                onClick={handleSaveAllCitySettings}
                className="w-full rounded-xl bg-[#0F172A] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                data-testid="admin-save-city-settings-btn"
              >
                Save All City Toggles for {activeCity.city_name}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Geofence Boundary Map & Pincodes Manager */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {activeCity?.city_name} Interactive Boundary Geofence Map
                </h3>
                <p className="text-xs text-slate-500">
                  Click on the map to add boundary points. Drag or click to configure operational zone perimeter.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPolygon([])}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Clear Points
                </button>
                <button
                  onClick={() => setPolygon(activeCity?.polygon || [])}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </button>
                <button
                  onClick={handleSaveAllCitySettings}
                  className="rounded-xl bg-[#22C55E] px-4 py-1.5 text-xs font-extrabold text-slate-950 shadow-xs hover:bg-emerald-500 flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" /> Save Geofence
                </button>
              </div>
            </div>

            {/* Leaflet Boundary Map */}
            <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200">
              <GeofenceMap
                polygon={polygon}
                onChange={setPolygon}
                center={activeCity?.center}
                others={store.cities.filter((c) => c.id !== activeCity?.id).map((c) => c.polygon)}
                testid="admin-geofence-map"
              />
            </div>

            {/* Pincode & Coordinates Manager */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Serviceable Pincodes ({activeCity?.city_name}) - Comma Separated:
                </label>
                <Input
                  value={pincodesStr}
                  onChange={(e) => setPincodesStr(e.target.value)}
                  placeholder="e.g. 226001, 226010, 226016"
                  className="h-10 text-xs font-mono font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span>Perimeter boundary markers: <b className="text-slate-800">{polygon.length} coordinates</b></span>
                <span>Coordinates: {polygon.slice(0, 3).map((p) => `[${p[0]}, ${p[1]}]`).join(" ")}{polygon.length > 3 ? "..." : ""}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Har City me Saare Service ka Switch Toggle Section */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-5" data-testid="city-services-toggle-container">
        {/* Header & Quick City Selector */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-100 p-2 text-[#1E3A8A]">
                <ToggleRight className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Har City me Saare Service Switch Toggles</span>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#1E3A8A]">
                    {activeCity?.city_name} ({activeCity?.state})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure real-time service availability switches for <strong>{activeCity?.city_name}</strong>. Toggle any individual service or entire categories ON or OFF.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Switch City Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Select City:
            </span>
            {store.cities.map((c) => {
              const isSelected = c.id === activeCity?.id;
              const disabledCount = (c.disabled_service_ids || []).length;
              const activeCount = store.services.length - disabledCount;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelectCity(c)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#1E3A8A] text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                  data-testid={`switch-city-btn-${c.id}`}
                >
                  <span>{c.city_name}</span>
                  <span className={`text-[10px] rounded-full px-1.5 py-0.2 ${isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600"}`}>
                    {activeCount}/{store.services.length} ON
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overview Stats & Global Toggle Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/60 p-4 border border-blue-100">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium">Total Platform Services:</span>
              <p className="font-heading text-base font-extrabold text-slate-900">{store.services.length}</p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 font-medium">Active in {activeCity?.city_name}:</span>
              <p className="font-heading text-base font-extrabold text-emerald-700">
                {store.services.length - (activeCity?.disabled_service_ids || []).length} Services Active
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-slate-500 font-medium">Disabled in {activeCity?.city_name}:</span>
              <p className="font-heading text-base font-extrabold text-rose-600">
                {(activeCity?.disabled_service_ids || []).length} Services Paused
              </p>
            </div>
          </div>

          {/* Master Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggleAllServicesForCity(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold shadow-xs active:scale-98 transition-all"
              data-testid={`enable-all-services-${activeCity?.id}`}
            >
              <CheckCheck className="h-4 w-4" />
              <span>Turn ALL Services ON</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleAllServicesForCity(false)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-700 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs active:scale-98 transition-all"
              data-testid={`disable-all-services-${activeCity?.id}`}
            >
              <Power className="h-4 w-4" />
              <span>Turn ALL Services OFF</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={serviceSearchQuery}
              onChange={(e) => setServiceSearchQuery(e.target.value)}
              placeholder="Search services by name or keyword..."
              className="pl-9 h-9 text-xs"
              data-testid="city-service-search-input"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setServiceCatFilter("all")}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors ${
                serviceCatFilter === "all"
                  ? "bg-[#1E3A8A] text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Trades ({store.services.length})
            </button>
            {store.categories.map((cat) => {
              const catServices = store.services.filter((s) => s.category_id === cat.id);
              const disabledInCat = catServices.filter((s) =>
                (activeCity?.disabled_service_ids || []).includes(s.id)
              ).length;
              const activeInCat = catServices.length - disabledInCat;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setServiceCatFilter(cat.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors flex items-center gap-1 ${
                    serviceCatFilter === cat.id
                      ? "bg-[#1E3A8A] text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] rounded px-1 ${serviceCatFilter === cat.id ? "bg-white/20" : "bg-white text-slate-500"}`}>
                    {activeInCat}/{catServices.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Grouped Services List with Toggles */}
        <div className="space-y-6">
          {store.categories
            .filter((cat) => serviceCatFilter === "all" || serviceCatFilter === cat.id)
            .map((cat) => {
              const servicesInCat = store.services.filter((s) => {
                if (s.category_id !== cat.id) return false;
                if (!serviceSearchQuery.trim()) return true;
                return (
                  s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
                  cat.name.toLowerCase().includes(serviceSearchQuery.toLowerCase())
                );
              });

              if (servicesInCat.length === 0) return null;

              const disabledInCat = servicesInCat.filter((s) =>
                (activeCity?.disabled_service_ids || []).includes(s.id)
              ).length;
              const allCatActive = disabledInCat === 0;

              return (
                <div key={cat.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  {/* Category Header with Category-Level Switch */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-7 w-7 rounded-lg object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-heading text-sm font-bold text-slate-900">{cat.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {servicesInCat.length - disabledInCat} of {servicesInCat.length} services enabled in {activeCity?.city_name}
                        </p>
                      </div>
                    </div>

                    {/* Toggle whole trade switch */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-600">
                        {allCatActive ? "All Active" : disabledInCat === servicesInCat.length ? "All Paused" : "Partial"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleCategoryServicesForCity(cat.id, !allCatActive)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                          allCatActive
                            ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300"
                            : "bg-slate-200 text-slate-700"
                        }`}
                        data-testid={`toggle-category-${cat.id}-${activeCity?.id}`}
                      >
                        <Power className="h-3 w-3" />
                        <span>{allCatActive ? "Disable Trade" : "Enable Trade"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Services Grid with Switch Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {servicesInCat.map((service) => {
                      const isActiveInCity = isServiceActiveInSelectedCity(service.id);
                      return (
                        <div
                          key={service.id}
                          className={`rounded-xl border p-3.5 transition-all flex items-center justify-between gap-3 ${
                            isActiveInCity
                              ? "border-emerald-200 bg-white shadow-2xs hover:border-emerald-300"
                              : "border-slate-200 bg-slate-100/70 opacity-80"
                          }`}
                          data-testid={`city-service-card-${activeCity?.id}-${service.id}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={service.image}
                              alt={service.name}
                              className={`h-12 w-12 rounded-xl object-cover shrink-0 border ${
                                isActiveInCity ? "border-slate-200" : "grayscale border-slate-300"
                              }`}
                            />
                            <div className="min-w-0">
                              <h5 className="font-heading text-xs font-bold text-slate-900 leading-snug truncate">
                                {service.name}
                              </h5>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-extrabold text-[#1E3A8A]">{inr(service.price)}</span>
                                <span>•</span>
                                <span>{service.duration_min} mins</span>
                              </div>
                              <div className="mt-1">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[9px] font-extrabold uppercase ${
                                    isActiveInCity
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      isActiveInCity ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                                    }`}
                                  />
                                  {isActiveInCity ? `Active in ${activeCity?.city_name}` : `Paused in ${activeCity?.city_name}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Individual Switch Toggle */}
                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleCityService(service.id, isActiveInCity)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2 ${
                                isActiveInCity ? "bg-[#22C55E]" : "bg-slate-300"
                              }`}
                              role="switch"
                              aria-checked={isActiveInCity}
                              data-testid={`city-service-toggle-${activeCity?.id}-${service.id}`}
                              title={isActiveInCity ? `Disable in ${activeCity?.city_name}` : `Enable in ${activeCity?.city_name}`}
                            >
                              <span className="sr-only">Toggle {service.name}</span>
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  isActiveInCity ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Add New City Modal */}
      <Dialog open={newCityModalOpen} onOpenChange={setNewCityModalOpen}>
        <DialogContent className="max-w-md" onClose={() => setNewCityModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add New City & Operational Zone</DialogTitle>
          </DialogHeader>
          <div className="space-y-3.5 pt-1 text-xs max-h-[75vh] overflow-y-auto pr-1">
            {/* Quick City Presets */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quick Select Indian City Preset:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777, pincodes: "400001, 400050, 400058" },
                  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567, pincodes: "411001, 411004, 411038" },
                  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873, pincodes: "302001, 302015, 302020" },
                  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714, pincodes: "380001, 380015, 380054" },
                  { name: "Hyderabad", state: "Telangana", lat: 17.385, lng: 78.4867, pincodes: "500001, 500034, 500081" },
                  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639, pincodes: "700001, 700019, 700091" },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyCityPreset(preset)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1E3A8A]"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700">City Name</label>
                <Input
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">State</label>
                <Input
                  value={newCityState}
                  onChange={(e) => setNewCityState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700">Center Latitude</label>
                <Input
                  value={newCityLat}
                  onChange={(e) => setNewCityLat(e.target.value)}
                  placeholder="19.0760"
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Center Longitude</label>
                <Input
                  value={newCityLng}
                  onChange={(e) => setNewCityLng(e.target.value)}
                  placeholder="72.8777"
                  className="mt-1 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700">Serviceable Pincodes (Comma separated)</label>
              <Input
                value={newCityPincodes}
                onChange={(e) => setNewCityPincodes(e.target.value)}
                placeholder="400001, 400050, 400058"
                className="mt-1 font-mono"
              />
            </div>

            {/* City-wise Initial Toggles: GST, Platefees, Base Price, Partner Model */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
              <p className="font-bold text-slate-800">Initial City Configuration & Toggles:</p>

              {/* GST Toggle & Rate */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700">Tax Invoice with GST</span>
                  <p className="text-[10px] text-slate-400">If unchecked, generates Non-GST bill of supply</p>
                </div>
                <input
                  type="checkbox"
                  checked={newCityGst}
                  onChange={(e) => setNewCityGst(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#1E3A8A]"
                />
              </div>

              {newCityGst && (
                <div className="flex items-center justify-between pl-2">
                  <span className="text-slate-600">GST Rate (%)</span>
                  <Input
                    type="number"
                    value={newCityGstRate}
                    onChange={(e) => setNewCityGstRate(Number(e.target.value))}
                    className="h-8 w-20 text-xs font-bold"
                  />
                </div>
              )}

              {/* Platform Fee ("platefees") */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700">Platform Fee (platefees)</span>
                  <p className="text-[10px] text-slate-400">Convenience fee in ₹</p>
                </div>
                <Input
                  type="number"
                  value={newCityPlatformFee}
                  onChange={(e) => setNewCityPlatformFee(Number(e.target.value))}
                  className="h-8 w-20 text-xs font-bold"
                />
              </div>

              {/* Base Price */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-slate-700">Base Price (Fare ₹)</span>
                  <p className="text-[10px] text-slate-400">Minimum inspection charge</p>
                </div>
                <Input
                  type="number"
                  value={newCityBasePrice}
                  onChange={(e) => setNewCityBasePrice(Number(e.target.value))}
                  className="h-8 w-20 text-xs font-bold"
                />
              </div>

              {/* Partner Model Toggle: % Commission vs Daily Subscription */}
              <div className="pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700 block mb-1.5">Service Provider Model:</span>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewCityModel("commission")}
                    className={`py-1.5 rounded-lg border text-xs font-bold ${
                      newCityModel === "commission"
                        ? "border-[#1E3A8A] bg-blue-100 text-[#1E3A8A]"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    % Commission
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewCityModel("daily_subscription")}
                    className={`py-1.5 rounded-lg border text-xs font-bold ${
                      newCityModel === "daily_subscription"
                        ? "border-amber-600 bg-amber-100 text-amber-900"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Daily Subscription
                  </button>
                </div>

                {newCityModel === "commission" ? (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Commission Rate (% of invoice)</span>
                    <Input
                      type="number"
                      value={newCityCommission}
                      onChange={(e) => setNewCityCommission(Number(e.target.value))}
                      className="h-8 w-20 text-xs font-bold"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Daily Subscription Fee (₹/day)</span>
                    <Input
                      type="number"
                      value={newCitySubFee}
                      onChange={(e) => setNewCitySubFee(Number(e.target.value))}
                      className="h-8 w-20 text-xs font-bold"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleCreateNewCity}
              className="mt-3 w-full rounded-xl bg-[#1E3A8A] py-3 text-xs font-bold text-white shadow-md hover:bg-[#172554] transition-all"
            >
              Add City & Generate Boundary Map
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
