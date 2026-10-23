"use client";

import React, { useState, useEffect } from 'react';
import {
  Navigation,
  ArrowUpRight,
  CornerUpLeft,
  CornerUpRight,
  MapPin,
  Phone,
  ExternalLink,
  X,
  BatteryCharging,
  Gauge,
  Compass,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';

interface LiveRouteNavigationScreenProps {
  onArrivedAtDoorstep?: (stop: RouteStop) => void;
  onExitNavigation?: () => void;
}

export const LiveRouteNavigationScreen: React.FC<LiveRouteNavigationScreenProps> = ({
  onArrivedAtDoorstep,
  onExitNavigation,
}) => {
  const {
    activeNavStop,
    activePickup,
    setIsLiveNavOpen,
    setActivePickup,
    setShiftStatus,
  } = useEmployee();

  const stop = activeNavStop || activePickup || {
    id: 'stop_nav_demo',
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
    status: 'IN_PROGRESS' as const,
  };

  const [speed, setSpeed] = useState<number>(24);
  const [batteryLevel, setBatteryLevel] = useState<number>(82);
  const [distanceRemainingKm, setDistanceRemainingKm] = useState<number>(2.4);
  const [minsRemaining, setMinsRemaining] = useState<number>(9);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [isArrived, setIsArrived] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const navigationSteps = [
    {
      icon: CornerUpLeft,
      instruction: 'In 200m turn left onto Benz Circle Main Road',
      distance: '200m',
      nextStreet: 'MG Road Junction',
    },
    {
      icon: ArrowUpRight,
      instruction: 'Continue straight for 1.2 km towards Madhura Nagar',
      distance: '1.2 km',
      nextStreet: 'Eluru Canal By-pass',
    },
    {
      icon: CornerUpRight,
      instruction: 'Turn right at Water Tank landmark into Door 14-8 Lane',
      distance: '150m',
      nextStreet: 'Customer Lane',
    },
    {
      icon: MapPin,
      instruction: 'Destination is on the left: Door 14-8-2',
      distance: '30m',
      nextStreet: 'Final Destination',
    },
  ];

  // Dynamic simulation of vehicle progress
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeed((prev) => Math.min(38, Math.max(18, prev + (Math.random() * 6 - 3))));
      setDistanceRemainingKm((prev) => {
        if (prev <= 0.2) return 0.1;
        return Number((prev - 0.05).toFixed(2));
      });
      setMinsRemaining((prev) => (prev > 2 ? prev - 1 : 2));
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleExit = () => {
    setIsLiveNavOpen(false);
    if (onExitNavigation) {
      onExitNavigation();
    }
  };

  const handleOpenGoogleMaps = () => {
    const destination = encodeURIComponent(`${stop.address}, ${stop.locality}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const handleConfirmArrival = () => {
    setIsArrived(true);
    setTimeout(() => {
      setIsLiveNavOpen(false);
      setActivePickup(stop);
      setShiftStatus('ON_PICKUP');
      if (onArrivedAtDoorstep) {
        onArrivedAtDoorstep(stop);
      } else {
        alert(`Arrived at ${stop.customerName}'s Doorstep! Ready for Doorstep QR Verification.`);
      }
    }, 400);
  };

  return (
    <div className="relative w-full h-full min-h-[700px] flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* 1. Map Canvas Background with Realistic Road Network */}
      <div className="absolute inset-0 bg-[#0d1522] overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 400 700"
          className="w-full h-full object-cover opacity-90"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Grid pattern for terrain */}
            <pattern id="roadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#162338" strokeWidth="0.8" />
            </pattern>
            {/* Glowing route gradient */}
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* City Block Terrain */}
          <rect width="100%" height="100%" fill="#0a101d" />
          <rect width="100%" height="100%" fill="url(#roadGrid)" />

          {/* Water body / Canal */}
          <path
            d="M -20,280 Q 120,310 240,270 T 420,330 L 420,360 Q 240,300 120,340 T -20,310 Z"
            fill="#0f2b3c"
            opacity="0.8"
          />
          <text x="180" y="325" fill="#38bdf8" fontSize="9" opacity="0.4" fontFamily="sans-serif">
            Eluru Canal
          </text>

          {/* Secondary Roads */}
          <path d="M 0,140 L 400,160" stroke="#1e293b" strokeWidth="9" fill="none" />
          <path d="M 0,230 L 400,210" stroke="#1e293b" strokeWidth="8" fill="none" />
          <path d="M 0,440 L 400,430" stroke="#1e293b" strokeWidth="10" fill="none" />
          <path d="M 0,560 L 400,580" stroke="#1e293b" strokeWidth="8" fill="none" />
          <path d="M 90,0 L 70,700" stroke="#1e293b" strokeWidth="8" fill="none" />
          <path d="M 310,0 L 330,700" stroke="#1e293b" strokeWidth="10" fill="none" />

          {/* Main Highway / Trunk Road */}
          <path
            d="M 200,700 L 200,460 L 140,370 L 140,210 L 260,110 L 260,0"
            stroke="#334155"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 200,700 L 200,460 L 140,370 L 140,210 L 260,110 L 260,0"
            stroke="#1e293b"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* ACTIVE TURN-BY-TURN ROUTE POLYLINE */}
          {/* Base halo glow */}
          <path
            d="M 200,580 L 200,460 L 140,370 L 140,210 L 260,120"
            stroke="#059669"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.4"
            fill="none"
            filter="url(#glow)"
          />
          {/* Main animated polyline */}
          <path
            d="M 200,580 L 200,460 L 140,370 L 140,210 L 260,120"
            stroke="url(#routeGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="8 4"
            className="animate-pulse"
          />

          {/* DESTINATION DOORSTEP PIN */}
          <g transform="translate(260, 120)">
            {/* Ripple rings */}
            <circle r="22" fill="#ef4444" opacity="0.2" className="animate-ping" />
            <circle r="14" fill="#ef4444" opacity="0.4" />
            {/* Pin head */}
            <circle r="10" fill="#dc2626" stroke="#ffffff" strokeWidth="2.5" />
            {/* Pin center dot */}
            <circle r="4" fill="#ffffff" />
            <text x="14" y="4" fill="#ffffff" fontSize="10" fontWeight="bold">
              {stop.pickupCode}
            </text>
          </g>

          {/* CURRENT VEHICLE LOCATION (EV Cargo Auto) */}
          <g transform="translate(200, 560)">
            {/* Radar / Accuracy Cone */}
            <path
              d="M 0,0 L -35,-80 A 90 90 0 0 1 35,-80 Z"
              fill="#10b981"
              opacity="0.18"
            />
            {/* Outer halo */}
            <circle r="18" fill="#10b981" opacity="0.25" className="animate-pulse" />
            <circle r="12" fill="#047857" stroke="#34d399" strokeWidth="2.5" />
            {/* EV Cargo Auto Direction Indicator */}
            <polygon points="0,-7 6,6 0,3 -6,6" fill="#ffffff" />
          </g>
        </svg>

        {/* Ambient Top & Bottom Shadows for High Contrast */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Header Overlay (Exit button + Live Telemetry) */}
      <div className="relative z-20 px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={handleExit}
          className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg active:scale-95"
          title="Exit Live Navigation"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Live EV Telemetry Bar */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg text-xs">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <Gauge className="w-3.5 h-3.5" />
            <span>{Math.round(speed)} km/h</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-emerald-300 font-medium">
            <BatteryCharging className="w-3.5 h-3.5" />
            <span>{batteryLevel}%</span>
          </div>
          <span className="text-slate-600">•</span>
          <div className="flex items-center gap-1 text-sky-400 font-medium">
            <Compass className="w-3.5 h-3.5" />
            <span>GPS &lt;4m</span>
          </div>
        </div>

        {/* Voice Guidance Toggle */}
        <button
          onClick={() => setIsVoiceMuted(!isVoiceMuted)}
          className="p-2.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg active:scale-95"
        >
          {isVoiceMuted ? (
            <VolumeX className="w-5 h-5 text-amber-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-emerald-400" />
          )}
        </button>
      </div>

      {/* 3. Floating Turn Instruction Card (Rapido / Uber Turn Box) */}
      <div className="relative z-20 px-4 mt-1">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900/90 via-slate-900/95 to-slate-900/95 border-2 border-emerald-500/40 p-3.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/30 shrink-0">
              {React.createElement(navigationSteps[currentStepIndex].icon, {
                className: 'w-7 h-7 stroke-[2.5]',
              })}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  {navigationSteps[currentStepIndex].distance}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  Next: {navigationSteps[currentStepIndex].nextStreet}
                </span>
              </div>
              <h2 className="text-sm font-bold text-white mt-1 leading-snug">
                {navigationSteps[currentStepIndex].instruction}
              </h2>
            </div>
          </div>

          {/* Quick cycle button for testing multiple turn maneuvers */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Radio className="w-3 h-3 animate-pulse" /> Live Rapido Turn Guidance
            </span>
            <button
              onClick={() =>
                setCurrentStepIndex((prev) => (prev + 1) % navigationSteps.length)
              }
              className="text-emerald-400 hover:text-emerald-300 underline font-medium"
            >
              Simulate Next Turn →
            </button>
          </div>
        </div>
      </div>

      {/* Spacer to push Bottom Card down */}
      <div className="flex-1" />

      {/* 4. Bottom Trip Status & Slide-to-Arrive Card */}
      <div className="relative z-20 px-4 pb-4">
        <div className="rounded-3xl bg-slate-900/95 border border-slate-800 p-4 shadow-2xl backdrop-blur-xl">
          {/* ETA & Distance Summary */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white tracking-tight">
                  {minsRemaining} <span className="text-sm font-semibold text-emerald-400">min</span>
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="text-sm font-semibold text-slate-300">
                  {distanceRemainingKm} km
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Est. Arrival: 11:18 AM</span>
              </div>
            </div>

            {/* Stop Number Badge */}
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                Stop #{stop.stopNumber || 2} of 6
              </span>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">{stop.pickupCode}</p>
            </div>
          </div>

          {/* Customer & Doorstep Info */}
          <div className="py-3 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white truncate">
                  {stop.customerName}
                </h3>
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  ~{stop.estimatedWeightKg} kg
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {stop.address}
              </p>
              {stop.landmark && (
                <p className="text-[11px] text-emerald-400 font-medium truncate mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" /> Landmark: {stop.landmark}
                </p>
              )}
            </div>

            {/* Quick Action Icons: Call + External Maps */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${stop.phone}`}
                className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center hover:bg-emerald-500 hover:text-slate-950 transition active:scale-95"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                onClick={handleOpenGoogleMaps}
                className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-white transition active:scale-95"
                title="Open Google Maps"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 5. PRIMARY ACTION: Slide / Tap when Arrived at Doorstep */}
          <div className="mt-2 pt-2 border-t border-slate-800/80">
            {isArrived ? (
              <div className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 text-slate-950 font-black text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
                Arrived! Launching Step 1 Verification...
              </div>
            ) : (
              <button
                onClick={handleConfirmArrival}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/25 hover:brightness-105 active:scale-[0.99] transition flex items-center justify-between group"
              >
                <span className="w-7 h-7 rounded-full bg-slate-950/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-slate-950" />
                </span>
                <span className="uppercase text-xs tracking-wider">
                  Slide / Tap When Arrived at Doorstep
                </span>
                <ChevronRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
