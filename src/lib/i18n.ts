import { useEffect } from "react";
import { HI_ADMIN, ADMIN_PATTERNS } from "./i18n_admin";

let current = "en";
export const getLocale = () => (current === "hi" ? "hi-IN" : "en-IN");
export const getCurrentLang = () => current;

const HI: Record<string, string> = {
  Home: "होम",
  Bookings: "बुकिंग",
  Wallet: "वॉलेट",
  Help: "मदद",
  Profile: "प्रोफ़ाइल",
  Schedule: "शेड्यूल",
  Earnings: "कमाई",
  "KYC & Profile": "केवाईसी और प्रोफ़ाइल",
  "AC Repair": "एसी रिपेयर",
  Cleaning: "सफ़ाई",
  Electrician: "इलेक्ट्रीशियन",
  Plumbing: "प्लंबिंग",
  Salon: "सैलून",
  Painting: "पेंटिंग",
  "Pest Control": "कीट नियंत्रण",
  "Appliance Repair": "उपकरण रिपेयर",
  Pending: "लंबित",
  Assigned: "असाइन",
  "En Route": "रास्ते में",
  "In Progress": "काम जारी",
  Completed: "पूरा",
  Cancelled: "रद्द",
  "Payment Pending": "भुगतान बाकी",
  "Choose service location": "सेवा स्थान चुनें",
  "Use current location (GPS)": "मौजूदा लोकेशन (GPS) इस्तेमाल करें",
  "+ Add new address / pincode": "+ नया पता / पिनकोड जोड़ें",
  "Set location": "लोकेशन चुनें",
  "Tap to detect via GPS": "GPS से पता लगाने के लिए टैप करें",
  "Search 'AC repair', 'cleaning'…": "'एसी रिपेयर', 'सफ़ाई' खोजें…",
  "Listening… say a service name": "सुन रहे हैं… सेवा का नाम बोलें",
  Hi: "नमस्ते",
  ", what do you need?": ", आपको क्या चाहिए?",
  "Trending near you": "आपके पास ट्रेंडिंग",
  Add: "जोड़ें",
  "Book again": "फिर से बुक करें",
  "Re-book": "फिर से बुक करें",
  "item(s) in cart": "आइटम कार्ट में",
  "View cart →": "कार्ट देखें →",
  "Added to cart": "कार्ट में जोड़ा गया",
  "Added previous services to cart": "पिछली सेवाएँ कार्ट में जोड़ी गईं",
  "50% OFF your first booking": "पहली बुकिंग पर 50% छूट",
  "Use code FIRST50 · up to ₹100": "कोड FIRST50 · ₹100 तक",
  "Summer-ready AC service": "गर्मी के लिए एसी सर्विस",
  "20% off with ACFEST": "ACFEST से 20% छूट",
  "Salon at home from ₹399": "घर पर सैलून ₹399 से",
  "Certified stylists, single-use kits": "प्रमाणित स्टाइलिस्ट, सिंगल-यूज़ किट",
  "All services": "सभी सेवाएँ",
  "No services match your search": "आपकी खोज से कोई सेवा नहीं मिली",
  "Starts at": "शुरुआत",
  "Checkout →": "चेकआउट →",
  "item(s)": "आइटम",
  "What's included": "क्या शामिल है",
  "Not included": "शामिल नहीं",
  "Add-ons": "ऐड-ऑन",
  Quantity: "मात्रा",
  "Customer reviews": "ग्राहक समीक्षाएँ",
  reviews: "समीक्षाएँ",
  "On time, neat and professional.": "समय पर, साफ़-सुथरा और पेशेवर।",
  "Good work, fair pricing.": "अच्छा काम, उचित दाम।",
  "Add to cart": "कार्ट में जोड़ें",
  "Proceed to Checkout": "चेकआउट करें",
  "Loading…": "लोड हो रहा है…",
  "× item": "× आइटम",
  "+ add-ons": "+ ऐड-ऑन",
  Checkout: "चेकआउट",
  "Your cart is empty": "आपका कार्ट खाली है",
  "Browse services": "सेवाएँ देखें",
  "Your services ·": "आपकी सेवाएँ ·",
  item: "आइटम",
  items: "आइटम",
  "(mix any categories)": "(कोई भी कैटेगरी मिलाएँ)",
  "Service address": "सेवा का पता",
  "+ New": "+ नया",
  "We don't serve this pincode yet. Pick another address.": "हम अभी इस पिनकोड पर सेवा नहीं देते। दूसरा पता चुनें।",
  "When should we come?": "हम कब आएँ?",
  Instant: "तुरंत",
  "Arrives in 30-45 min": "30-45 मिनट में पहुँचेंगे",
  "Pick date & slot": "तारीख और समय चुनें",
  "Coupons & offers": "कूपन और ऑफ़र",
  "Enter code": "कोड डालें",
  Apply: "लागू करें",
  "applied · you save": "लागू · आपकी बचत",
  Remove: "हटाएँ",
  "Payment method": "भुगतान का तरीका",
  "UPI (GPay / PhonePe)": "UPI (GPay / PhonePe)",
  "Credit / Debit Card": "क्रेडिट / डेबिट कार्ड",
  "HomeServe Wallet": "HomeServe वॉलेट",
  "Cash after service": "सेवा के बाद नकद",
  Bal: "बैलेंस",
  "Item total": "आइटम कुल",
  "Coupon discount": "कूपन छूट",
  "GST (18%)": "जीएसटी (18%)",
  "To pay": "भुगतान राशि",
  "Cancellation policy": "रद्दीकरण नीति",
  Total: "कुल",
  "Placing…": "बुक हो रहा है…",
  "Confirm booking": "बुकिंग पक्की करें",
  "Processing demo payment…": "डेमो भुगतान हो रहा है…",
  "Secure payment via Razorpay": "Razorpay से सुरक्षित भुगतान",
  "Demo payment mode": "डेमो भुगतान मोड",
  "Payment successful": "भुगतान सफल",
  "Payment cancelled": "भुगतान रद्द",
  "Free cancellation while we are finding a partner (Pending).": "पार्टनर ढूँढते समय रद्द करना मुफ़्त (लंबित)।",
  "₹49 fee once a partner is assigned.": "पार्टनर असाइन होने पर ₹49 शुल्क।",
  "₹99 fee once the partner is en route.": "पार्टनर के रास्ते में होने पर ₹99 शुल्क।",
  "Cancellation not allowed after the job has started.": "काम शुरू होने के बाद रद्द नहीं कर सकते।",
  "Prepaid amounts are refunded instantly to your in-app wallet minus the fee.": "प्रीपेड राशि शुल्क काटकर तुरंत आपके वॉलेट में वापस आती है।",
  "My bookings": "मेरी बुकिंग",
  "No bookings yet": "अभी कोई बुकिंग नहीं",
  "One-click Re-book": "एक क्लिक में फिर से बुक करें",
  Booked: "बुक किया",
  "ASAP (30-45 min)": "जल्द से जल्द (30-45 मिनट)",
  "Finding the best verified partner near you…": "आपके पास सबसे अच्छा सत्यापित पार्टनर ढूँढ रहे हैं…",
  jobs: "काम",
  Verified: "सत्यापित",
  "Share Start OTP": "शुरुआत OTP बताएँ",
  "End OTP (share when done)": "समाप्ति OTP (काम पूरा होने पर बताएँ)",
  "Extra parts / charges": "अतिरिक्त पार्ट्स / शुल्क",
  approved: "स्वीकृत",
  rejected: "अस्वीकृत",
  pending: "लंबित",
  "Approved extras": "स्वीकृत अतिरिक्त",
  "GST 18%": "जीएसटी 18%",
  "Total (": "कुल (",
  paid: "भुगतान हुआ",
  "GST Invoice": "जीएसटी इनवॉइस",
  "Rate your experience": "अपना अनुभव रेट करें",
  "Add a tip (100% goes to partner)": "टिप दें (100% पार्टनर को)",
  "No tip": "टिप नहीं",
  "Write a review (optional)": "समीक्षा लिखें (वैकल्पिक)",
  Submit: "जमा करें",
  "You rated": "आपने रेटिंग दी",
  "Cancel booking": "बुकिंग रद्द करें",
  "Approve extra charge?": "अतिरिक्त शुल्क स्वीकार करें?",
  Decline: "मना करें",
  Approve: "स्वीकार करें",
  requested: "ने माँगा",
  for: "के लिए",
  "Extra charge approved": "अतिरिक्त शुल्क स्वीकृत",
  "Extra charge declined": "अतिरिक्त शुल्क अस्वीकृत",
  "Pay balance": "बकाया भुगतान करें",
  "Tax Invoice": "टैक्स इनवॉइस",
  "Bill to:": "बिल प्राप्तकर्ता:",
  "Place of supply:": "आपूर्ति का स्थान:",
  Subtotal: "उप-योग",
  Discount: "छूट",
  "Taxable value": "कर योग्य मूल्य",
  "Invoice total": "इनवॉइस कुल",
  "Tip to partner (non-taxable)": "पार्टनर को टिप (कर-मुक्त)",
  "Download / Print": "डाउनलोड / प्रिंट",
  "In-app chat": "इन-ऐप चैट",
  "No messages yet": "अभी कोई संदेश नहीं",
  "Type a message": "संदेश लिखें",
  "Masked call": "मास्क्ड कॉल",
  "Enter PIN": "पिन डालें",
  "when prompted": "पूछे जाने पर",
  "Dial now": "अभी डायल करें",
  Call: "कॉल",
  "Cashbacks, refunds & promo rewards live here": "कैशबैक, रिफ़ंड और प्रोमो रिवॉर्ड यहाँ रहते हैं",
  Transactions: "लेन-देन",
  "No transactions yet": "अभी कोई लेन-देन नहीं",
  "Wallet top-up (demo UPI)": "वॉलेट टॉप-अप (डेमो UPI)",
  "Welcome! Add your name and an address to get started.": "स्वागत है! शुरू करने के लिए अपना नाम और पता जोड़ें।",
  "Your name": "आपका नाम",
  "Full name": "पूरा नाम",
  Email: "ईमेल",
  "Save profile": "प्रोफ़ाइल सेव करें",
  Notifications: "सूचनाएँ",
  "push alerts": "पुश अलर्ट",
  "sms alerts": "एसएमएस अलर्ट",
  "Offers & promotions": "ऑफ़र और प्रमोशन",
  "Saved addresses": "सेव किए पते",
  "+ Add": "+ जोड़ें",
  "Use for booking": "बुकिंग के लिए इस्तेमाल करें",
  Logout: "लॉग आउट",
  "Profile updated": "प्रोफ़ाइल अपडेट हुई",
  "Add address": "पता जोड़ें",
  Office: "ऑफ़िस",
  Other: "अन्य",
  "Detect via GPS": "GPS से पता लगाएँ",
  "House / flat, street, area": "मकान / फ़्लैट, गली, इलाका",
  "Pincode (e.g. 226001)": "पिनकोड (जैसे 226001)",
  Landmark: "लैंडमार्क",
  "Audio landmark note for technician (max 20s)": "तकनीशियन के लिए ऑडियो लैंडमार्क नोट (अधिकतम 20 सेकंड)",
  Record: "रिकॉर्ड",
  Stop: "रोकें",
  "Save address": "पता सेव करें",
  "Address saved": "पता सेव हुआ",
  Language: "भाषा",
  "Help & Support": "मदद और सहायता",
  "Live chatbot": "लाइव चैटबॉट",
  "Type your question": "अपना सवाल लिखें",
  "Raise support ticket": "सपोर्ट टिकट बनाएँ",
  "My tickets": "मेरे टिकट",
  "No tickets yet": "अभी कोई टिकट नहीं",
  "message(s)": "संदेश",
  open: "खुला",
  "Namaste,": "नमस्ते,",
  Partner: "पार्टनर",
  Availability: "उपलब्धता",
  ONLINE: "ऑनलाइन",
  OFFLINE: "ऑफ़लाइन",
  "You're online — job alerts on": "आप ऑनलाइन हैं — जॉब अलर्ट चालू",
  "You're offline": "आप ऑफ़लाइन हैं",
  KYC: "केवाईसी",
  "Driving Licence": "ड्राइविंग लाइसेंस",
  "Police Verification": "पुलिस सत्यापन",
  "Cash in hand (COD)": "हाथ में नकद (COD)",
  "Today's jobs": "आज के काम",
  "Today's earnings": "आज की कमाई",
  "Current job": "मौजूदा काम",
  "Open job →": "काम खोलें →",
  "Waiting for job requests…": "जॉब रिक्वेस्ट का इंतज़ार…",
  "Go online to receive jobs": "काम पाने के लिए ऑनलाइन हों",
  "New job request": "नई जॉब रिक्वेस्ट",
  Accept: "स्वीकार करें",
  "Job accepted!": "काम स्वीकार!",
  "Job declined": "काम मना किया",
  "Send emergency SOS?": "इमरजेंसी SOS भेजें?",
  Cancel: "रद्द करें",
  "Send SOS": "SOS भेजें",
  Arrived: "पहुँच गए",
  "Start (OTP)": "शुरू (OTP)",
  Complete: "पूरा करें",
  "Collect cash": "नकद लें",
  "Prepaid online": "ऑनलाइन प्रीपेड",
  Maps: "मैप",
  Chat: "चैट",
  "Request extra spare parts / charges": "अतिरिक्त पार्ट्स / शुल्क माँगें",
  "awaiting approval": "मंज़ूरी का इंतज़ार",
  "Start Navigation": "नेविगेशन शुरू करें",
  "1 · Arrived at Location": "1 · लोकेशन पर पहुँचे",
  "2 · Start Job": "2 · काम शुरू करें",
  "Awaiting approval…": "मंज़ूरी का इंतज़ार…",
  "4 · Complete Job": "4 · काम पूरा करें",
  "Withdrawable balance": "निकासी योग्य बैलेंस",
  "Pending weekly settlement:": "बाकी साप्ताहिक सेटलमेंट:",
  "Withdraw to Bank": "बैंक में निकालें",
  daily: "दैनिक",
  weekly: "साप्ताहिक",
  "Gross job value": "कुल काम मूल्य",
  "Commission (15-20%)": "कमीशन (15-20%)",
  Penalties: "जुर्माना",
  Tips: "टिप",
  "Payout requests": "पेआउट अनुरोध",
  "Working hours & weekly off": "काम के घंटे और साप्ताहिक छुट्टी",
  "Aadhaar Card": "आधार कार्ड",
  "PAN Card": "पैन कार्ड",
  Approved: "स्वीकृत",
  "Under review": "जाँच में",
  Rejected: "अस्वीकृत",
  Resubmit: "फिर से जमा करें",
  "Skills (categories)": "कौशल (कैटेगरी)",
  "Bank account for payouts": "पेआउट के लिए बैंक खाता",
};

const PATTERNS: [RegExp, string | ((...args: any[]) => string)][] = [
  [/^(\d+) min$/, "$1 मिनट"],
  [/^Arriving in ~(\d+) min$/, "~$1 मिनट में पहुँच रहे हैं"],
  [/^Pay (₹[\d,.]+)$/, "$1 का भुगतान करें"],
  [/^Results for "(.+)"$/, '"$1" के परिणाम'],
  [/^Booking (\S+) confirmed!$/, "बुकिंग $1 पक्की!"],
  [/^Payment for booking (\S+)$/, "बुकिंग $1 का भुगतान"],
  [/^Refund for cancelled booking (\S+)$/, "रद्द बुकिंग $1 का रिफ़ंड"],
  [/^5% cashback on (\S+)$/, "$1 पर 5% कैशबैक"],
  [/^Cancellation fee (\S+)$/, "रद्दीकरण शुल्क $1"],
  [/^Approved extras for (\S+)$/, "$1 के स्वीकृत अतिरिक्त"],
  [/^Surge ([\d.]+)x(.*)$/, "सर्ज $1x$2"],
  [/^(₹[\d,.]+) added( \(demo UPI\))?$/, "$1 जोड़े गए"],
  [/^Ticket (\S+) created$/, "टिकट $1 बना"],
  [/^Collect cash (₹[\d,.]+)$/, "$1 नकद लें"],
  [/^Extra: (.+)$/, (_m: string, a: string) => `अतिरिक्त: ${a}`],
  [/^(.+) × ?(\d+)$/, (_m: string, a: string, q: string) => `${HI[a] || a} ×${q}`],
  ...ADMIN_PATTERNS,
];

Object.assign(HI, HI_ADMIN);

const translate = (s: string): string | null => {
  const k = s.trim();
  if (!k) return null;
  let v = HI[k];
  if (v === undefined) {
    const p = PATTERNS.find(([re]) => re.test(k));
    if (!p) return null;
    v = typeof p[1] === "function" ? (k.replace(p[0], p[1] as any)) : k.replace(p[0], p[1]);
  }
  return s.replace(k, v);
};

const done = new Map<Node, [string, string]>();
const ph = new Map<HTMLInputElement | HTMLTextAreaElement, string>();

const walk = (root: Node) => {
  if (root.nodeType === 1 && (root as Element).closest("[translate='no']")) return;
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (x) => (x.nodeType === 1 && (x as Element).getAttribute("translate") === "no" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  let n: Node | null = root;
  if (n.nodeType === 3 && n.parentElement?.closest("[translate='no']")) return;
  while (n) {
    if (n.nodeType === 3) {
      const v = translate(n.nodeValue || "");
      if (v !== null && v !== n.nodeValue) {
        if (done.size > 3000) {
          done.forEach((_, node) => { if (!node.isConnected) done.delete(node); });
          ph.forEach((_, el) => { if (!el.isConnected) ph.delete(el); });
        }
        done.set(n, [n.nodeValue || "", v]);
        n.nodeValue = v;
      }
    } else if (n.nodeType === 1 && "placeholder" in n) {
      const el = n as HTMLInputElement;
      if (el.placeholder) {
        const v = translate(el.placeholder);
        if (v !== null) {
          ph.set(el, el.placeholder);
          el.placeholder = v;
        }
      }
    }
    n = tw.nextNode();
  }
};

export const useHindi = (lang: string = "en") => {
  current = lang || "en";
  useEffect(() => {
    if (lang !== "hi") return undefined;
    document.documentElement.lang = "hi";
    walk(document.body);
    const mo = new MutationObserver((ms) =>
      ms.forEach((m) => {
        if (m.type === "characterData" || m.type === "attributes") walk(m.target);
        else m.addedNodes.forEach((x) => walk(x));
      })
    );
    mo.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder"],
    });
    return () => {
      mo.disconnect();
      done.forEach(([orig, tr], node) => {
        if (node.nodeValue === tr) node.nodeValue = orig;
      });
      done.clear();
      ph.forEach((orig, el) => {
        el.placeholder = orig;
      });
      ph.clear();
      document.documentElement.lang = "en";
    };
  }, [lang]);
};
