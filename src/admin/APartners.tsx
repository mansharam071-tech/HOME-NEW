import React, { useState } from "react";
import { Users, Siren, AlertTriangle, CheckCircle, RefreshCcw, DollarSign, MapPin, Star } from "lucide-react";
import { useStore, storeApi } from "@/lib/store";
import { inr, fmtDT } from "@/lib/utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const APartners: React.FC = () => {
  const store = useStore();
  const partners = store.users.filter((u) => u.role === "partner");
  const activeSos = store.sosAlerts.filter((s) => s.status === "active");

  const handleResolveSos = (alertId: string) => {
    storeApi.resolveSos(alertId);
    toast.success("SOS incident resolved and marked closed.");
  };

  const handleCollectCod = (partnerId: string) => {
    storeApi.adminCollectCod(partnerId);
    toast.success("COD cash balance recorded as collected!");
  };

  const handleResetRejections = (partnerId: string) => {
    storeApi.adminResetPartnerRejections(partnerId);
    toast.success("Consecutive rejection penalties reset!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-extrabold text-slate-900">Partner Fleet & Safety Desk</h2>
        <p className="text-xs text-slate-500">Monitor live technicians, resolve emergency SOS sirens, and manage cash-on-delivery limits</p>
      </div>

      {/* Emergency SOS Alerts Section */}
      {activeSos.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-500 bg-rose-50/80 p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-heading font-extrabold text-sm">
            <Siren className="h-5 w-5 animate-bounce text-rose-600" /> Active Emergency Distress Calls ({activeSos.length})
          </div>

          <div className="space-y-2.5">
            {activeSos.map((sos) => (
              <div
                key={sos.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl bg-white p-4 border border-rose-200 shadow-xs"
              >
                <div>
                  <h4 className="font-heading font-extrabold text-sm text-slate-900">{sos.partner_name}</h4>
                  <p className="text-xs text-slate-600">Mobile: +91 {sos.partner_phone} · Triggered: {fmtDT(sos.created_at)}</p>
                  <p className="text-xs font-mono text-rose-700 mt-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-600" /> Lat: {sos.location.lat.toFixed(4)}, Lng: {sos.location.lng.toFixed(4)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`https://maps.google.com/?q=${sos.location.lat},${sos.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                  >
                    Open GPS Coordinates
                  </a>
                  <button
                    onClick={() => handleResolveSos(sos.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-emerald-700"
                  >
                    Resolve Alert
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technicians Table */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Partner Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Rating</th>
                <th className="p-3">Jobs Completed</th>
                <th className="p-3">COD Cash in Hand</th>
                <th className="p-3">Rejection Streak</th>
                <th className="p-3">City</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((p) => {
                const isCodOver = (p.cod_cash || 0) >= (p.cod_limit || 3000);
                const isHighRej = (p.consecutive_rejections || 0) >= 3;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400">+91 {p.phone}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          p.is_online ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${p.is_online ? "bg-emerald-600" : "bg-slate-400"}`} />
                        {p.is_online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-600">★ {p.rating || 4.8}</td>
                    <td className="p-3 font-semibold text-slate-800">{p.jobs_done || 0}</td>
                    <td className="p-3">
                      <span className={`font-mono font-bold ${isCodOver ? "text-rose-600" : "text-slate-800"}`}>
                        {inr(p.cod_cash || 0)}
                      </span>
                      <span className="text-slate-400 text-[10px]"> / {inr(p.cod_limit || 3000)}</span>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${isHighRej ? "text-rose-600" : "text-slate-700"}`}>
                        {p.consecutive_rejections || 0} rejects
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{p.city_id}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {(p.cod_cash || 0) > 0 && (
                          <button
                            onClick={() => handleCollectCod(p.id)}
                            className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                            title="Collect COD Cash"
                          >
                            Collect Cash
                          </button>
                        )}
                        {(p.consecutive_rejections || 0) > 0 && (
                          <button
                            onClick={() => handleResetRejections(p.id)}
                            className="rounded-lg bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] font-bold text-[#1E3A8A] hover:bg-blue-100"
                            title="Reset Rejection Streak"
                          >
                            Reset Rejects
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
