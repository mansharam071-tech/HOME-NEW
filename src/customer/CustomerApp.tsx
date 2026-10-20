import React, { useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, CalendarCheck, Wallet, LifeBuoy, User } from "lucide-react";
import { PhoneFrame } from "@/components/common/Shared";
import { OtpLogin } from "@/components/common/OtpLogin";
import { session } from "@/lib/store";
import { useLang } from "@/lib/i18n";
import { CHome } from "./CHome";
import { CServices } from "./CServices";
import { CServiceDetail } from "./CServiceDetail";
import { CCheckout } from "./CCheckout";
import { CBookings } from "./CBookings";
import { CTracking } from "./CTracking";
import { CWallet } from "./CWallet";
import { CProfile } from "./CProfile";
import { CSupport } from "./CSupport";

const NAV = [
  { to: "/app", icon: Home, label: "Home", end: true },
  { to: "/app/bookings", icon: CalendarCheck, label: "Bookings" },
  { to: "/app/wallet", icon: Wallet, label: "Wallet" },
  { to: "/app/support", icon: LifeBuoy, label: "Help" },
  { to: "/app/profile", icon: User, label: "Profile" },
];

export const CustomerApp: React.FC = () => {
  const [sess, setSess] = useState(session.get("customer"));
  const nav = useNavigate();
  const loc = useLocation();
  const { t } = useLang();

  if (!sess && loc.pathname !== "/app/login") {
    return <Navigate to="/app/login" replace />;
  }

  const hideBottomNav =
    loc.pathname === "/app/login" ||
    loc.pathname.includes("/service/") ||
    loc.pathname.includes("/checkout") ||
    loc.pathname.includes("/booking/");

  return (
    <PhoneFrame tone="light" testid="customer-app-frame">
      <div className="relative flex-1 overflow-y-auto no-scrollbar flex flex-col">
        <Routes>
          <Route
            path="login"
            element={
              <OtpLogin
                role="customer"
                title="Home services, done right."
                subtitle="Verified professionals at your doorstep in 30 minutes."
                hint="New here? Any 10-digit mobile number logs you in instantly with OTP 1234."
                onDone={(d) => {
                  setSess({ token: d.token, user: d.user });
                  nav("/app");
                }}
              />
            }
          />
          <Route index element={<CHome />} />
          <Route path="services" element={<CServices />} />
          <Route path="service/:id" element={<CServiceDetail />} />
          <Route path="checkout" element={<CCheckout />} />
          <Route path="bookings" element={<CBookings />} />
          <Route path="booking/:id" element={<CTracking />} />
          <Route path="wallet" element={<CWallet />} />
          <Route path="profile" element={<CProfile />} />
          <Route path="support" element={<CSupport />} />
        </Routes>
      </div>

      {sess && !hideBottomNav && (
        <nav className="grid grid-cols-5 border-t border-slate-200 bg-white px-1 pb-1 pt-1.5 z-30 shrink-0">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`customer-nav-${n.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] font-bold transition-colors ${
                  isActive ? "text-[#1E3A8A]" : "text-slate-400 hover:text-slate-600"
                }`
              }
            >
              <n.icon className="h-5 w-5" />
              <span>{t(n.label)}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </PhoneFrame>
  );
};
