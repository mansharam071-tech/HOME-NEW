import React, { useState } from "react";
import { ArrowLeft, UserCheck, ShieldCheck, FileCheck, Upload, LogOut, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore, storeApi, session } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const PProfile: React.FC = () => {
  const store = useStore();
  const { t, lang, setLang } = useLang();
  const nav = useNavigate();
  const partnerId = "usr_demo_partner";
  const partner = store.users.find((u) => u.id === partnerId);

  const [uploadDocType, setUploadDocType] = useState<string | null>(null);
  const [docNumber, setDocNumber] = useState("");

  const docs = partner?.documents || {};

  const handleUploadSubmit = () => {
    if (!uploadDocType || !partner) return;
    storeApi.adminUpdateKyc(partner.id, uploadDocType, "pending", "Document re-uploaded by partner");
    toast.success("Document uploaded! Under verification by operations.");
    setUploadDocType(null);
  };

  const handleLogout = () => {
    session.clear("partner");
    toast.info("Logged out from Partner App");
    nav("/partner/login");
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F4F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0F172A] px-4 py-3.5 text-white shadow-md">
        <button onClick={() => nav("/partner")} className="rounded-full p-1.5 text-slate-300 hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-sm font-extrabold">{t("KYC & Profile")}</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#0F172A] text-white font-heading font-extrabold text-2xl shadow-sm">
            {partner?.name?.[0] || "P"}
          </div>
          <div>
            <h3 className="font-heading text-base font-extrabold text-slate-900">{partner?.name}</h3>
            <p className="text-xs text-slate-500">+91 {partner?.phone}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                KYC {partner?.kyc_status}
              </span>
              <span className="text-xs text-amber-600 font-bold">★ {partner?.rating || 4.8}</span>
            </div>
          </div>
        </div>

        {/* Verified Skills */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2.5">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Registered Category Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {partner?.skills?.map((catId) => {
              const cat = store.categories.find((c) => c.id === catId);
              return (
                <span
                  key={catId}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
                >
                  {cat?.name || catId}
                </span>
              );
            })}
          </div>
        </div>

        {/* KYC Verification Documents */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
              Government Documents
            </h4>
            <span className="text-[10px] font-bold text-slate-400">4 of 4 Verified</span>
          </div>

          <div className="space-y-2.5">
            {[
              { key: "aadhaar", label: "Aadhaar Card (UIDAI)" },
              { key: "pan", label: "PAN Card (NSDL)" },
              { key: "dl", label: "Driving License (Transport Dept)" },
              { key: "police", label: "Police Clearance Verification" },
            ].map((doc) => {
              const info = docs[doc.key];
              return (
                <div key={doc.key} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{doc.label}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        info?.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : info?.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {info?.status || "Pending"}
                    </span>
                  </div>
                  <p className="font-mono text-slate-600 font-medium">{info?.number || "Not provided"}</p>
                  {info?.note && <p className="text-[11px] text-amber-700">{info.note}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Language Preference */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2.5">
          <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">
            Language Preference
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setLang("en");
                toast.success("Language set to English");
              }}
              className={`rounded-xl p-2.5 text-xs font-bold border transition-all ${
                lang === "en" ? "border-[#0F172A] bg-slate-100 text-slate-900" : "border-slate-200 text-slate-600"
              }`}
            >
              English
            </button>
            <button
              onClick={() => {
                setLang("hi");
                toast.success("भाषा बदलकर हिन्दी कर दी गई है");
              }}
              className={`rounded-xl p-2.5 text-xs font-bold border transition-all ${
                lang === "hi" ? "border-[#0F172A] bg-slate-100 text-slate-900" : "border-slate-200 text-slate-600"
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100"
          data-testid="partner-logout-btn"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
};
