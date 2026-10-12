"use client";

import React from 'react';
import {
  CheckCircle2,
  FileText,
  User,
  Scale,
  Coins,
  CreditCard,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';
import { fieldOpsApi } from '../../services/api';

interface PickupCompletedScreenProps {
  onDone?: () => void;
}

export const PickupCompletedScreen: React.FC<PickupCompletedScreenProps> = ({ onDone }) => {
  const {
    activePickup,
    setPickupStep,
    setShiftStatus,
    setActivePickup,
    routeStops,
    totalCollectedWeightKg,
    totalCollectedValueRupees,
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

  const handleDone = async () => {
    try {
      await fieldOpsApi.completePickup({
        pickupId: stop.id,
        paymentMethod: 'CASH',
        totalWeightKg: finalWeight,
        finalScrapValueRupees: finalValue,
      });
    } catch (e) {}

    // Mark active stop as completed in routeStops
    stop.status = 'COMPLETED';
    setShiftStatus('AVAILABLE');
    setPickupStep('IDLE');
    if (onDone) {
      onDone();
    }
  };

  const finalWeight = totalCollectedWeightKg > 0 ? totalCollectedWeightKg : 28;
  const finalValue = totalCollectedValueRupees > 0 ? totalCollectedValueRupees : 804;

  return (
    <div className="relative min-h-[720px] flex flex-col justify-between bg-[#F8FAFC] text-slate-900 select-none pb-24">
      <div className="p-4 space-y-4">
        {/* 1. Hero Section with Checkmark Sparkles & Vector Cargo Auto (Matches Image 2) */}
        <div className="pt-2 flex flex-col items-center text-center">
          {/* Circular Checkmark Badge with Radiant Sparkles */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Sparkle Rays SVG */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 100 100"
            >
              <line x1="50" y1="8" x2="50" y2="18" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="50" y1="82" x2="50" y2="92" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="8" y1="50" x2="18" y2="50" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="82" y1="50" x2="92" y2="50" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="20" y1="20" x2="27" y2="27" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="73" y1="73" x2="80" y2="80" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
              <line x1="80" y1="20" x2="73" y2="27" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
              <line x1="27" y1="73" x2="20" y2="80" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
            </svg>

            <div className="w-16 h-16 rounded-full bg-[#0A3D2B] text-white flex items-center justify-center shadow-xl shadow-emerald-900/30">
              <CheckCircle2 className="w-9 h-9 text-emerald-400 stroke-[2.5]" />
            </div>
          </div>

          {/* ASLI KAATA Electric 3-Wheeler Cargo Auto Vector Illustration (Exact Match to Image 2) */}
          <div className="w-full max-w-[280px] h-36 my-1 relative flex items-center justify-center">
            <svg
              viewBox="0 0 320 180"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Skyline silhouette backdrop */}
              <g fill="#E2E8F0" opacity="0.6">
                <rect x="20" y="80" width="25" height="50" rx="2" />
                <rect x="50" y="65" width="30" height="65" rx="2" />
                <rect x="85" y="75" width="20" height="55" rx="2" />
                <rect x="210" y="70" width="35" height="60" rx="2" />
                <rect x="250" y="85" width="30" height="45" rx="2" />
                <rect x="285" y="60" width="25" height="70" rx="2" />
              </g>

              {/* Road Ground Shadow */}
              <ellipse cx="160" cy="155" rx="110" ry="12" fill="#CBD5E1" opacity="0.6" />

              {/* ASLI KAATA EV CARGO AUTO BODY */}
              {/* Green Cargo Box */}
              <rect x="130" y="55" width="120" height="80" rx="10" fill="#0A3D2B" stroke="#062418" strokeWidth="2.5" />
              {/* Yellow border line on cargo box */}
              <rect x="134" y="59" width="112" height="72" rx="7" fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 3" />
              
              {/* Cargo Box ASLI KAATA Logo Plaque */}
              <rect x="150" y="75" width="80" height="36" rx="6" fill="#F8FAFC" />
              <text x="190" y="90" textAnchor="middle" fill="#0A3D2B" fontSize="11" fontWeight="900" fontFamily="sans-serif">
                ASLI
              </text>
              <text x="190" y="103" textAnchor="middle" fill="#0A3D2B" fontSize="11" fontWeight="900" fontFamily="sans-serif">
                KAATA
              </text>

              {/* Yellow Driver Cabin */}
              <path
                d="M 65 135 L 75 75 Q 85 60 110 60 L 135 60 L 135 135 Z"
                fill="#F59E0B"
                stroke="#D97706"
                strokeWidth="2.5"
              />
              {/* Windshield Glass */}
              <path
                d="M 80 75 Q 88 66 105 66 L 130 66 L 130 98 L 84 98 Z"
                fill="#38BDF8"
                opacity="0.75"
                stroke="#0284C7"
                strokeWidth="1.5"
              />
              {/* Windshield Reflection Line */}
              <line x1="90" y1="70" x2="115" y2="95" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />

              {/* Cabin Door / Trim */}
              <path d="M 82 105 L 128 105 L 128 135 L 70 135 Z" fill="#0A3D2B" opacity="0.9" />

              {/* Headlight */}
              <circle cx="68" cy="115" r="5" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />

              {/* Front Wheel */}
              <circle cx="85" cy="148" r="18" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <circle cx="85" cy="148" r="9" fill="#94A3B8" />
              <circle cx="85" cy="148" r="4" fill="#0F172A" />

              {/* Rear Wheel */}
              <circle cx="215" cy="148" r="18" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
              <circle cx="215" cy="148" r="9" fill="#94A3B8" />
              <circle cx="215" cy="148" r="4" fill="#0F172A" />
            </svg>
          </div>

          <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1">
            Pickup Successfully Completed
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-[280px] font-medium leading-relaxed">
            The scrap pickup has been successfully collected and recorded.
          </p>
        </div>

        {/* 2. Receipt Details Card (Matches Image 2) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="space-y-2.5 text-xs text-slate-700">
            {/* Pickup ID */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> Pickup ID
              </span>
              <span className="font-mono font-black text-slate-900">{stop.pickupCode}</span>
            </div>

            <div className="border-t border-slate-100" />

            {/* Customer */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
              </span>
              <span className="font-bold text-slate-900">{stop.customerName}</span>
            </div>

            <div className="border-t border-slate-100" />

            {/* Total Weight */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <Scale className="w-3.5 h-3.5 text-emerald-600" /> Total Weight
              </span>
              <span className="font-mono font-black text-slate-900">{finalWeight} kg</span>
            </div>

            <div className="border-t border-slate-100" />

            {/* Final Scrap Value */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <Coins className="w-3.5 h-3.5 text-emerald-600" /> Final Scrap Value
              </span>
              <span className="font-mono font-black text-sm text-emerald-800">
                ₹ {finalValue}
              </span>
            </div>

            <div className="border-t border-slate-100" />

            {/* Settlement Method */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Settlement Method
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900">Cash</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0A3D2B] text-[10px] font-black uppercase">
                  Received
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100" />

            {/* Invoice */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <Receipt className="w-3.5 h-3.5 text-emerald-600" /> Invoice
              </span>
              <span className="font-mono font-semibold text-slate-500 text-[11px]">
                INV-20261004-0012
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Sticky Bottom Primary Action: Done (Yellow button matching Image 2) */}
      <div className="fixed sm:absolute bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-xl">
        <button
          type="button"
          onClick={handleDone}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
        >
          <span>Done</span>
        </button>
      </div>
    </div>
  );
};
