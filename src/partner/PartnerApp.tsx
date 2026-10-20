import React, { useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, CalendarDays, IndianRupee, UserCog, Siren } from "lucide-react";
import { PhoneFrame } from "@/components/common/Shared";
import { OtpLogin } from "@/components/common/OtpLogin";
import { session, storeApi } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PDashboard } from "./PDashboard";
import { PJob } from "./PJob";
import { PEarnings } from "./PEarnings";
import { PSchedule } from "./PSchedule";
import { PProfile } from "./PProfile";

const NAV = [
  { to: "/partner", icon: Home, label: "Home", end: true },
  { to: "/partner/schedule", icon: CalendarDays, label: "Schedule" },
  { to: "/partner/earnings", icon: IndianRupee, label: "Earnings" },
  { to: "/partner/profile", icon: UserCog, label: "KYC & Profile" },
];

export const PartnerApp: React.FC = () => {
  const [sess, setSess] = useState(session.get("partner"));
  const nav = useNavigate();
  const loc = useLocation();
  const { t } = useLang();
  const [sosOpen, setSosOpen] = useState(false);

  if (!sess && loc.pathname !== "/partner/login") {
    return <Navigate to="/partner/login" replace />;
  }

  const inJob = loc.pathname.includes("/partner/job/");

  const handleSendSos = () => {
    storeApi.sendSos("usr_demo_partner");
    toast.error("🚨 EMERGENCY SOS BROADCAST: Live GPS alert sent to SMARTFIX Control Room!");
    setSosOpen(false);
  };

  return (
    <PhoneFrame tone="partner" testid="partner-app-frame">
      <div className="relative flex-1 overflow-y-auto no-scrollbar flex flex-col bg-[#F4F5F7]">
        <Routes>
          <Route
            path="login"
            element={
              <OtpLogin
                role="partner"
                accent="#0F172A"
                title="Earn more. Work your way."
                subtitle="Partner app for verified SMARTFIX home service professionals."
                hint="Demo Mode: Enter 9000000001 with OTP 1234 to log in as Ramesh Kumar."
                onDone={(d) => {
                  setSess({ token: d.token, user: d.user });
                  nav("/partner");
                }}
              />
            }
          />
          <Route index element={<PDashboard />} />
          <Route path="job/:id" element={<PJob />} />
          <Route path="earnings" element={<PEarnings />} />
          <Route path="schedule" element={<PSchedule />} />
          <Route path="profile" element={<PProfile />} />
        </Routes>

        {/* Floating Emergency SOS Siren Button */}
        {sess && (
          <button
            onClick={() => setSosOpen(true)}
            data-testid="partner-sos-btn"
            className="sos-pulse absolute bottom-20 right-4 z-40 grid h-13 w-13 place-items-center rounded-full bg-[#EF4444] text-white shadow-2xl active:scale-95 transition-transform"
            title="Emergency SOS"
          >
            <Siren className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Bottom Nav Bar */}
      {sess && !inJob && loc.pathname !== "/partner/login" && (
        <nav className="grid grid-cols-4 border-t-2 border-slate-200 bg-white pb-1 pt-1.5 z-30 shrink-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`partner-nav-${n.label.split(" ")[0].toLowerCase()}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-0.5 py-1 text-center text-[10px] font-extrabold leading-tight transition-colors ${
                  isActive ? "text-[#0F172A]" : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              <n.icon className="h-5 w-5" />
              <span>{t(n.label)}</span>
            </NavLink>
          ))}
        </nav>
      )}

      {/* Emergency SOS Confirmation Modal */}
      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogContent className="max-w-xs text-center" onClose={() => setSosOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-rose-600 flex items-center justify-center gap-1.5">
              <Siren className="h-5 w-5" /> Trigger Emergency SOS?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1 text-xs">
            <p className="text-slate-600">
              This will immediately dispatch your live GPS location and distress siren to the SMARTFIX operations safety desk and local emergency channels.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSosOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSos}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 font-bold text-white shadow-md hover:bg-rose-700"
                data-testid="sos-confirm-btn"
              >
                Send SOS
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PhoneFrame>
  );
};
