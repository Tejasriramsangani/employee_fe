"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  Flashlight,
  Info,
  CheckCircle2,
  Camera,
  Keyboard,
  Loader2,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useEmployee } from '../../context/EmployeeContext';
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

  const stop = activePickup;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // useRef for the in-progress guard so the scanner callback always reads
  // the latest value — a plain state variable would be stale inside the closure.
  const verifyingRef = useRef(false);
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [manualToken, setManualToken] = useState('');
  const [scanError, setScanError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const handleBack = () => {
    if (onCancel) onCancel();
    else setPickupStep('IDLE');
  };

  // Bug 5+6 fix: wrap in useCallback so the scanner useEffect closes over a
  // stable function reference and no longer needs the eslint-disable comment.
  const verifyToken = useCallback(async (qrToken: string) => {
    // Bug 1 fix: use ref so the scanner callback always reads the live value.
    if (!stop || !qrToken.trim() || verifyingRef.current) return;
    verifyingRef.current = true;
    setVerifying(true);
    setScanError('');
    try {
      // Backend verify requires ARRIVED — mark arrived unless already past that gate
      const raw = String(stop.rawStatus || '').toUpperCase();
      const alreadyArrivedOrLater = [
        'ARRIVED',
        'VERIFIED',
        'IN_PROGRESS',
        'MEASURED',
        'SUMMARY_READY',
      ].includes(raw);
      if (!alreadyArrivedOrLater) {
        const arrived = await fieldOpsApi.arrived(stop.id);
        if (!arrived.success) {
          const msg = (arrived.message || '').toLowerCase();
          if (!msg.includes('arrived') && !msg.includes('already')) {
            setScanError(arrived.message || 'Mark arrived first, then scan QR.');
            return;
          }
        }
      }

      const verified = await fieldOpsApi.verifyQr(stop.id, qrToken.trim());
      if (!verified.success) {
        setScanError(verified.message || 'QR verification failed. Ask customer to refresh their QR.');
        return;
      }

      triggerVibration([100, 50, 100]);
      const started = await fieldOpsApi.startPickup(stop.id);
      if (!started.success) {
        setScanError(started.message || 'Verified, but could not start pickup.');
        return;
      }

      if (onScanSuccess) onScanSuccess();
      else setPickupStep('STEP_2_VERIFIED');
    } catch (e: any) {
      setScanError(e?.message || 'Verification failed.');
    } finally {
      verifyingRef.current = false;
      setVerifying(false);
    }
  }, [stop, triggerVibration, onScanSuccess, setPickupStep]);

  useEffect(() => {
    if (mode !== 'camera' || !stop) return;

    const elementId = 'employee-qr-reader';

    // Bug 3 fix: guard DOM existence before constructing the scanner.
    // In React Strict Mode / fast remounts the div may not be in the DOM yet.
    if (!document.getElementById(elementId)) return;

    let cancelled = false;
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 240, height: 240 } },
        async (decoded) => {
          // Bug 1 fix: read verifyingRef (not the stale `verifying` state).
          if (cancelled || verifyingRef.current) return;
          // scanner.pause() is synchronous — no await needed.
          try { scanner.pause(true); } catch { /* ignore */ }
          await verifyToken(decoded);
        },
        () => {
          /* ignore per-frame decode errors */
        },
      )
      .then(() => {
        if (!cancelled) setCameraReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setScanError('Camera unavailable. Use manual code entry instead.');
          setMode('manual');
        }
      });

    return () => {
      cancelled = true;
      setCameraReady(false);
      const sc = scannerRef.current;
      scannerRef.current = null;
      if (!sc) return;
      // Bug 2 fix: html5-qrcode throws if .stop() is called while paused.
      // resume() returns void per its typings, so use individual try/catch blocks.
      (async () => {
        try { sc.resume(); } catch { /* already stopped or never started */ }
        // Give the MediaStream a tick to resume before stopping.
        await new Promise((r) => setTimeout(r, 50));
        try { sc.stop(); } catch { /* ignore */ }
        try { sc.clear(); } catch { /* ignore */ }
      })();
    };
    // verifyToken is stable via useCallback — no eslint-disable needed.
  }, [mode, stop?.id, verifyToken]);

  // Bug 4 fix: apply real torch constraint to the camera track when the
  // flashlight toggle changes. Gracefully ignored on unsupported devices.
  useEffect(() => {
    if (mode !== 'camera') return;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        const track = stream.getVideoTracks()[0];
        if (track) {
          // 'torch' is not yet in standard TS lib types — cast to any.
          await (track as any).applyConstraints({
            advanced: [{ torch: isFlashlightOn }],
          });
          // Release this temporary stream — the scanner manages its own.
          stream.getTracks().forEach((t) => t.stop());
        }
      } catch {
        // Device does not support torch — silently ignore.
      }
    })();
  }, [isFlashlightOn, mode]);

  if (!stop) {
    return (
      <div className="min-h-[720px] bg-slate-950 text-white flex items-center justify-center">
        No active pickup selected.
      </div>
    );
  }

  return (
    <div className="min-h-[720px] bg-slate-950 text-white flex flex-col">
      <header className="px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-black">Scan Customer QR</h1>
          <p className="text-[10px] text-slate-400 font-mono">{stop.pickupCode}</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFlashlightOn(!isFlashlightOn)}
          className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer ${
            isFlashlightOn ? 'bg-amber-400 text-slate-950' : 'bg-white/10'
          }`}
          title="Flashlight (device dependent)"
        >
          <Flashlight className="w-4 h-4" />
        </button>
      </header>

      <div className="px-4 pt-3 flex gap-2">
        <button
          type="button"
          // Bug 8 fix: clear stale error when switching modes.
          onClick={() => { setMode('camera'); setScanError(''); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'camera' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Camera
        </button>
        <button
          type="button"
          // Bug 8 fix: clear stale error when switching modes.
          onClick={() => { setMode('manual'); setScanError(''); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'manual' ? 'bg-emerald-500 text-slate-950' : 'bg-white/10 text-white'
          }`}
        >
          <Keyboard className="w-3.5 h-3.5" /> Enter code
        </button>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">
        <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 flex gap-2 text-[11px] text-emerald-100">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          Ask the customer to open <strong>My Pickups → this order</strong> and show the green QR card.
        </div>

        {mode === 'camera' ? (
          <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-black min-h-[320px]">
            <div id="employee-qr-reader" className="w-full" />
            {!cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Starting camera…
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Paste / type QR token from customer
            </label>
            <textarea
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              rows={4}
              placeholder="AK-QR-…"
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400"
            />
            <button
              type="button"
              disabled={verifying || !manualToken.trim()}
              onClick={() => verifyToken(manualToken)}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-black text-sm disabled:opacity-40 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Verify & start pickup
            </button>
          </div>
        )}

        {scanError && (
          <div className="p-3 rounded-xl bg-rose-950 text-rose-200 text-xs font-semibold">{scanError}</div>
        )}

        {verifying && mode === 'camera' && (
          <div className="text-center text-xs text-emerald-300 font-bold flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Verifying QR…
          </div>
        )}
      </div>
    </div>
  );
};
