"use client";

import React from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  FileText,
  User,
  MapPin,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

interface PickupVerifiedScreenProps {
  onContinueToCatalog?: () => void;
  onBack?: () => void;
}

export const PickupVerifiedScreen: React.FC<PickupVerifiedScreenProps> = ({
  onContinueToCatalog,
  onBack,
}) => {
  const { activePickup, setPickupStep } = useEmployee();

  const stop = activePickup;

  const handleContinue = () => {
    if (onContinueToCatalog) {
      onContinueToCatalog();
    } else {
      setPickupStep('STEP_4_CATALOG');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setPickupStep('STEP_1_SCAN_QR');
    }
  };

  if (!stop) {
    return <div className="min-h-[720px] flex items-center justify-center">No active pickup selected.</div>;
  }

  return (
    <div className="relative min-h-[720px] flex flex-col justify-between bg-[#F8FAFC] text-slate-900 select-none p-4">
      {/* 1. Header with Back button and centered title */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black text-slate-900 tracking-tight">
            Pickup Verified
          </h1>
          <div className="w-8" /> {/* Balance spacer */}
        </div>

        {/* 2. Hero Checkmark Badge with Radiant Sparkle Rays (Exact Match to Image 2) */}
        <div className="pt-8 pb-4 flex flex-col items-center text-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Radiant Sparkle Rays SVG */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin"
              style={{ animationDuration: '24s' }}
              viewBox="0 0 100 100"
            >
              {/* Radial dashes surrounding circle */}
              <line x1="50" y1="6" x2="50" y2="16" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="84" x2="50" y2="94" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="6" y1="50" x2="16" y2="50" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <line x1="84" y1="50" x2="94" y2="50" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              
              <line x1="19" y1="19" x2="26" y2="26" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="74" y1="74" x2="81" y2="81" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="81" y1="19" x2="74" y2="26" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <line x1="26" y1="74" x2="19" y2="81" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </svg>

            {/* Glowing Green Central Disc */}
            <div className="w-20 h-20 rounded-full bg-[#0A3D2B] text-white flex items-center justify-center shadow-2xl shadow-emerald-900/30 ring-8 ring-emerald-500/10">
              <CheckCircle2 className="w-11 h-11 text-emerald-400 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-4">
            Pickup Verified
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px] font-medium leading-relaxed">
            Customer and pickup details verified successfully.
          </p>
        </div>

        {/* 3. Verification Details Card (Matches Image 2) */}
        <div className="mt-4 p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3.5">
          {/* Row 1: Pickup ID */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span>Pickup ID</span>
            </div>
            <span className="font-mono font-black text-slate-900 text-xs">
              {stop.pickupCode}
            </span>
          </div>

          <div className="border-t border-slate-100" />

          {/* Row 2: Customer Name */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>Customer Name</span>
            </div>
            <span className="font-bold text-slate-900 text-xs">
              {stop.customerName}
            </span>
          </div>

          <div className="border-t border-slate-100" />

          {/* Row 3: Location */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-slate-500 font-medium">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Location</span>
            </div>
            <span className="font-bold text-slate-900 text-xs text-right max-w-[170px] truncate">
              {stop.locality}
            </span>
          </div>
        </div>

        {/* 4. Geofence Check Banner (Exact Match to Image 2) */}
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-950">
          <div className="p-1 rounded-full bg-emerald-100 text-[#0A3D2B] mt-0.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-medium text-emerald-900 leading-snug">
            You are at the correct location. You can now proceed with the pickup.
          </p>
        </div>
      </div>

      {/* 5. Primary Action Button: Continue -> (Matches Image 2) */}
      <div className="pt-4 pb-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-2xl bg-[#0A3D2B] hover:bg-[#0E4D36] text-white font-black text-sm tracking-wide shadow-xl shadow-emerald-950/20 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
