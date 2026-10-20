import React, { useState } from "react";
import { ArrowLeft, User, Phone, Mail, MapPin, Globe, Bell, LogOut, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore, storeApi, session } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

export const CProfile: React.FC = () => {
  const store = useStore();
  const { lang, setLang, t } = useLang();
  const nav = useNavigate();
  const customerId = "usr_demo_customer";
  const user = store.users.find((u) => u.id === customerId);

  const [name, setName] = useState(user?.name || "Aarav Sharma");
  const [email, setEmail] = useState(user?.email || "aarav@example.com");

  const addresses = store.addresses.filter((a) => a.user_id === customerId);

  const handleSave = () => {
    storeApi.updateUser({ id: customerId, name, email });
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    session.clear("customer");
    toast.info("Logged out from Customer App");
    nav("/app/login");
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
        <h2 className="font-heading text-base font-bold text-slate-900">{t("Profile")}</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* User Avatar Card */}
        <div className="flex items-center gap-4 rounded-3xl bg-white p-5 border border-slate-200/80 shadow-2xs">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#1E3A8A] text-white font-heading font-extrabold text-2xl shadow-sm">
            {user?.name?.[0] || "A"}
          </div>
          <div>
            <h3 className="font-heading text-base font-extrabold text-slate-900">{user?.name}</h3>
            <p className="text-xs text-slate-500">+91 {user?.phone}</p>
            <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Verified Customer
            </span>
          </div>
        </div>

        {/* Edit Information */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Personal Details
          </h4>
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#1E3A8A]"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-900 outline-none focus:border-[#1E3A8A]"
            />
          </div>
          <button
            onClick={handleSave}
            className="rounded-xl bg-[#1E3A8A] px-4 py-2 text-xs font-bold text-white hover:bg-[#172554] shadow-xs"
          >
            Save Changes
          </button>
        </div>

        {/* Language Preferences */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-2.5">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5" /> Language Preference
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setLang("en");
                toast.success("Switched language to English");
              }}
              className={`flex items-center justify-between rounded-xl p-3 border text-xs font-bold transition-all ${
                lang === "en" ? "border-[#1E3A8A] bg-blue-50/70 text-[#1E3A8A]" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span>English</span>
              {lang === "en" && <Check className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                setLang("hi");
                toast.success("भाषा बदलकर हिन्दी कर दी गई है");
              }}
              className={`flex items-center justify-between rounded-xl p-3 border text-xs font-bold transition-all ${
                lang === "hi" ? "border-[#1E3A8A] bg-blue-50/70 text-[#1E3A8A]" : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              <span>हिन्दी (Hindi)</span>
              {lang === "hi" && <Check className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Saved Addresses List */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" /> Saved Addresses
          </h4>
          <div className="space-y-2">
            {addresses.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{a.label}</span>
                  {a.is_default && (
                    <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-[#1E3A8A]">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-slate-600">{a.line}, {a.city} - {a.pincode}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          data-testid="customer-logout-btn"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};
