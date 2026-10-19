"use client";

import React, { useState, useEffect } from 'react';
import { ServerOff, RefreshCw, WifiOff, PhoneCall, Radio, AlertTriangle } from 'lucide-react';

interface ServerDownScreenProps {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
  errorDetails?: string;
  autoRetrySeconds?: number;
}

export const ServerDownScreen: React.FC<ServerDownScreenProps> = ({
  onRetry,
  isRetrying = false,
  errorDetails = 'Unable to reach ASLI KAATA Operations Server',
  autoRetrySeconds = 10,
}) => {
  const [countdown, setCountdown] = useState<number>(autoRetrySeconds);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  useEffect(() => {
    if (isRetrying) return;
    if (countdown <= 0) {
      onRetry();
      setCountdown(autoRetrySeconds);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, isRetrying, onRetry, autoRetrySeconds]);

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-[#0A3D2B] via-[#062419] to-[#020e0a] text-white flex flex-col justify-between p-6 select-none overflow-hidden max-w-[480px] mx-auto">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-16 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-16 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black tracking-wider uppercase text-emerald-300">
            Field Force Companion
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>Server Unreachable</span>
        </div>
      </div>

      {/* Center Animated Radar */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-6">
        <div className="relative w-36 h-36 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping duration-1000" />
          <div className="absolute inset-3 rounded-full border border-teal-400/30 animate-pulse" />
          <div className="absolute inset-6 rounded-full bg-emerald-950/60 backdrop-blur-md border border-emerald-500/30 shadow-2xl" />

          <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <ServerOff className="w-8 h-8 text-slate-950 stroke-[2.2]" />
          </div>

          <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-red-500 border-2 border-[#0A3D2B] flex items-center justify-center text-white shadow-md animate-bounce">
            <WifiOff className="w-4 h-4" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight text-white mb-2">
          Operations Server Offline
        </h2>
        <p className="text-sm text-emerald-100/80 leading-relaxed max-w-xs mb-4">
          The central dispatch server is temporarily warming up or reconnecting. Your assigned routes and collected weights are cached locally.
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-emerald-500/25 text-emerald-300 text-xs font-medium backdrop-blur-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin text-emerald-400' : ''}`} />
          <span>
            {isRetrying
              ? 'Connecting to Dispatcher...'
              : `Auto-reconnecting in ${countdown}s`}
          </span>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 space-y-3 w-full pb-2">
        <button
          onClick={() => onRetry()}
          disabled={isRetrying}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:brightness-105 active:scale-[0.98] text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 stroke-[2.5] ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Re-establishing Link...' : 'Retry Connection Now'}</span>
        </button>

        <div className="text-center pt-1">
          <button
            onClick={() => setShowDiagnostics((prev) => !prev)}
            className="text-[11px] text-emerald-300/60 hover:text-emerald-300 underline transition cursor-pointer"
          >
            {showDiagnostics ? 'Hide Technical Details' : 'View Network Diagnostics'}
          </button>

          {showDiagnostics && (
            <div className="mt-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-left font-mono space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="font-bold">Field Device Diagnostics</span>
              </div>
              <p className="truncate">Backend: {errorDetails}</p>
              <p className="truncate">Local Cache: Available (Offline Safe)</p>
              <p className="text-[10px] text-slate-500">Checked: {new Date().toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-center gap-4 text-xs text-emerald-200/70">
          <a
            href="tel:919908123456"
            className="inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
            <span>Yard Manager Emergency Hotline</span>
          </a>
        </div>
      </div>
    </div>
  );
};
