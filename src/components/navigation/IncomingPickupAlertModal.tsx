"use client";

import { Button, DialogSurface } from '../ui';
import React, { useState, useEffect } from 'react';
import {
  Bell,
  Scale,
  MapPin,
  Clock,
  Check,
  X,
  Phone,
  ArrowRight,
  Flame,
  Volume2,
  Sparkles,
} from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

export const IncomingPickupAlertModal: React.FC = () => {
  const {
    isIncomingAlertOpen,
    setIsIncomingAlertOpen,
    incomingOrder,
    startLiveNavigation,
    routeStops,
  } = useEmployee();

  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);

  // 30-second Countdown Timer
  useEffect(() => {
    if (!isIncomingAlertOpen) {
      setSecondsRemaining(30);
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsIncomingAlertOpen(false); // auto-expire
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isIncomingAlertOpen, setIsIncomingAlertOpen]);

  if (!isIncomingAlertOpen || !incomingOrder) return null;

  const handleAccept = () => {
    setIsIncomingAlertOpen(false);
    const matchingStop = routeStops.find((s) => s.pickupCode === incomingOrder.pickupCode);
    if (matchingStop) startLiveNavigation(matchingStop);
  };

  const timerPercentage = (secondsRemaining / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80  p-0 sm:p-4">
      <DialogSurface label="New Bulk Pickup Request" className="w-full max-w-[440px] bg-white rounded-t-2xl sm:rounded-3xl p-5 pb-safe shadow-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom-8 duration-300">
        {/* Top Header with Pulsing Alert Badge & Countdown Timer */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 animate-bounce">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 text-lg tracking-tight">New Bulk Pickup Request</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">Priority Commercial Order • Ready for Pickup</p>
            </div>
          </div>

          {/* 30-Sec Circular Countdown Clock */}
          <div className="relative w-11 h-11 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-amber-500 transition-all duration-1000 ease-linear"
                strokeDasharray={`${timerPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono font-bold text-xs text-slate-800">{secondsRemaining}s</span>
          </div>
        </div>

        {/* Customer & Order Details Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="data-value font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {incomingOrder.pickupCode}
            </span>
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase block">Distance</span>
              <span className="font-mono font-bold text-xs text-slate-900">{incomingOrder.distanceKm} km • {incomingOrder.etaMinutes} mins</span>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-900 text-sm">{incomingOrder.customerName}</div>
            <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{incomingOrder.address}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-700">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold">Estimated Scrap:</span>
            </div>
            <span className="data-value font-mono font-bold text-emerald-800 text-sm">
              {incomingOrder.estimatedWeightKg} kg
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium italic">
            Items: {incomingOrder.categoriesHint}
          </p>
        </div>

        {/* Actions: Accept (Large Green) vs Decline */}
        <div className="space-y-2 pt-1">
          <Button
            type="button"
            onClick={handleAccept}
            className="w-full py-3.5 rounded-2xl bg-brand text-white font-extrabold text-xs hover:bg-[var(--brand-hover)] transition-all flex items-center justify-center gap-2 shadow-lg  cursor-pointer active:scale-[0.98]"
          >
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
            <span>Accept Pickup Order ({secondsRemaining}s)</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Button>

          <Button
            type="button"
            onClick={() => setIsIncomingAlertOpen(false)}
            className="w-full py-2.5 rounded-xl text-slate-500 font-bold text-xs hover:text-slate-800 transition-colors cursor-pointer"
          >
            Decline / Pass to Next Collector
          </Button>
        </div>
      </DialogSurface>
    </div>
  );
};
