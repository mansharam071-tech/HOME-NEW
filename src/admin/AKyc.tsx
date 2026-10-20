import React, { useState } from "react";
import { ShieldCheck, Check, X, Clock, FileText, User } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { User as UserType } from "@/lib/types";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const AKyc: React.FC = () => {
  const store = useStore();
  const partners = store.users.filter((u) => u.role === "partner");

  const [selectedPartner, setSelectedPartner] = useState<UserType | null>(null);
  const [activeDocKey, setActiveDocKey] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");

  const handleUpdateDocStatus = (
    partnerId: string,
    docKey: string,
    status: "approved" | "rejected" | "under_review"
  ) => {
    storeApi.adminUpdateKyc(partnerId, docKey, status, reviewNote || `Marked ${status} by Admin`);
    toast.success(`Document ${docKey} marked as ${status}!`);
    setReviewNote("");
    // refresh partner in modal
    const updated = store.users.find((u) => u.id === partnerId);
    if (updated) setSelectedPartner(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold text-slate-900">Partner KYC Verification Queue</h2>
        <p className="text-xs text-slate-500">Audit government ID credentials, criminal background checks, and driving licenses</p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Partner Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Aadhaar</th>
                <th className="p-3">PAN</th>
                <th className="p-3">DL</th>
                <th className="p-3">Police Check</th>
                <th className="p-3">Overall KYC</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((p) => {
                const docs = p.documents || {};
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600">+91 {p.phone}</td>
                    <td className="p-3">
                      <DocPill status={docs.aadhaar?.status} />
                    </td>
                    <td className="p-3">
                      <DocPill status={docs.pan?.status} />
                    </td>
                    <td className="p-3">
                      <DocPill status={docs.dl?.status} />
                    </td>
                    <td className="p-3">
                      <DocPill status={docs.police?.status} />
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          p.kyc_status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.kyc_status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedPartner(p)}
                        className="rounded-lg bg-[#1E3A8A] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#172554] shadow-2xs"
                      >
                        Inspect Docs
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Inspector Modal */}
      {selectedPartner && (
        <Dialog open={!!selectedPartner} onOpenChange={() => setSelectedPartner(null)}>
          <DialogContent className="max-w-lg" onClose={() => setSelectedPartner(null)}>
            <DialogHeader>
              <DialogTitle>KYC Verification: {selectedPartner.name}</DialogTitle>
              <p className="text-xs text-slate-500">Phone: +91 {selectedPartner.phone} · City: {selectedPartner.city_id}</p>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              {[
                { key: "aadhaar", label: "Aadhaar Card (UIDAI)" },
                { key: "pan", label: "PAN Card (Income Tax Dept)" },
                { key: "dl", label: "Driving License (Transport Dept)" },
                { key: "police", label: "Police Clearance Verification" },
              ].map((item) => {
                const info = selectedPartner.documents?.[item.key];
                return (
                  <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#1E3A8A]" />
                        <span className="font-bold text-slate-900">{item.label}</span>
                      </div>
                      <DocPill status={info?.status} />
                    </div>

                    <div className="flex justify-between text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <span>Doc Number: <b className="font-mono text-slate-800">{info?.number || "Not provided"}</b></span>
                      {info?.expiry_date && <span>Expires: {info.expiry_date}</span>}
                    </div>

                    {info?.note && <p className="text-[11px] text-amber-700 italic">Note: {info.note}</p>}

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateDocStatus(selectedPartner.id, item.key, "approved")}
                        className="flex-1 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleUpdateDocStatus(selectedPartner.id, item.key, "rejected")}
                        className="flex-1 rounded-xl bg-rose-600 py-1.5 text-xs font-bold text-white hover:bg-rose-700 flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const DocPill: React.FC<{ status?: string }> = ({ status = "pending" }) => {
  const isAppr = status === "approved";
  const isRej = status === "rejected";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
        isAppr
          ? "bg-emerald-100 text-emerald-800"
          : isRej
          ? "bg-rose-100 text-rose-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {status}
    </span>
  );
};
