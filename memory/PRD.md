# HomeServe – Mobile Apps PRD

## Original problem statement
"kya aap is 3module project ka mobile app bana sakte hai" – user uploaded the HomeServe 3-module project (Customer, Partner/Technician, Admin; FastAPI + MongoDB common backend + React web).

## User choices
- SEPARATE mobile apps for Customer, Partner and Admin – **start with Admin** (done)
- Reuse existing backend / common DB as-is
- Demo payment mode (Wallet + COD real, UPI/Card simulated); Razorpay keys later
- Hindi + English toggle
- Project colors #1E3A8A blue, #F59E0B amber

## Architecture
- /app/backend – user's existing FastAPI backend (unchanged), .env recreated (DB homeserve_db, admin seed)
- /app/frontend – NEW Expo SDK 57 (expo-router) HomeServe Admin app
- /app/web_frontend – original React web app (reference for Customer/Partner apps)

## Implemented (Oct 2026) – Admin mobile app
- Admin email/password login, session persisted (SecureStore / localStorage)
- Tabs: Home (KPIs, red alerts with actions, trend line chart, category donut, quick actions), Bookings (status chips, search, detail sheet, reassign, cancel+refund), Partners (KYC doc review, partner COD/rejection tools, payouts, SOS panel), More
- Stack screens: Cities & geofencing (pincodes, CSV text upload, surge, city prices, JSON), Surge rules & Coupons, Finance (commission 15–20%, weekly settlements, GST invoices), Alerts, Global search
- Hindi/English toggle (saved to user profile)
- Tested: iteration_4 + iteration_5 all pass

## Backlog
- P0: Partner/Technician mobile app (separate Expo app)
- P0: Customer mobile app (separate Expo app)
- P1: Map polygon editor for geofence in mobile; Razorpay live keys
- P2: CSV file picker upload, export reports
