"use client";

import React from 'react';
import {
  Wifi,
  Battery,
  Signal,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  Check,
  Zap,
  Info,
} from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

export const MobileFrameShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    hasUpdateAvailable,
    setHasUpdateAvailable,
    isReleaseNotesOpen,
    setIsReleaseNotesOpen,
    shiftStatus,
    simulateHomeState,
    triggerIncomingOrderAlert,
    setPickupStep,
    isOfflineCached,
  } = useEmployee();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:py-6 p-0">
      {/* Quick Demo Controller for all 3 States from Image 2 (visible on desktop) */}
      <div className="hidden sm:flex items-center gap-2 mb-3 px-4 py-2 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300 shadow-lg">
        <span className="font-bold text-slate-400 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Preview Image 2 States:
        </span>
        <button
          onClick={() => simulateHomeState('ON_PICKUP')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            shiftStatus === 'ON_PICKUP'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          1. On Pickup
        </button>
        <button
          onClick={() => simulateHomeState('AVAILABLE')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            shiftStatus === 'AVAILABLE'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          2. Next Pickup
        </button>
        <button
          onClick={() => simulateHomeState('COMPLETED')}
          className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            shiftStatus === 'COMPLETED'
              ? 'bg-emerald-500 text-slate-950 shadow-sm'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          3. Shift Done
        </button>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => triggerIncomingOrderAlert()}
          className="px-2.5 py-1 rounded-lg font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
        >
          <span>🚨 Alert</span>
        </button>
        <span className="text-slate-600">|</span>
        <button
          onClick={() => setPickupStep('STEP_1_SCAN_QR')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-emerald-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>🔍 Step 1 QR</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_2_VERIFIED')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-emerald-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>✅ Step 2</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_4_CATALOG')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-amber-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>🛒 Step 4</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_6_WEIGHTS')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-amber-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>⚖️ Step 6</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_10_REVIEW')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-yellow-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>📋 Step 10</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_11_EDIT')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-sky-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>✏️ Step 11</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_15_OTP')}
          className="px-2.5 py-1 rounded-lg font-bold bg-slate-700 hover:bg-slate-600 text-emerald-300 shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>🔑 Step 15</span>
        </button>
        <button
          onClick={() => setPickupStep('STEP_19_COMPLETED')}
          className="px-2.5 py-1 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer transition-all active:scale-95"
        >
          <span>🎉 Step 19</span>
        </button>
      </div>

      {/* Mobile Smartphone Viewport Container (440px fixed width on desktop) */}
      <div className="w-full sm:max-w-[440px] min-h-screen sm:min-h-[880px] bg-[#F8FAFC] sm:rounded-[44px] shadow-[0_24px_64px_rgba(0,0,0,0.6)] border sm:border-slate-800 relative flex flex-col overflow-hidden">
        {/* iOS / Mobile Status Bar */}
        <header className="sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-md px-6 pt-3 pb-1 flex items-center justify-between text-slate-800 text-xs font-semibold select-none">
          <span className="font-bold tracking-tight">9:41</span>
          {/* Dynamic Island Pill Mock with Offline Cache Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-16 h-3.5 bg-slate-900 rounded-full hidden sm:block"></div>
            {isOfflineCached && (
              <span className="text-[9px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" /> Cached
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5 text-slate-800" />
            <Wifi className="w-3.5 h-3.5 text-slate-800" />
            <Battery className="w-4 h-4 text-slate-800" />
          </div>
        </header>

        {/* In-App Version Update Sentinel Banner (Task 0.5) */}
        {hasUpdateAvailable && (
          <div className="bg-gradient-to-r from-[#0A3D2B] to-[#0E4D36] text-white px-4 py-2 flex items-center justify-between text-[11px] shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold">v2.1 Update Available (Live Rapido Nav)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReleaseNotesOpen(true)}
                className="underline hover:text-emerald-300 cursor-pointer font-bold"
              >
                What's New
              </button>
              <button
                type="button"
                onClick={() => setHasUpdateAvailable(false)}
                className="text-white/60 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Mobile Body */}
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        {/* Release Notes Modal */}
        {isReleaseNotesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-[#0A3D2B]">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">ASLI KAATA Field v2.1</h3>
                    <p className="text-[10px] text-slate-400">Release Notes & Features</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReleaseNotesOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Rapido-Style Live Turn Navigation:</strong> Real-time route polylines and ETA calculation to customer doorsteps.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Haptic Vibration & Chime:</strong> Real-time vibration pattern alert when new high-value bulk pickups are assigned.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900">Evening Cash Float Reconciler:</strong> One-tap settlement balance matching yard gate counter.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsReleaseNotesOpen(false);
                  setHasUpdateAvailable(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#0A3D2B] text-white font-bold text-xs hover:bg-[#0E4D36] transition-all cursor-pointer shadow-md"
              >
                Update Now & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
