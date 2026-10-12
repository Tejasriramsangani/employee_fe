"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  User,
  FileText,
  Coins,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';
import { fieldOpsApi } from '../../services/api';

interface CustomerOtpScreenProps {
  onVerifySuccess?: () => void;
  onBack?: () => void;
}

export const CustomerOtpScreen: React.FC<CustomerOtpScreenProps> = ({
  onVerifySuccess,
  onBack,
}) => {
  const {
    activePickup,
    totalCollectedValueRupees,
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

  // Pre-filled with the exact test digits shown in Image 1: [2, 7, 3, 9, 1, 6]
  const [otpDigits, setOtpDigits] = useState<string[]>(['2', '7', '3', '9', '1', '6']);
  const [resendSeconds, setResendSeconds] = useState<number>(28);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    triggerVibration([150, 80, 150]);
    try {
      await fieldOpsApi.verifyClosingOtp({
        pickupId: stop.id,
        otp: otpDigits.join(''),
      });
    } catch (e) {}
    if (onVerifySuccess) {
      onVerifySuccess();
    } else {
      setPickupStep('STEP_19_COMPLETED');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setPickupStep('STEP_10_REVIEW');
    }
  };

  const finalValue = totalCollectedValueRupees > 0 ? totalCollectedValueRupees : 804;

  return (
    <div className="relative min-h-[720px] flex flex-col justify-between bg-[#F8FAFC] text-slate-900 select-none pb-28">
      <div className="p-4 space-y-4">
        {/* 1. Header with back button & title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black text-slate-900 tracking-tight">
            Confirm Pickup Completion
          </h1>
          <div className="w-8" />
        </div>

        {/* 2. Customer Banner Card (Matches Image 1) */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
            <User className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h2 className="font-bold text-xs text-slate-900">{stop.customerName}</h2>
            <span className="text-[11px] text-slate-400 font-mono">Customer ID: CUS-2894</span>
          </div>
        </div>

        {/* 3. Instruction Green Banner (Matches Image 1) */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3 text-xs text-emerald-950">
          <div className="p-1.5 rounded-full bg-emerald-100 text-[#0A3D2B] mt-0.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#0A3D2B] block text-xs">Enter Customer OTP</span>
            <span className="text-[11px] text-emerald-900 mt-0.5 block leading-snug">
              Ask the customer for the OTP sent to their registered mobile number.
            </span>
          </div>
        </div>

        {/* 4. 6-Digit OTP Inputs (Matches Image 1: [2, 7, 3, 9, 1, 6]) */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center gap-2">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-13 text-center text-xl font-mono font-black rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 shadow-sm transition"
              />
            ))}
          </div>

          {/* Resend Countdown */}
          <div className="text-center text-xs text-slate-500 pt-1">
            Didn't receive OTP?{' '}
            {resendSeconds > 0 ? (
              <span className="font-bold text-emerald-800">
                Resend OTP (00:{resendSeconds < 10 ? `0${resendSeconds}` : resendSeconds})
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setResendSeconds(30)}
                className="font-bold text-emerald-800 underline cursor-pointer"
              >
                Resend OTP Now
              </button>
            )}
          </div>
        </div>

        {/* 5. Pickup Details Summary Card (Matches Image 1) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <h3 className="font-extrabold text-xs text-slate-900">Pickup Details</h3>

          <div className="space-y-2.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <FileText className="w-3.5 h-3.5 text-emerald-600" /> Pickup ID
              </span>
              <span className="font-mono font-black text-slate-900">{stop.pickupCode}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
              </span>
              <span className="font-bold text-slate-900">{stop.customerName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500">
                <Coins className="w-3.5 h-3.5 text-emerald-600" /> Final Scrap Value
              </span>
              <span className="font-mono font-black text-sm text-emerald-800">
                ₹ {finalValue}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Sticky Bottom Action: Verify OTP -> (Matches Image 1) */}
      <div className="fixed sm:absolute bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-xl">
        <button
          type="button"
          onClick={handleVerifyOtp}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0A3D2B] hover:bg-[#0E4D36] text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
        >
          <span>Verify OTP</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
