"use client";

import { Button } from '../ui';
import React from 'react';
import { Compass, Phone, Play, ArrowRight } from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';

interface PickupActionsProps {
  stop: RouteStop;
  /** Start (or continue) the doorstep collection: opens the QR scan / the screen the pickup has reached. */
  onStart: (stop: RouteStop) => void;
  /** 'dark' for use on the green Home card. */
  variant?: 'light' | 'dark';
}

/** Server statuses meaning the picker is already at the door and collecting. */
const COLLECTING = [
  'VERIFIED',
  'IN_PROGRESS',
  'MEASURED',
  'SUMMARY_READY',
  'CUSTOMER_CONFIRMED',
  'PAYMENT_PENDING',
  'SETTLED',
];

const isDialable = (phone: string) => /\d{6,}/.test(phone);

/**
 * The actions for one open pickup, in the order a picker needs them:
 *  1. Before the journey starts: only Navigate, so the route comes first.
 *  2. After Navigate was tapped (the picker comes back to the app): Call customer, Navigate, Start Pickup.
 *  3. Once collecting has begun: Call customer and Continue.
 */
export const PickupActions: React.FC<PickupActionsProps> = ({ stop, onStart, variant = 'light' }) => {
  const { startLiveNavigation, hasNavigated } = useEmployee();
  const dark = variant === 'dark';
  const collecting = COLLECTING.includes(stop.rawStatus);
  const navigated = hasNavigated(stop);

  const callClass = dark
    ? 'bg-white/10 hover:bg-white/20 border border-emerald-400/40 text-emerald-100'
    : 'border border-slate-200 text-slate-800 hover:bg-slate-50';
  const navClass = dark
    ? 'bg-white/10 hover:bg-white/20 border border-emerald-400/40 text-emerald-100'
    : 'border border-brand/30 text-brand bg-emerald-50 hover:bg-emerald-100';
  const primaryClass = dark
    ? 'bg-gold text-slate-950 hover:bg-amber-400 shadow-lg '
    : 'bg-brand text-white hover:bg-[var(--brand-hover)] shadow-sm';

  const call = (
    <a
      key="call"
      href={isDialable(stop.phone) ? `tel:${stop.phone}` : undefined}
      aria-disabled={!isDialable(stop.phone)}
      className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition ${callClass} ${
        isDialable(stop.phone) ? '' : 'opacity-50 pointer-events-none'
      }`}
    >
      <Phone className="w-3.5 h-3.5 text-emerald-500" />
      <span>Call</span>
    </a>
  );

  const navigate = (full: boolean) => (
    <Button
      key="navigate"
      type="button"
      onClick={() => startLiveNavigation(stop)}
      className={`${full ? 'w-full py-3 text-sm' : 'py-2.5 text-xs'} rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition ${
        full ? primaryClass : navClass
      }`}
    >
      <Compass className={`${full ? 'w-4 h-4' : 'w-3.5 h-3.5'} ${full && !dark ? 'text-emerald-400' : 'text-emerald-500'}`} />
      <span>Navigate</span>
    </Button>
  );

  // 3. Already collecting: just get back into the flow.
  if (collecting) {
    return (
      <div className="grid grid-cols-[1fr_2fr] gap-2">
        {call}
        <Button
          type="button"
          onClick={() => onStart(stop)}
          className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition ${primaryClass}`}
        >
          <span>Continue Pickup</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // 1. Route first.
  if (!navigated) return navigate(true);

  // 2. Back from the map: call, navigate again, or start.
  return (
    <div className="grid grid-cols-3 gap-2">
      {call}
      {navigate(false)}
      <Button
        type="button"
        onClick={() => onStart(stop)}
        className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] transition ${primaryClass}`}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Start Pickup</span>
      </Button>
    </div>
  );
};
