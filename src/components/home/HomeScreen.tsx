"use client";

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
  Play,
  RotateCcw,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';

interface HomeScreenProps {
  onStartPickupFlow?: (pickupId: string) => void;
  onNavigateToPickup?: (stop: RouteStop) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartPickupFlow,
  onNavigateToPickup,
}) => {
  const {
    profile,
    shiftStatus,
    setShiftStatus,
    routeStops,
    activePickup,
    setActivePickup,
    setActiveTab,
    startLiveNavigation,
    triggerIncomingOrderAlert,
  } = useEmployee();

  const [selectedStopForDrawer, setSelectedStopForDrawer] = useState<RouteStop | null>(null);

  // Compute overview counts
  const totalScheduled = routeStops.length;
  const inProgressCount = routeStops.filter((s) => s.status === 'IN_PROGRESS').length;
  const completedCount = routeStops.filter((s) => s.status === 'COMPLETED').length;

  // Next scheduled pickup (for State 2)
  const nextScheduledPickup = routeStops.find((s) => s.status === 'SCHEDULED') || routeStops[0] || null;

  const handleContinuePickup = () => {
    if (activePickup && onStartPickupFlow) {
      onStartPickupFlow(activePickup.pickupCode);
    } else if (routeStops.length > 0 && onStartPickupFlow) {
      onStartPickupFlow(routeStops[0].pickupCode);
    }
  };

  const handleStartNextPickup = (stop: RouteStop) => {
    setActivePickup(stop);
    setShiftStatus('ON_PICKUP');
    if (onStartPickupFlow) {
      onStartPickupFlow(stop.pickupCode);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 1. Header (Greeting, Status Pill, Notification Bell, Avatar) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">
              {shiftStatus === 'COMPLETED' ? `Good evening, ${profile.name.split(' ')[0]}` : `Good morning, ${profile.name.split(' ')[0]}`}
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {shiftStatus === 'COMPLETED' ? 'Great work today!' : "Ready for today's pickups?"}
          </p>

          {/* Shift Status Pill Switcher */}
          <div className="mt-1.5 flex items-center">
            <button
              type="button"
              onClick={() => {
                const nextStatus = shiftStatus === 'ON_PICKUP' ? 'AVAILABLE' : 'ON_PICKUP';
                setShiftStatus(nextStatus);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                shiftStatus === 'ON_PICKUP'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : shiftStatus === 'COMPLETED'
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  shiftStatus === 'ON_PICKUP'
                    ? 'bg-amber-500 animate-pulse'
                    : shiftStatus === 'COMPLETED'
                    ? 'bg-slate-400'
                    : 'bg-emerald-500'
                }`}
              ></span>
              <span>
                {shiftStatus === 'ON_PICKUP'
                  ? "You're On Pickup"
                  : shiftStatus === 'COMPLETED'
                  ? 'Shift Finished'
                  : "You're Available"}
              </span>
            </button>
          </div>
        </div>

        {/* Right Header: Test Alert Trigger, Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => triggerIncomingOrderAlert()}
            title="Simulate Incoming Bulk Dispatch Alert"
            className="px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold text-[10px] flex items-center gap-1 hover:bg-amber-100 transition shadow-xs cursor-pointer active:scale-95"
          >
            <span>🚨 Alert</span>
          </button>

          <button
            type="button"
            className="p-2.5 rounded-full bg-white border border-slate-200/90 text-slate-700 shadow-xs relative hover:bg-slate-50 cursor-pointer"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
          </button>

          {/* Avatar in Green Cap / Uniform */}
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-emerald-500/80 p-0.5 relative shadow-xs flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-[#0A3D2B] flex items-center justify-center text-white font-bold text-xs uppercase">
              👷 RK
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white"></span>
          </div>
        </div>
      </div>

      {/* 2. Today's Overview Counters Card */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-900">Today's Overview</span>
          <span className="text-[11px] text-slate-400 font-medium">Mon, 05 Oct 2026</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Scheduled Today */}
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100/80 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div>
              <div className="font-mono font-black text-slate-900 text-sm leading-none">
                {totalScheduled < 10 ? `0${totalScheduled}` : totalScheduled}
              </div>
              <div className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">
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
              <div className="font-mono font-black text-slate-900 text-sm leading-none">
                {inProgressCount < 10 ? `0${inProgressCount}` : inProgressCount}
              </div>
              <div className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">
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
              <div className="font-mono font-black text-slate-900 text-sm leading-none">
                {completedCount < 10 ? `0${completedCount}` : completedCount}
              </div>
              <div className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-tight">
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
            <h3 className="font-black text-slate-900 text-sm">Standby • Ready for Route Assignment</h3>
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
          {shiftStatus === 'ON_PICKUP' && activePickup && (
            <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0A3D2B] via-[#0E4D36] to-[#062418] text-white shadow-xl space-y-3 relative overflow-hidden">
              {/* Subtle background circuit/grid decorative */}
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-xl pointer-events-none"></div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-200">Current Pickup</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wide">
                    In Progress
                  </span>
                </div>
                <span className="font-mono font-extrabold text-xs text-emerald-300">
                  {activePickup.pickupCode}
                </span>
              </div>

              {/* Customer & Route Details with Mini-Map graphic */}
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="font-black text-sm text-white truncate">
                    {activePickup.customerName}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-[11px] font-medium">{activePickup.timeSlot}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                    <span className="text-[11px] font-medium truncate">
                      {activePickup.locality}
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

              {/* Action Buttons: Navigate Route & Continue Pickup */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const targetStop = activePickup || routeStops[0];
                    if (onNavigateToPickup) {
                      onNavigateToPickup(targetStop);
                    } else {
                      startLiveNavigation(targetStop);
                    }
                  }}
                  className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-emerald-400/40 text-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer active:scale-[0.98]"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Navigate</span>
                </button>
                <button
                  type="button"
                  onClick={handleContinuePickup}
                  className="py-2.5 rounded-xl bg-[#F59E0B] text-slate-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-amber-950/30 cursor-pointer active:scale-[0.98]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* --- STATE 2: NEXT PICKUP (BETWEEN STOPS / AVAILABLE) --- */}
          {shiftStatus === 'AVAILABLE' && nextScheduledPickup && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-white border border-amber-200/80 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span className="font-extrabold text-xs text-slate-900">Next Pickup</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Starts in 45 mins
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <div className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#0A3D2B] font-mono font-bold text-xs mt-0.5">
                      {nextScheduledPickup.scheduledTime}
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-slate-400">{nextScheduledPickup.pickupCode}</div>
                      <div className="font-bold text-slate-900 text-sm">{nextScheduledPickup.customerName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{nextScheduledPickup.locality}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedStopForDrawer(nextScheduledPickup)}
                    className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all text-center cursor-pointer"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateToPickup) {
                        onNavigateToPickup(nextScheduledPickup);
                      } else {
                        handleStartNextPickup(nextScheduledPickup);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-[#0A3D2B] text-white font-bold text-xs hover:bg-[#0E4D36] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Navigate</span>
                  </button>
                </div>
              </div>

              {/* Motivational Incentive Banner */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-2.5 text-xs text-slate-700">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-[#0A3D2B] block">Complete pickups on time</span>
                  <span className="text-[10px] text-slate-500">Keep customers happy and earn better incentives.</span>
                </div>
              </div>
            </div>
          )}

          {/* --- STATE 3: SHIFT COMPLETED CELEBRATION --- */}
          {shiftStatus === 'COMPLETED' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0A3D2B] to-[#10B981] text-white shadow-xl space-y-2 text-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-full bg-white/10 mx-auto flex items-center justify-center shadow-inner">
                  <Trophy className="w-7 h-7 text-amber-300 animate-bounce" />
                </div>
                <h3 className="font-black text-base tracking-tight">All today's pickups completed!</h3>
                <p className="text-xs text-emerald-100 font-medium">Great work. Keep it going!</p>
              </div>

              {/* Milestone Achievement Banner */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center gap-2.5 text-xs text-slate-800">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-slate-900 block">You completed {completedCount} pickups today!</span>
                  <span className="text-[10px] text-slate-500">Your efforts help build a cleaner and greener city.</span>
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
          <button
            type="button"
            onClick={() => setActiveTab('MY_PICKUPS')}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({routeStops.length})</span>
            <ArrowRight className="w-3 h-3" />
          </button>
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
                      <span className="font-mono font-bold text-[11px] text-slate-400">{stop.pickupCode}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{selectedStopForDrawer.pickupCode}</span>
                <h3 className="font-black text-slate-900 text-sm">{selectedStopForDrawer.customerName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStopForDrawer(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedStopForDrawer.address}</span>
                </div>
                <div className="text-[10px] text-slate-400">{selectedStopForDrawer.landmark}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Time Window</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{selectedStopForDrawer.timeSlot}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Est. Weight</span>
                  <span className="font-bold text-emerald-800 text-xs mt-0.5 block">
                    ~{selectedStopForDrawer.estimatedWeightKg} kg
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <a
                href={`tel:${selectedStopForDrawer.phone}`}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Customer</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const stop = selectedStopForDrawer;
                  setSelectedStopForDrawer(null);
                  handleStartNextPickup(stop);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0A3D2B] text-white font-bold text-xs hover:bg-[#0E4D36] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Start Pickup</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
