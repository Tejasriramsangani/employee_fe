"use client";

import React from 'react';
import { Bell, X } from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

/** Banner shown on any screen when a new notification arrives. */
export const NotificationToast: React.FC = () => {
  const { toastNotification, dismissToastNotification, setActiveTab, markNotificationRead, pickupStep } = useEmployee();
  if (!toastNotification) return null;

  const open = () => {
    void markNotificationRead(toastNotification.id);
    dismissToastNotification();
    // Never yank someone out of a half-finished pickup; they can open the inbox afterwards.
    if (pickupStep === 'IDLE') setActiveTab('NOTIFICATIONS');
  };

  return (
    <div className="fixed top-3 left-0 right-0 z-[60] max-w-[440px] mx-auto px-3 pointer-events-none">
      <div className="pointer-events-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-emerald-500/40 p-3 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
        <button type="button" onClick={open} className="flex items-start gap-3 text-left min-w-0 flex-1 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black leading-tight">{toastNotification.title}</div>
            <div className="text-[11px] text-slate-300 mt-0.5 leading-snug line-clamp-2">{toastNotification.body}</div>
          </div>
        </button>
        <button
          type="button"
          onClick={dismissToastNotification}
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
