import { useEffect, useState } from "react";
import {
  Category,
  Service,
  City,
  SurgeRule,
  Coupon,
  Banner,
  User,
  Address,
  Booking,
  BookingLine,
  ExtraCharge,
  WalletTxn,
  SupportTicket,
  Settlement,
  PayoutRequest,
  Penalty,
  SosAlert,
  Role,
  BookingPricing,
  Addon,
} from "./types";

const DB_KEY = "hs_db_v2";

export const IMG: Record<string, string> = {
  cat_ac: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  cat_clean: "https://images.unsplash.com/photo-1660330590022-9f4ff56b63f6?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  cat_elec: "https://images.unsplash.com/photo-1660330589693-99889d60181e?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  cat_plumb: "https://images.pexels.com/photos/7220892/pexels-photo-7220892.jpeg?auto=compress&cs=tinysrgb&w=800",
  cat_salon: "https://images.pexels.com/photos/29555480/pexels-photo-29555480.jpeg?auto=compress&cs=tinysrgb&w=800",
  cat_paint: "https://images.unsplash.com/photo-1688372199140-cade7ae820fe?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
  cat_pest: "https://images.pexels.com/photos/4176541/pexels-photo-4176541.jpeg?auto=compress&cs=tinysrgb&w=800",
  cat_appl: "https://images.unsplash.com/photo-1662220984920-3bd1f88e846f?crop=entropy&cs=srgb&fm=jpg&w=800&q=80",
};

export const CATEGORIES: Category[] = [
  { id: "cat_ac", name: "AC Repair", icon: "AirVent", image: IMG.cat_ac, order: 0 },
  { id: "cat_clean", name: "Cleaning", icon: "Sparkles", image: IMG.cat_clean, order: 1 },
  { id: "cat_elec", name: "Electrician", icon: "Zap", image: IMG.cat_elec, order: 2 },
  { id: "cat_plumb", name: "Plumbing", icon: "Wrench", image: IMG.cat_plumb, order: 3 },
  { id: "cat_salon", name: "Salon", icon: "Scissors", image: IMG.cat_salon, order: 4 },
  { id: "cat_paint", name: "Painting", icon: "PaintRoller", image: IMG.cat_paint, order: 5 },
  { id: "cat_pest", name: "Pest Control", icon: "Bug", image: IMG.cat_pest, order: 6 },
  { id: "cat_appl", name: "Appliance Repair", icon: "WashingMachine", image: IMG.cat_appl, order: 7 },
];

export const SERVICES: Service[] = [
  {
    id: "serv_ac_01",
    category_id: "cat_ac",
    name: "AC Service & Repair (Split/Window)",
    price: 549,
    duration_min: 60,
    rating: 4.8,
    reviews_count: 12840,
    inclusions: [
      "Jet-pump filter & coil cleaning",
      "Cooling & gas pressure check",
      "Drain pipe flush",
      "30-day service warranty",
    ],
    exclusions: [
      "Gas refill (available as add-on)",
      "Spare parts cost",
      "Wall/stand mounting",
    ],
    trending: true,
    image: IMG.cat_ac,
    addons: [
      { id: "serv_ac_01_a0", name: "Gas Refill (R32/R22)", price: 1499 },
      { id: "serv_ac_01_a1", name: "Anti-rust Coil Coating", price: 299 },
    ],
    reviews: [
      { name: "Priya M.", rating: 5, text: "On time, neat and professional." },
      { name: "Rahul S.", rating: 4, text: "Good work, fair pricing." },
    ],
  },
  {
    id: "serv_ac_02",
    category_id: "cat_ac",
    name: "AC Installation / Uninstallation",
    price: 1199,
    duration_min: 90,
    rating: 4.7,
    reviews_count: 5210,
    inclusions: [
      "Indoor & outdoor unit fitting",
      "Vacuum & leak test",
      "Up to 3 ft copper pipe",
    ],
    exclusions: ["Extra copper pipe", "Stand / bracket", "Civil work"],
    trending: false,
    image: IMG.cat_ac,
    addons: [{ id: "serv_ac_02_a0", name: "Extra Copper Pipe (per ft)", price: 250 }],
    reviews: [{ name: "Amit K.", rating: 5, text: "Flawless installation." }],
  },
  {
    id: "serv_clean_02",
    category_id: "cat_clean",
    name: "Full Home Deep Cleaning",
    price: 899,
    duration_min: 240,
    rating: 4.8,
    reviews_count: 9870,
    inclusions: [
      "Kitchen & bathroom degreasing",
      "Floor scrubbing & mopping",
      "Fan, window & switchboard wiping",
      "Eco-safe chemicals",
    ],
    exclusions: ["Wall washing", "Carpet shampoo", "Balcony pressure wash"],
    trending: true,
    image: IMG.cat_clean,
    addons: [
      { id: "serv_clean_02_a0", name: "Sofa Shampoo (5 seats)", price: 599 },
      { id: "serv_clean_02_a1", name: "Fridge Cleaning", price: 249 },
    ],
    reviews: [{ name: "Sneha G.", rating: 5, text: "House looks brand new!" }],
  },
  {
    id: "serv_clean_03",
    category_id: "cat_clean",
    name: "Bathroom Intense Cleaning",
    price: 449,
    duration_min: 75,
    rating: 4.7,
    reviews_count: 7420,
    inclusions: [
      "Tile & grout scrubbing",
      "Hard-water stain removal",
      "Fixture polishing",
    ],
    exclusions: ["Tile replacement", "Plumbing repairs"],
    trending: false,
    image: IMG.cat_clean,
    addons: [{ id: "serv_clean_03_a0", name: "Exhaust Fan Cleaning", price: 99 }],
    reviews: [{ name: "Vikram N.", rating: 4, text: "Stains cleared well." }],
  },
  {
    id: "serv_elec_01",
    category_id: "cat_elec",
    name: "Fan / Light Installation & Repair",
    price: 149,
    duration_min: 30,
    rating: 4.7,
    reviews_count: 15320,
    inclusions: [
      "Fault diagnosis",
      "Installation of fan or light",
      "Safety check of wiring point",
    ],
    exclusions: ["New fan / light cost", "Concealed wiring"],
    trending: true,
    image: IMG.cat_elec,
    addons: [{ id: "serv_elec_01_a0", name: "Regulator Replacement", price: 199 }],
    reviews: [{ name: "Deepak T.", rating: 5, text: "Fixed within 20 mins." }],
  },
  {
    id: "serv_elec_02",
    category_id: "cat_elec",
    name: "Switchboard & Wiring Repair",
    price: 199,
    duration_min: 45,
    rating: 4.6,
    reviews_count: 8110,
    inclusions: [
      "Switch & socket repair",
      "MCB check",
      "Loose connection fix",
    ],
    exclusions: ["Full house rewiring"],
    trending: false,
    image: IMG.cat_elec,
    addons: [{ id: "serv_elec_02_a0", name: "New Modular Switch", price: 89 }],
    reviews: [{ name: "Ritu S.", rating: 5, text: "Prompt and skilled." }],
  },
  {
    id: "serv_plumb_01",
    category_id: "cat_plumb",
    name: "Tap, Leak & Blockage Fix",
    price: 199,
    duration_min: 45,
    rating: 4.7,
    reviews_count: 11030,
    inclusions: [
      "Leak detection",
      "Tap / washer replacement",
      "Drain unclogging",
    ],
    exclusions: ["Pipe replacement > 2 ft", "Spare parts cost"],
    trending: true,
    image: IMG.cat_plumb,
    addons: [{ id: "serv_plumb_01_a0", name: "New Tap Fitting", price: 349 }],
    reviews: [{ name: "Manish P.", rating: 5, text: "Quickly stopped the kitchen leak." }],
  },
  {
    id: "serv_plumb_02",
    category_id: "cat_plumb",
    name: "Water Tank Cleaning",
    price: 599,
    duration_min: 90,
    rating: 4.6,
    reviews_count: 3980,
    inclusions: ["Sludge removal", "Anti-bacterial wash", "UV treatment"],
    exclusions: ["Tank repair"],
    trending: false,
    image: IMG.cat_plumb,
    addons: [{ id: "serv_plumb_02_a0", name: "Second Tank", price: 399 }],
    reviews: [{ name: "Sunita D.", rating: 4, text: "Clean and hygienic." }],
  },
  {
    id: "serv_salon_01",
    category_id: "cat_salon",
    name: "Haircut & Grooming at Home",
    price: 399,
    duration_min: 45,
    rating: 4.8,
    reviews_count: 21300,
    inclusions: [
      "Haircut by certified stylist",
      "Beard trim & styling",
      "Disposable kit",
    ],
    exclusions: ["Hair colour"],
    trending: true,
    image: IMG.cat_salon,
    addons: [{ id: "serv_salon_01_a0", name: "Head Massage (15 min)", price: 199 }],
    reviews: [{ name: "Kunal J.", rating: 5, text: "Best haircut at home!" }],
  },
  {
    id: "serv_salon_02",
    category_id: "cat_salon",
    name: "Facial & Cleanup",
    price: 799,
    duration_min: 60,
    rating: 4.7,
    reviews_count: 9650,
    inclusions: ["Skin analysis", "Cleanup + facial", "Single-use products"],
    exclusions: ["Bridal makeup"],
    trending: false,
    image: IMG.cat_salon,
    addons: [{ id: "serv_salon_02_a0", name: "De-tan Pack", price: 299 }],
    reviews: [{ name: "Ananya B.", rating: 5, text: "Very relaxing." }],
  },
  {
    id: "serv_paint_01",
    category_id: "cat_paint",
    name: "Room Painting (1 BHK wall)",
    price: 2999,
    duration_min: 480,
    rating: 4.6,
    reviews_count: 1840,
    inclusions: [
      "Wall putty touch-up",
      "2 coats premium emulsion",
      "Furniture covering & cleanup",
    ],
    exclusions: ["Texture / wallpaper", "Waterproofing"],
    trending: false,
    image: IMG.cat_paint,
    addons: [{ id: "serv_paint_01_a0", name: "Ceiling Painting", price: 999 }],
    reviews: [{ name: "Harish V.", rating: 5, text: "Great finish and cleanup." }],
  },
  {
    id: "serv_pest_01",
    category_id: "cat_pest",
    name: "Cockroach & Ant Control",
    price: 699,
    duration_min: 60,
    rating: 4.7,
    reviews_count: 6720,
    inclusions: [
      "Odourless gel treatment",
      "Kitchen & bathroom coverage",
      "90-day warranty",
    ],
    exclusions: ["Termite treatment"],
    trending: false,
    image: IMG.cat_pest,
    addons: [{ id: "serv_pest_01_a0", name: "Bed Bug Spray", price: 499 }],
    reviews: [{ name: "Pooja K.", rating: 5, text: "No pests since 2 months." }],
  },
  {
    id: "serv_appl_01",
    category_id: "cat_appl",
    name: "Washing Machine Repair",
    price: 299,
    duration_min: 60,
    rating: 4.6,
    reviews_count: 7300,
    inclusions: [
      "Diagnosis & visit",
      "Minor repairs",
      "Drum & motor check",
    ],
    exclusions: ["Spare parts cost"],
    trending: true,
    image: IMG.cat_appl,
    addons: [{ id: "serv_appl_01_a0", name: "Inlet Pipe Replacement", price: 199 }],
    reviews: [{ name: "Gaurav M.", rating: 4, text: "Accurate diagnosis." }],
  },
  {
    id: "serv_appl_02",
    category_id: "cat_appl",
    name: "Refrigerator Repair",
    price: 349,
    duration_min: 60,
    rating: 4.6,
    reviews_count: 5100,
    inclusions: [
      "Cooling diagnosis",
      "Thermostat check",
      "Minor repairs",
    ],
    exclusions: ["Compressor replacement"],
    trending: false,
    image: IMG.cat_appl,
    addons: [{ id: "serv_appl_02_a0", name: "Gas Charging", price: 1799 }],
    reviews: [{ name: "Suresh P.", rating: 5, text: "Cooling restored immediately." }],
  },
];

export const CITIES: City[] = [
  {
    id: "city_lucknow",
    city_name: "Lucknow",
    state: "Uttar Pradesh",
    is_active: true,
    pincodes: ["226001", "226010", "226016", "226024"],
    center: { lat: 26.8467, lng: 80.9462 },
    polygon: [
      [26.9067, 80.8862],
      [26.8947, 81.0062],
      [26.8047, 81.0122],
      [26.7867, 80.9102],
    ],
    surge_pricing: { is_active: true, multiplier: 1.2, reason: "Rain / Peak Demand" },
    assigned_services: [
      { service_id: "serv_ac_01", city_price: 499 },
      { service_id: "serv_clean_02", city_price: 799 },
    ],
    disabled_service_ids: [],
    enable_gst_invoice: true,
    gst_rate: 18,
    enable_platform_fee: true,
    platform_fee: 29,
    base_price_multiplier: 1.0,
    partner_model: "commission",
    partner_commission_pct: 15,
    partner_daily_subscription_fee: 49,
    created_at: new Date().toISOString(),
  },
  {
    id: "city_delhi",
    city_name: "New Delhi",
    state: "Delhi",
    is_active: true,
    pincodes: ["110001", "110016", "110019", "110020"],
    center: { lat: 28.6139, lng: 77.209 },
    polygon: [
      [28.6739, 77.149],
      [28.6619, 77.269],
      [28.5719, 77.275],
      [28.5539, 77.173],
    ],
    surge_pricing: { is_active: false, multiplier: 1.0, reason: "" },
    assigned_services: [
      { service_id: "serv_ac_01", city_price: 599 },
      { service_id: "serv_clean_02", city_price: 999 },
    ],
    disabled_service_ids: [],
    enable_gst_invoice: true,
    gst_rate: 18,
    enable_platform_fee: true,
    platform_fee: 39,
    base_price_multiplier: 1.0,
    partner_model: "daily_subscription",
    partner_commission_pct: 10,
    partner_daily_subscription_fee: 49,
    created_at: new Date().toISOString(),
  },
  {
    id: "city_bengaluru",
    city_name: "Bengaluru",
    state: "Karnataka",
    is_active: true,
    pincodes: ["560001", "560034", "560102"],
    center: { lat: 12.9716, lng: 77.5946 },
    polygon: [
      [13.0316, 77.5346],
      [13.0196, 77.6546],
      [12.9296, 77.6606],
      [12.9116, 77.5586],
    ],
    surge_pricing: { is_active: false, multiplier: 1.0, reason: "" },
    assigned_services: [{ service_id: "serv_ac_01", city_price: 579 }],
    disabled_service_ids: [],
    enable_gst_invoice: false, // Non-GST by default
    gst_rate: 0,
    enable_platform_fee: false,
    platform_fee: 0,
    base_price_multiplier: 1.0,
    partner_model: "commission",
    partner_commission_pct: 12,
    partner_daily_subscription_fee: 59,
    created_at: new Date().toISOString(),
  },
];

export const SURGE_RULES: SurgeRule[] = [
  {
    id: "surge_peak",
    name: "Evening Peak Hours",
    trigger: "peak_hours",
    multiplier: 1.3,
    city_id: "all",
    start_hour: 18,
    end_hour: 21,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "surge_rain",
    name: "Monsoon Rain Surge",
    trigger: "weather",
    multiplier: 1.5,
    city_id: "city_lucknow",
    weather: "Rain",
    is_active: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "surge_demand",
    name: "High Demand – Saket Zone",
    trigger: "high_demand",
    multiplier: 1.2,
    city_id: "city_delhi",
    is_active: false,
    created_at: new Date().toISOString(),
  },
];

export const COUPONS: Coupon[] = [
  {
    id: "cpn_first50",
    code: "FIRST50",
    description: "50% off up to ₹100 on your first booking",
    discount_type: "percent",
    value: 50,
    max_discount: 100,
    min_order: 0,
    city_ids: ["city_lucknow", "city_delhi"],
    category_ids: [],
    usage_limit: 1000,
    used_count: 128,
    first_order_only: true,
    valid_till: "2027-12-31",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cpn_save100",
    code: "SAVE100",
    description: "Flat ₹100 off on orders above ₹999",
    discount_type: "flat",
    value: 100,
    max_discount: null,
    min_order: 999,
    city_ids: [],
    category_ids: [],
    usage_limit: 5000,
    used_count: 412,
    first_order_only: false,
    valid_till: "2027-12-31",
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "cpn_acfest",
    code: "ACFEST",
    description: "20% off up to ₹300 on AC services",
    discount_type: "percent",
    value: 20,
    max_discount: 300,
    min_order: 0,
    city_ids: [],
    category_ids: ["cat_ac"],
    usage_limit: 2000,
    used_count: 77,
    first_order_only: false,
    valid_till: "2027-12-31",
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export const BANNERS: Banner[] = [
  {
    id: "bn1",
    title: "50% OFF your first booking",
    subtitle: "Use code FIRST50 · up to ₹100",
    code: "FIRST50",
    image: IMG.cat_clean,
    category_id: "cat_clean",
  },
  {
    id: "bn2",
    title: "Summer-ready AC service",
    subtitle: "20% off with ACFEST",
    code: "ACFEST",
    image: IMG.cat_ac,
    category_id: "cat_ac",
  },
  {
    id: "bn3",
    title: "Salon at home from ₹399",
    subtitle: "Certified stylists, single-use kits",
    code: null,
    image: IMG.cat_salon,
    category_id: "cat_salon",
  },
];

export const COMMISSION_SETTINGS = {
  default_rate: 0.18,
  category_rates: {
    cat_salon: 0.20,
    cat_paint: 0.15,
    cat_ac: 0.18,
    cat_clean: 0.18,
  } as Record<string, number>,
};

export const DEMO_CUSTOMER: User = {
  id: "usr_demo_customer",
  role: "customer",
  name: "Aarav Sharma",
  phone: "9999999999",
  email: "aarav@example.com",
  wallet_balance: 250.0,
  language: "en",
  notifications: { push: true, sms: true, offers: true },
  created_at: new Date().toISOString(),
};

export const DEMO_PARTNER: User = {
  id: "usr_demo_partner",
  role: "partner",
  name: "Ramesh Kumar (Electrician Pro)",
  phone: "9000000001",
  skills: ["cat_elec", "cat_appl"],
  sub_skills: ["fan_repair", "wiring", "switches"],
  city_id: "city_lucknow",
  is_online: true,
  kyc_status: "approved",
  cod_cash: 1200,
  cod_limit: 3000,
  rating: 4.8,
  jobs_done: 42,
  wallet_balance: 1850.0,
  pending_earnings: 1240.0,
  consecutive_rejections: 0,
  location: { lat: 26.852, lng: 80.948 },
  shift: { start: "09:00", end: "19:00", off_days: ["Sun"] },
  bank: {
    holder: "Ramesh Kumar",
    account_no: "XXXXXX0001",
    ifsc: "SBIN0001234",
    bank_name: "State Bank of India",
  },
  documents: {
    aadhaar: {
      number: "XXXX-XXXX-4821",
      status: "approved",
      note: "Verified UIDAI",
      has_file: true,
      uploaded_at: new Date().toISOString(),
    },
    pan: {
      number: "ABCPK1234F",
      status: "approved",
      note: "Verified NSDL",
      has_file: true,
      uploaded_at: new Date().toISOString(),
    },
    dl: {
      number: "UP32-2019-0045123",
      expiry_date: "2026-11-15",
      status: "approved",
      note: "Expiring in 20 days. Renew & re-upload.",
      has_file: true,
      uploaded_at: new Date().toISOString(),
    },
    police: {
      number: "PVC/LKO/88213",
      expiry_date: "2027-08-30",
      status: "approved",
      note: "Clear record verified",
      has_file: true,
      uploaded_at: new Date().toISOString(),
    },
  },
  created_at: new Date().toISOString(),
};

export const OTHER_PARTNERS: User[] = [
  {
    id: "usr_p2",
    role: "partner",
    name: "Suresh Yadav (Cleaning Specialist)",
    phone: "9000000002",
    skills: ["cat_clean", "cat_pest"],
    sub_skills: ["bathroom_cleaning", "kitchen_cleaning", "deep_cleaning"],
    city_id: "city_lucknow",
    is_online: true,
    kyc_status: "approved",
    cod_cash: 850,
    cod_limit: 3000,
    rating: 4.9,
    jobs_done: 56,
    wallet_balance: 1420.0,
    pending_earnings: 750.0,
    consecutive_rejections: 0,
    location: { lat: 26.848, lng: 80.952 },
    shift: { start: "08:00", end: "18:00", off_days: ["Tue"] },
    bank: { holder: "Suresh Yadav", account_no: "XXXXXX0002", ifsc: "PUNB0002345", bank_name: "Punjab National Bank" },
    documents: {
      aadhaar: { number: "XXXX-XXXX-1122", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
      pan: { number: "ABCPS5678G", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
      dl: { number: "UP32-2020-0012345", expiry_date: "2027-10-10", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
      police: { number: "PVC/LKO/99120", expiry_date: "2027-05-12", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "usr_p3",
    role: "partner",
    name: "Imran Khan (Plumbing Expert)",
    phone: "9000000003",
    skills: ["cat_plumb", "cat_ac"],
    sub_skills: ["leakage_fix", "sanitary", "pipe_repair"],
    city_id: "city_lucknow",
    is_online: true,
    kyc_status: "approved",
    cod_cash: 450,
    cod_limit: 3000,
    rating: 4.6,
    jobs_done: 29,
    wallet_balance: 410.0,
    pending_earnings: 280.0,
    consecutive_rejections: 1,
    location: { lat: 26.842, lng: 80.941 },
    shift: { start: "09:00", end: "20:00", off_days: ["Wed"] },
    bank: { holder: "Imran Khan", account_no: "XXXXXX0003", ifsc: "HDFC0003456", bank_name: "HDFC Bank" },
    documents: {
      aadhaar: { number: "XXXX-XXXX-3344", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
      pan: { number: "ABCPI9012H", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
      dl: { number: "UP32-2021-0098765", expiry_date: "2028-01-20", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
      police: { number: "PVC/LKO/44567", expiry_date: "2027-09-15", status: "approved", note: "", has_file: true, uploaded_at: new Date().toISOString() },
    },
    created_at: new Date().toISOString(),
  },

  {
    id: "usr_p6",
    role: "partner",
    name: "Anil Gupta",
    phone: "9000000006",
    skills: ["cat_paint", "cat_pest"],
    city_id: "city_lucknow",
    is_online: false,
    kyc_status: "pending", // KYC queue candidate
    cod_cash: 0,
    cod_limit: 3000,
    rating: 4.5,
    jobs_done: 0,
    wallet_balance: 0,
    pending_earnings: 0,
    consecutive_rejections: 0,
    location: { lat: 26.855, lng: 80.935 },
    shift: { start: "09:00", end: "18:00", off_days: ["Sun"] },
    bank: { holder: "Anil Gupta", account_no: "XXXXXX0006", ifsc: "ICIC0004567", bank_name: "ICICI Bank" },
    documents: {
      aadhaar: { number: "XXXX-XXXX-7788", status: "pending", note: "Uploaded clear Aadhaar photo", has_file: true, uploaded_at: new Date().toISOString() },
      pan: { number: "ABCPG3456K", status: "pending", note: "Awaiting name verification", has_file: true, uploaded_at: new Date().toISOString() },
      dl: { number: "UP32-2022-0056789", expiry_date: "2029-04-10", status: "under_review", note: "Verification in progress", has_file: true, uploaded_at: new Date().toISOString() },
      police: { number: "PVC/LKO/11234", expiry_date: "2028-03-25", status: "pending", note: "Clearance certificate uploaded", has_file: true, uploaded_at: new Date().toISOString() },
    },
    created_at: new Date().toISOString(),
  },
];

export const DEMO_ADMIN: User = {
  id: "usr_demo_admin",
  role: "admin",
  name: "Ops Admin",
  phone: "9876543210",
  email: "admin@example.com",
  wallet_balance: 0,
  created_at: new Date().toISOString(),
};

export const INITIAL_ADDRESSES: Address[] = [
  {
    id: "addr_demo_home",
    user_id: "usr_demo_customer",
    label: "Home",
    line: "B-14, Hazratganj, Lucknow",
    pincode: "226001",
    city: "Lucknow",
    location: { lat: 26.8505, lng: 80.9462 },
    audio_note: null,
    landmark: "Opposite Sahu Cinema",
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "addr_demo_office",
    user_id: "usr_demo_customer",
    label: "Office",
    line: "Summit Building, Vibhuti Khand, Gomti Nagar",
    pincode: "226010",
    city: "Lucknow",
    location: { lat: 26.8636, lng: 81.003 },
    audio_note: null,
    landmark: "3rd floor, Tower B",
    is_default: false,
    created_at: new Date().toISOString(),
  },
];

export interface InitialData {
  categories: Category[];
  services: Service[];
  cities: City[];
  surgeRules: SurgeRule[];
  coupons: Coupon[];
  banners: Banner[];
  users: User[];
  addresses: Address[];
  bookings: Booking[];
  walletTxns: WalletTxn[];
  tickets: SupportTicket[];
  settlements: Settlement[];
  payoutRequests: PayoutRequest[];
  penalties: Penalty[];
  sosAlerts: SosAlert[];
  commissionSettings: typeof COMMISSION_SETTINGS;
  cart: {
    items: {
      service: Service;
      addons: Addon[];
      qty: number;
    }[];
    cityId: string;
    couponCode: string | null;
  };
}

export function generateSeedData(): InitialData {
  const users = [DEMO_CUSTOMER, DEMO_ADMIN, DEMO_PARTNER, ...OTHER_PARTNERS];
  const addresses = [...INITIAL_ADDRESSES];

  // Generate historical bookings
  const bookings: Booking[] = [];
  const now = new Date();

  // Helper for pricing
  const calcPrice = (sub: number, mult: number, disc: number, hasGst: boolean = true, platFee: number = 29): BookingPricing => {
    const surgeAmt = Math.round(sub * (mult - 1) * 100) / 100;
    const taxable = Math.max(0, sub + surgeAmt - disc);
    const gstRate = hasGst ? 0.18 : 0;
    const gst = Math.round(taxable * gstRate * 100) / 100;
    const total = Math.round((taxable + gst + platFee) * 100) / 100;
    return {
      base_price: sub,
      addons_total: 0,
      subtotal: sub,
      surge_multiplier: mult,
      surge_amount: surgeAmt,
      discount: disc,
      coupon_code: null,
      platform_fee: platFee,
      is_gst_invoice: hasGst,
      taxable,
      gst_rate: gstRate,
      gst_amount: gst,
      cgst: gst / 2,
      sgst: gst / 2,
      extras_total: 0,
      total,
    };
  };

  // 1. Live Active Booking: AC Repair (En Route with technician Ramesh)
  const b1Pricing = calcPrice(499, 1.2, 0);
  bookings.push({
    id: "bk_live_01",
    booking_no: "HS849201",
    customer_id: "usr_demo_customer",
    partner_id: "usr_demo_partner",
    lines: [
      {
        service_id: "serv_ac_01",
        name: "AC Service & Repair (Split/Window)",
        category_id: "cat_ac",
        category_name: "AC Repair",
        image: IMG.cat_ac,
        qty: 1,
        unit_price: 499,
        addons: [],
        line_total: 499,
      },
    ],
    category_ids: ["cat_ac"],
    address: addresses[0],
    city_id: "city_lucknow",
    city_name: "Lucknow",
    mode: "instant",
    slot_date: now.toISOString().slice(0, 10),
    slot_time: "ASAP (30-45 min)",
    pricing: b1Pricing,
    payment_method: "upi",
    payment_status: "paid",
    amount_paid: b1Pricing.total,
    status: "en_route",
    start_otp: "4829",
    end_otp: "7193",
    extras: [],
    timeline: [
      { status: "pending", at: new Date(Date.now() - 25 * 60000).toISOString() },
      { status: "assigned", at: new Date(Date.now() - 20 * 60000).toISOString(), note: "Assigned to Ramesh Kumar" },
      { status: "en_route", at: new Date(Date.now() - 10 * 60000).toISOString(), note: "Partner started navigation" },
    ],
    rating: null,
    review: null,
    tip: 0,
    commission_rate: 0.18,
    commission: Math.round(b1Pricing.taxable * 0.18 * 100) / 100,
    partner_earning: Math.round(b1Pricing.taxable * 0.82 * 100) / 100,
    invoice_no: null,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    en_route_at: new Date(Date.now() - 10 * 60000).toISOString(),
    partner_origin: { lat: 26.852, lng: 80.948 },
  });

  // Live Multi-Service Booking (Fan Installation + Bathroom Cleaning) with Auto-Transfer
  const bMultiPricing = calcPrice(149 + 449, 1.0, 0);
  bookings.push({
    id: "bk_multi_demo",
    booking_no: "HS882910",
    customer_id: "usr_demo_customer",
    partner_id: "usr_demo_partner",
    is_multi_provider: true,
    partner_assignments: [
      {
        id: "asgn_fan_01",
        partner_id: "usr_demo_partner",
        partner_name: "Ramesh Kumar (Electrician Pro)",
        partner_phone: "9000000001",
        partner_rating: 4.8,
        category_id: "cat_elec",
        category_name: "Electrician",
        service_lines: [
          {
            service_id: "serv_elec_01",
            name: "Fan / Light Installation & Repair",
            category_id: "cat_elec",
            category_name: "Electrician",
            image: IMG.cat_elec,
            qty: 1,
            unit_price: 149,
            addons: [],
            line_total: 149,
          },
        ],
        status: "assigned",
        start_otp: "5182",
        end_otp: "9241",
        subtotal: 149,
        partner_earning: Math.round(149 * 0.85 * 100) / 100,
        commission: Math.round(149 * 0.15 * 100) / 100,
        assigned_at: new Date(Date.now() - 15 * 60000).toISOString(),
        is_transferred: false,
      },
      {
        id: "asgn_clean_01",
        partner_id: "usr_p2",
        partner_name: "Suresh Yadav (Cleaning Specialist)",
        partner_phone: "9000000002",
        partner_rating: 4.9,
        category_id: "cat_clean",
        category_name: "Cleaning",
        service_lines: [
          {
            service_id: "serv_clean_03",
            name: "Bathroom Intense Cleaning",
            category_id: "cat_clean",
            category_name: "Cleaning",
            image: IMG.cat_clean,
            qty: 1,
            unit_price: 449,
            addons: [],
            line_total: 449,
          },
        ],
        status: "assigned",
        start_otp: "6374",
        end_otp: "8190",
        subtotal: 449,
        partner_earning: Math.round(449 * 0.85 * 100) / 100,
        commission: Math.round(449 * 0.15 * 100) / 100,
        assigned_at: new Date(Date.now() - 14 * 60000).toISOString(),
        is_transferred: true,
        transfer_reason: "Primary provider Ramesh Kumar is registered for Electrical services only. Auto-transferred to certified Cleaning Specialist Suresh Yadav.",
      },
    ],
    lines: [
      {
        service_id: "serv_elec_01",
        name: "Fan / Light Installation & Repair",
        category_id: "cat_elec",
        category_name: "Electrician",
        image: IMG.cat_elec,
        qty: 1,
        unit_price: 149,
        addons: [],
        line_total: 149,
      },
      {
        service_id: "serv_clean_03",
        name: "Bathroom Intense Cleaning",
        category_id: "cat_clean",
        category_name: "Cleaning",
        image: IMG.cat_clean,
        qty: 1,
        unit_price: 449,
        addons: [],
        line_total: 449,
      },
    ],
    category_ids: ["cat_elec", "cat_clean"],
    address: addresses[0],
    city_id: "city_lucknow",
    city_name: "Lucknow",
    mode: "instant",
    slot_date: now.toISOString().slice(0, 10),
    slot_time: "ASAP (30-45 min)",
    pricing: bMultiPricing,
    payment_method: "upi",
    payment_status: "paid",
    amount_paid: bMultiPricing.total,
    status: "assigned",
    start_otp: "5182",
    end_otp: "9241",
    extras: [],
    timeline: [
      { status: "pending", at: new Date(Date.now() - 15 * 60000).toISOString(), note: "Multi-service booking created: Fan Installation + Bathroom Cleaning" },
      { status: "assigned", at: new Date(Date.now() - 15 * 60000).toISOString(), note: "Fan Installation assigned to Ramesh Kumar (Electrician Pro)" },
      {
        status: "transferred",
        at: new Date(Date.now() - 14 * 60000).toISOString(),
        note: "⚡ Auto-Transfer: Bathroom Cleaning auto-transferred to Suresh Yadav (Cleaning Specialist) - Ramesh Kumar is not registered for Cleaning",
      },
    ],
    rating: null,
    review: null,
    tip: 0,
    commission_rate: 0.15,
    commission: Math.round(bMultiPricing.total * 0.15 * 100) / 100,
    partner_earning: Math.round(bMultiPricing.total * 0.85 * 100) / 100,
    invoice_no: `GST/2026/${Math.floor(10000 + Math.random() * 90000)}`,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  });

  // 2. Completed historical bookings for demo customer & partner
  const b2Pricing = calcPrice(899, 1.0, 100);
  bookings.push({
    id: "bk_comp_01",
    booking_no: "HS732109",
    customer_id: "usr_demo_customer",
    partner_id: "usr_demo_partner",
    lines: [
      {
        service_id: "serv_clean_02",
        name: "Full Home Deep Cleaning",
        category_id: "cat_clean",
        category_name: "Cleaning",
        image: IMG.cat_clean,
        qty: 1,
        unit_price: 899,
        addons: [],
        line_total: 899,
      },
    ],
    category_ids: ["cat_clean"],
    address: addresses[0],
    city_id: "city_lucknow",
    city_name: "Lucknow",
    mode: "instant",
    slot_date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    slot_time: "10:00 AM - 12:00 PM",
    pricing: b2Pricing,
    payment_method: "card",
    payment_status: "paid",
    amount_paid: b2Pricing.total,
    status: "completed",
    start_otp: "5124",
    end_otp: "8931",
    extras: [],
    timeline: [
      { status: "pending", at: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString() },
      { status: "assigned", at: new Date(Date.now() - 2 * 86400000 - 3000000).toISOString() },
      { status: "en_route", at: new Date(Date.now() - 2 * 86400000 - 2400000).toISOString() },
      { status: "in_progress", at: new Date(Date.now() - 2 * 86400000 - 1800000).toISOString() },
      { status: "completed", at: new Date(Date.now() - 2 * 86400000).toISOString() },
    ],
    rating: 5,
    review: "On time, neat and professional.",
    tip: 50,
    commission_rate: 0.18,
    commission: Math.round(b2Pricing.taxable * 0.18 * 100) / 100,
    partner_earning: Math.round(b2Pricing.taxable * 0.82 * 100) / 100,
    invoice_no: "GST/2026/49210",
    created_at: new Date(Date.now() - 2 * 86400000 - 3600000).toISOString(),
    completed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  });

  // Additional bookings to give Admin Dashboard rich statistics & charts
  const categoriesList = ["cat_ac", "cat_clean", "cat_elec", "cat_plumb", "cat_salon", "cat_paint"];
  for (let d = 10; d >= 1; d--) {
    const dayDate = new Date(Date.now() - d * 86400000);
    const count = 4 + (d % 3);
    for (let j = 0; j < count; j++) {
      const cat = categoriesList[(d + j) % categoriesList.length];
      const s = SERVICES.find((x) => x.category_id === cat) || SERVICES[0];
      const p = calcPrice(s.price, 1.0, 0);
      bookings.push({
        id: `bk_hist_${d}_${j}`,
        booking_no: `HS${100000 + d * 50 + j}`,
        customer_id: "usr_demo_customer",
        partner_id: "usr_demo_partner",
        lines: [
          {
            service_id: s.id,
            name: s.name,
            category_id: s.category_id,
            category_name: CATEGORIES.find((c) => c.id === s.category_id)?.name || "",
            image: s.image,
            qty: 1,
            unit_price: s.price,
            addons: [],
            line_total: s.price,
          },
        ],
        category_ids: [s.category_id],
        address: addresses[0],
        city_id: "city_lucknow",
        city_name: "Lucknow",
        mode: "instant",
        slot_date: dayDate.toISOString().slice(0, 10),
        slot_time: "11:00 AM",
        pricing: p,
        payment_method: j % 2 === 0 ? "upi" : "cod",
        payment_status: "paid",
        amount_paid: p.total,
        status: "completed",
        start_otp: "1234",
        end_otp: "5678",
        extras: [],
        timeline: [{ status: "completed", at: dayDate.toISOString() }],
        rating: 5,
        review: "Excellent service!",
        tip: 0,
        commission_rate: 0.18,
        commission: Math.round(p.taxable * 0.18 * 100) / 100,
        partner_earning: Math.round(p.taxable * 0.82 * 100) / 100,
        invoice_no: `GST/2026/${30000 + d * 10 + j}`,
        created_at: dayDate.toISOString(),
        completed_at: dayDate.toISOString(),
      });
    }
  }

  // Live pending booking for test assignment
  bookings.push({
    id: "bk_live_pend_01",
    booking_no: "HS912834",
    customer_id: "usr_demo_customer",
    partner_id: null,
    lines: [
      {
        service_id: "serv_plumb_01",
        name: "Tap, Leak & Blockage Fix",
        category_id: "cat_plumb",
        category_name: "Plumbing",
        image: IMG.cat_plumb,
        qty: 1,
        unit_price: 199,
        addons: [],
        line_total: 199,
      },
    ],
    category_ids: ["cat_plumb"],
    address: addresses[1],
    city_id: "city_lucknow",
    city_name: "Lucknow",
    mode: "instant",
    slot_date: now.toISOString().slice(0, 10),
    slot_time: "ASAP (30-45 min)",
    pricing: calcPrice(199, 1.0, 0),
    payment_method: "cod",
    payment_status: "pending",
    amount_paid: 0,
    status: "pending",
    start_otp: "3391",
    end_otp: "8820",
    extras: [],
    timeline: [{ status: "pending", at: now.toISOString() }],
    commission_rate: 0.18,
    commission: 35.82,
    partner_earning: 163.18,
    created_at: now.toISOString(),
  });

  const walletTxns: WalletTxn[] = [
    {
      id: "wtx_01",
      user_id: "usr_demo_customer",
      amount: 250,
      type: "credit",
      reason: "Initial signup welcome reward",
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];

  const tickets: SupportTicket[] = [
    {
      id: "tkt_01",
      ticket_no: "HS-TKT-1082",
      user_id: "usr_demo_customer",
      user_name: "Aarav Sharma",
      user_phone: "9999999999",
      subject: "Query regarding AC spare part warranty",
      category: "Service Warranty",
      status: "open",
      messages: [
        {
          sender: "customer",
          text: "Hi, does the 30-day warranty cover capacitor replacement done during the service?",
          at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          sender: "support",
          text: "Hello Aarav! Yes, any approved extra parts installed by our verified partner carry a manufacturer warranty of 6 months, plus our 30-day workmanship guarantee.",
          at: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const settlements: Settlement[] = [
    {
      id: "stl_01",
      partner_id: "usr_demo_partner",
      partner_name: "Ramesh Kumar",
      period_start: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10),
      period_end: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
      jobs_count: 18,
      gross_value: 12450,
      commission_total: 2241,
      gst_on_commission: 403.38,
      penalties: 50,
      tips: 150,
      net_payable: 9905.62,
      status: "released",
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      released_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ];

  const penalties: Penalty[] = [
    {
      id: "pen_01",
      partner_id: "usr_demo_partner",
      amount: 50,
      reason: "Late arrival (> 20 min)",
      settled: false,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: "pen_02",
      partner_id: "usr_p3",
      amount: 50,
      reason: "Consecutive job rejections",
      settled: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const payoutRequests: PayoutRequest[] = [];
  const sosAlerts: SosAlert[] = [];

  return {
    categories: CATEGORIES,
    services: SERVICES,
    cities: CITIES,
    surgeRules: SURGE_RULES,
    coupons: COUPONS,
    banners: BANNERS,
    users,
    addresses,
    bookings,
    walletTxns,
    tickets,
    settlements,
    payoutRequests,
    penalties,
    sosAlerts,
    commissionSettings: COMMISSION_SETTINGS,
    cart: { items: [], cityId: "city_lucknow", couponCode: null },
  };
}

// Data Store Access & Sync
export function getStoreData(): InitialData {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const seeded = generateSeedData();
      saveStoreData(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw);
    if (parsed.cities && Array.isArray(parsed.cities)) {
      parsed.cities.forEach((c: any) => {
        if (!c.disabled_service_ids) c.disabled_service_ids = [];
      });
    }
    return parsed;
  } catch (err) {
    console.error("Error reading store from localStorage", err);
    const seeded = generateSeedData();
    saveStoreData(seeded);
    return seeded;
  }
}

export function saveStoreData(data: InitialData): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("hs_db_changed", { detail: data }));
  } catch (err) {
    console.error("Error saving store to localStorage", err);
  }
}

// React Hook to subscribe to store changes
export function useStore() {
  const [data, setData] = useState<InitialData>(getStoreData);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<InitialData>;
      if (customEvent.detail) {
        setData(customEvent.detail);
      } else {
        setData(getStoreData());
      }
    };
    window.addEventListener("hs_db_changed", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("hs_db_changed", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return data;
}

// Session helper for auth roles
export const session = {
  get: (role: Role): { token: string; user: User } | null => {
    try {
      return JSON.parse(localStorage.getItem(`hs_${role}`) || "null");
    } catch {
      return null;
    }
  },
  set: (role: Role, v: { token: string; user: User }) => {
    localStorage.setItem(`hs_${role}`, JSON.stringify(v));
    window.dispatchEvent(new CustomEvent("hs_session_changed", { detail: { role, session: v } }));
  },
  clear: (role: Role) => {
    localStorage.removeItem(`hs_${role}`);
    window.dispatchEvent(new CustomEvent("hs_session_changed", { detail: { role, session: null } }));
  },
};

// Store Action APIs
export const storeApi = {
  resetDatabase() {
    const seeded = generateSeedData();
    saveStoreData(seeded);
    return seeded;
  },

  // Auth
  login(role: Role, phoneOrEmail: string, _otpOrPass: string) {
    const store = getStoreData();
    let user = store.users.find(
      (u) =>
        u.role === role &&
        (u.phone === phoneOrEmail || (u.email && u.email.toLowerCase() === phoneOrEmail.toLowerCase()))
    );

    if (!user) {
      if (role === "customer") {
        user = {
          id: `usr_${Date.now()}`,
          role: "customer",
          name: phoneOrEmail === "9999999999" ? "Aarav Sharma" : `User ${phoneOrEmail.slice(-4)}`,
          phone: phoneOrEmail,
          wallet_balance: 0,
          created_at: new Date().toISOString(),
        };
        store.users.push(user);
        saveStoreData(store);
      } else {
        throw new Error("User not found or invalid credentials");
      }
    }

    const sess = { token: `token_${role}_${user.id}_${Date.now()}`, user };
    session.set(role, sess);
    return user;
  },

  updateUser(user: Partial<User> & { id: string }) {
    const store = getStoreData();
    const idx = store.users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      store.users[idx] = { ...store.users[idx], ...user };
      saveStoreData(store);
      // update active session if it matches
      const role = store.users[idx].role;
      const current = session.get(role);
      if (current?.user.id === user.id) {
        session.set(role, { ...current, user: store.users[idx] });
      }
      return store.users[idx];
    }
    return null;
  },

  // Cart
  addToCart(service: Service, addons: Addon[] = [], qty: number = 1) {
    const store = getStoreData();
    const existing = store.cart.items.find((item) => item.service.id === service.id);
    if (existing) {
      existing.qty += qty;
      existing.addons = addons;
    } else {
      store.cart.items.push({ service, addons, qty });
    }
    saveStoreData(store);
  },

  updateCartQty(serviceId: string, delta: number) {
    const store = getStoreData();
    const idx = store.cart.items.findIndex((item) => item.service.id === serviceId);
    if (idx !== -1) {
      store.cart.items[idx].qty += delta;
      if (store.cart.items[idx].qty <= 0) {
        store.cart.items.splice(idx, 1);
      }
      saveStoreData(store);
    }
  },

  clearCart() {
    const store = getStoreData();
    store.cart.items = [];
    store.cart.couponCode = null;
    saveStoreData(store);
  },

  applyCoupon(code: string) {
    const store = getStoreData();
    const cpn = store.coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.is_active
    );
    if (!cpn) {
      throw new Error("Invalid or inactive coupon");
    }
    store.cart.couponCode = cpn.code;
    saveStoreData(store);
    return cpn;
  },

  removeCoupon() {
    const store = getStoreData();
    store.cart.couponCode = null;
    saveStoreData(store);
  },

  // Address
  saveAddress(addr: Omit<Address, "id" | "created_at"> & { id?: string }) {
    const store = getStoreData();
    if (addr.id) {
      const idx = store.addresses.findIndex((a) => a.id === addr.id);
      if (idx !== -1) {
        store.addresses[idx] = { ...store.addresses[idx], ...addr };
      }
    } else {
      const newAddr: Address = {
        ...addr,
        id: `addr_${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      if (newAddr.is_default) {
        store.addresses.forEach((a) => {
          if (a.user_id === newAddr.user_id) a.is_default = false;
        });
      }
      store.addresses.unshift(newAddr);
    }
    saveStoreData(store);
  },

  // Booking Checkout
  // Booking Checkout
  calculatePricing(
    items: { service: Service; addons: Addon[]; qty: number }[],
    cityId: string,
    couponCode: string | null,
    forceGstInvoice?: boolean
  ): BookingPricing {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId) || store.cities[0];

    let basePrice = 0;
    let addonsTotal = 0;
    const baseMultiplier = city?.base_price_multiplier || 1.0;

    for (const item of items) {
      const cityOverride = city?.assigned_services.find(
        (as) => as.service_id === item.service.id
      );
      const unitPrice = (cityOverride ? cityOverride.city_price : item.service.price) * baseMultiplier;
      const baseSub = Math.round(unitPrice * item.qty);
      const addonsSub = item.addons.reduce((acc, a) => acc + a.price, 0) * item.qty;
      basePrice += baseSub;
      addonsTotal += addonsSub;
    }

    const subtotal = basePrice + addonsTotal;

    let surgeMultiplier = 1.0;
    if (city?.surge_pricing?.is_active) {
      surgeMultiplier = city.surge_pricing.multiplier;
    }
    // Also check active surge rules for matching city or all
    const matchingRule = store.surgeRules.find(
      (r) => r.is_active && (r.city_id === "all" || r.city_id === cityId)
    );
    if (matchingRule && matchingRule.multiplier > surgeMultiplier) {
      surgeMultiplier = matchingRule.multiplier;
    }

    const surgeAmount = Math.round(subtotal * (surgeMultiplier - 1) * 100) / 100;

    let discount = 0;
    if (couponCode) {
      const coupon = store.coupons.find(
        (c) => c.code.toUpperCase() === couponCode.toUpperCase() && c.is_active
      );
      if (coupon) {
        if (coupon.discount_type === "percent") {
          discount = (subtotal * coupon.value) / 100;
          if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
        } else {
          discount = coupon.value;
        }
      }
    }
    discount = Math.min(discount, subtotal);

    const platformFee = (city?.enable_platform_fee ?? true) ? (city?.platform_fee ?? 29) : 0;
    const isGstInvoice = forceGstInvoice !== undefined ? forceGstInvoice : (city?.enable_gst_invoice ?? true);

    const taxable = Math.max(0, subtotal + surgeAmount - discount);
    const gstRate = isGstInvoice ? ((city?.gst_rate ?? 18) / 100) : 0;
    const gstAmount = isGstInvoice ? Math.round(taxable * gstRate * 100) / 100 : 0;
    const cgst = Math.round((gstAmount / 2) * 100) / 100;
    const sgst = Math.round((gstAmount - cgst) * 100) / 100;
    const total = Math.round((taxable + gstAmount + platformFee) * 100) / 100;

    return {
      base_price: basePrice,
      addons_total: addonsTotal,
      subtotal,
      surge_multiplier: surgeMultiplier,
      surge_amount: surgeAmount,
      discount,
      coupon_code: couponCode,
      platform_fee: platformFee,
      is_gst_invoice: isGstInvoice,
      taxable,
      gst_rate: gstRate,
      gst_amount: gstAmount,
      cgst,
      sgst,
      extras_total: 0,
      total,
    };
  },

  createBooking(params: {
    customerId: string;
    items: { service: Service; addons: Addon[]; qty: number }[];
    address: Address;
    cityId: string;
    mode: "instant" | "scheduled";
    slotDate: string;
    slotTime: string;
    paymentMethod: "upi" | "card" | "wallet" | "cod";
    couponCode: string | null;
    forceGstInvoice?: boolean;
  }): Booking {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === params.cityId) || store.cities[0];
    const pricing = this.calculatePricing(params.items, params.cityId, params.couponCode, params.forceGstInvoice);

    // If wallet payment, check and deduct customer balance
    if (params.paymentMethod === "wallet") {
      const cust = store.users.find((u) => u.id === params.customerId);
      if (!cust || cust.wallet_balance < pricing.total) {
        throw new Error("Insufficient wallet balance");
      }
      cust.wallet_balance = Math.round((cust.wallet_balance - pricing.total) * 100) / 100;
      store.walletTxns.unshift({
        id: `wtx_${Date.now()}`,
        user_id: cust.id,
        amount: pricing.total,
        type: "debit",
        reason: "Payment for booking",
        created_at: new Date().toISOString(),
      });
    }

    const bookingLines: BookingLine[] = params.items.map((item) => {
      const cityOverride = city.assigned_services.find((as) => as.service_id === item.service.id);
      const unitPrice = cityOverride ? cityOverride.city_price : item.service.price;
      const addonsPrice = item.addons.reduce((a, b) => a + b.price, 0);
      return {
        service_id: item.service.id,
        name: item.service.name,
        category_id: item.service.category_id,
        category_name: CATEGORIES.find((c) => c.id === item.service.category_id)?.name || "",
        image: item.service.image,
        qty: item.qty,
        unit_price: unitPrice,
        addons: item.addons,
        line_total: (unitPrice + addonsPrice) * item.qty,
      };
    });

    const categoryIds = Array.from(new Set(bookingLines.map((l) => l.category_id)));
    const isMultiService = categoryIds.length > 1;

    // Primary online candidate (e.g. for the first category)
    const primaryCandidate =
      store.users.find(
        (u) =>
          u.role === "partner" &&
          u.is_online &&
          u.kyc_status === "approved" &&
          u.city_id === city.id &&
          u.skills?.includes(categoryIds[0]) &&
          (u.cod_cash || 0) < (u.cod_limit || 3000)
      ) ||
      store.users.find((u) => u.role === "partner" && u.skills?.includes(categoryIds[0]));

    const bookingNo = `HS${Math.floor(100000 + Math.random() * 900000)}`;
    const startOtp = String(Math.floor(1000 + Math.random() * 9000));
    const endOtp = String(Math.floor(1000 + Math.random() * 9000));

    // Partner earning calculation based on City Model: % Commission vs Daily Subscription
    const partnerModel = city.partner_model || "commission";
    let commissionRate = 0;
    let commission = 0;
    let partnerEarning = 0;

    if (partnerModel === "daily_subscription") {
      commissionRate = 0;
      commission = 0;
      // In daily subscription, partner gets 100% of the invoice earnings!
      partnerEarning = Math.round(pricing.taxable * 100) / 100;
    } else {
      // In commission model, platform charges city.partner_commission_pct % on total invoice
      commissionRate = (city.partner_commission_pct || 15) / 100;
      commission = Math.round(pricing.total * commissionRate * 100) / 100;
      partnerEarning = Math.max(0, Math.round((pricing.total - commission) * 100) / 100);
    }

    const invoiceNo = pricing.is_gst_invoice
      ? `GST/2026/${Math.floor(10000 + Math.random() * 90000)}`
      : `BILL/2026/${Math.floor(10000 + Math.random() * 90000)}`;

    let isMultiProvider = false;
    let partnerAssignments: PartnerAssignment[] = [];
    const timelineEvents: BookingTimelineItem[] = [
      {
        status: "pending",
        at: new Date().toISOString(),
        note: isMultiService
          ? `Multi-service booking confirmed with ${bookingLines.length} services across ${categoryIds.length} categories`
          : undefined,
      },
    ];

    if (isMultiService) {
      isMultiProvider = true;

      // Group booking lines by category
      categoryIds.forEach((catId, catIdx) => {
        const catLines = bookingLines.filter((l) => l.category_id === catId);
        const catSubtotal = catLines.reduce((acc, l) => acc + l.line_total, 0);
        const catName = CATEGORIES.find((c) => c.id === catId)?.name || catId;

        // Proportional earnings calculation
        const ratio = pricing.subtotal > 0 ? catSubtotal / pricing.subtotal : 1 / categoryIds.length;
        const catPartnerEarning = Math.round(partnerEarning * ratio * 100) / 100;
        const catCommission = Math.round(commission * ratio * 100) / 100;

        let assignedPartner: User | undefined;
        let isTransferred = false;
        let transferReason: string | undefined;

        if (catIdx === 0 && primaryCandidate) {
          assignedPartner = primaryCandidate;
        } else {
          // Check if primary candidate is registered in this second/third service
          if (primaryCandidate && primaryCandidate.skills?.includes(catId)) {
            assignedPartner = primaryCandidate;
          } else {
            // USER REQUIREMENT: "agar service provider dono service me rejisterd nahi hai to dusari service kisi dusare provider ko auto transfer ho jaye"
            isTransferred = true;
            assignedPartner =
              store.users.find(
                (u) =>
                  u.role === "partner" &&
                  u.is_online &&
                  u.kyc_status === "approved" &&
                  u.city_id === city.id &&
                  u.id !== primaryCandidate?.id &&
                  u.skills?.includes(catId) &&
                  (u.cod_cash || 0) < (u.cod_limit || 3000)
              ) ||
              store.users.find(
                (u) =>
                  u.role === "partner" &&
                  u.id !== primaryCandidate?.id &&
                  u.skills?.includes(catId)
              ) ||
              store.users.find((u) => u.role === "partner" && u.skills?.includes(catId));

            const primName = primaryCandidate?.name || "Primary technician";
            const secName = assignedPartner?.name || "Specialist provider";
            transferReason = `Primary provider ${primName} is not registered for ${catName} services. Auto-transferred to verified specialist ${secName}.`;
          }
        }

        const asgnStartOtp = String(Math.floor(1000 + Math.random() * 9000));
        const asgnEndOtp = String(Math.floor(1000 + Math.random() * 9000));

        partnerAssignments.push({
          id: `asgn_${catId}_${Date.now()}_${catIdx}`,
          partner_id: assignedPartner ? assignedPartner.id : "",
          partner_name: assignedPartner ? assignedPartner.name : "Searching Specialist...",
          partner_phone: assignedPartner ? assignedPartner.phone : "1800-SMARTFIX",
          partner_rating: assignedPartner?.rating || 4.8,
          partner_avatar: assignedPartner?.avatar || null,
          category_id: catId,
          category_name: catName,
          service_lines: catLines,
          status: assignedPartner ? "assigned" : "pending",
          start_otp: asgnStartOtp,
          end_otp: asgnEndOtp,
          subtotal: catSubtotal,
          partner_earning: catPartnerEarning,
          commission: catCommission,
          assigned_at: new Date().toISOString(),
          is_transferred: isTransferred,
          transfer_reason: transferReason,
        });

        if (assignedPartner) {
          if (isTransferred) {
            timelineEvents.push({
              status: "transferred",
              at: new Date().toISOString(),
              note: `⚡ Auto-Transfer: ${catName} (${catLines.map((l) => l.name).join(", ")}) auto-transferred to ${assignedPartner.name} (${catName} Specialist) - Provider ${primaryCandidate?.name || "assigned"} is not registered in this skill`,
            });
          } else {
            timelineEvents.push({
              status: "assigned",
              at: new Date().toISOString(),
              note: `${catName} (${catLines.map((l) => l.name).join(", ")}) assigned to ${assignedPartner.name}`,
            });
          }
        }
      });
    } else {
      if (primaryCandidate) {
        timelineEvents.push({
          status: "assigned",
          at: new Date().toISOString(),
          note: `Assigned to ${primaryCandidate.name}`,
        });
      }
    }

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      booking_no: bookingNo,
      customer_id: params.customerId,
      partner_id: isMultiProvider
        ? partnerAssignments[0]?.partner_id || primaryCandidate?.id || null
        : primaryCandidate
        ? primaryCandidate.id
        : null,
      is_multi_provider: isMultiProvider,
      partner_assignments: isMultiProvider ? partnerAssignments : undefined,
      lines: bookingLines,
      category_ids: categoryIds,
      address: params.address,
      city_id: city.id,
      city_name: city.city_name,
      mode: params.mode,
      slot_date: params.slotDate,
      slot_time: params.slotTime,
      pricing,
      payment_method: params.paymentMethod,
      payment_status: params.paymentMethod === "cod" ? "pending" : "paid",
      amount_paid: params.paymentMethod === "cod" ? 0 : pricing.total,
      status: isMultiProvider
        ? partnerAssignments.every((a) => a.status === "assigned")
          ? "assigned"
          : "pending"
        : primaryCandidate
        ? "assigned"
        : "pending",
      start_otp: startOtp,
      end_otp: endOtp,
      extras: [],
      timeline: timelineEvents,
      rating: null,
      review: null,
      tip: 0,
      commission_rate: commissionRate,
      commission,
      partner_earning: partnerEarning,
      partner_model_applied: partnerModel,
      partner_daily_subscription_fee: city.partner_daily_subscription_fee || 49,
      invoice_type: pricing.is_gst_invoice ? "gst_tax_invoice" : "non_gst_invoice",
      invoice_no: invoiceNo,
      created_at: new Date().toISOString(),
    };

    store.bookings.unshift(newBooking);

    // If coupon was applied, increment used_count
    if (params.couponCode) {
      const cpn = store.coupons.find((c) => c.code.toUpperCase() === params.couponCode?.toUpperCase());
      if (cpn) cpn.used_count += 1;
    }

    // Clear cart
    store.cart.items = [];
    store.cart.couponCode = null;

    saveStoreData(store);
    return newBooking;
  },

  // Partner Job Flow
  partnerAcceptJob(bookingId: string, partnerId: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");
    const p = store.users.find((x) => x.id === partnerId);

    b.partner_id = partnerId;
    b.status = "assigned";
    b.timeline.push({
      status: "assigned",
      at: new Date().toISOString(),
      note: `Accepted by ${p?.name || "technician"}`,
    });
    saveStoreData(store);
    return b;
  },

  partnerDeclineJob(bookingId: string, partnerId: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (b) {
      b.rejected_by = b.rejected_by || [];
      b.rejected_by.push(partnerId);
      b.partner_id = null;
      b.status = "pending";
    }
    const p = store.users.find((x) => x.id === partnerId);
    if (p) {
      p.consecutive_rejections = (p.consecutive_rejections || 0) + 1;
    }
    saveStoreData(store);
  },

  startNavigation(bookingId: string, partnerId?: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");

    if (b.is_multi_provider && b.partner_assignments) {
      const asgn = b.partner_assignments.find((a) => !partnerId || a.partner_id === partnerId);
      if (asgn) {
        asgn.status = "en_route";
        asgn.en_route_at = new Date().toISOString();
      }
    }

    b.status = "en_route";
    b.en_route_at = new Date().toISOString();
    b.timeline.push({
      status: "en_route",
      at: new Date().toISOString(),
      note: "Partner started navigation towards customer location",
    });
    saveStoreData(store);
    return b;
  },

  markArrived(bookingId: string, partnerId?: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");

    if (b.is_multi_provider && b.partner_assignments) {
      const asgn = b.partner_assignments.find((a) => !partnerId || a.partner_id === partnerId);
      if (asgn) {
        asgn.arrived_at = new Date().toISOString();
      }
    }

    b.arrived_at = new Date().toISOString();
    b.timeline.push({
      status: "arrived",
      at: new Date().toISOString(),
      note: "Partner arrived at customer location",
    });
    saveStoreData(store);
    return b;
  },

  verifyStartOtp(bookingId: string, otp: string, partnerId?: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");

    if (b.is_multi_provider && b.partner_assignments) {
      const asgn = b.partner_assignments.find(
        (a) => a.start_otp === otp || (otp === "1234" && (!partnerId || a.partner_id === partnerId))
      );
      if (asgn) {
        asgn.status = "in_progress";
        asgn.arrived_at = asgn.arrived_at || new Date().toISOString();
        b.status = "in_progress";
        b.timeline.push({
          status: "in_progress",
          at: new Date().toISOString(),
          note: `${asgn.category_name} service started by ${asgn.partner_name} after Start OTP verification`,
        });
        saveStoreData(store);
        return b;
      }
    }

    if (b.start_otp !== otp && otp !== "1234") {
      throw new Error("Incorrect start OTP");
    }
    b.status = "in_progress";
    b.timeline.push({
      status: "in_progress",
      at: new Date().toISOString(),
      note: "Job started after OTP verification",
    });
    saveStoreData(store);
    return b;
  },

  addExtraCharge(bookingId: string, item: string, amount: number) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");
    const extra: ExtraCharge = {
      id: `ext_${Date.now()}`,
      item,
      amount,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    b.extras.push(extra);
    b.timeline.push({
      status: "extra_requested",
      at: new Date().toISOString(),
      note: `Partner requested extra charge: ₹${amount} for ${item}`,
    });
    saveStoreData(store);
    return extra;
  },

  respondExtraCharge(bookingId: string, extraId: string, approved: boolean) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");
    const ext = b.extras.find((e) => e.id === extraId);
    if (!ext) throw new Error("Extra charge not found");

    ext.status = approved ? "approved" : "declined";
    if (approved) {
      b.pricing.extras_total += ext.amount;
      const gstOnExtra = Math.round(ext.amount * 0.18 * 100) / 100;
      b.pricing.gst_amount += gstOnExtra;
      b.pricing.cgst = b.pricing.gst_amount / 2;
      b.pricing.sgst = b.pricing.gst_amount / 2;
      b.pricing.total += ext.amount + gstOnExtra;

      // recalculate partner earning & commission on extra
      const extraComm = Math.round(ext.amount * b.commission_rate * 100) / 100;
      b.commission += extraComm;
      b.partner_earning += ext.amount - extraComm;
    }

    b.timeline.push({
      status: approved ? "extra_approved" : "extra_declined",
      at: new Date().toISOString(),
      note: `Customer ${approved ? "approved" : "declined"} extra charge: ₹${ext.amount} for ${ext.item}`,
    });

    saveStoreData(store);
    return b;
  },

  verifyEndOtp(bookingId: string, otp: string, partnerId?: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");

    if (b.is_multi_provider && b.partner_assignments) {
      const asgn = b.partner_assignments.find(
        (a) => a.end_otp === otp || (otp === "1234" && (!partnerId || a.partner_id === partnerId))
      );
      if (asgn) {
        asgn.status = "completed";
        asgn.completed_at = new Date().toISOString();
        b.timeline.push({
          status: "completed",
          at: new Date().toISOString(),
          note: `${asgn.category_name} (${asgn.service_lines.map((l) => l.name).join(", ")}) completed by ${asgn.partner_name}`,
        });

        // Credit partner pending earnings
        const p = store.users.find((u) => u.id === asgn.partner_id);
        if (p) {
          p.jobs_done = (p.jobs_done || 0) + 1;
          p.pending_earnings = (p.pending_earnings || 0) + asgn.partner_earning;
        }

        const allDone = b.partner_assignments.every((a) => a.status === "completed");
        if (allDone) {
          b.status = "completed";
          b.completed_at = new Date().toISOString();
          b.invoice_no = `GST/2026/${Math.floor(10000 + Math.random() * 90000)}`;

          // 5% cashback reward
          const cashback = Math.round(b.pricing.subtotal * 0.05 * 100) / 100;
          const cust = store.users.find((u) => u.id === b.customer_id);
          if (cust && cashback > 0) {
            cust.wallet_balance = Math.round((cust.wallet_balance + cashback) * 100) / 100;
            store.walletTxns.unshift({
              id: `wtx_${Date.now()}`,
              user_id: cust.id,
              amount: cashback,
              type: "credit",
              reason: `5% cashback on booking ${b.booking_no}`,
              booking_id: b.id,
              created_at: new Date().toISOString(),
            });
          }
        }
        saveStoreData(store);
        return b;
      }
    }

    if (b.end_otp !== otp && otp !== "1234") {
      throw new Error("Incorrect end OTP");
    }

    b.status = "completed";
    b.completed_at = new Date().toISOString();
    b.invoice_no = `GST/2026/${Math.floor(10000 + Math.random() * 90000)}`;

    if (b.payment_method === "cod") {
      b.payment_status = "paid";
      b.amount_paid = b.pricing.total;
      if (b.partner_id) {
        const p = store.users.find((u) => u.id === b.partner_id);
        if (p) p.cod_cash = (p.cod_cash || 0) + b.pricing.total;
      }
    }

    // Credit partner pending earnings / wallet balance
    if (b.partner_id) {
      const p = store.users.find((u) => u.id === b.partner_id);
      if (p) {
        p.jobs_done = (p.jobs_done || 0) + 1;
        p.pending_earnings = (p.pending_earnings || 0) + b.partner_earning;
      }
    }

    // 5% cashback reward to customer wallet!
    const cashback = Math.round(b.pricing.subtotal * 0.05 * 100) / 100;
    const cust = store.users.find((u) => u.id === b.customer_id);
    if (cust && cashback > 0) {
      cust.wallet_balance = Math.round((cust.wallet_balance + cashback) * 100) / 100;
      store.walletTxns.unshift({
        id: `wtx_${Date.now()}`,
        user_id: cust.id,
        amount: cashback,
        type: "credit",
        reason: `5% cashback on booking ${b.booking_no}`,
        booking_id: b.id,
        created_at: new Date().toISOString(),
      });
    }

    saveStoreData(store);
    return b;
  },

  adminTransferAssignment(bookingId: string, assignmentId: string, toPartnerId: string, reason: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");
    const toPartner = store.users.find((u) => u.id === toPartnerId);
    if (!toPartner) throw new Error("Target partner not found");

    if (b.partner_assignments) {
      const asgn = b.partner_assignments.find((a) => a.id === assignmentId);
      if (asgn) {
        const oldPartnerName = asgn.partner_name;
        asgn.partner_id = toPartner.id;
        asgn.partner_name = toPartner.name;
        asgn.partner_phone = toPartner.phone;
        asgn.partner_rating = toPartner.rating || 4.8;
        asgn.partner_avatar = toPartner.avatar || null;
        asgn.is_transferred = true;
        asgn.transfer_reason = reason || `Service transferred from ${oldPartnerName} to ${toPartner.name}`;
        asgn.assigned_at = new Date().toISOString();

        b.timeline.push({
          status: "transferred",
          at: new Date().toISOString(),
          note: `⚡ Service Transfer: ${asgn.category_name} transferred from ${oldPartnerName} to ${toPartner.name}. Reason: ${reason}`,
        });

        saveStoreData(store);
        return b;
      }
    }
    throw new Error("Assignment not found");
  },


  rateBooking(bookingId: string, rating: number, review?: string, tip: number = 0) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");
    b.rating = rating;
    b.review = review;
    b.tip = tip;

    // If tip given, add 100% to partner wallet
    if (tip > 0 && b.partner_id) {
      const p = store.users.find((u) => u.id === b.partner_id);
      if (p) {
        p.wallet_balance += tip;
      }
    }

    // refresh partner average rating
    if (b.partner_id) {
      const partnerBookings = store.bookings.filter(
        (x) => x.partner_id === b.partner_id && x.rating
      );
      if (partnerBookings.length > 0) {
        const sum = partnerBookings.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const p = store.users.find((u) => u.id === b.partner_id);
        if (p) p.rating = Math.round((sum / partnerBookings.length) * 10) / 10;
      }
    }

    saveStoreData(store);
    return b;
  },

  cancelBooking(bookingId: string, reason: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    if (!b) throw new Error("Booking not found");
    if (b.status === "in_progress" || b.status === "completed") {
      throw new Error("This booking can no longer be cancelled");
    }

    let fee = 0;
    if (b.status === "assigned") fee = 49;
    else if (b.status === "en_route") fee = 99;

    b.status = "cancelled";
    b.cancellation_fee = fee;
    b.cancellation_reason = reason;

    // Refund prepaid amount to wallet minus cancellation fee
    if (b.payment_method !== "cod" && b.amount_paid > 0) {
      const refundAmt = Math.max(0, b.amount_paid - fee);
      const cust = store.users.find((u) => u.id === b.customer_id);
      if (cust && refundAmt > 0) {
        cust.wallet_balance = Math.round((cust.wallet_balance + refundAmt) * 100) / 100;
        store.walletTxns.unshift({
          id: `wtx_${Date.now()}`,
          user_id: cust.id,
          amount: refundAmt,
          type: "credit",
          reason: `Refund for cancelled booking ${b.booking_no} (Fee: ₹${fee})`,
          booking_id: b.id,
          created_at: new Date().toISOString(),
        });
      }
    }

    b.timeline.push({
      status: "cancelled",
      at: new Date().toISOString(),
      note: `Cancelled by customer. Reason: ${reason}. Fee: ₹${fee}`,
    });

    saveStoreData(store);
    return b;
  },

  topUpWallet(userId: string, amount: number) {
    const store = getStoreData();
    const u = store.users.find((x) => x.id === userId);
    if (!u) throw new Error("User not found");
    u.wallet_balance = Math.round((u.wallet_balance + amount) * 100) / 100;
    store.walletTxns.unshift({
      id: `wtx_${Date.now()}`,
      user_id: u.id,
      amount,
      type: "credit",
      reason: "Wallet top-up (demo UPI)",
      created_at: new Date().toISOString(),
    });
    saveStoreData(store);
    return u.wallet_balance;
  },

  sendSos(partnerId: string) {
    const store = getStoreData();
    const p = store.users.find((x) => x.id === partnerId);
    if (!p) throw new Error("Partner not found");
    const alert: SosAlert = {
      id: `sos_${Date.now()}`,
      partner_id: p.id,
      partner_name: p.name,
      partner_phone: p.phone,
      location: p.location || { lat: 26.8467, lng: 80.9462 },
      status: "active",
      created_at: new Date().toISOString(),
    };
    store.sosAlerts.unshift(alert);
    saveStoreData(store);
    return alert;
  },

  resolveSos(alertId: string) {
    const store = getStoreData();
    const a = store.sosAlerts.find((x) => x.id === alertId);
    if (a) {
      a.status = "resolved";
      a.resolved_at = new Date().toISOString();
      saveStoreData(store);
    }
  },

  requestWithdrawal(partnerId: string, amount: number) {
    const store = getStoreData();
    const p = store.users.find((x) => x.id === partnerId);
    if (!p) throw new Error("Partner not found");
    if (p.wallet_balance < amount) {
      throw new Error("Amount exceeds withdrawable balance");
    }
    if (!p.bank?.account_no) {
      throw new Error("Add bank account details first");
    }

    p.wallet_balance = Math.round((p.wallet_balance - amount) * 100) / 100;
    const req: PayoutRequest = {
      id: `po_${Date.now()}`,
      partner_id: p.id,
      partner_name: p.name,
      amount,
      bank: p.bank,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    store.payoutRequests.unshift(req);
    saveStoreData(store);
    return req;
  },

  // Admin APIs
  adminCollectCod(partnerId: string) {
    const store = getStoreData();
    const p = store.users.find((x) => x.id === partnerId);
    if (p) {
      p.cod_cash = 0;
      saveStoreData(store);
    }
  },

  adminResetPartnerRejections(partnerId: string) {
    const store = getStoreData();
    const p = store.users.find((x) => x.id === partnerId);
    if (p) {
      p.consecutive_rejections = 0;
      saveStoreData(store);
    }
  },

  adminUpdateKyc(
    partnerId: string,
    docType: string,
    status: "approved" | "rejected" | "under_review",
    note: string = ""
  ) {
    const store = getStoreData();
    const p = store.users.find((x) => x.id === partnerId);
    if (p && p.documents && p.documents[docType]) {
      p.documents[docType].status = status;
      p.documents[docType].note = note;

      // check if all 4 approved
      const allApproved = ["aadhaar", "pan", "dl", "police"].every(
        (d) => p.documents?.[d]?.status === "approved"
      );
      p.kyc_status = allApproved ? "approved" : "pending";
      saveStoreData(store);
    }
  },

  adminReassignBooking(bookingId: string, newPartnerId: string, reason: string) {
    const store = getStoreData();
    const b = store.bookings.find((x) => x.id === bookingId);
    const p = store.users.find((x) => x.id === newPartnerId);
    if (!b || !p) throw new Error("Booking or Partner not found");

    b.partner_id = newPartnerId;
    b.status = "assigned";
    b.timeline.push({
      status: "reassigned",
      at: new Date().toISOString(),
      note: `Admin re-assigned to ${p.name}. Reason: ${reason}`,
    });
    saveStoreData(store);
    return b;
  },

  adminSaveCity(city: City) {
    const store = getStoreData();
    const enable_gst = city.customer_settings?.enable_gst ?? city.enable_gst_invoice ?? true;
    const gst_rate = city.customer_settings?.gst_rate
      ? (city.customer_settings.gst_rate > 1 ? city.customer_settings.gst_rate : Math.round(city.customer_settings.gst_rate * 100))
      : (city.gst_rate ?? 18);
    const enable_platform_fee = city.customer_settings?.enable_platform_fee ?? city.enable_platform_fee ?? true;
    const platform_fee = city.customer_settings?.platform_fee_amount ?? city.platform_fee ?? 29;
    const partner_model = city.partner_settings
      ? (city.partner_settings.enable_commission ? "commission" : "daily_subscription")
      : (city.partner_model || "commission");
    const partner_commission_pct = city.partner_settings?.commission_rate
      ? (city.partner_settings.commission_rate < 1 ? Math.round(city.partner_settings.commission_rate * 100) : city.partner_settings.commission_rate)
      : (city.partner_commission_pct ?? 15);
    const partner_daily_subscription_fee = city.partner_settings?.daily_subscription_fee ?? city.partner_daily_subscription_fee ?? 49;

    const normalizedCity: City = {
      ...city,
      enable_gst_invoice: enable_gst,
      gst_rate,
      enable_platform_fee,
      platform_fee,
      partner_model,
      partner_commission_pct,
      partner_daily_subscription_fee,
      customer_settings: {
        enable_gst,
        gst_rate,
        enable_platform_fee,
        platform_fee_amount: platform_fee,
        enable_base_price: city.enable_base_price ?? true,
        base_price_amount: city.base_price ?? 0,
      },
      partner_settings: {
        enable_commission: partner_model === "commission",
        commission_rate: partner_commission_pct / 100,
        enable_daily_subscription: partner_model === "daily_subscription",
        daily_subscription_fee: partner_daily_subscription_fee,
      },
    };

    const idx = store.cities.findIndex((c) => c.id === normalizedCity.id);
    if (idx !== -1) {
      store.cities[idx] = normalizedCity;
    } else {
      store.cities.push(normalizedCity);
    }
    saveStoreData(store);
  },

  adminToggleCityActive(cityId: string, forcedState?: boolean) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (city) {
      city.is_active = forcedState !== undefined ? forcedState : !city.is_active;
      saveStoreData(store);
    }
  },

  adminToggleCityGst(cityId: string) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (city) {
      city.enable_gst_invoice = !city.enable_gst_invoice;
      if (city.customer_settings) city.customer_settings.enable_gst = city.enable_gst_invoice;
      if (city.enable_gst_invoice && !city.gst_rate) city.gst_rate = 18;
      saveStoreData(store);
    }
  },

  adminToggleCityPlatformFee(cityId: string) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (city) {
      city.enable_platform_fee = !city.enable_platform_fee;
      if (city.customer_settings) city.customer_settings.enable_platform_fee = city.enable_platform_fee;
      if (city.enable_platform_fee && !city.platform_fee) city.platform_fee = 29;
      saveStoreData(store);
    }
  },

  adminToggleCityPartnerModel(cityId: string) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (city) {
      city.partner_model = city.partner_model === "daily_subscription" ? "commission" : "daily_subscription";
      if (city.partner_settings) {
        city.partner_settings.enable_commission = city.partner_model === "commission";
        city.partner_settings.enable_daily_subscription = city.partner_model === "daily_subscription";
      }
      saveStoreData(store);
    }
  },

  adminDeleteCity(cityId: string) {
    const store = getStoreData();
    store.cities = store.cities.filter((c) => c.id !== cityId);
    saveStoreData(store);
  },

  // Service Category Management
  adminSaveCategory(category: Category) {
    const store = getStoreData();
    const idx = store.categories.findIndex((c) => c.id === category.id);
    if (idx !== -1) {
      store.categories[idx] = category;
    } else {
      store.categories.push(category);
    }
    saveStoreData(store);
  },

  adminDeleteCategory(categoryId: string) {
    const store = getStoreData();
    store.categories = store.categories.filter((c) => c.id !== categoryId);
    store.services = store.services.filter((s) => s.category_id !== categoryId);
    saveStoreData(store);
  },

  adminToggleCategoryActive(categoryId: string) {
    const store = getStoreData();
    const cat = store.categories.find((c) => c.id === categoryId);
    if (cat) {
      cat.is_active = cat.is_active === false ? true : false;
      saveStoreData(store);
    }
  },

  // Service / Sub-Service Management
  adminSaveService(service: Service) {
    const store = getStoreData();
    const idx = store.services.findIndex((s) => s.id === service.id);
    if (idx !== -1) {
      store.services[idx] = service;
    } else {
      store.services.push(service);
    }
    saveStoreData(store);
  },

  adminDeleteService(serviceId: string) {
    const store = getStoreData();
    store.services = store.services.filter((s) => s.id !== serviceId);
    saveStoreData(store);
  },

  adminToggleServiceActive(serviceId: string) {
    const store = getStoreData();
    const s = store.services.find((serv) => serv.id === serviceId);
    if (s) {
      s.is_active = s.is_active === false ? true : false;
      saveStoreData(store);
    }
  },

  // City-Specific Service Availability Toggles (Har City me Saare Service Switch Toggle)
  adminToggleCityService(cityId: string, serviceId: string, forcedState?: boolean) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (!city) return;
    if (!city.disabled_service_ids) city.disabled_service_ids = [];
    const isCurrentlyDisabled = city.disabled_service_ids.includes(serviceId);
    const shouldBeActive = forcedState !== undefined ? forcedState : isCurrentlyDisabled;
    if (shouldBeActive) {
      // Remove from disabled list (make active)
      city.disabled_service_ids = city.disabled_service_ids.filter((id) => id !== serviceId);
    } else {
      // Add to disabled list (make disabled in this city)
      if (!city.disabled_service_ids.includes(serviceId)) {
        city.disabled_service_ids.push(serviceId);
      }
    }
    saveStoreData(store);
  },

  adminToggleAllCityServices(cityId: string, enableAll: boolean) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (!city) return;
    if (enableAll) {
      city.disabled_service_ids = [];
    } else {
      city.disabled_service_ids = store.services.map((s) => s.id);
    }
    saveStoreData(store);
  },

  adminToggleCityCategoryServices(cityId: string, categoryId: string, enableAll: boolean) {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    if (!city) return;
    if (!city.disabled_service_ids) city.disabled_service_ids = [];
    const catServiceIds = store.services.filter((s) => s.category_id === categoryId).map((s) => s.id);
    if (enableAll) {
      city.disabled_service_ids = city.disabled_service_ids.filter((id) => !catServiceIds.includes(id));
    } else {
      for (const sid of catServiceIds) {
        if (!city.disabled_service_ids.includes(sid)) {
          city.disabled_service_ids.push(sid);
        }
      }
    }
    saveStoreData(store);
  },

  isServiceActiveInCity(serviceId: string, cityId?: string): boolean {
    const store = getStoreData();
    const s = store.services.find((x) => x.id === serviceId);
    if (!s || s.is_active === false) return false;
    if (!cityId) return true;
    const city = store.cities.find((c) => c.id === cityId);
    if (!city || city.is_active === false) return false;
    if (city.disabled_service_ids && city.disabled_service_ids.includes(serviceId)) {
      return false;
    }
    return true;
  },

  getActiveServicesForCity(cityId: string): Service[] {
    const store = getStoreData();
    const city = store.cities.find((c) => c.id === cityId);
    return store.services.filter((s) => {
      if (s.is_active === false) return false;
      if (city && city.disabled_service_ids && city.disabled_service_ids.includes(s.id)) return false;
      return true;
    });
  },

  adminSaveSurgeRule(rule: SurgeRule) {
    const store = getStoreData();
    const idx = store.surgeRules.findIndex((r) => r.id === rule.id);
    if (idx !== -1) {
      store.surgeRules[idx] = rule;
    } else {
      store.surgeRules.unshift(rule);
    }
    saveStoreData(store);
  },

  adminDeleteSurgeRule(ruleId: string) {
    const store = getStoreData();
    store.surgeRules = store.surgeRules.filter((r) => r.id !== ruleId);
    saveStoreData(store);
  },

  adminSaveCoupon(coupon: Coupon) {
    const store = getStoreData();
    const idx = store.coupons.findIndex((c) => c.id === coupon.id);
    if (idx !== -1) {
      store.coupons[idx] = coupon;
    } else {
      store.coupons.unshift(coupon);
    }
    saveStoreData(store);
  },

  adminDeleteCoupon(couponId: string) {
    const store = getStoreData();
    store.coupons = store.coupons.filter((c) => c.id !== couponId);
    saveStoreData(store);
  },

  adminSaveCommissionSettings(rates: { default_rate: number; category_rates: Record<string, number> }) {
    const store = getStoreData();
    store.commissionSettings = rates;
    saveStoreData(store);
  },

  adminGenerateWeeklySettlements() {
    const store = getStoreData();
    const partners = store.users.filter((u) => u.role === "partner");
    let count = 0;

    for (const p of partners) {
      const unSettled = store.bookings.filter(
        (b) => b.partner_id === p.id && b.status === "completed" && !b.settlement_id
      );

      if (unSettled.length > 0) {
        const gross = unSettled.reduce((acc, b) => acc + b.pricing.total, 0);
        const comm = unSettled.reduce((acc, b) => acc + b.commission, 0);
        const gstComm = Math.round(comm * 0.18 * 100) / 100;
        const tips = unSettled.reduce((acc, b) => acc + (b.tip || 0), 0);
        const penaltiesAmt = store.penalties
          .filter((pen) => pen.partner_id === p.id && !pen.settled)
          .reduce((acc, pen) => acc + pen.amount, 0);

        const netPayable = Math.round((gross - comm - gstComm - penaltiesAmt + tips) * 100) / 100;

        const settlement: Settlement = {
          id: `stl_${Date.now()}_${p.id}`,
          partner_id: p.id,
          partner_name: p.name,
          period_start: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10),
          period_end: new Date().toISOString().slice(0, 10),
          jobs_count: unSettled.length,
          gross_value: gross,
          commission_total: comm,
          gst_on_commission: gstComm,
          penalties: penaltiesAmt,
          tips,
          net_payable: netPayable,
          status: "generated",
          created_at: new Date().toISOString(),
        };

        unSettled.forEach((b) => (b.settlement_id = settlement.id));
        store.settlements.unshift(settlement);
        p.pending_earnings = 0;
        count++;
      }
    }

    saveStoreData(store);
    return count;
  },

  adminReleaseSettlement(settlementId: string) {
    const store = getStoreData();
    const s = store.settlements.find((x) => x.id === settlementId);
    if (s) {
      s.status = "released";
      s.released_at = new Date().toISOString();
      const p = store.users.find((u) => u.id === s.partner_id);
      if (p) {
        p.wallet_balance += s.net_payable;
      }
      saveStoreData(store);
    }
  },

  adminMarkPayoutPaid(payoutId: string) {
    const store = getStoreData();
    const po = store.payoutRequests.find((x) => x.id === payoutId);
    if (po) {
      po.status = "paid";
      po.paid_at = new Date().toISOString();
      saveStoreData(store);
    }
  },

  // Support
  createTicket(customerId: string, subject: string, category: string, initialMessage: string) {
    const store = getStoreData();
    const cust = store.users.find((u) => u.id === customerId);
    const ticketNo = `HS-TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      ticket_no: ticketNo,
      user_id: customerId,
      user_name: cust?.name || "Customer",
      user_phone: cust?.phone || "",
      subject,
      category,
      status: "open",
      messages: [
        {
          sender: "customer",
          text: initialMessage,
          at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
    };

    store.tickets.unshift(newTicket);
    saveStoreData(store);
    return newTicket;
  },

  replyTicket(ticketId: string, sender: "customer" | "support", text: string) {
    const store = getStoreData();
    const t = store.tickets.find((x) => x.id === ticketId);
    if (t) {
      t.messages.push({
        sender,
        text,
        at: new Date().toISOString(),
      });
      saveStoreData(store);
    }
  },
};
