"use client";

import React from 'react';
import { Bell, CheckCheck, ClipboardList, CalendarClock, XCircle, PartyPopper, Info } from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';
import type { AppNotificationItem } from '../../services/api';

const META: Record<AppNotificationItem['type'], { icon: React.ElementType; tint: string }> = {
  PICKUP_ASSIGNED: { icon: ClipboardList, tint: 'bg-emerald-100 text-emerald-700' },
  PICKUP_RESCHEDULED: { icon: CalendarClock, tint: 'bg-amber-100 text-amber-700' },
  PICKUP_CANCELLED: { icon: XCircle, tint: 'bg-rose-100 text-rose-700' },
  ACCOUNT_APPROVED: { icon: PartyPopper, tint: 'bg-violet-100 text-violet-700' },
  GENERAL: { icon: Info, tint: 'bg-slate-100 text-slate-600' },
};

export const timeAgo = (iso: string) => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? 'Yesterday' : `${d} days ago`;
};

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    refreshNotifications,
    setActiveTab,
  } = useEmployee();

  const open = (n: AppNotificationItem) => {
    void markNotificationRead(n.id);
    if (n.type.startsWith('PICKUP_') && n.type !== 'PICKUP_CANCELLED') setActiveTab('MY_PICKUPS');
    else if (n.type === 'ACCOUNT_APPROVED') setActiveTab('HOME');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      <div className="bg-[#0A3D2B] text-white px-5 pt-8 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black tracking-tight">Notifications</h1>
            <p className="text-[11px] text-emerald-200 font-semibold">
              {unreadNotificationCount > 0 ? `${unreadNotificationCount} unread` : 'You are all caught up'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void markAllNotificationsRead()}
            disabled={unreadNotificationCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      <div className="px-4 -mt-2 space-y-2.5 pt-4">
        {notifications.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No notifications yet</p>
            <p className="text-xs text-slate-500">New pickups and updates from the team will show up here.</p>
            <button
              type="button"
              onClick={() => void refreshNotifications()}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>
        ) : (
          notifications.map((n) => {
            const meta = META[n.type] || META.GENERAL;
            const Icon = meta.icon;
            const unread = !n.readAt;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => open(n)}
                className={`w-full text-left p-3.5 rounded-2xl border flex gap-3 items-start transition-all cursor-pointer ${
                  unread ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white/60 border-slate-200'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.tint}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm leading-tight ${unread ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                      {n.title}
                    </span>
                    {unread && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">{n.body}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">{timeAgo(n.createdAt)}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
