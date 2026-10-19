# SMARTFIX – Mobile Apps PRD

## Original problem statement
"kya aap is 3module project ka mobile app bana sakte hai" – SMARTFIX 3-module project (Customer, Partner/Technician, Admin; FastAPI + MongoDB common backend + React web).

## User choices
- SEPARATE mobile apps for Customer, Partner, Admin (Admin done → Customer done → Partner next)
- Reuse existing backend / common DB as-is
- Demo payments (Wallet + COD real, UPI/Card simulated); Razorpay later
- Demo OTP 1234 for now; real SMS (Twilio) later
- Hindi + English toggle; colors #1E3A8A / #F59E0B
- Live map on tracking (react-native-maps, native only)

## Architecture
- /app/backend – existing FastAPI backend (unchanged)
- /app/frontend – CUSTOMER Expo SDK 57 app (currently in preview)
- /app/apps/admin – ADMIN Expo app source (preserved; copy into /app/frontend to preview/build)
- /app/web_frontend – original React web app (reference)

## Implemented
- Oct 2026: Admin app – dashboard, bookings (reassign/cancel), KYC/partners/SOS/payouts, cities, surge & coupons, finance, alerts, search, HI/EN
- Oct 2026: Customer app – OTP login, home (location/GPS sheet, search, banners, categories, trending, book again), services list/detail with add-ons, address add with GPS (permission flow), checkout (instant/scheduled, coupons, UPI/Card/Wallet/COD), live tracking (map, stepper, OTPs, chat, masked call, extra-charge approval, cancel, invoice, rate+tip, rebook), bookings, wallet top-up, profile (lang, notifications, addresses), support chatbot + tickets
- Security audit run (findings: fixed demo OTP, default admin password, committed JWT secret) – not yet fixed
- Oct 2026: Rebrand HomeServe → SMARTFIX across all apps + backend (admin email admin@smartfix.in, new booking nos start with SF; DB_NAME homeserve_db kept for data)
- Oct 2026: Emergent managed push notifications (customer app) – /api/register-push (auth + own user only), send_push on booking events (assigned, en_route, arrived, in_progress, completed, cancelled, extra-charge request), tap → opens booking; weekly nudge if permission denied. Needs google-services.json + valid Android package name (user asked "24SERVICE" – invalid format, suggest com.service24.customer). Works only in real builds.

## Backlog
- P0: Partner/Technician mobile app
- P0: Security fixes (real OTP via SMS, admin password, JWT secret rotation, CORS)
- P1: Razorpay native checkout in app; audio landmark note; avatar upload (object storage)
- P2: Geofence map editor in admin app
