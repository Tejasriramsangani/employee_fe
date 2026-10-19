"use client";

import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  Phone,
  ArrowRight,
  KeyRound,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react';
import { fieldOpsApi } from '../../services/api';

interface EmployeeLoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export const EmployeeLoginScreen: React.FC<EmployeeLoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Seeded Employee Accounts for instant testing
  const DEMO_EMPLOYEES = [
    {
      name: 'Ramesh Kumar',
      code: 'EMP-001',
      mobile: '9848011111',
      vehicle: 'Tata Ace (AP 16 TX 4920)',
      role: 'Heavy Cargo Lead',
    },
    {
      name: 'Suresh Babu',
      code: 'EMP-002',
      mobile: '9848022222',
      vehicle: 'Electric 3W (AP 16 EV 0482)',
      role: 'Doorstep EV Collector',
    },
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSelectQuickLogin = (empMobile: string) => {
    setMobile(empMobile);
    setErrorMessage(null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const formattedMobile = cleanMobile.startsWith('91') && cleanMobile.length === 12
      ? `+${cleanMobile}`
      : `+91${cleanMobile.slice(-10)}`;

    const res = await fieldOpsApi.sendOtp(formattedMobile);
    setIsLoading(false);

    if (res.success) {
      setStep('OTP');
      setCooldown(60);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance cursor
    if (val && index < 5) {
      const nextInput = document.getElementById(`emp-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`emp-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const cleanMobile = mobile.replace(/\D/g, '');
    const formattedMobile = cleanMobile.startsWith('91') && cleanMobile.length === 12
      ? `+${cleanMobile}`
      : `+91${cleanMobile.slice(-10)}`;

    const res = await fieldOpsApi.verifyOtp(formattedMobile, fullCode);
    setIsLoading(false);

    if (res.success && res.data) {
      const token = res.data.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('aslikaata_emp_token', token);
        localStorage.setItem('aslikaata_emp_user', JSON.stringify(res.data.user));
      }
      onLoginSuccess(token, res.data.user);
    } else {
      setErrorMessage(res.message || 'Verification failed. Please check the OTP.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-5 select-none relative overflow-hidden">
      {/* Decorative emerald gradient glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 pt-4 text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
          <Truck className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-xl font-black tracking-tight text-white">ASLI KAATA FIELD OPS</h1>
        <p className="text-xs text-emerald-300 font-semibold tracking-wider uppercase">
          Driver & Doorstep Scrap Collector Companion
        </p>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4 my-auto">
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="flex items-center rounded-2xl bg-slate-900/90 border border-slate-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-2.5">
                <span className="font-mono text-sm font-bold text-emerald-400 px-2 border-r border-slate-700">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="98480 11111"
                  className="w-full bg-transparent text-white font-mono text-base font-bold pl-3 focus:outline-none placeholder:text-slate-600 tracking-wider"
                  autoFocus
                />
                <Phone className="w-4 h-4 text-slate-500 mr-1" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || mobile.length < 10}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Login OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Login Section for Pre-seeded Field Drivers */}
            <div className="pt-2 border-t border-slate-700/60">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                <span>⚡ Quick Login (Pre-Seeded Drivers)</span>
              </div>
              <div className="space-y-2">
                {DEMO_EMPLOYEES.map((emp) => (
                  <button
                    key={emp.code}
                    type="button"
                    onClick={() => handleSelectQuickLogin(emp.mobile)}
                    className={`w-full p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      mobile === emp.mobile
                        ? 'bg-emerald-950/50 border-emerald-500 text-white'
                        : 'bg-slate-900/60 border-slate-700/60 hover:bg-slate-900 hover:border-slate-600 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{emp.name}</span>
                        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded-md border border-emerald-800">
                          {emp.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{emp.vehicle}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400">{emp.mobile}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-white">Enter 6-Digit OTP</h3>
              <p className="text-xs text-slate-400 font-medium">
                Sent to <span className="font-mono text-emerald-400 font-bold">+91 {mobile}</span>
              </p>
            </div>

            {/* 6 OTP Input Boxes */}
            <div className="flex justify-center gap-2 pt-1">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`emp-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 rounded-2xl bg-slate-900 border-2 border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-center font-mono font-black text-xl text-white focus:outline-none transition-all"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            {/* Hint Box: Master OTP */}
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test Driver Master OTP: <strong className="text-white font-mono text-xs">123456</strong></span>
              </div>
              <p className="text-[10px] text-emerald-400/80">
                You can also use the live SMS verification code delivered to your mobile device.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.some((d) => !d)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-[0.99] text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Access Route</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('PHONE');
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Change Number
              </button>
              {cooldown > 0 ? (
                <span className="text-slate-500 font-mono text-[11px]">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-emerald-400 font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Footer Info */}
      <div className="relative z-10 text-center text-[11px] text-slate-500 space-y-1">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Doorstep Weighing & KYC Protected System</span>
        </p>
        <p className="text-[10px] text-slate-600">ASLI KAATA Enterprise Logistics v2.4</p>
      </div>
    </div>
  );
};
