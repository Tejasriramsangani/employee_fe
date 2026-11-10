"use client";

import { Button } from '../ui';
import React from 'react';
import { Home, ClipboardList, User, Bell } from 'lucide-react';
import { useEmployee, AppTab } from '../../context/EmployeeContext';

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab, routeStops, unreadNotificationCount } = useEmployee();

  const scheduledCount = routeStops.filter((s) => s.status !== 'COMPLETED').length;

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-40 max-w-3xl mx-auto bg-white/95  border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] px-4 pt-2 pb-safe">
      <div className="grid grid-cols-4 gap-2">
        {/* Tab 1: Home */}
        <Button
          type="button"
          aria-current={activeTab === 'HOME' ? 'page' : undefined}
          onClick={() => setActiveTab('HOME')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'HOME' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'HOME' ? 'scale-110 stroke-[2.5]' : ''}`} />
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'HOME' ? 'font-bold text-brand' : ''}`}>
            Home
          </span>
        </Button>

        {/* Tab 2: My Pickups */}
        <Button
          type="button"
          aria-current={activeTab === 'MY_PICKUPS' ? 'page' : undefined}
          onClick={() => setActiveTab('MY_PICKUPS')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'MY_PICKUPS' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ClipboardList className={`w-5 h-5 transition-transform ${activeTab === 'MY_PICKUPS' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {scheduledCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono font-bold text-[11px] leading-tight shadow-xs">
                {scheduledCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'MY_PICKUPS' ? 'font-bold text-brand' : ''}`}>
            My Pickups
          </span>
        </Button>

        {/* Tab 3: Notifications */}
        <Button
          type="button"
          aria-current={activeTab === 'NOTIFICATIONS' ? 'page' : undefined}
          onClick={() => setActiveTab('NOTIFICATIONS')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'NOTIFICATIONS' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Bell className={`w-5 h-5 transition-transform ${activeTab === 'NOTIFICATIONS' ? 'scale-110 stroke-[2.5]' : ''}`} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[16px] px-1 rounded-full bg-rose-600 text-white font-mono font-bold text-[11px] leading-4 text-center shadow-xs">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'NOTIFICATIONS' ? 'font-bold text-brand' : ''}`}>
            Alerts
          </span>
        </Button>

        {/* Tab 4: Profile */}
        <Button
          type="button"
          aria-current={activeTab === 'PROFILE' ? 'page' : undefined}
          onClick={() => setActiveTab('PROFILE')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'PROFILE' ? 'text-brand' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${activeTab === 'PROFILE' ? 'scale-110 stroke-[2.5]' : ''}`} />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border border-white"></span>
          </div>
          <span className={`text-[11px] mt-1 font-semibold ${activeTab === 'PROFILE' ? 'font-bold text-brand' : ''}`}>
            Profile
          </span>
        </Button>
      </div>
    </nav>
  );
};
