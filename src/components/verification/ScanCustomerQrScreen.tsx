"use client";

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Flashlight,
  Info,
  CheckCircle2,
  Scan,
  Sparkles,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';
import { fieldOpsApi } from '../../services/api';

interface ScanCustomerQrScreenProps {
  onScanSuccess?: () => void;
  onCancel?: () => void;
}

export const ScanCustomerQrScreen: React.FC<ScanCustomerQrScreenProps> = ({
  onScanSuccess,
  onCancel,
}) => {
  const {
    activePickup,
    isFlashlightOn,
    setIsFlashlightOn,
    setPickupStep,
    triggerVibration,
  } = useEmployee();

  const stop: RouteStop = activePickup || {
    id: 'stop_02',
    stopNumber: 2,
    pickupCode: 'AKP-10245',
    customerName: 'Vinay Palakonda',
    phone: '9908123456',
    timeSlot: '11:00 AM - 01:00 PM',
    scheduledTime: '11:00 AM',
    address: 'Door 14-8-2, Behind Rythu Bazar, Madhura Nagar',
    locality: 'Madhura Nagar, Vijayawada',
    landmark: 'Near Water Tank',
    estimatedWeightKg: 28,
    itemsCategoryHint: 'Cardboard, PET Bottles, Iron',
    status: 'IN_PROGRESS',
  };

  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);

  // Simulated auto-scanning radar line
  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 4));
    }, 80);
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleSimulateSuccessfulScan = async () => {
    setIsScanning(false);
    triggerVibration([100, 50, 100]);
    try {
      await fieldOpsApi.verifyQr({
        pickupId: stop.id,
        qrToken: stop.pickupCode,
      });
    } catch (e) {}
    setTimeout(() => {
      if (onScanSuccess) {
        onScanSuccess();
      } else {
        setPickupStep('STEP_2_VERIFIED');
      }
    }, 350);
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
    } else {
      setPickupStep('IDLE');
    }
  };

  return (
    <div className="relative min-h-[720px] flex flex-col bg-slate-950 text-white select-none">
      {/* 1. Header with back button & title */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-slate-900">
        <button
          onClick={handleBack}
          type="button"
          className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-black text-slate-100 tracking-tight">
          Verify Pickup
        </h1>
        <div className="w-8" /> {/* Balance spacer */}
      </div>

      {/* 2. Instructions Title */}
      <div className="px-6 pt-4 pb-2 text-center">
        <h2 className="text-lg font-black text-white tracking-tight">
          Scan Customer QR
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-[280px] mx-auto font-medium">
          Scan the customer's pickup QR to verify this pickup.
        </p>
      </div>

      {/* 3. Camera Viewfinder Screen with Simulated Customer Smartphone */}
      <div className="flex-1 px-5 py-3 flex flex-col items-center justify-center relative">
        {/* Viewfinder Target Outer Box */}
        <div
          onClick={handleSimulateSuccessfulScan}
          className="relative w-full max-w-[310px] aspect-[4/5] rounded-3xl bg-slate-900 border-2 border-slate-800 overflow-hidden shadow-2xl cursor-pointer group"
          title="Click to simulate successful scan"
        >
          {/* Flashlight beam simulation */}
          {isFlashlightOn && (
            <div className="absolute inset-0 bg-white/20 backdrop-brightness-150 pointer-events-none z-30 transition-opacity" />
          )}

          {/* Camera Blur Ambient Background */}
          <div className="absolute inset-0 bg-radial from-slate-800 via-slate-900 to-slate-950 opacity-90" />

          {/* Simulated Customer Smartphone Frame inside Camera Lens */}
          <div className="absolute inset-4 rounded-2xl bg-slate-950 border border-slate-700/60 p-3 flex flex-col items-center justify-between shadow-inner">
            {/* Customer Phone Top Status & Brand Header */}
            <div className="w-full flex items-center justify-center pt-1">
              <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-300 tracking-wider uppercase">
                  ASLI KAATA
                </span>
              </div>
            </div>

            {/* High-Fidelity SVG QR Code */}
            <div className="relative p-2.5 rounded-2xl bg-white shadow-xl flex flex-col items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-36 h-36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="100" height="100" fill="#ffffff" />
                
                {/* Top-Left Corner Position Finder */}
                <rect x="10" y="10" width="24" height="24" rx="3" fill="#0A3D2B" />
                <rect x="14" y="14" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="18" y="18" width="8" height="8" rx="1" fill="#0A3D2B" />

                {/* Top-Right Corner Position Finder */}
                <rect x="66" y="10" width="24" height="24" rx="3" fill="#0A3D2B" />
                <rect x="70" y="14" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="74" y="18" width="8" height="8" rx="1" fill="#0A3D2B" />

                {/* Bottom-Left Corner Position Finder */}
                <rect x="10" y="66" width="24" height="24" rx="3" fill="#0A3D2B" />
                <rect x="14" y="70" width="16" height="16" rx="2" fill="#ffffff" />
                <rect x="18" y="74" width="8" height="8" rx="1" fill="#0A3D2B" />

                {/* Dynamic QR Bit Patterns */}
                <rect x="38" y="12" width="6" height="6" fill="#0A3D2B" />
                <rect x="48" y="18" width="8" height="4" fill="#0A3D2B" />
                <rect x="40" y="26" width="6" height="6" fill="#0A3D2B" />
                <rect x="52" y="28" width="6" height="6" fill="#0A3D2B" />

                <rect x="14" y="40" width="8" height="6" fill="#0A3D2B" />
                <rect x="28" y="42" width="6" height="8" fill="#0A3D2B" />
                <rect x="38" y="40" width="10" height="10" fill="#0A3D2B" />
                <rect x="52" y="42" width="8" height="6" fill="#0A3D2B" />
                <rect x="66" y="40" width="8" height="8" fill="#0A3D2B" />
                <rect x="78" y="44" width="8" height="6" fill="#0A3D2B" />

                <rect x="14" y="52" width="8" height="8" fill="#0A3D2B" />
                <rect x="26" y="54" width="8" height="6" fill="#0A3D2B" />
                <rect x="40" y="56" width="6" height="8" fill="#0A3D2B" />
                <rect x="50" y="52" width="8" height="8" fill="#0A3D2B" />
                <rect x="64" y="54" width="10" height="6" fill="#0A3D2B" />
                <rect x="78" y="56" width="8" height="6" fill="#0A3D2B" />

                <rect x="38" y="68" width="8" height="6" fill="#0A3D2B" />
                <rect x="50" y="72" width="8" height="8" fill="#0A3D2B" />
                <rect x="62" y="68" width="6" height="8" fill="#0A3D2B" />
                <rect x="74" y="70" width="12" height="6" fill="#0A3D2B" />
                <rect x="42" y="82" width="12" height="6" fill="#0A3D2B" />
                <rect x="60" y="80" width="8" height="8" fill="#0A3D2B" />
                <rect x="74" y="82" width="12" height="6" fill="#0A3D2B" />

                {/* Central Brand Emblem */}
                <circle cx="50" cy="50" r="9" fill="#F59E0B" />
                <path
                  d="M 46 50 L 49 53 L 55 47"
                  stroke="#0A3D2B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Subtext under QR */}
              <div className="mt-1 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Pickup ID
                </span>
                <span className="font-mono font-black text-xs text-slate-900 tracking-wider">
                  {stop.pickupCode}
                </span>
              </div>
            </div>

            {/* Customer Name Tag */}
            <div className="text-center pb-1">
              <span className="text-[11px] text-slate-400 font-medium">
                Customer: <strong className="text-white">{stop.customerName}</strong>
              </span>
            </div>
          </div>

          {/* Animated Green Corner Brackets (Exact Match to Image 1) */}
          <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl pointer-events-none z-20 shadow-sm shadow-emerald-400/50" />
          <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl pointer-events-none z-20 shadow-sm shadow-emerald-400/50" />
          <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl pointer-events-none z-20 shadow-sm shadow-emerald-400/50" />
          <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl pointer-events-none z-20 shadow-sm shadow-emerald-400/50" />

          {/* Vertical Laser Scanline */}
          <div
            className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent pointer-events-none z-20 shadow-[0_0_8px_#34d399]"
            style={{ top: `${scanProgress}%` }}
          />

          {/* Tap Prompt Overlay on Hover */}
          <div className="absolute inset-x-0 bottom-3 text-center z-20 group-hover:scale-105 transition-transform">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-black text-[11px] shadow-lg">
              <Sparkles className="w-3.5 h-3.5" /> Tap anywhere to verify QR
            </span>
          </div>
        </div>

        {/* 4. Flashlight Toggle Button (matches Image 1) */}
        <div className="mt-4 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsFlashlightOn(!isFlashlightOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 cursor-pointer ${
              isFlashlightOn
                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flashlight className="w-5 h-5" />
          </button>
          <span className="text-[11px] font-semibold text-slate-400 mt-1">
            Flashlight {isFlashlightOn ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {/* 5. Bottom Helper Card (matching Image 1) */}
      <div className="px-5 pb-5 space-y-3">
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/90 flex items-center gap-3 text-xs text-slate-300 shadow-md">
          <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5 text-slate-300" />
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Ask the customer to open their pickup details and show the QR code.
          </p>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={handleBack}
          className="w-full py-3.5 rounded-2xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 font-bold text-xs transition cursor-pointer active:scale-[0.99] text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
