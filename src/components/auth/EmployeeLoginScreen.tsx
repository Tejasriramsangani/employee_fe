"use client";

import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldCheck,
  Phone,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { fieldOpsApi, PickerRequestStatusInfo } from '../../services/api';
import { PickerRequestForm } from './PickerRequestForm';

interface EmployeeLoginScreenProps {
  onLoginSuccess: (token: string, user: any) => void;
}

type Step = 'PHONE' | 'OTP' | 'NO_ACCOUNT' | 'REQUEST_FORM' | 'REQUEST_SENT';

const formatDate = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const EmployeeLoginScreen: React.FC<EmployeeLoginScreenProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<Step>('PHONE');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  // Set only when the backend runs with SMS_PROVIDER=mock (no real SMS is sent).
  const [devOtp, setDevOtp] = useState<string | null>(null);
  // Latest picker request for the entered number (shown on the "no account" screen).
  const [requestInfo, setRequestInfo] = useState<PickerRequestStatusInfo | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const cleanMobile = () => mobile.replace(/\D/g, '').slice(-10);

  const loadRequestStatus = async () => {
    const res = await fieldOpsApi.pickerRequestStatus(cleanMobile());
    setRequestInfo(res.success && res.data?.found ? res.data : null);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cleanMobile().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setNoticeMessage(null);

    const res = await fieldOpsApi.sendOtp(cleanMobile());

    if (res.success) {
      setIsLoading(false);
      setStep('OTP');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setDevOtp(res.data?.devOtp ?? null);
      return;
    }

    // This number has no field account: no OTP was sent. Offer to raise a request instead.
    if (res.details?.code === 'EMPLOYEE_ACCOUNT_NOT_FOUND') {
      await loadRequestStatus();
      setIsLoading(false);
      setStep('NO_ACCOUNT');
      return;
    }

    setIsLoading(false);
    setErrorMessage(res.message || 'Failed to send OTP');
  };

  const fillDevOtp = () => {
    if (devOtp && /^\d{6}$/.test(devOtp)) setOtp(devOtp.split(''));
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

    const res = await fieldOpsApi.verifyOtp(cleanMobile(), fullCode);
    setIsLoading(false);

    if (res.success && res.data) {
      const token = res.data.accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('aslikaata_emp_token', token);
        localStorage.setItem('aslikaata_emp_refresh_token', res.data.refreshToken);
        localStorage.setItem('aslikaata_emp_user', JSON.stringify(res.data.user));
      }
      onLoginSuccess(token, res.data.user);
    } else if (res.details?.code === 'EMPLOYEE_ACCOUNT_NOT_FOUND') {
      await loadRequestStatus();
      setStep('NO_ACCOUNT');
    } else {
      setErrorMessage(res.message || 'Verification failed. Please check the OTP.');
    }
  };

  const backToPhone = () => {
    setStep('PHONE');
    setOtp(['', '', '', '', '', '']);
    setDevOtp(null);
    setErrorMessage(null);
    setNoticeMessage(null);
  };

  const refreshStatus = async () => {
    setIsLoading(true);
    await loadRequestStatus();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between p-5 pt-safe pb-safe select-none relative overflow-hidden">
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

      {/* Main Card */}
      <div className="relative z-10 bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-5 shadow-2xl space-y-4 my-4">
        {noticeMessage && (
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{noticeMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'PHONE' && (
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
                  placeholder="10-digit mobile number"
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

            <p className="text-center text-[11px] text-slate-500">
              New here? Enter your number and we will help you apply to become a picker.
            </p>
          </form>
        )}

        {step === 'OTP' && (
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

            {devOtp ? (
              /* SMS_PROVIDER=mock: no SMS is sent, so show the OTP that was just generated */
              <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-300 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      Test OTP: <strong className="text-white font-mono text-sm tracking-widest">{devOtp}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={fillDevOtp}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-600 text-slate-950 font-black text-[10px] uppercase tracking-wider hover:bg-emerald-500 cursor-pointer"
                  >
                    Fill
                  </button>
                </div>
                <p className="text-[10px] text-emerald-400/80">
                  SMS provider is in <strong>mock</strong> mode, so no SMS was sent. This code is generated for
                  this login only and is shown here for testing.
                </p>
              </div>
            ) : (
              <p className="text-center text-[11px] text-slate-400">
                Enter the 6-digit code sent by SMS to your mobile number.
              </p>
            )}

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
                onClick={backToPhone}
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

        {step === 'NO_ACCOUNT' && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white">You don&apos;t have an account on this app</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                <span className="font-mono text-emerald-400 font-bold">+91 {cleanMobile()}</span> is not registered
                as an ASLI KAATA picker, so we have not sent an OTP.
              </p>
            </div>

            {requestInfo?.status === 'PENDING' && (
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-sky-300 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Request {requestInfo.requestCode} is under review</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Submitted {formatDate(requestInfo.submittedAt)}. We will get back to you by SMS once our team
                  decides. You can log in with this number after approval.
                </p>
                <button
                  type="button"
                  onClick={refreshStatus}
                  disabled={isLoading}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-sky-300 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                  Check status
                </button>
              </div>
            )}

            {requestInfo?.status === 'REJECTED' && (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-left space-y-1">
                <div className="text-rose-300 text-xs font-bold">
                  Request {requestInfo.requestCode} was not approved
                </div>
                {requestInfo.rejectionReason && (
                  <p className="text-[11px] text-slate-300">Reason: {requestInfo.rejectionReason}</p>
                )}
                <p className="text-[11px] text-slate-500">You are welcome to apply again.</p>
              </div>
            )}

            {requestInfo?.status !== 'PENDING' && (
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setStep('REQUEST_FORM');
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {requestInfo?.status === 'REJECTED' ? 'Apply again' : 'Raise a request to become a freelancer'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={backToPhone}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Try a different number
            </button>
          </div>
        )}

        {step === 'REQUEST_FORM' && (
          <PickerRequestForm
            initialMobile={cleanMobile()}
            onBack={() => setStep('NO_ACCOUNT')}
            onSubmitted={(code) => {
              setSubmittedCode(code);
              setStep('REQUEST_SENT');
            }}
            onConflict={async (code, message) => {
              if (code === 'ACCOUNT_EXISTS') {
                setStep('PHONE');
                setNoticeMessage(message || 'This number already has an account. Please log in.');
              } else {
                await loadRequestStatus();
                setStep('NO_ACCOUNT');
                setNoticeMessage(message || null);
              }
            }}
          />
        )}

        {step === 'REQUEST_SENT' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-white">Request submitted!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Thank you for applying. <strong className="text-white">We will get back to you</strong> after our team
                reviews your details.
              </p>
            </div>
            {submittedCode && (
              <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-slate-700">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Your request ID</div>
                <div className="font-mono font-black text-emerald-400 text-lg tracking-wider">{submittedCode}</div>
              </div>
            )}
            <ul className="text-left text-[11px] text-slate-400 space-y-1.5 bg-slate-900/60 border border-slate-700/70 rounded-2xl p-3">
              <li>• We will send you an SMS on <span className="font-mono text-slate-200">+91 {cleanMobile()}</span> once it is decided.</li>
              <li>• After approval, log in here with the same number and OTP.</li>
              <li>• You can check the status any time by entering your number on the login screen.</li>
            </ul>
            <button
              type="button"
              onClick={backToPhone}
              className="w-full py-3 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm transition-all cursor-pointer"
            >
              Back to login
            </button>
          </div>
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
