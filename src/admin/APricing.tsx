import React, { useState } from "react";
import { Plus, Trash2, Zap, Ticket, Percent, ShieldCheck, Check } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { SurgeRule, Coupon } from "@/lib/types";
import { inr } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const APricing: React.FC = () => {
  const store = useStore();
  const [addSurgeOpen, setAddSurgeOpen] = useState(false);
  const [addCouponOpen, setAddCouponOpen] = useState(false);

  // New Surge Rule state
  const [newSurgeName, setNewSurgeName] = useState("");
  const [newSurgeTrigger, setNewSurgeTrigger] = useState<"peak_hours" | "weather" | "high_demand">("peak_hours");
  const [newSurgeMultiplier, setNewSurgeMultiplier] = useState(1.3);
  const [newSurgeCityId, setNewSurgeCityId] = useState("all");

  // New Coupon state
  const [newCpnCode, setNewCpnCode] = useState("");
  const [newCpnDesc, setNewCpnDesc] = useState("");
  const [newCpnType, setNewCpnType] = useState<"percent" | "flat">("percent");
  const [newCpnVal, setNewCpnVal] = useState(25);
  const [newCpnMaxDisc, setNewCpnMaxDisc] = useState<number | null>(250);
  const [newCpnMinOrder, setNewCpnMinOrder] = useState(499);

  // Commission Settings
  const [defaultComm, setDefaultComm] = useState(store.commissionSettings.default_rate * 100);

  const handleCreateSurge = () => {
    if (!newSurgeName.trim()) {
      toast.error("Please enter rule name");
      return;
    }
    const rule: SurgeRule = {
      id: `surge_${Date.now()}`,
      name: newSurgeName.trim(),
      trigger: newSurgeTrigger,
      multiplier: Number(newSurgeMultiplier),
      city_id: newSurgeCityId,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    storeApi.adminSaveSurgeRule(rule);
    toast.success("New surge rule saved!");
    setNewSurgeName("");
    setAddSurgeOpen(false);
  };

  const handleCreateCoupon = () => {
    if (!newCpnCode.trim()) {
      toast.error("Please enter coupon code");
      return;
    }
    const coupon: Coupon = {
      id: `cpn_${Date.now()}`,
      code: newCpnCode.trim().toUpperCase(),
      description: newCpnDesc.trim() || `${newCpnVal}% discount`,
      discount_type: newCpnType,
      value: Number(newCpnVal),
      max_discount: newCpnMaxDisc,
      min_order: Number(newCpnMinOrder),
      city_ids: [],
      category_ids: [],
      usage_limit: 1000,
      used_count: 0,
      first_order_only: false,
      valid_till: "2027-12-31",
      is_active: true,
      created_at: new Date().toISOString(),
    };
    storeApi.adminSaveCoupon(coupon);
    toast.success(`Coupon ${coupon.code} activated!`);
    setNewCpnCode("");
    setAddCouponOpen(false);
  };

  const handleSaveCommission = () => {
    storeApi.adminSaveCommissionSettings({
      ...store.commissionSettings,
      default_rate: defaultComm / 100,
    });
    toast.success("Platform commission rates saved!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold text-slate-900">Surge Pricing & Promotions</h2>
        <p className="text-xs text-slate-500">Manage dynamic demand multipliers, promotional discount vouchers, and commission rates</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Dynamic Surge Rules Manager */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-[#F59E0B]" /> Dynamic Surge Rules
              </h3>
              <p className="text-xs text-slate-500">Automated price adjustments for high demand or weather</p>
            </div>
            <button
              onClick={() => setAddSurgeOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-[#1E3A8A] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#172554]"
            >
              <Plus className="h-3.5 w-3.5" /> Add Rule
            </button>
          </div>

          <div className="space-y-2.5">
            {store.surgeRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900">{rule.name}</p>
                    <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-bold text-amber-900">
                      {rule.multiplier}x
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Trigger: <span className="font-semibold">{rule.trigger.replace("_", " ")}</span> · City: {rule.city_id}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rule.is_active}
                    onChange={(e) => {
                      storeApi.adminSaveSurgeRule({ ...rule, is_active: e.target.checked });
                      toast.info(`Surge rule ${rule.name} ${e.target.checked ? "activated" : "paused"}`);
                    }}
                    className="h-4 w-4 rounded accent-[#1E3A8A]"
                    title="Toggle active"
                  />
                  <button
                    onClick={() => {
                      storeApi.adminDeleteSurgeRule(rule.id);
                      toast.info("Surge rule removed");
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotional Coupons Manager */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Ticket className="h-4 w-4 text-emerald-600" /> Promo Coupons
              </h3>
              <p className="text-xs text-slate-500">Discount codes valid for consumer checkout</p>
            </div>
            <button
              onClick={() => setAddCouponOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-[#1E3A8A] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#172554]"
            >
              <Plus className="h-3.5 w-3.5" /> Create Coupon
            </button>
          </div>

          <div className="space-y-2.5">
            {store.coupons.map((cpn) => (
              <div
                key={cpn.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-[#1E3A8A] text-sm">{cpn.code}</span>
                    <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                      {cpn.discount_type === "percent" ? `${cpn.value}% OFF` : `₹${cpn.value} FLAT`}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">{cpn.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Used: {cpn.used_count} times</p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cpn.is_active}
                    onChange={(e) => {
                      storeApi.adminSaveCoupon({ ...cpn, is_active: e.target.checked });
                    }}
                    className="h-4 w-4 rounded accent-[#1E3A8A]"
                    title="Toggle coupon"
                  />
                  <button
                    onClick={() => {
                      storeApi.adminDeleteCoupon(cpn.id);
                      toast.info("Coupon deleted");
                    }}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform Commission Rate Configuration */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4 max-w-xl text-xs">
        <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-1.5">
          <Percent className="h-4 w-4 text-slate-600" /> Platform Commission Policy
        </h3>
        <p className="text-slate-500">
          The platform deducts this percentage on the taxable subtotal of every completed service.
        </p>
        <div className="flex items-center gap-3">
          <div className="w-48">
            <label className="font-bold text-slate-700 block mb-1">Default Cut (%)</label>
            <Input
              type="number"
              value={defaultComm}
              onChange={(e) => setDefaultComm(Number(e.target.value))}
              className="h-10 text-sm font-bold"
            />
          </div>
          <button
            onClick={handleSaveCommission}
            className="mt-5 rounded-xl bg-[#0F172A] px-5 py-2.5 font-bold text-white shadow-xs hover:bg-slate-800"
          >
            Update Commission Rate
          </button>
        </div>
      </div>

      {/* Add Surge Rule Modal */}
      <Dialog open={addSurgeOpen} onOpenChange={setAddSurgeOpen}>
        <DialogContent className="max-w-xs" onClose={() => setAddSurgeOpen(false)}>
          <DialogHeader>
            <DialogTitle>Add Surge Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="font-bold text-slate-700">Rule Name</label>
              <Input
                value={newSurgeName}
                onChange={(e) => setNewSurgeName(e.target.value)}
                placeholder="e.g. Festival Surge"
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Trigger Type</label>
              <select
                value={newSurgeTrigger}
                onChange={(e) => setNewSurgeTrigger(e.target.value as any)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold"
              >
                <option value="peak_hours">Peak Hours</option>
                <option value="weather">Weather (Rain/Heat)</option>
                <option value="high_demand">High Demand Zone</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700">Multiplier (e.g. 1.3)</label>
              <Input
                type="number"
                step="0.1"
                value={newSurgeMultiplier}
                onChange={(e) => setNewSurgeMultiplier(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <button
              onClick={handleCreateSurge}
              className="mt-2 w-full rounded-xl bg-[#1E3A8A] py-2.5 font-bold text-white shadow-sm hover:bg-[#172554]"
            >
              Save Rule
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Coupon Modal */}
      <Dialog open={addCouponOpen} onOpenChange={setAddCouponOpen}>
        <DialogContent className="max-w-xs" onClose={() => setAddCouponOpen(false)}>
          <DialogHeader>
            <DialogTitle>Create Coupon</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1 text-xs">
            <div>
              <label className="font-bold text-slate-700">Coupon Code</label>
              <Input
                value={newCpnCode}
                onChange={(e) => setNewCpnCode(e.target.value.toUpperCase())}
                placeholder="e.g. DIWALI100"
                className="mt-1 font-mono font-bold uppercase"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Discount Type</label>
              <select
                value={newCpnType}
                onChange={(e) => setNewCpnType(e.target.value as any)}
                className="mt-1 h-10 w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold"
              >
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700">Value ({newCpnType === "percent" ? "%" : "₹"})</label>
              <Input
                type="number"
                value={newCpnVal}
                onChange={(e) => setNewCpnVal(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Min Order Value (₹)</label>
              <Input
                type="number"
                value={newCpnMinOrder}
                onChange={(e) => setNewCpnMinOrder(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            <button
              onClick={handleCreateCoupon}
              className="mt-2 w-full rounded-xl bg-[#1E3A8A] py-2.5 font-bold text-white shadow-sm hover:bg-[#172554]"
            >
              Activate Coupon
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
