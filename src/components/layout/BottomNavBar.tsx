"use client";

import React from 'react';
import { Home, ClipboardList, User, ShieldCheck } from 'lucide-react';
import { useEmployee, AppTab } from '../../context/EmployeeContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, routeStops } = useEmployee();

  const scheduledCount = routeStops.filter((s) => s.status !== 'COMPLETED').length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto bg-white border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-4 py-2">
      <div className="grid grid-cols-3 gap-2">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => setActiveTab('HOME')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'HOME' ? 'text-[#0A3D2B]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'HOME' ? 'scale-110 stroke-[2.5]' : ''}`} />
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'HOME' ? 'font-black text-[#0A3D2B]' : ''}`}>
            Home
          </span>
        </button>

        {/* Tab 2: My Pickups */}
        <button
          type="button"
          onClick={() => setActiveTab('MY_PICKUPS')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'MY_PICKUPS' ? 'text-[#0A3D2B]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ClipboardList className={`w-5 h-5 transition-transform ${activeTab === 'MY_PICKUPS' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {scheduledCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono font-bold text-[9px] leading-tight shadow-xs">
                {scheduledCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'MY_PICKUPS' ? 'font-black text-[#0A3D2B]' : ''}`}>
            My Pickups
          </span>
        </button>

        {/* Tab 3: Profile */}
        <button
          type="button"
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROFILE' ? 'text-[#0A3D2B]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${activeTab === 'PROFILE' ? 'scale-110 stroke-[2.5]' : ''}`} />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-white"></span>
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'PROFILE' ? 'font-black text-[#0A3D2B]' : ''}`}>
            Profile
          </span>
        </button>
      </div>
    </nav>
  );
};
