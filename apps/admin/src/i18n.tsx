import React, { createContext, useContext } from "react";
// @ts-ignore - plain JS dictionary shared with the web admin panel
import { HI_ADMIN, ADMIN_PATTERNS } from "./i18n_admin";

const EXTRA: Record<string, string> = {
  Home: "होम", Bookings: "बुकिंग", Partners: "पार्टनर", More: "और",
  "Admin console": "एडमिन कंसोल", "Sign in": "साइन इन करें", Email: "ईमेल", Password: "पासवर्ड",
  "Enter email and password": "ईमेल और पासवर्ड डालें", "SMARTFIX Ops": "SMARTFIX ऑप्स",
  "Manage bookings, partners, cities and payouts on the go.": "चलते-फिरते बुकिंग, पार्टनर, शहर और पेआउट संभालें।",
  "Good day,": "नमस्ते,", "Failed to load": "लोड नहीं हो पाया", Retry: "फिर से कोशिश करें",
  Daily: "दैनिक", Weekly: "साप्ताहिक", Bookings_: "बुकिंग", "See all": "सभी देखें",
  Pending: "लंबित", Assigned: "असाइन", "En Route": "रास्ते में", "In Progress": "काम जारी", Completed: "पूरा", Cancelled: "रद्द", "Payment Pending": "भुगतान बाकी", All: "सभी",
  "Cancel booking": "बुकिंग रद्द करें", "Cancel with full refund?": "पूरे रिफ़ंड के साथ रद्द करें?", "Yes, cancel": "हाँ, रद्द करें", "Keep booking": "बुकिंग रखें",
  "Booking details": "बुकिंग विवरण", Partner: "पार्टनर", Amount: "राशि", Payment: "भुगतान", Address: "पता",
  "Choose partner": "पार्टनर चुनें", "No partners available": "कोई पार्टनर उपलब्ध नहीं",
  "KYC": "केवाईसी", Payouts: "पेआउट", "Search": "खोजें", "Alerts": "अलर्ट", Language: "भाषा", Logout: "लॉग आउट",
  "Cities & Geofencing": "शहर और जियोफ़ेंसिंग", "Surge & Coupons": "सर्ज और कूपन", "Finance & Settlements": "वित्त और सेटलमेंट",
  "Notifications & red alerts": "सूचनाएँ और रेड अलर्ट", "Global search": "ग्लोबल खोज", "हिंदी": "हिंदी", English: "English",
  "Pincodes": "पिनकोड", "Add": "जोड़ें", "Paste CSV text with pincodes": "पिनकोड वाला CSV टेक्स्ट चिपकाएँ", "Upload CSV text": "CSV टेक्स्ट अपलोड करें",
  "Delete city": "शहर हटाएँ", "Show JSON": "JSON दिखाएँ", "Hide JSON": "JSON छिपाएँ", Multiplier: "गुणक", Reason: "कारण",
  "Surge rules": "सर्ज नियम", Coupons: "कूपन", Trigger: "ट्रिगर", "Discount type": "छूट का प्रकार", "Valid till (YYYY-MM-DD)": "तक मान्य (YYYY-MM-DD)",
  Settlements: "सेटलमेंट", Invoices: "इनवॉइस", "Customer GST invoice": "ग्राहक जीएसटी इनवॉइस", Total: "कुल", Close: "बंद करें",
  "Polygon geofence points are kept as drawn on the web console.": "पॉलीगॉन जियोफ़ेंस बिंदु वेब कंसोल जैसे ही रहते हैं।",
  Documents: "दस्तावेज़", "Type at least 2 characters": "कम से कम 2 अक्षर लिखें", Users: "उपयोगकर्ता", Cities: "शहर",
  "Unread alerts": "अलर्ट", "Logged in as": "लॉग इन", "Bank": "बैंक", Approve: "स्वीकार करें", Accept: "स्वीकार करें", Resubmit: "फिर से माँगें",
  "Driving Licence": "ड्राइविंग लाइसेंस", "Police Verification": "पुलिस सत्यापन", "SOS emergencies": "SOS आपातकाल", Cancel: "रद्द करें",
  "Rate": "दर", "Operations": "ऑपरेशंस", "Account": "खाता", "Pull down to refresh": "रीफ़्रेश के लिए नीचे खींचें",
};

const DICT: Record<string, string> = { ...HI_ADMIN, ...EXTRA };

export const translate = (s: string, lang: string): string => {
  if (lang !== "hi" || !s) return s;
  const trimmed = s.trim();
  if (DICT[trimmed]) return s.replace(trimmed, DICT[trimmed]);
  for (const [re, rep] of ADMIN_PATTERNS as [RegExp, any][]) {
    if (re.test(trimmed)) return trimmed.replace(re, rep);
  }
  return s;
};

const LangCtx = createContext<{ lang: string; t: (s: string) => string }>({ lang: "en", t: (s) => s });

export const LangProvider = ({ lang, children }: { lang: string; children: React.ReactNode }) => (
  <LangCtx.Provider value={{ lang, t: (s: string) => translate(s, lang) }}>{children}</LangCtx.Provider>
);

export const useLang = () => useContext(LangCtx);
