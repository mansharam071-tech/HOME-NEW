import React, { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Role, User } from "@/lib/types";
import { storeApi, session, DEMO_CUSTOMER, DEMO_PARTNER } from "@/lib/store";

interface OtpLoginProps {
  role: Role;
  title: string;
  subtitle: string;
  accent?: string;
  onDone: (data: { token: string; user: User; is_new?: boolean }) => void;
  hint?: string;
}

export const OtpLogin: React.FC<OtpLoginProps> = ({
  role,
  title,
  subtitle,
  accent = "#1E3A8A",
  onDone,
  hint,
}) => {
  const [phone, setPhone] = useState(role === "partner" ? DEMO_PARTNER.phone : DEMO_CUSTOMER.phone);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);

  const send = () => {
    setBusy(true);
    setTimeout(() => {
      toast.success("OTP sent! Demo mode: use OTP 1234");
      setStep("otp");
      setBusy(false);
    }, 400);
  };

  const verify = () => {
    setBusy(true);
    setTimeout(() => {
      try {
        if (otp !== "1234") {
          toast.error("Invalid OTP. In demo mode, please enter 1234.");
          setBusy(false);
          return;
        }
        const user = storeApi.login(role, phone, otp);
        const token = `token_${role}_${user.id}_${Date.now()}`;
        session.set(role, { token, user });
        toast.success(`Welcome back, ${user.name}!`);
        onDone({ token, user });
      } catch (e: any) {
        toast.error(e.message || "Login failed");
      }
      setBusy(false);
    }, 400);
  };

  const quickDemoLogin = () => {
    const defaultPhone = role === "partner" ? DEMO_PARTNER.phone : DEMO_CUSTOMER.phone;
    setPhone(defaultPhone);
    setOtp("1234");
    const user = storeApi.login(role, defaultPhone, "1234");
    const token = `token_${role}_${user.id}_${Date.now()}`;
    session.set(role, { token, user });
    toast.success(`Logged in as demo ${role} (${user.name})`);
    onDone({ token, user });
  };

  return (
    <div className="flex h-full flex-col">
      <div
        className="relative overflow-hidden px-6 pb-10 pt-12 text-white"
        style={{ background: accent }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 right-16 h-32 w-32 rounded-full bg-[#F59E0B]/30" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">SMARTFIX</p>
        <h1 className="font-heading mt-3 text-3xl font-extrabold leading-tight">{title}</h1>
        <p className="mt-2 text-sm text-white/80">{subtitle}</p>
      </div>

      <div className="-mt-5 flex-1 rounded-t-3xl bg-white px-6 pt-7 shadow-lg flex flex-col justify-between pb-6">
        <div>
          {step === "phone" ? (
            <>
              <label className="text-sm font-semibold text-slate-800">Mobile number</label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 px-3.5 focus-within:border-[#1E3A8A] focus-within:ring-2 focus-within:ring-blue-100">
                <span className="text-[15px] font-semibold text-slate-600">+91</span>
                <input
                  data-testid={`${role}-login-phone-input`}
                  className="h-12 flex-1 bg-transparent text-[15px] font-medium outline-none text-slate-900"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>

              <Button
                data-testid={`${role}-login-send-otp-btn`}
                disabled={phone.length !== 10 || busy}
                onClick={send}
                className="mt-6 h-12 w-full rounded-xl bg-[#F59E0B] text-[15px] font-bold text-slate-950 hover:bg-[#D97706]"
              >
                {busy ? "Sending OTP..." : "Get OTP"}
              </Button>

              <button
                type="button"
                onClick={quickDemoLogin}
                className="mt-4 w-full text-center text-xs font-semibold text-[#1E3A8A] hover:underline"
              >
                ⚡ 1-Click Demo Login ({role === "partner" ? "Ramesh - Partner" : "Aarav - Customer"})
              </button>
            </>
          ) : (
            <>
              <label className="text-sm font-semibold text-slate-800">
                Enter 4-digit OTP sent to +91 {phone}
              </label>
              <Input
                data-testid={`${role}-login-otp-input`}
                className="mt-2 h-12 text-center text-2xl font-bold tracking-[0.5em]"
                maxLength={4}
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••"
                autoFocus
              />
              <p className="mt-2 text-xs text-slate-500">
                Demo mode — use OTP <b className="text-slate-900">1234</b>
              </p>
              <Button
                data-testid={`${role}-login-verify-btn`}
                disabled={otp.length !== 4 || busy}
                onClick={verify}
                className="mt-6 h-12 w-full rounded-xl text-[15px] font-bold text-white"
                style={{ background: accent }}
              >
                {busy ? "Verifying..." : "Verify & Continue"}
              </Button>
              <button
                data-testid={`${role}-login-change-number`}
                className="mt-4 w-full text-sm font-medium text-[#1E3A8A] hover:underline"
                onClick={() => setStep("phone")}
              >
                Change mobile number
              </button>
            </>
          )}

          {hint && (
            <p className="mt-6 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-500 leading-relaxed">
              {hint}
            </p>
          )}
        </div>

        <div className="pt-4 text-center">
          <p className="text-[11px] text-slate-400">
            By proceeding, you agree to SMARTFIX Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
