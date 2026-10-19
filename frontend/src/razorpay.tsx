import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { api } from "./api";
import RazorpaySheet, { RzpOrder } from "./RazorpaySheet";
import { useAuth } from "./auth";

type Result = "paid" | "dismissed" | "failed";
const Ctx = createContext<(order: RzpOrder, description: string) => Promise<Result>>(async () => "failed");

/** Opens Razorpay Standard Checkout (WebView on phones, checkout.js on web) and verifies on the server. */
export const RazorpayProvider = ({ children }: { children: React.ReactNode }) => {
  const { session } = useAuth();
  const [job, setJob] = useState<{ order: RzpOrder; description: string } | null>(null);
  const resolver = useRef<((r: Result) => void) | null>(null);

  const pay = useCallback((order: RzpOrder, description: string) => new Promise<Result>((resolve) => {
    resolver.current = resolve;
    setJob({ order, description });
  }), []);

  const done = (r: Result) => { setJob(null); resolver.current?.(r); resolver.current = null; };

  const onSuccess = async (resp: any) => {
    try {
      await api("/payments/verify", { method: "POST", body: {
        razorpay_order_id: resp.razorpay_order_id, razorpay_payment_id: resp.razorpay_payment_id, razorpay_signature: resp.razorpay_signature,
      } });
      done("paid");
    } catch { done("failed"); }
  };
  const onDismiss = async () => {
    if (job) await api("/payments/cancel", { method: "POST", body: { order_id: job.order.order_id, reason: "Checkout closed by customer" } }).catch(() => {});
    done("dismissed");
  };
  const onFailed = () => done("failed");

  return (
    <Ctx.Provider value={pay}>
      {children}
      {job && <RazorpaySheet order={job.order} description={job.description} prefill={{ name: session?.user?.name, contact: session?.user?.phone, email: session?.user?.email }}
        onSuccess={onSuccess} onDismiss={onDismiss} onFailed={onFailed} />}
    </Ctx.Provider>
  );
};

export const useRazorpay = () => useContext(Ctx);

/** Shared toast text for payment results. */
export const payMessage = (r: Result) =>
  r === "paid" ? "Payment successful" : r === "dismissed" ? "Payment cancelled" : "Payment failed or could not be verified";
