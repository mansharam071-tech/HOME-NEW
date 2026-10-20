import React, { useState } from "react";
import { ArrowLeft, Clock, Calendar, Check, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore, storeApi } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";

export const PSchedule: React.FC = () => {
  const store = useStore();
  const { t } = useLang();
  const nav = useNavigate();
  const partnerId = "usr_demo_partner";
  const partner = store.users.find((u) => u.id === partnerId);

  const [shiftStart, setShiftStart] = useState(partner?.shift?.start || "09:00");
  const [shiftEnd, setShiftEnd] = useState(partner?.shift?.end || "19:00");
  const [offDays, setOffDays] = useState<string[]>(partner?.shift?.off_days || ["Sun"]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const toggleDay = (d: string) => {
    setOffDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleSave = () => {
    if (partner) {
      storeApi.updateUser({
        id: partner.id,
        shift: { start: shiftStart, end: shiftEnd, off_days: offDays },
      });
      toast.success("Work schedule saved successfully!");
    }
  };

  return (
    <div className="flex-1 pb-24 text-slate-900 bg-[#F4F5F7]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#0F172A] px-4 py-3.5 text-white shadow-md">
        <button onClick={() => nav("/partner")} className="rounded-full p-1.5 text-slate-300 hover:bg-slate-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-sm font-extrabold">{t("Schedule")} & Availability</h2>
        <div className="w-8" />
      </div>

      <div className="p-4 space-y-4">
        {/* Working Hours */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-[#1E3A8A]" /> Daily Shift Hours
          </h3>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-bold text-slate-700">Start Time</label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700">End Time</label>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* Weekly Off Days */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[#1E3A8A]" /> Weekly Off-Days
          </h3>
          <p className="text-xs text-slate-500">Select days you are unavailable for automatic job assignment:</p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {days.map((d) => {
              const selected = offDays.includes(d);
              return (
                <button
                  key={d}
                  onClick={() => toggleDay(d)}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all border ${
                    selected
                      ? "border-rose-400 bg-rose-50 text-rose-700 font-extrabold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {d}
                  {selected && <span className="block text-[9px] font-normal">OFF</span>}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#0F172A] py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800"
        >
          <Save className="h-4 w-4" /> Save Schedule Changes
        </button>
      </div>
    </div>
  );
};
