export type Role = 'customer' | 'partner' | 'admin';

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  order: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface Review {
  name: string;
  rating: number;
  text: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  price: number;
  duration_min: number;
  rating: number;
  reviews_count: number;
  inclusions: string[];
  exclusions: string[];
  trending: boolean;
  image: string;
  addons: Addon[];
  reviews: Review[];
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CitySurge {
  is_active: boolean;
  multiplier: number;
  reason: string;
}

export interface CityAssignedService {
  service_id: string;
  city_price: number;
}

export interface City {
  id: string;
  city_name: string;
  state: string;
  is_active: boolean;
  pincodes: string[];
  center: LatLng;
  polygon: [number, number][];
  surge_pricing: CitySurge;
  assigned_services: CityAssignedService[];
  created_at: string;
}

export interface SurgeRule {
  id: string;
  name: string;
  trigger: 'peak_hours' | 'weather' | 'high_demand';
  multiplier: number;
  city_id: string;
  start_hour?: number;
  end_hour?: number;
  weather?: string;
  is_active: boolean;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percent' | 'flat';
  value: number;
  max_discount: number | null;
  min_order: number;
  city_ids: string[];
  category_ids: string[];
  usage_limit: number;
  used_count: number;
  first_order_only: boolean;
  valid_till: string;
  is_active: boolean;
  created_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  code: string | null;
  image: string;
  category_id: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  line: string;
  pincode: string;
  city: string;
  location: LatLng;
  audio_note?: string | null;
  landmark?: string;
  is_default: boolean;
  created_at: string;
}

export interface DocumentInfo {
  number: string;
  expiry_date?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  note: string;
  has_file: boolean;
  uploaded_at: string;
  file_url?: string;
}

export interface PartnerShift {
  start: string;
  end: string;
  off_days: string[];
}

export interface BankAccount {
  holder: string;
  account_no: string;
  ifsc: string;
  bank_name: string;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  phone: string;
  email?: string;
  avatar?: string | null;
  language?: 'en' | 'hi';
  wallet_balance: number;
  created_at: string;
  // Customer specific
  notifications?: {
    push: boolean;
    sms: boolean;
    offers: boolean;
  };
  // Partner specific
  skills?: string[];
  sub_skills?: string[];
  city_id?: string;
  is_online?: boolean;
  kyc_status?: 'pending' | 'approved' | 'rejected';
  documents?: Record<string, DocumentInfo>;
  cod_cash?: number;
  cod_limit?: number;
  rating?: number;
  jobs_done?: number;
  pending_earnings?: number;
  consecutive_rejections?: number;
  location?: LatLng;
  shift?: PartnerShift;
  bank?: BankAccount;
}

export interface BookingLine {
  service_id: string;
  name: string;
  category_id: string;
  category_name: string;
  image: string;
  qty: number;
  unit_price: number;
  addons: Addon[];
  line_total: number;
}

export interface ExtraCharge {
  id: string;
  item: string;
  amount: number;
  status: 'pending' | 'approved' | 'declined';
  created_at: string;
}

export interface BookingTimelineItem {
  status: string;
  at: string;
  note?: string;
}

export interface BookingPricing {
  subtotal: number;
  surge_multiplier: number;
  surge_amount: number;
  discount: number;
  coupon_code: string | null;
  taxable: number;
  gst_rate: number;
  gst_amount: number;
  cgst: number;
  sgst: number;
  extras_total: number;
  total: number;
}

export type BookingStatus =
  | 'payment_pending'
  | 'pending'
  | 'assigned'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Booking {
  id: string;
  booking_no: string;
  customer_id: string;
  partner_id: string | null;
  lines: BookingLine[];
  category_ids: string[];
  address: Address;
  city_id: string;
  city_name: string;
  mode: 'instant' | 'scheduled';
  slot_date: string;
  slot_time: string;
  pricing: BookingPricing;
  payment_method: 'upi' | 'card' | 'wallet' | 'cod';
  payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
  amount_paid: number;
  status: BookingStatus;
  start_otp: string;
  end_otp: string;
  extras: ExtraCharge[];
  timeline: BookingTimelineItem[];
  rating?: number | null;
  review?: string | null;
  tip?: number;
  commission_rate: number;
  commission: number;
  partner_earning: number;
  invoice_no?: string | null;
  offered_to?: string | null;
  rejected_by?: string[];
  settlement_id?: string | null;
  created_at: string;
  completed_at?: string | null;
  en_route_at?: string | null;
  arrived_at?: string | null;
  partner_origin?: LatLng | null;
  cancellation_fee?: number;
  cancellation_reason?: string;
}

export interface WalletTxn {
  id: string;
  user_id: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  booking_id?: string | null;
  created_at: string;
}

export interface TicketMessage {
  sender: 'customer' | 'support';
  text: string;
  at: string;
}

export interface SupportTicket {
  id: string;
  ticket_no: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  subject: string;
  category: string;
  status: 'open' | 'resolved';
  messages: TicketMessage[];
  created_at: string;
}

export interface Settlement {
  id: string;
  partner_id: string;
  partner_name: string;
  period_start: string;
  period_end: string;
  jobs_count: number;
  gross_value: number;
  commission_total: number;
  gst_on_commission: number;
  penalties: number;
  tips: number;
  net_payable: number;
  status: 'generated' | 'released';
  created_at: string;
  released_at?: string;
}

export interface PayoutRequest {
  id: string;
  partner_id: string;
  partner_name: string;
  amount: number;
  bank: BankAccount;
  status: 'pending' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface Penalty {
  id: string;
  partner_id: string;
  amount: number;
  reason: string;
  settled: boolean;
  created_at: string;
}

export interface SosAlert {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_phone: string;
  location: LatLng;
  status: 'active' | 'resolved';
  created_at: string;
  resolved_at?: string;
}
