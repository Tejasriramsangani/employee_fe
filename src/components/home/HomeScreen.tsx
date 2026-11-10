"use client";

import { Button, DialogSurface } from '../ui';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Bell,
  MapPin,
  Navigation,
  ArrowRight,
  ChevronRight,
  Star,
  Trophy,
  Phone,
  ShieldCheck,
  Sparkles,
  Compass,
  X,
  Power,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';
import { PickupActions } from '../pickups/PickupActions';

interface HomeScreenProps {
  onStartPickupFlow?: (pickupId: string) => void;
  onNavigateToPickup?: (stop: RouteStop) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartPickupFlow,
  onNavigateToPickup,
}) => {
  const { profile, shiftStatus, setShiftStatus, routeStops, nextPickup, setActiveTab, setOnDuty } = useEmployee();

  // Duty switch (like a ride-hailing captain going online / offline).
  const [dutyBusy, setDutyBusy] = useState(false);
  const [dutyError, setDutyError] = useState('');
  const toggleDuty = async () => {
    if (dutyBusy) return;
    setDutyBusy(true);
    setDutyError('');
    const saved = await setOnDuty(!profile.onDuty);
    if (!saved) setDutyError('Could not change your duty. Check your connection and try again.');
    setDutyBusy(false);
  };

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  // Always the live copy, so the buttons change as soon as the pickup's status does.
  const selectedStopForDrawer = routeStops.find((s) => s.id === selectedStopId) || null;
  const setSelectedStopForDrawer = (stop: RouteStop | null) => setSelectedStopId(stop?.id ?? null);

  // Compute overview counts
  const totalScheduled = routeStops.length;
  const inProgressCount = routeStops.filter((s) => s.status === 'IN_PROGRESS').length;
  const completedCount = routeStops.filter((s) => s.status === 'COMPLETED').length;

  // The pickup shown first: the open one the picker last tapped Navigate on (finished ones never show here).
  const nextScheduledPickup = nextPickup && nextPickup.status !== 'IN_PROGRESS' ? nextPickup : null;
  const currentPickup = nextPickup && nextPickup.status === 'IN_PROGRESS' ? nextPickup : null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // "Shift ended" only appears after the employee has actually been on duty and switched off today.
  const endedToday =
    !profile.onDuty &&
    profile.dutyChangedAt &&
    new Date(profile.dutyChangedAt).toDateString() === new Date().toDateString();
  const dutySubtitle = profile.onDuty
    ? "You're online. Ready for today's pickups."
    : endedToday
    ? `Shift ended at ${new Date(profile.dutyChangedAt as string).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}${
        completedCount > 0 ? ` · ${completedCount} pickup${completedCount > 1 ? 's' : ''} done today` : ''
      }`
    : 'Go on duty to start receiving pickups.';

  const handleStart = (stop: RouteStop) => {
    setSelectedStopForDrawer(null);
    setShiftStatus('ON_PICKUP');
    onStartPickupFlow?.(stop.pickupCode);
  };

  return (
    <div className="p-4 space-y-4">
      {/* 1. Header (Greeting, Status Pill, Notification Bell, Avatar) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {greeting}, {profile.name.split(' ')[0]}
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {dutySubtitle}
          </p>
        </div>

        {/* Right Header: Test Alert Trigger, Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-2">
          <Button aria-label="Notifications"
            type="button"
            className="p-2.5 rounded-full bg-white border border-slate-200/90 text-slate-700 shadow-xs relative hover:bg-slate-50 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </Button>

          {/* Avatar in Green Cap / Uniform */}
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500/80 p-0.5 relative shadow-xs flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-brand flex items-center justify-center text-white font-bold text-xs uppercase">
              {profile.name !== '—' ? profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2) : '—'}
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white"></span>
          </div>
        </div>
      </div>

      {/* Duty switch */}
      <div
        className={`rounded-2xl px-4 py-3 flex items-center justify-between gap-3 border transition-colors ${
          profile.onDuty
            ? 'bg-gradient-to-r from-brand to-[var(--brand-hover)] border-emerald-700 text-white shadow-md'
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              profile.onDuty ? 'bg-emerald-400/20 text-emerald-300' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Power className="w-4.5 h-4.5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight">{profile.onDuty ? 'You are ON DUTY' : 'You are OFF DUTY'}</p>
            <p className={`text-[11px] leading-snug ${profile.onDuty ? 'text-emerald-200' : 'text-slate-500'}`}>
              {profile.onDuty ? 'New pickups can be assigned to you' : 'Switch on to get new pickups'}
            </p>
          </div>
        </div>
        <Button
          type="button"
          role="switch"
          aria-checked={profile.onDuty}
          aria-label="Duty on or off"
          onClick={toggleDuty}
          disabled={dutyBusy}
          className={`relative w-14 h-8 rounded-full shrink-0 transition-colors cursor-pointer disabled:opacity-60 ${
            profile.onDuty ? 'bg-emerald-400' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              profile.onDuty ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </Button>
      </div>
      {dutyError && <p className="text-[11px] font-semibold text-rose-600 -mt-2 px-1">{dutyError}</p>}

      {/* 2. Today's Overview Counters Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-900">Today's Overview</span>
          <span className="text-[11px] text-slate-400 font-medium">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Scheduled Today */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div>
              <div className="font-mono font-bold text-slate-900 text-sm leading-none">
                {totalScheduled < 10 ? `0${totalScheduled}` : totalScheduled}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-tight">
                Scheduled<br />Today
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div>
              <div className="font-mono font-bold text-slate-900 text-sm leading-none">
                {inProgressCount < 10 ? `0${inProgressCount}` : inProgressCount}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-tight">
                In<br />Progress
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div>
              <div className="font-mono font-bold text-slate-900 text-sm leading-none">
                {completedCount < 10 ? `0${completedCount}` : completedCount}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-tight">
                Completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dynamic Centerpiece Card based on Shift State */}

      {/* 3. Dynamic Centerpiece Card based on Shift State */}
      {routeStops.length === 0 ? (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm text-center space-y-3 my-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-100">
            <Compass className="w-7 h-7 stroke-[1.8]" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Standby • Ready for Route Assignment</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              No pickups assigned to your vehicle yet today. Pickups dispatched from the Yard Cockpit will appear here in real time.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Driver System Ready ({profile.vehicleReg || 'Vehicle Linked'})</span>
          </div>
        </div>
      ) : (
        <>
          {/* --- STATE 1: CURRENT PICKUP (IN PROGRESS) --- */}
          {currentPickup && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-brand via-[var(--brand-hover)] to-[var(--brand-dark)] text-white shadow-xl space-y-3 relative overflow-hidden">
              {/* Subtle background circuit/grid decorative */}
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-200">Current Pickup</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] uppercase tracking-wide">
                    In Progress
                  </span>
                </div>
                <span className="data-value font-mono font-extrabold text-xs text-emerald-300">
                  {currentPickup.pickupCode}
                </span>
              </div>

              {/* Customer & Route Details with Mini-Map graphic */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="font-bold text-sm text-white truncate">
                    {currentPickup.customerName}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-[11px] font-medium">{currentPickup.timeSlot}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span className="text-[11px] font-medium truncate">
                      {currentPickup.locality}
                    </span>
                  </div>
                </div>

                {/* Mini GPS Route Graphic */}
                <div className="w-20 h-20 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 relative flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:8px_8px] opacity-20"></div>
                  <svg className="w-16 h-16 absolute" viewBox="0 0 100 100" fill="none">
                    <path
                      d="M15 80 C 40 70, 30 35, 75 25"
                      stroke="#F59E0B"
                      strokeWidth="3.5"
                      strokeDasharray="4 3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute top-4 right-4 animate-bounce">
                    <MapPin className="w-5 h-5 fill-amber-400 text-amber-500 drop-shadow-md" />
                  </div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
              </div>

              {/* Navigate first; Call / Navigate / Start once the journey has begun; Continue while collecting */}
              <div className="pt-1">
                <PickupActions stop={currentPickup} onStart={handleStart} variant="dark" />
              </div>
            </div>
          )}

          {/* --- STATE 2: NEXT PICKUP (BETWEEN STOPS / AVAILABLE) --- */}
          {nextScheduledPickup && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-white border border-amber-200/80 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold text-xs text-slate-900">Next Pickup</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {nextScheduledPickup.scheduledTime}
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-brand font-mono font-bold text-xs mt-0.5">
                      {nextScheduledPickup.scheduledTime}
                    </div>
                    <div>
                      <div className="font-mono text-[11px] text-slate-400">{nextScheduledPickup.pickupCode}</div>
                      <div className="font-bold text-slate-900 text-sm">{nextScheduledPickup.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{nextScheduledPickup.locality}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <PickupActions stop={nextScheduledPickup} onStart={handleStart} />
                  <Button
                    type="button"
                    onClick={() => setSelectedStopForDrawer(nextScheduledPickup)}
                    className="w-full text-center text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    View details
                  </Button>
                </div>
              </div>

              {/* Motivational Incentive Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-slate-700">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-brand block">Complete pickups on time</span>
                  <span className="text-[11px] text-slate-500">Keep customers happy and earn better incentives.</span>
                </div>
              </div>
            </div>
          )}

          {/* --- STATE 3: SHIFT COMPLETED CELEBRATION --- */}
          {shiftStatus === 'COMPLETED' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-brand to-brand text-white shadow-xl space-y-2 text-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center shadow-inner">
                  <Trophy className="w-7 h-7 text-amber-300 animate-bounce" />
                </div>
                <h3 className="font-bold text-base tracking-tight">All today's pickups completed!</h3>
                <p className="text-xs text-emerald-100 font-medium">Great work. Keep it going!</p>
              </div>

              {/* Milestone Achievement Banner */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center gap-2.5 text-xs text-slate-800">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">You completed {completedCount} pickups today!</span>
                  <span className="text-[11px] text-slate-500">Your efforts help build a cleaner and greener city.</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. Today's Pickups List matching Image 2 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-xs text-slate-900">Today's Pickups</span>
          <Button
            type="button"
            onClick={() => setActiveTab('MY_PICKUPS')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({routeStops.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {routeStops.length === 0 ? (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500 font-medium">
              No pickups in queue for today yet.
            </div>
          ) : (
            routeStops.slice(0, 4).map((stop) => (
              <div
                key={stop.id}
                onClick={() => setSelectedStopForDrawer(stop)}
                className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold text-[11px] shrink-0 text-center">
                    {stop.scheduledTime}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="data-value font-mono font-bold text-[11px] text-slate-400">{stop.pickupCode}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[11px] font-bold uppercase ${
                          stop.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stop.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {stop.status === 'COMPLETED' ? 'Completed' : stop.status === 'IN_PROGRESS' ? 'In Progress' : 'Scheduled'}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs truncate mt-0.5">{stop.customerName}</div>
                    <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{stop.locality}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Stop Inspector Drawer Modal */}
      {selectedStopForDrawer && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70  p-0 sm:p-4">
          <DialogSurface onClose={() => setSelectedStopForDrawer(null)} label="Home" className="w-full max-w-[440px] bg-white rounded-t-2xl sm:rounded-3xl p-5 pb-safe shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="data-value font-mono text-[11px] text-slate-400">{selectedStopForDrawer.pickupCode}</span>
                <h3 className="font-bold text-slate-900 text-lg">{selectedStopForDrawer.customerName}</h3>
              </div>
              <Button aria-label="Close"
                type="button"
                onClick={() => setSelectedStopForDrawer(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedStopForDrawer.address}</span>
                </div>
                <div className="text-[11px] text-slate-400">{selectedStopForDrawer.landmark}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Time Window</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{selectedStopForDrawer.timeSlot}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-bold uppercase block">Est. Weight</span>
                  <span className="font-bold text-emerald-800 text-xs mt-0.5 block">
                    {selectedStopForDrawer.estimatedWeightLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Completed pickups have nothing left to do; open ones get the Navigate-first buttons */}
            {selectedStopForDrawer.status !== 'COMPLETED' && (
              <div className="pt-2 border-t border-slate-100">
                <PickupActions stop={selectedStopForDrawer} onStart={handleStart} />
              </div>
            )}
          </DialogSurface>
        </div>
      )}
    </div>
  );
};
