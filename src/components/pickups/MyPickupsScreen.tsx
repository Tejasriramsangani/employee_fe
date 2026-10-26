"use client";

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Compass,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Scale,
  X,
  Play,
} from 'lucide-react';
import { useEmployee, RouteStop } from '../../context/EmployeeContext';

interface MyPickupsScreenProps {
  onSelectStop?: (stop: RouteStop) => void;
  onNavigateToStop?: (stop: RouteStop) => void;
}

export const MyPickupsScreen: React.FC<MyPickupsScreenProps> = ({
  onSelectStop,
  onNavigateToStop,
}) => {
  const {
    routeStops,
    routeTitle,
    startLiveNavigation,
    setActivePickup,
    setPickupStep,
    setShiftStatus,
  } = useEmployee();

  const [filter, setFilter] = useState<'ALL' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');
  const [inspectingStop, setInspectingStop] = useState<RouteStop | null>(null);

  const filteredStops = routeStops.filter((s) => {
    if (filter !== 'ALL' && s.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.customerName.toLowerCase().includes(q) ||
        s.pickupCode.toLowerCase().includes(q) ||
        s.locality.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleStartLiveNavigation = (e: React.MouseEvent, stop: RouteStop) => {
    e.stopPropagation();
    if (onNavigateToStop) {
      onNavigateToStop(stop);
    } else {
      startLiveNavigation(stop);
    }
  };

  const handleOpenGoogleMaps = (e: React.MouseEvent, stop: RouteStop) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${stop.address}, ${stop.locality}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleStartPickup = (stop: RouteStop) => {
    startLiveNavigation(stop);
  };

  return (
    <div className="p-4 space-y-4 select-none pb-24">
      {/* 1. Header with route title & summary */}
      <div>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Today's Route Sequence</h1>
        <p className="text-xs text-slate-500 font-medium">
          {routeStops.length} Total Pickups • {routeTitle}
        </p>
      </div>

      {/* 2. Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, code or area..."
          className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-xs"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              filter === tab
                ? 'bg-[#0A3D2B] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab === 'ALL'
              ? `All (${routeStops.length})`
              : tab === 'SCHEDULED'
              ? `Scheduled (${routeStops.filter((s) => s.status === 'SCHEDULED').length})`
              : tab === 'IN_PROGRESS'
              ? `In Progress (${routeStops.filter((s) => s.status === 'IN_PROGRESS').length})`
              : `Done (${routeStops.filter((s) => s.status === 'COMPLETED').length})`}
          </button>
        ))}
      </div>

      {/* 4. Ordered Stop Cards */}
      <div className="space-y-3">
        {filteredStops.map((stop) => (
          <div
            key={stop.id}
            onClick={() => setInspectingStop(stop)}
            className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer space-y-2.5 shadow-xs hover:border-slate-300 active:scale-[0.99] ${
              stop.status === 'IN_PROGRESS'
                ? 'border-amber-400 ring-2 ring-amber-400/20'
                : stop.status === 'COMPLETED'
                ? 'border-emerald-200 bg-emerald-50/20'
                : 'border-slate-200'
            }`}
          >
            {/* Card Top: Stop Number Badge, Code, and Status Pill */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#0A3D2B] text-white font-black text-xs flex items-center justify-center">
                  #{stop.stopNumber}
                </span>
                <span className="font-mono font-bold text-xs text-slate-500">{stop.pickupCode}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                  stop.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : stop.status === 'IN_PROGRESS'
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stop.status.replace('_', ' ')}
              </span>
            </div>

            {/* Customer & Location */}
            <div>
              <div className="font-bold text-slate-900 text-sm">{stop.customerName}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{stop.timeSlot}</span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">{stop.address}</span>
              </div>
            </div>

            {/* Meta details & Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">
                ~{stop.estimatedWeightKg} kg • {stop.itemsCategoryHint}
              </span>

              {/* Direct Quick Actions: Call + Navigate Route */}
              <div className="flex items-center gap-1.5">
                <a
                  href={`tel:${stop.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                  title="Call Customer"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={(e) => handleStartLiveNavigation(e, stop)}
                  className="px-2.5 py-1 rounded-lg bg-[#0A3D2B] text-white hover:bg-[#0E4D36] font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 transition"
                  title="Live Turn-by-Turn Navigation"
                >
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Navigate</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Stop Inspector Drawer Modal */}
      {inspectingStop && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] text-slate-400">{inspectingStop.pickupCode}</span>
                <h3 className="font-black text-slate-900 text-sm">
                  Stop #{inspectingStop.stopNumber}: {inspectingStop.customerName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingStop(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{inspectingStop.address}</span>
                </div>
                {inspectingStop.landmark && (
                  <div className="text-[10px] text-slate-400">Landmark: {inspectingStop.landmark}</div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Time Window</span>
                  <span className="font-bold text-slate-900 text-xs mt-0.5 block">{inspectingStop.timeSlot}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Est. Weight</span>
                  <span className="font-bold text-emerald-800 text-xs mt-0.5 block">
                    ~{inspectingStop.estimatedWeightKg} kg
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={(e) => {
                  handleOpenGoogleMaps(e, inspectingStop);
                }}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const s = inspectingStop;
                  setInspectingStop(null);
                  startLiveNavigation(s);
                }}
                className="py-2.5 rounded-xl bg-[#0A3D2B] text-white font-bold text-xs hover:bg-[#0E4D36] flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Nav</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const s = inspectingStop;
                setInspectingStop(null);
                handleStartPickup(s);
              }}
              className="w-full py-3 rounded-2xl bg-[#F59E0B] text-slate-950 font-black text-xs hover:bg-amber-400 flex items-center justify-center gap-2 shadow-md cursor-pointer transition active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Start Doorstep Collection Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
