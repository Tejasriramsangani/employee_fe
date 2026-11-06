# ASLI KAATA Employee App — Mobile Build & Deployment Guide

## 1. Backend Configuration
- **API Base URL:** `http://52.64.91.185:4000/api/v1`
- **Socket.IO URL:** `http://52.64.91.185:4000`
- **Platform:** Next.js 16 → Capacitor 8 → Android APK / iOS App

---

## 2. Prerequisites

| Tool | Recommended Version | Download / Install |
|------|--------------------|-------------------|
| Node.js | ≥ 18.x (LTS) | https://nodejs.org |
| Android Studio | Ladybug+ | https://developer.android.com/studio |
| Java JDK | 17 | Bundled with Android Studio |
| Android SDK Platform | 34 / 35 | Via Android Studio SDK Manager |

---

## 3. Step-by-Step Mobile Build Guide

### Step 1: Navigate to directory and install dependencies
```bash
cd employee_fe
npm install
```

### Step 2: Initialize Android platform (Run once)
```bash
npx cap add android
node android-config/post-android-setup.js
```
> **What `post-android-setup.js` does:**
> 1. Injects `network_security_config.xml` to allow cleartext HTTP traffic to `52.64.91.185` (crucial for Android 9+).
> 2. Sets `android:usesCleartextTraffic="true"` and `android:allowBackup="false"` in `AndroidManifest.xml`.
> 3. Adds all required native permissions:
>    - `android.permission.INTERNET`
>    - `android.permission.ACCESS_NETWORK_STATE`
>    - `android.permission.ACCESS_FINE_LOCATION` (GPS live routing & geofence verification)
>    - `android.permission.ACCESS_COARSE_LOCATION`
>    - `android.permission.POST_NOTIFICATIONS` (Native dispatch & shift alerts)
>    - `android.permission.CAMERA` (Customer QR code scanning)
>    - Hardware features: Camera, Autofocus, Flashlight (torch for dark doorways)

### Step 3: Build the static bundle & sync to Android
```bash
npm run build:app
```
*(Runs: `cross-env CAPACITOR_BUILD=1 next build && cap sync android`)*

### Step 4: Open in Android Studio & Generate APK
```bash
npm run android:open
```
In Android Studio:
1. Wait for Gradle sync to complete.
2. Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Or click the **Run ▶** button to launch on an Android emulator or connected physical device via USB debugging.

---

## 4. Mobile Ergonomics & Viewport Optimizations Made

| Area | Implementation |
|------|---------------|
| **Backend IP** | `.env.local` configured to `http://52.64.91.185:4000/api/v1` |
| **Cleartext HTTP** | `network_security_config.xml` allows HTTP traffic to `52.64.91.185` |
| **Capacitor Config** | `capacitor.config.ts` configured with `allowNavigation: ['52.64.91.185']`, `allowMixedContent: true`, `backgroundColor: '#0A3D2B'` |
| **Static Export** | `next.config.ts` has `trailingSlash: true` and `images.unoptimized: true` for zero-server mobile runtime |
| **No Fake Status Bar** | Removed fake iOS "9:41" header on mobile devices so the phone's native status bar displays naturally |
| **Safe Areas** | Integrated `pt-safe`, `pb-safe`, `mb-safe` across all screens, modals, bottom navigation, and action bars |
| **No iOS Auto-Zoom** | Set `input { font-size: 16px !important; }` in `globals.css` to prevent WebKit zoom glitch on focus |
| **Overscroll Behavior** | `overscroll-behavior: none` prevents rubber-banding on mobile WebViews |
| **Camera & Flashlight** | Native camera permission + html5-qrcode lifecycle protection for QR verification |
| **PWA Manifest & Icons** | Configured `manifest.json` and ASLI KAATA brand logo assets |

---

## 5. End-to-End Operational Mobile Screen Flow

```
1. Login Screen (Mobile OTP / Freelancer Onboarding Request)
   │
   ▼
2. Home Dashboard
   ├── Shift Toggle (Online / Offline Duty)
   ├── Today's Counters (Scheduled, In Progress, Completed)
   ├── Active In-Progress Pickup Card (Navigate / Continue)
   └── Today's Pickups Quick List
   │
   ▼ (Accept or Select Pickup)
3. Live Route / Navigation (Google Maps turn-by-turn with customer GPS pin)
   │
   ▼ (Arrive at Customer Doorstep)
4. Step 1: Scan Customer QR (Camera Viewfinder with torch / Manual code entry)
   │
   ▼ (QR Verified & Geofence Validated)
5. Step 2: Pickup Verified Confirmation
   │
   ▼
6. Step 4: Add Scrap Catalog (Search, Category Filter, Product Selection)
   │
   ▼
7. Step 6: Added Items & Digital Weight Entry (Gross weights, rates, live subtotals)
   │
   ▼
8. Step 10: Customer Review (Itemized summary table, cash/UPI method, edit modal)
   │
   ▼
9. Step 15: Customer OTP Verification (6-digit customer confirmation code)
   │
   ▼
10. Step 19: Pickup Completed Voucher (Celebration screen, settlement receipt)
   │
   ▼
11. Profile & Evening Settlement (Completed jobs count, total kg collected, payouts summary)
```

---

## 6. Troubleshooting & Common Mobile Issues

| Issue | Solution |
|-------|----------|
| **"Network Error" or "Server Unreachable"** | Verify `.env.local` has `http://52.64.91.185:4000/api/v1` and ensure `node android-config/post-android-setup.js` was executed to allow cleartext HTTP traffic. |
| **Camera scan black screen** | Ensure camera permission is granted in Android settings (`android.permission.CAMERA`). |
| **Bottom buttons covered by navigation bar** | `pb-safe` padding ensures buttons stay above the Android gesture bar. |
| **White screen on launch** | Verify `out/` folder was generated by `npm run build:app` and `webDir: 'out'` in `capacitor.config.ts`. |

