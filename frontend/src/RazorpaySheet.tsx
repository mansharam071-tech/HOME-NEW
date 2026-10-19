import React, { useMemo } from "react";
import { Modal, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "./theme";

export type RzpOrder = { order_id: string; amount: number; currency: string; key_id: string };
type Props = {
  order: RzpOrder; description: string; prefill: { name?: string; contact?: string; email?: string };
  onSuccess: (r: any) => void; onDismiss: () => void; onFailed: () => void;
};

export const checkoutOptions = (order: RzpOrder, description: string, prefill: Props["prefill"]) => ({
  key: order.key_id, amount: Number(order.amount), currency: order.currency, order_id: order.order_id,
  name: "SMARTFIX", description, prefill: { name: prefill.name || "", contact: prefill.contact || "", email: prefill.email || "" },
  theme: { color: colors.brand },
});

/** Native: Razorpay Standard Checkout inside a WebView (works in Expo Go and builds). */
export default function RazorpaySheet({ order, description, prefill, onSuccess, onDismiss, onFailed }: Props) {
  const insets = useSafeAreaInsets();
  const html = useMemo(() => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script></head><body style="background:${colors.surface}"><script>
function send(v){window.ReactNativeWebView.postMessage(JSON.stringify(v));}
var o=${JSON.stringify(checkoutOptions(order, description, prefill)).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/\u2028|\u2029/g, "")};
o.handler=function(r){send({type:'success',data:r});};
o.modal={ondismiss:function(){send({type:'dismissed'});}};
try{var rzp=new Razorpay(o);rzp.on('payment.failed',function(){});rzp.open();}catch(e){send({type:'error'});}
</script></body></html>`, [order, description, prefill]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const v = JSON.parse(e.nativeEvent.data);
      if (v.type === "success") onSuccess(v.data);
      else if (v.type === "dismissed") onDismiss();
      else onFailed();
    } catch { onFailed(); }
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onDismiss}>
      <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: colors.surface }} testID="razorpay-checkout">
        <WebView originWhitelist={["https://*", "about:*"]} source={{ html, baseUrl: "https://checkout.razorpay.com" }} onMessage={onMessage}
          javaScriptEnabled domStorageEnabled startInLoadingState setSupportMultipleWindows={false} />
      </View>
    </Modal>
  );
}
