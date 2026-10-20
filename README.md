# SMARTFIX - Home Service Ecosystem

SMARTFIX is a comprehensive home services ecosystem designed with an authentic Android mobile layout, real-time status synchronization, two-way OTP validation, geofencing, and automated operations management.

## Architecture

The ecosystem provides three seamlessly interconnected applications running on a single unified local store:

### 1. Consumer Mobile App (`/app`)
- **Location & Discovery**: Geolocation detection, operational city switcher, multi-category service browser (AC Repair, Deep Cleaning, Electrician, Plumbing, Salon, Painting, Pest Control, Appliance Repair), trending services, voice search simulation.
- **Cart & Dynamic Pricing**: Add-on configuration, city surge multiplier adjustments, promotional voucher redemption (e.g. `FIRST50`, `SAVE100`, `ACFEST`), delivery address manager.
- **Booking & Security**: Instant (30–45 min) vs scheduled timeslots, payment options (UPI, Card, SMARTFIX Wallet, COD), 18% GST invoice breakdown.
- **Live Tracking & Service OTPs**: Real-time Leaflet map tracking of technician with GPS polyline, Start OTP and End OTP fraud protection, in-app chat, number-masked phone calls, extra charges approval banner, rating/tipping, and printable tax invoices.
- **Wallet & Rewards**: 5% automatic cashback credited on completed services, recharge via demo UPI, transaction history ledger.

### 2. Partner / Technician App (`/partner`)
- **Operations & Alerts**: Online/Offline availability toggle, 15-second urgent job offer banner with auto-reassignment countdown, and Emergency SOS siren dispatcher with live GPS coordinates.
- **Job Execution**: Navigation to customer location, arrival check-in, Start OTP validation, extra parts/labor charge request with live customer notification, End OTP validation for job completion.
- **Financials**: Real-time earnings breakdown, COD cash-in-hand counter vs credit limits, weekly settlement statements, bank withdrawal requests.
- **KYC & Schedule**: Government document submission status (Aadhaar, PAN, DL, Police Clearance), working shift hours and weekly off-days scheduler.

### 3. Operations Admin Console (`/admin`)
- **Live Control Room**: Overview of active in-field technicians, reassignment of delayed or vehicle-breakdown bookings with audit reasons.
- **Interactive Geofencing**: Polygon boundary coordinator on Leaflet map, active cities manager, city surge multiplier configuration, pincode mappings.
- **Pricing & Promos**: Surge rules engine (Peak Hours, Weather, High Demand), coupon code generator, platform commission rate configuration (default 18%).
- **Safety & Fraud**: Live Emergency SOS dispatch desk with GPS resolution, COD cash collection tracking, consecutive rejection penalties reset.
- **KYC Verification Queue**: Audit submitted technician government documents with Approve / Reject / Under-Review actions.
- **Financial Ledger**: Batch generation of weekly settlements, payout disbursements, partner withdrawal approvals.

## Demo Credentials
- **Customer App**: Mobile `9999999999` (Demo OTP: `1234`)
- **Partner App**: Mobile `9000000001` (Demo OTP: `1234`)
- **Admin Console**: `admin@example.com` / `admin123`
