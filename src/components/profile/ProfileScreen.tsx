"use client";

import React from 'react';
import { Banknote, LogOut, ShieldCheck, Truck, User } from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

const UnavailableCard = ({ title }: { title: string }) => (
  <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
    <h3 className="font-black text-xs text-slate-900 uppercase tracking-wide">{title}</h3>
    <div className="font-mono font-black text-xl text-slate-900 mt-3">₹0</div>
    <p className="text-[11px] text-slate-500 mt-1">Not available from server yet</p>
  </div>
);

export const ProfileScreen: React.FC = () => {
  const { profile, logout } = useEmployee();
  const initials =
    profile.name === '—'
      ? '—'
      : profile.name
          .split(/\s+/)
          .map((part) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

  return (
    <div className="p-4 space-y-4 select-none pb-24">
      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A3D2B] to-[#10B981] text-white flex items-center justify-center font-black text-xl">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-slate-900 text-base truncate">{profile.name}</h2>
            {profile.kycVerified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-slate-500 mt-0.5">{profile.employeeCode}</div>
          <div className="text-[11px] text-emerald-800 font-bold mt-0.5">{profile.assignedDivision}</div>
        </div>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-700" /> Employee details
        </h3>
        <div className="flex justify-between"><span className="text-slate-500">Phone</span><strong>{profile.phone}</strong></div>
        <div className="flex justify-between"><span className="text-slate-500">Role</span><strong>{profile.role}</strong></div>
        <div className="flex justify-between"><span className="text-slate-500">KYC status</span><strong>{profile.kycVerified ? 'Approved' : 'Not approved'}</strong></div>
      </div>

      <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs">
        <h3 className="font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Truck className="w-4 h-4 text-emerald-700" /> Assigned vehicle
        </h3>
        <div className="flex justify-between"><span className="text-slate-500">Registration</span><strong>{profile.vehicleReg}</strong></div>
        <div className="flex justify-between"><span className="text-slate-500">Vehicle</span><strong>{profile.vehicleName}</strong></div>
      </div>

      <UnavailableCard title="Wallet & Cash Float" />
      <UnavailableCard title="Earnings & Incentives" />
      <UnavailableCard title="Route Expenses" />

      <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-slate-700">
          <Banknote className="w-4 h-4" />
          <h3 className="font-black text-xs uppercase tracking-wide">Shift handover</h3>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Not available from server yet</p>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full py-3 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out of Device
      </button>
    </div>
  );
};
