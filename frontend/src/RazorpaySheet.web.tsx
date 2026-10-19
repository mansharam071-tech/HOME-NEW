import { useEffect } from "react";
import { colors } from "./theme";

export type RzpOrder = { order_id: string; amount: number; currency: string; key_id: string };
type Props = {
  order: RzpOrder; description: string; prefill: { name?: string; contact?: string; email?: string };
  onSuccess: (r: any) => void; onDismiss: () => void; onFailed: () => void;
};

const loadScript = () => new Promise<void>((resolve, reject) => {
  if ((window as any).Razorpay) return resolve();
  const s = document.createElement("script");
  s.src = "https://checkout.razorpay.com/v1/checkout.js";
  s.onload = () => resolve();
  s.onerror = () => reject(new Error("load"));
  document.body.appendChild(s);
});

/** Web preview: Razorpay checkout.js popup. */
export default function RazorpaySheet({ order, description, prefill, onSuccess, onDismiss, onFailed }: Props) {
  useEffect(() => {
    let closed = false;
    loadScript().then(() => {
      const rzp = new (window as any).Razorpay({
        key: order.key_id, amount: Number(order.amount), currency: order.currency, order_id: order.order_id,
        name: "SMARTFIX", description, prefill: { name: prefill.name || "", contact: prefill.contact || "", email: prefill.email || "" },
        theme: { color: colors.brand },
        handler: (r: any) => { closed = true; onSuccess(r); },
        modal: { ondismiss: () => { if (!closed) onDismiss(); } },
      });
      rzp.open();
    }).catch(onFailed);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}
