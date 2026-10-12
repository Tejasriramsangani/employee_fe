# ASLI KAATA: Employee Mobile App (Collector & Driver) Implementation Tasks

This document defines the complete architectural design, UI/UX specification, data schemas, API contracts, and phased implementation tasks for the **ASLI KAATA Employee Mobile Web / PWA App (`employee_fe`)**.

The specifications and UI wireframes directly mirror the reference flows and screens provided, enhanced with high-end driver ergonomics (Rapido/Uber-style navigation, real-time incoming request vibration & sound, and in-app update notifications):
1. **Home Dashboard & Shift Lifecycle** (`Shift Available`, `Active In-Progress`, `Completed Celebration`)
2. **Real-time Order Incoming Alert with Haptic Vibration & Chime** (Rapido-style 30-sec accept overlay for bulk/on-demand orders)
3. **Rapido/Uber-style Turn-by-Turn Route Navigation** (Live route polyline, ETA countdown, traffic indicators, "Slide to Arrive")
4. **Step 1: Scan Customer QR** (Camera Viewfinder & Geofence Verification)
5. **Step 2: Pickup Verified Confirmation** (Location validation check)
6. **Step 4: Add Scrap Catalog** (Category pills, search, multi-selection)
7. **Step 6: Added Items & Digital Weighing** (Live unit weights, line values, checkout overview)
8. **Step 10: Customer Review & Handshake** (Customer info, itemized table, edit modal)
9. **Step 11: Edit Pickup Details** (Modify weights, remove items with trash icon)
10. **Step 15: Customer OTP Verification** (6-digit PIN input, resend countdown, summary card)
11. **Step 19: Pickup Completed Voucher** (3D EV Cargo Rickshaw illustration, settlement receipt, Done)
12. **In-App Version Update Sentinel** (Live release notes modal & one-click refresh)
13. **Route Sequence & Navigation (`My Pickups`)** (Stop order, Google Maps redirection)
14. **Cash Float & Daily Settlement (`Profile`)** (Opening float, verified payouts, return balance, incentives)

---

## 1. Executive Summary & Architectural Scope

The Employee App is the **field operational companion** for ASLI KAATA’s field force (Pickers and EV Cargo Auto Drivers). It operates on smartphones and ruggedized handheld devices, interfacing in real-time with the **NestJS Backend (`aslikaata_be`)** and the **Admin Operations Cockpit (`admin_fe`)**.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ASLI KAATA FIELD FORCE MOBILE WORKSPACE                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
       │                                  │                                   │
       ▼                                  ▼                                   ▼
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│   SHIFT & ROUTE RUN  │       │ RAPIDO-STYLE INCOMING│       │  DOORSTEP VERIFY &   │
│ • Morning Float Sync │       │   DISPATCH & ROUTE   │       │      QR SCANNING     │
│ • Daily Stop Roster  │       │ • Haptic Vibration   │       │ • Scan Customer QR   │
│ • Real-time Status   │       │ • Audio Chime Alert  │       │ • Geofence Check     │
│ • In-App Version Sent│       │ • Live Route & ETA   │       │ • Location Confirmed │
└──────────────────────┘       └──────────────────────┘       └──────────────────────┘
       │                                  │                                   │
       ▼                                  ▼                                   ▼
┌──────────────────────┐       ┌──────────────────────┐       ┌──────────────────────┐
│  DIGITAL WEIGHING &  │       │  CUSTOMER REVIEW &   │       │ PROFILE, WALLET &    │
│    LINE VALUATION    │       │    OTP VERIFICATION  │       │   EVENING SETTLEMENT │
│ • Scrap Catalog      │       │ • Itemized Handshake │       │ • Cash Float Balance │
│ • Gross / Deduction  │       │ • 6-Digit SMS OTP    │       │ • Volume Incentives  │
│ • Live Rate Engine   │       │ • Success Celebration│       │ • Incidentals Logging│
└──────────────────────┘       └──────────────────────┘       └──────────────────────┘
```

---

## 2. Design System & UI/UX Principles for Mobile Field App

The Employee App is engineered for rapid one-handed outdoor usage, high contrast under bright sunlight, and large touch targets (minimum 48px tap areas).

### 2.1 Color Tokens & Visual Language
* **Primary Forest Operations**: `#0A3D2B` (Brand Navy-Forest Green)
* **Secondary Brand Emerald**: `#10B981` / `#059669`
* **Accent Gold / Mustard**: `#F59E0B` / `#EAB308` (Primary Call-to-Action buttons)
* **Canvas Background**: `#F8FAFC` (Slate Ultra-light)
* **Card Surface**: `#FFFFFF` (Elevated White Cards with 1px `#E2E8F0` border)
* **Status Badges**:
  * In Progress / En Route: `#F59E0B` (Amber Pill)
  * Scheduled: `#0284C7` (Sky Blue Pill)
  * Completed / Verified: `#10B981` (Emerald Checkmark Pill)
  * Warning / Shortage: `#EF4444` (Ruby Red Pill)

### 2.2 Audio, Haptics & Ergonomics
* **Haptic Vibration**: Pulse patterns (`navigator.vibrate([300, 150, 300, 150, 500])`) for new incoming bulk orders and OTP verification.
* **Audio Alerts**: Web Audio API synthesized alert chime when new pickups arrive.
* **Layout Structure**: Mobile-first viewport (max width 480px centered on desktop for testing, 100vw on mobile).
* **Sticky Bottom Action Bar**: Fixed at bottom of viewport for thumb reachability with primary CTAs.

---

## 3. End-to-End User Flow & State Machine

```
[Morning Check-in & Cash Float]
            │
            ▼
[Home Dashboard: Stop 1 Queued]
            │
            ├────────────────────────────────────────┐
            ▼ (Normal Scheduled Run)                 ▼ (New Incoming On-Demand / Bulk Order)
[Click "Navigate" / "View Details"]       [Rapido Overlay: Haptic Vibration + Audio Chime]
            │                                        │
            ▼                                        ▼ [Accept Pickup (30s Timer)]
[Rapido-Style Live Navigation Screen] ◄──────────────┘
  • Live Route Polyline & ETA
  • Turn-by-Turn Instruction Card
  • "Slide when Arrived at Doorstep"
            │
            ▼
[Step 1: Scan Customer QR] ───► (Camera Viewfinder verifies AKP-XXXXX)
            │
            ▼
[Step 2: Pickup Verified] ────► (Geofence confirmed, location matches)
            │
            ▼
[Step 4: Add Scrap Catalog] ──► (Filter Paper/Plastic/Metal, select popular items)
            │
            ▼
[Step 6: Added Items Entry] ──► (Enter weights on scale, calculate live totals)
            │
            ▼
[Step 10: Customer Review] ───► [Optional Step 11: Edit Items & Weights]
            │
            ▼
[Step 15: Customer OTP PIN] ──► (Customer enters 6-digit SMS OTP)
            │
            ▼
[Step 19: Pickup Completed] ──► (EV Auto Celebration, Voucher generated, Cash/UPI)
            │
            ▼
[Next Stop or Evening Float Settlement]
```

---

## 4. Phase-by-Phase Implementation Tasks

### Phase 0: Project Setup, Mobile Shell & Global State Architecture
- [x] **Task 0.1**: Configure `employee_fe` project shell:
  - Install dependencies (`lucide-react`, `socket.io-client`, `canvas-confetti`).
  - Configure `globals.css` with ASLI KAATA brand tokens (`#0A3D2B`, `#10B981`, `#F59E0B`).
  - Configure viewport metadata for mobile PWA standalone rendering (`viewport-fit=cover`).
- [x] **Task 0.2**: Build **Mobile App Frame & Navigation Container**:
  - Centered mobile frame container (440px max width with subtle phone mock shadow on desktop, 100vw on mobile).
  - iOS-style status bar mock (clock `9:41`, signal, Wi-Fi, battery).
- [x] **Task 0.3**: Build **Bottom Navigation Bar**:
  - 3 primary tabs: `Home` (`HomeIcon`), `My Pickups` (`ClipboardList`), `Profile` (`UserCircle`).
  - Active tab highlighting with badge counters.
- [x] **Task 0.4**: Build **Global Employee Context (`EmployeeContext.tsx`)**:
  - Employee profile: Ravi Kumar (`AKP-EMP-0247`), Assigned Vehicle (`AP 16 TX 4021`), Division (`Vijayawada Central`).
  - Shift State: `AVAILABLE` vs `ON_PICKUP`.
  - Cash Float State: `Opening Float`, `Customer Payouts Total`, `Incidental Expenses`, `Balance to Return`.
  - Today's Route Stops List with active pickup pointer.
- [x] **Task 0.5**: Build **In-App Version Update Sentinel**:
  - Checks client app version against backend minimum version.
  - Floating bottom banner: *"New Features Available! Tap to Update"* with release notes modal (v2.1 features: Live Rapido Navigation & Haptics).

---

### Phase 1: Home Dashboard & Shift Lifecycle Screens
- [x] **Task 1.1**: Build **Time-Aware Header & Shift Status Toggle**:
  - Dynamic greeting ("Good morning, Ravi" vs "Good evening, Ravi").
  - Subtitle ("Ready for today's pickups?" vs "Great work today!").
  - Shift pill toggle: `● You're On Pickup` (amber) vs `● You're Available` (green).
  - Notification icon with unread indicator and collector avatar in uniform.
- [x] **Task 1.2**: Build **Today's Overview Counters Card**:
  - Date banner (`Mon, 05 Oct 2026`).
  - 3 metric cards:
    - `Scheduled Today` (calendar icon, count badge e.g. `06`).
    - `In Progress` (clock icon, count badge e.g. `01`).
    - `Completed` (checkmark icon, count badge e.g. `03`).
- [x] **Task 1.3**: Build **Active In-Progress Pickup Card** (State 1):
  - Forest green elevated gradient card.
  - Status pill: `In Progress` (yellow badge).
  - Pickup ID (`AKP-10245`), Customer Name (`Vinay Palakonda`).
  - Time slot (`11:00 AM – 01:00 PM`) and Address (`Madhura Nagar, Vijayawada`).
  - Mini GPS map thumbnail with route path and yellow destination pin.
  - Action button: `Continue Pickup ->` (yellow button redirecting to active step or live navigation).
- [x] **Task 1.4**: Build **Next Pickup Card** (State 2):
  - Gold star badge: `Next Pickup` (`Starts in 45 mins`).
  - Time (`09:00 AM`), Customer (`Suresh Kumar`), Locality (`Benz Circle`).
  - Dual action buttons: `[View Details]` (outline) and `[Navigate]` (dark green with compass).
  - Motivational banner: `Complete pickups on time - Keep customers happy and earn better incentives.`
- [x] **Task 1.5**: Build **Shift Completed Celebration Card** (State 3):
  - Emerald banner with Gold Trophy icon: `All today's pickups completed! Great work. Keep it going!`.
  - Full route completed list with green `Completed` badges.
  - Milestone footer card: `★ You completed 6 pickups today! Your efforts help build a cleaner and greener city.`.
- [x] **Task 1.6**: Build **Today's Pickups Quick-List**:
  - Chronological list of stops with time tags (`09:00 AM`, `01:00 PM`, `03:30 PM`).
  - Tap-to-inspect route stop drawer.

---

### Phase 2: Live Dispatch Alert & Rapido-Style Turn-by-Turn Navigation
- [x] **Task 2.1**: Build **Real-Time Incoming Pickup Alert (Rapido/Uber Driver Overlay)**:
  - Full-screen incoming request bottom sheet overlay triggered via WebSocket or simulated test trigger.
  - **Haptic Vibration**: Fires vibration pattern (`navigator.vibrate([300, 150, 300, 150, 500])`).
  - **Audio Ringtone**: Synthesized double-chime dispatch sound alert.
  - 30-Second Circular Countdown Progress Timer.
  - Order details: Customer name, pickup ID (`AKP-10255`), Estimated Weight (`180 kg Bulk`), Distance (`3.2 km`), Estimated Route Time (`12 mins`).
  - Actions: `Accept Pickup Request` (green button) vs `Decline / Pass` (red outlined).
- [x] **Task 2.2**: Build **Rapido-Style Live Turn-by-Turn Route Navigation Screen**:
  - Full-screen map interface showing:
    - Current vehicle location (EV Cargo Auto icon).
    - Destination marker (Customer Doorstep pin).
    - Dynamic route polyline with simulated driving progress.
  - Top Floating Navigation Header Card:
    - Turn instruction icon (e.g. Left Turn 200m).
    - Turn text: *"In 200m turn left onto Benz Circle Main Road"*.
    - Current speed: `24 km/h` • Battery: `82%`.
  - Bottom Trip Status Card:
    - Estimated Arrival Time: *"11:18 AM (11 mins remaining • 3.2 km)"*.
    - Customer Info pill with direct `Call` button (`📞`).
    - External Navigation button: `Open Google Maps` (`↗`).
    - Primary Slider / Action Button: `"Slide when Arrived at Doorstep ->"`, transitioning directly to Step 1 (Scan Customer QR).

---

### Phase 3: Doorstep Arrival, QR Scanning & Location Verification
- [x] **Task 3.1**: Build **Step 1: Scan Customer QR Screen**:
  - Header: Back button `<` | `Verify Pickup`.
  - Instruction: `Scan Customer QR - Scan the customer's pickup QR to verify this pickup.`.
  - Camera Viewfinder viewfinder box with animated green corner brackets.
  - Realistic camera simulation targeting customer phone displaying `AKP-10245` QR code.
  - Flashlight toggle button (`🔦 Flashlight`) with on/off torch state.
  - Helper card: `Ask the customer to open their pickup details and show the QR code.`.
  - Tap-to-simulate successful scan trigger.
- [x] **Task 3.2**: Build **Step 2: Pickup Verified Confirmation Screen**:
  - Hero checkmark badge: Large green circle with ray sparkles.
  - Header: `Pickup Verified - Customer and pickup details verified successfully.`.
  - Verification Summary Card:
    - Pickup ID: `AKP-10245`.
    - Customer Name: `Vinay Palakonda`.
    - Location: `Madhura Nagar, Vijayawada`.
  - Geofence Check Banner:
    - Green check icon: `You are at the correct location. You can now proceed with the pickup.`.
  - Primary button: `Continue ->` (forest green button advancing to Step 4).

---

### Phase 4: Digital Weighing, Scrap Catalog & Cart Management
- [x] **Task 4.1**: Build **Step 4: Add Scrap Catalog Screen**:
  - Header: Back button | `Add Scrap` | `Selected (3)` counter pill.
  - Search input: `Search scrap items...` with clear button.
  - Category filter pills (horizontal scroll): `All`, `Paper`, `Plastic`, `Metal`, `E-Waste`, `Rubber`, `Others`.
  - Popular Items list with real-time rate lookup:
    - Newspaper (`₹ 12 / kg`), Cardboard (`₹ 10 / kg`), PET Bottles (`₹ 18 / kg`), Mixed Plastic (`₹ 12 / kg`), Iron (`₹ 28 / kg`), Aluminium (`₹ 120 / kg`), E-Waste (`₹ 45 / kg`).
  - Multi-select checkboxes with visual card selection ring.
  - Sticky bottom bar: `X items selected` | `Done ->` (yellow button advancing to Step 6).
- [x] **Task 4.2**: Build **Step 6: Added Items & Weight Entry Screen**:
  - Itemized weighing cards with product thumbnail, name, active rate/kg.
  - Weight input field (`[ 15 ]`) with unit selector (`kg`).
  - Real-time line item value calculation: $\text{Weight (kg)} \times \text{Rate (₹/kg)} = \text{Line Total (₹)}$.
  - Remove item button (`x`).
  - Secondary action: `+ Add More Scrap` (reopens catalog).
  - Sticky checkout overview bar:
    - Scale icon: `Total Weight` (e.g. `28 kg`).
    - Coin icon: `Total Value` (e.g. `₹ 434`).
    - Primary button: `Checkout Overview ->` (advancing to Step 10).
- [x] **Task 4.3**: Build **Step 11: Edit Pickup Details Screen**:
  - Info banner: `You can modify weights, remove items or add more scrap items.`.
  - Selected items list with red trash can deletion buttons (`🗑️`).
  - Real-time weight re-calculation.
  - Primary button: `Save Changes ->` (returns to Step 10 Customer Review).

---

### Phase 5: Customer Review, Doorstep OTP Verification & Completion Voucher
- [x] **Task 5.1**: Build **Step 10: Customer Review Screen**:
  - Yellow top banner: `Ask the customer to review the collected items, weights, rates and final value.`.
  - Customer Information Card:
    - Customer Name: `Vinay Palakonda` (`CUS-2894`) with Call Phone button (`📞`).
    - Address: `Madhura Nagar, Vijayawada`.
    - Date & Slot: `Sat, 04 Oct 2026 | 11:00 AM – 01:00 PM`.
    - Pickup ID: `AKP-10245`.
    - Payment Method: `[Cash]` (or UPI selector).
  - Collected Items Table:
    - Table columns: `Item` | `Weight` | `Rate/kg` | `Value`.
    - Itemized breakdown matching collected scrap.
    - Grand totals: `Total Weight: 25.5 kg` | `Total Scrap Value: ₹ 409`.
  - Inside-card action: `[Edit Details]` (opens Step 11).
  - Green agreement banner: `Confirm with Customer - Once the customer has verified all the details, ask them to confirm.`.
  - Primary button: `Customer Confirmed ->` (advances to Step 15).
- [x] **Task 5.2**: Build **Step 15: Confirm Pickup Completion (Customer OTP Verification)**:
  - Header: Back button | `Confirm Pickup Completion`.
  - Customer banner card: `Vinay Palakonda` (`CUS-2894`).
  - Green instruction banner: `Enter Customer OTP - Ask the customer for the OTP sent to their registered mobile number.`.
  - 6-Digit PIN input boxes with auto-focus and auto-advance: `[ 2 ] [ 7 ] [ 3 ] [ 9 ] [ 1 ] [ 6 ]`.
  - Resend countdown timer: `Didn't receive OTP? Resend OTP (00:28)`.
  - Pickup Details summary card:
    - Pickup ID: `AKP-10245`.
    - Customer: `Vinay Palakonda`.
    - Final Scrap Value: `₹ 804`.
  - Primary button: `Verify OTP ->` (validates OTP via backend and transitions to Step 19).
- [x] **Task 5.3**: Build **Step 19: Pickup Successfully Completed Voucher Screen**:
  - Full celebratory hero state:
    - Green checkmark badge with sunburst sparkles.
    - **Custom Vector EV Three-Wheeler Cargo Auto** illustration in brand green & yellow with `ASLI KAATA` logo.
  - Headings: `Pickup Successfully Completed` | `The scrap pickup has been successfully collected and recorded.`.
  - Receipt Details Card:
    - Pickup ID: `AKP-10245`.
    - Customer: `Vinay Palakonda`.
    - Total Weight: `28 kg`.
    - Final Scrap Value: `₹ 804`.
    - Settlement Method: `Cash` with `Received` badge.
    - Invoice Number: `INV-20261004-0012`.
  - Primary action: `Done` (vibrant yellow button returning to Home with confetti burst).

---

### Phase 6: Route Stops Navigation (`My Pickups` Tab)
- [x] **Task 6.1**: Build **My Pickups Route Screen**:
  - Top tab filters: `All (6)`, `Scheduled (2)`, `In Progress (1)`, `Completed (3)`.
  - Stop list ordered by optimized route run sequence (Stop 1, Stop 2, Stop 3...).
  - Stop cards displaying customer name, address, time window, estimated scrap kg, and contact buttons (`Call Customer`, `Directions`).
- [x] **Task 6.2**: Build **Navigation Redirection Action**:
  - One-click `[Navigate]` button opening Google Maps / Apple Maps with destination coordinates.
  - In-app turn-by-turn guidance summary.

---

### Phase 7: Daily Cash Float Desk, Route Incidentals & Collector Earnings (`Profile` Tab)
- [x] **Task 7.1**: Build **Collector Profile Screen**:
  - Profile header with photo, name (`Ravi Kumar`), employee ID (`AKP-EMP-0247`), KYC verified badge (`Verified`).
  - Assigned Vehicle Card: `Mahindra Treo Zor EV-01` (`AP 16 TX 4021`), Battery/Fuel status, Division (`Vijayawada Central`).
- [x] **Task 7.2**: Build **Daily Cash Float Wallet Card**:
  - Morning Cash Float Received: `₹15,000`.
  - Verified Doorstep Cash Payouts: `₹11,450`.
  - Approved Fuel & Charging Vouchers: `₹130.50`.
  - **Remaining Balance to Return to Yard**: `₹3,419.50` ($\text{Opening} - \text{Payouts} - \text{Expenses}$).
  - Live status indicator: `BALANCED` (green).
- [x] **Task 7.3**: Build **Collector Earnings & Daily Incentive Tracker**:
  - Fixed Daily Wage: `₹750`.
  - Volume-Based Incentive: `+₹0.50/kg` collected (e.g. 340 kg = `+₹170`).
  - Total Today's Earnings: `₹920`.
- [x] **Task 7.4**: Build **Route Incidentals Quick-Entry Modal**:
  - Submit toll voucher, puncture repair, or emergency breakdown expense with receipt photo upload.
- [x] **Task 7.5**: Build **Shift Close & Cash Settlement Handover Button**:
  - Digital handover confirmation matching evening yard gate audit desk.

---

### Phase 8: Backend Integration, Offline Resilience & End-to-End Verification
- [x] **Task 8.1**: Integrate with NestJS Backend Endpoints:
  - `GET /admin/route-runs?date=YYYY-MM-DD` (Fetch assigned stops for employee vehicle).
  - `POST /pickups/:id/verify-qr` (Validate QR token and geofence coordinates).
  - `POST /pickups/:id/add-items` (Save digital weighing lines).
  - `POST /pickups/:id/request-otp` & `POST /pickups/:id/verify-otp` (SMS OTP verification).
  - `POST /pickups/:id/complete` (Finalize pickup, generate invoice `INV-XXXX`).
- [x] **Task 8.2**: Offline Weight Caching:
  - Cache active weighing session in `localStorage` to prevent data loss in basement/offline zones.
- [x] **Task 8.3**: Browser & Mobile Screen Verification:
  - Verify complete flow from Home -> Incoming Order Haptic Alert -> Rapido Navigation -> Scan QR -> Add Scrap -> Weight Entry -> Review -> OTP -> Success Voucher -> Float Return.
  - Validate clean Turbopack & TypeScript build with exit code 0.

---

## 5. Verification & Acceptance Criteria
1. **Incoming Request Vibration & Chime**: When a customer books a bulk or on-demand pickup, the employee app plays an audible chime, triggers `navigator.vibrate`, and renders the Rapido-style 30-second accept overlay.
2. **Rapido-Style Live Navigation**: Once accepted, the app displays live route polyline, driving ETA countdown (e.g. `11 mins • 3.2 km`), and turn-by-turn guidance with a "Slide when Arrived" action.
3. **QR Scanning**: Scanning the Customer App QR code on Step 1 immediately decodes `AKP-10245` and passes to the geofence verified screen.
4. **Weighing Math**: Adding 15 kg Cardboard (@ ₹10), 8 kg PET (@ ₹18), and 5 kg Iron (@ ₹28) automatically computes `28 kg` and `₹ 434` without manual math.
5. **Customer Agreement**: The customer review screen displays all items in an itemized table with one-click edit capabilities.
6. **OTP Handshake**: Entering the valid 6-digit OTP locks the record, marks the pickup `COMPLETED`, generates invoice `INV-20261004-0012`, and displays the celebratory EV cargo auto graphic.
7. **Cash Float Reconciler**: Every cash payout made automatically updates the collector's cash float wallet in their profile, matching the admin's evening settlement desk.
8. **In-App Update Sentinel**: If a new version is released, the app displays a non-intrusive "New Update Available" bottom banner with release notes and refresh action.
