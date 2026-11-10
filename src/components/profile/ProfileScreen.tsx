"use client";

import { Button } from '../ui';
import React, { useEffect } from 'react';
import { CheckCircle2, ClipboardList, IndianRupee, LogOut, MapPin, ShieldCheck, Truck, User, Weight } from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const titleCase = (value: string) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : '—';

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4">
    <span className="text-slate-500 shrink-0">{label}</span>
    <strong className="text-right text-slate-900">{value}</strong>
  </div>
);

const Stat = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wide">
      {icon}
      {label}
    </div>
    <div className="font-mono font-bold text-lg text-slate-900 mt-1.5">{value}</div>
  </div>
);

export const ProfileScreen: React.FC = () => {
  const { profile, logout, refreshDashboardData } = useEmployee();

  // Stats change as pickups finish, so reload them whenever this screen opens.
  useEffect(() => {
    void refreshDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loaded = Boolean(profile.id);
  const initials =
    profile.name === '—'
      ? '—'
      : profile.name
          .split(/\s+/)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
  const hasVehicle = profile.vehicleReg !== '—' || profile.vehicleName !== '—';
  const { stats } = profile;

  return (
    <div className="p-4 space-y-4 select-none pb-28">
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand to-brand text-white flex items-center justify-center font-bold text-xl">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-900 text-base truncate">{loaded ? profile.name : 'Loading…'}</h2>
            {profile.kycVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold uppercase">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-slate-500 mt-0.5">{profile.employeeCode}</div>
          {profile.homeArea && (
            <div className="text-[11px] text-emerald-800 font-bold mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {profile.homeArea}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<ClipboardList className="w-3 h-3" />} label="Today" value={stats.todayJobs} />
        <Stat icon={<Truck className="w-3 h-3" />} label="Open" value={stats.openJobs} />
        <Stat icon={<CheckCircle2 className="w-3 h-3" />} label="Done" value={stats.completed} />
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" /> Employee details
        </h3>
        <Row label="Phone" value={profile.phone} />
        <Row label="Account status" value={titleCase(profile.status)} />
        <Row label="Member since" value={formatDate(profile.memberSince)} />
        <Row label="Approved on" value={formatDate(profile.approvedAt)} />
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-700" /> Vehicle
        </h3>
        {hasVehicle ? (
          <>
            <Row label="Registration" value={profile.vehicleReg} />
            <Row label="Vehicle" value={profile.vehicleName} />
          </>
        ) : (
          <p className="text-slate-500">No vehicle on record.</p>
        )}
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wide">Work summary</h3>
        <div className="grid grid-cols-2 gap-2">
          <Stat icon={<ClipboardList className="w-3 h-3" />} label="Pickups assigned" value={stats.totalAssigned} />
          <Stat icon={<CheckCircle2 className="w-3 h-3" />} label="Completed" value={stats.completed} />
          <Stat icon={<Weight className="w-3 h-3" />} label="Scrap collected" value={`${stats.totalWeightKg} kg`} />
          <Stat
            icon={<IndianRupee className="w-3 h-3" />}
            label="Paid to customers"
            value={`₹${stats.totalPayoutRupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
          />
        </div>
      </div>

      <Button
        type="button"
        onClick={logout}
        className="w-full py-3 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out of Device
      </Button>
    </div>
  );
};
