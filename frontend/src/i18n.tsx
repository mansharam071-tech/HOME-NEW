import React, { createContext, useContext } from "react";
// @ts-ignore - plain JS dictionary shared with the web customer app
import { HI, PATTERNS } from "./i18n_customer";

const EXTRA: Record<string, string> = {
  Home: "होम", Bookings: "बुकिंग", Wallet: "वॉलेट", Profile: "प्रोफ़ाइल",
  "Mobile number": "मोबाइल नंबर", "Get OTP": "OTP पाएँ", "Verify & Continue": "जाँचें और आगे बढ़ें", "Change number": "नंबर बदलें",
  "Demo mode — use OTP 1234": "डेमो मोड — OTP 1234 इस्तेमाल करें", "Home services, done right.": "घरेलू सेवाएँ, सही तरीके से।",
  "Verified professionals at your doorstep in 30 minutes.": "30 मिनट में आपके दरवाज़े पर सत्यापित पेशेवर।",
  "New here? Any valid mobile number creates your account instantly.": "नए हैं? कोई भी मान्य मोबाइल नंबर तुरंत आपका खाता बना देता है।",
  "Help & Support": "मदद और सहायता", "Live chatbot": "लाइव चैटबॉट", "Type your question": "अपना सवाल लिखें", "My tickets": "मेरे टिकट", "No tickets yet": "अभी कोई टिकट नहीं",
  "Raise support ticket": "सहायता टिकट बनाएँ", "My bookings": "मेरी बुकिंग", "No bookings yet": "अभी कोई बुकिंग नहीं", "One-click Re-book": "एक क्लिक में फिर से बुक करें",
  Transactions: "लेन-देन", "No transactions yet": "अभी कोई लेन-देन नहीं", "Cashbacks, refunds & promo rewards live here": "कैशबैक, रिफ़ंड और प्रोमो इनाम यहाँ मिलते हैं",
  "Save profile": "प्रोफ़ाइल सेव करें", "Full name": "पूरा नाम", Email: "ईमेल", Notifications: "सूचनाएँ", "Saved addresses": "सहेजे गए पते", "+ Add": "+ जोड़ें",
  "Use for booking": "बुकिंग के लिए इस्तेमाल करें", Logout: "लॉग आउट", Language: "भाषा", "Push alerts": "पुश अलर्ट", "Sms alerts": "SMS अलर्ट", "Offers & promotions": "ऑफ़र और प्रमोशन",
  "Add address": "पता जोड़ें", "Detect via GPS": "GPS से पता लगाएँ", "House / flat, street, area": "मकान / फ़्लैट, गली, इलाका", "Pincode (e.g. 226001)": "पिनकोड (जैसे 226001)",
  Landmark: "लैंडमार्क", "Save address": "पता सेव करें", "Address saved": "पता सेव हुआ", "Profile updated": "प्रोफ़ाइल अपडेट हुई",
  "Allow location access": "लोकेशन की अनुमति दें", "We use your location only to find your address and nearest service city.": "हम आपकी लोकेशन सिर्फ़ पता और नज़दीकी सेवा शहर ढूँढने के लिए इस्तेमाल करते हैं।",
  Allow: "अनुमति दें", "Not now": "अभी नहीं", "Open Settings": "सेटिंग्स खोलें", "Location permission is off. Enable it in Settings, or type your pincode manually.": "लोकेशन अनुमति बंद है। सेटिंग्स में चालू करें या पिनकोड खुद लिखें।",
  "Rate your experience": "अपना अनुभव रेट करें", "Add a tip (100% goes to partner)": "टिप दें (100% पार्टनर को)", "No tip": "कोई टिप नहीं", "Write a review (optional)": "समीक्षा लिखें (वैकल्पिक)", Submit: "जमा करें",
  "In-app chat": "इन-ऐप चैट", "Type a message": "संदेश लिखें", "No messages yet": "अभी कोई संदेश नहीं", "Masked call": "मास्क्ड कॉल", "Dial now": "अभी डायल करें",
  "Tax Invoice": "टैक्स इनवॉइस", "GST Invoice": "जीएसटी इनवॉइस", "Approve extra charge?": "अतिरिक्त शुल्क स्वीकार करें?", Approve: "स्वीकार करें", Decline: "अस्वीकार करें",
  "Cancel booking": "बुकिंग रद्द करें", "Cancel this booking? Fees apply as per policy.": "यह बुकिंग रद्द करें? नीति के अनुसार शुल्क लगेगा।", "Yes, cancel": "हाँ, रद्द करें", "Keep booking": "बुकिंग रखें",
  "Finding the best verified partner near you…": "आपके पास सबसे अच्छा सत्यापित पार्टनर ढूँढ रहे हैं…", "Share Start OTP": "स्टार्ट OTP बताएँ", "End OTP (share when done)": "एंड OTP (काम पूरा होने पर बताएँ)",
  Confirmed: "कन्फ़र्म", "Job Started": "काम शुरू", "Extra parts / charges": "अतिरिक्त पार्ट्स / शुल्क", "Balance due for approved extras": "स्वीकृत अतिरिक्त का बकाया", Help: "मदद",
  "Your location": "आपकी लोकेशन",
  "Didn't catch that, please try again": "समझ नहीं आया, फिर से बोलें", "Voice input failed, please try again": "आवाज़ इनपुट विफल, फिर से कोशिश करें",
  "Could not start the microphone": "माइक्रोफ़ोन शुरू नहीं हो सका", "Allow microphone": "माइक्रोफ़ोन की अनुमति दें", "Microphone permission": "माइक्रोफ़ोन अनुमति",
  "Speak instead of typing — we use the mic only while you hold a voice search or chat.": "लिखने की जगह बोलें — माइक सिर्फ़ वॉइस सर्च या चैट के समय इस्तेमाल होता है।",
  "Microphone is off for SMARTFIX. Enable it in Settings to search and chat by voice.": "SMARTFIX के लिए माइक बंद है। आवाज़ से खोजने और चैट के लिए सेटिंग्स में चालू करें।", Technician: "टेक्नीशियन", "Choose a different address": "दूसरा पता चुनें", "Live map is available in the mobile app": "लाइव मैप मोबाइल ऐप में उपलब्ध है",
};

const DICT: Record<string, string> = { ...HI, ...EXTRA };

export const translate = (s: string, lang: string): string => {
  if (lang !== "hi" || !s) return s;
  const trimmed = s.trim();
  if (DICT[trimmed]) return s.replace(trimmed, DICT[trimmed]);
  for (const [re, rep] of PATTERNS as [RegExp, any][]) {
    if (re.test(trimmed)) return trimmed.replace(re, rep);
  }
  return s;
};

const LangCtx = createContext<{ lang: string; t: (s: string) => string }>({ lang: "en", t: (s) => s });

export const LangProvider = ({ lang, children }: { lang: string; children: React.ReactNode }) => (
  <LangCtx.Provider value={{ lang, t: (s: string) => translate(s, lang) }}>{children}</LangCtx.Provider>
);

export const useLang = () => useContext(LangCtx);
