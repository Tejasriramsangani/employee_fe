"use client";

import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Truck,
  BatteryCharging,
  Banknote,
  DollarSign,
  TrendingUp,
  Receipt,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  X,
  Camera,
  Upload,
  ArrowRight,
  FileText,
  Clock,
  ChevronRight,
  Gauge,
  Award,
} from 'lucide-react';
import { useEmployee, RouteExpense } from '../../context/EmployeeContext';

export const ProfileScreen: React.FC = () => {
  const {
    profile,
    cashFloat,
    routeExpenses,
    addRouteExpense,
    isShiftClosed,
    closeShiftAndHandover,
    logout,
  } = useEmployee();

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState<boolean>(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState<boolean>(false);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);

  // Expense entry form state
  const [expenseCategory, setExpenseCategory] = useState<string>('Tyre Puncture & Air');
  const [expenseAmount, setExpenseAmount] = useState<string>('80');
  const [expenseNotes, setExpenseNotes] = useState<string>('Srinivasa Tyre Works, Benz Circle');
  const [hasReceiptImage, setHasReceiptImage] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount) || 0;
    if (amt <= 0) return;

    addRouteExpense({
      category: expenseCategory,
      amount: amt,
      notes: expenseNotes,
      receiptAttached: hasReceiptImage,
    });

    setIsExpenseModalOpen(false);
    showToast(`Recorded route expense: ₹${amt.toFixed(2)} (${expenseCategory}).`);
  };

  const handleConfirmHandover = () => {
    closeShiftAndHandover();
    setIsHandoverModalOpen(false);
    showToast('Evening shift closed & cash settlement submitted to Yard Gate #2 Audit Desk.');
  };

  return (
    <div className="p-4 space-y-4 select-none pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-4 right-4 z-50 flex items-center gap-2 p-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-emerald-500/40 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* 1. Collector Profile Header (Task 7.1) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0A3D2B] to-[#10B981] text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
          👷 RK
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-slate-900 text-base truncate">{profile.name}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-black uppercase">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
            </span>
          </div>
          <div className="font-mono text-xs text-slate-400 mt-0.5">{profile.employeeCode}</div>
          <div className="text-[11px] text-[#0A3D2B] font-bold mt-0.5">{profile.assignedDivision}</div>
        </div>
      </div>

      {/* 2. Assigned Fleet Vehicle Card (Task 7.1) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Truck className="w-3.5 h-3.5 text-emerald-700" /> Assigned Fleet Vehicle
          </span>
          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
            Active On Route
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="font-black text-slate-900 text-sm font-mono tracking-wide">
              {profile.vehicleReg}
            </div>
            <div className="text-xs text-slate-500 font-medium mt-0.5">{profile.vehicleName}</div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-100">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <span>{profile.batteryPct}% Charge</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <div>
            <span className="text-slate-400">Est. Range:</span>{' '}
            <strong className="text-slate-800">68 km</strong>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Motor Odometer:</span>{' '}
            <strong className="text-slate-800">14,280 km</strong>
          </div>
        </div>
      </div>

      {/* 3. Daily Cash Float Wallet Card (Task 7.2) */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
              Daily Cash Float Wallet
            </h3>
          </div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            ● Balanced
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Morning Float Received:</span>
            <span className="font-mono font-bold text-slate-900">
              ₹{cashFloat.openingFloatRupees.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between text-rose-600 font-medium">
            <span>Doorstep Cash Payouts:</span>
            <span className="font-mono font-bold">
              -₹{cashFloat.customerPaidOutRupees.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between text-amber-700 font-medium">
            <span>Approved Route Incidentals:</span>
            <span className="font-mono font-bold">
              -₹{cashFloat.approvedRouteExpensesRupees.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between font-black text-slate-900 pt-2 border-t border-slate-200 text-sm">
            <span>Remaining Cash to Return:</span>
            <span className="font-mono text-emerald-700">
              ₹{cashFloat.expectedCashToReturnRupees.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Quick Actions: View Ledger & Add Expense */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsLedgerModalOpen(true)}
            className="py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition text-center cursor-pointer"
          >
            View Cash Ledger
          </button>
          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0A3D2B] font-bold text-xs hover:bg-emerald-100 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4. Collector Earnings & Daily Incentive Tracker (Task 7.3) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white border border-emerald-200/90 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <h3 className="font-black text-slate-900 text-xs uppercase tracking-wide">
              Today's Earnings & Incentives
            </h3>
          </div>
          <span className="font-mono font-black text-base text-emerald-900">₹920</span>
        </div>

        <div className="space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Fixed Daily Wage:</span>
            <span className="font-mono font-bold text-slate-900">₹750</span>
          </div>
          <div className="flex justify-between text-emerald-800">
            <span>Volume Incentive (340 kg @ ₹0.50/kg):</span>
            <span className="font-mono font-bold">+₹170</span>
          </div>
        </div>

        {/* Milestone Boost Progress Bar */}
        <div className="pt-2 border-t border-emerald-100 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Milestone: 340 / 400 kg</span>
            <span className="font-bold text-emerald-700">60 kg to +₹100 Bonus!</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              style={{ width: '85%' }}
            />
          </div>
        </div>
      </div>

      {/* 5. Shift Close & Evening Handover Button (Task 7.5) */}
      <div className="pt-2">
        {isShiftClosed ? (
          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-xs text-center flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Evening Shift Closed & Handed Over to Yard Gate #2</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsHandoverModalOpen(true)}
            className="w-full py-4 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.99]"
          >
            <LogOut className="w-4 h-4 text-emerald-400" />
            <span>Close Shift & Evening Handover</span>
          </button>
        )}

        <button
          type="button"
          onClick={logout}
          className="w-full mt-2 py-3 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 text-rose-500" />
          <span>Sign Out of Device</span>
        </button>
      </div>

      {/* --- MODAL 1: Route Incidentals Quick-Entry Modal (Task 7.4) --- */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Record Route Incidental</h3>
                <p className="text-[11px] text-slate-500">Expenses are reimbursed from daily float</p>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Expense Category</label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tyre Puncture & Air">Tyre Puncture & Air</option>
                  <option value="Municipal Bridge Toll">Municipal Bridge Toll</option>
                  <option value="Emergency EV Charging">Emergency EV Charging / Plug-in</option>
                  <option value="Commercial Parking Fee">Commercial Parking Fee</option>
                  <option value="Other Emergency Repair">Other Emergency Repair</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor & Notes</label>
                <input
                  type="text"
                  required
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Simulated Receipt Photo Upload */}
              <div className="p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 font-medium">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Attach Receipt Photo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasReceiptImage(!hasReceiptImage)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                    hasReceiptImage
                      ? 'bg-emerald-100 text-[#0A3D2B]'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {hasReceiptImage ? '✓ Receipt Attached' : '+ Attach'}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#0A3D2B] text-white font-black text-xs hover:bg-[#0E4D36] transition shadow-md cursor-pointer"
                >
                  Save & Deduct from Float
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: Cash Ledger Breakdown Drawer --- */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Today's Cash Ledger</h3>
                <p className="text-[11px] text-slate-500">Audit trail for daily float disbursement</p>
              </div>
              <button
                type="button"
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Entry 1 */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Morning Float Disbursed</div>
                  <div className="text-[10px] text-slate-400">Yard Safe Desk #2 • 07:30 AM</div>
                </div>
                <div className="font-mono font-black text-emerald-800">+₹15,000.00</div>
              </div>

              {/* Entry 2 */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Doorstep Cash Payout: AKP-10231</div>
                  <div className="text-[10px] text-slate-400">Suresh Kumar (Benz Circle) • 09:42 AM</div>
                </div>
                <div className="font-mono font-black text-rose-600">-₹420.00</div>
              </div>

              {/* Entry 3 */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">Doorstep Cash Payout: AKP-10245</div>
                  <div className="text-[10px] text-slate-400">Vinay Palakonda (Madhura Nagar) • 11:30 AM</div>
                </div>
                <div className="font-mono font-black text-rose-600">-₹804.00</div>
              </div>

              {/* Route Expenses */}
              {routeExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{exp.category}</div>
                    <div className="text-[10px] text-slate-500">
                      {exp.notes} • {exp.time}
                    </div>
                  </div>
                  <div className="font-mono font-black text-amber-800">-₹{exp.amount.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm">
              <span>Remaining Return Balance:</span>
              <span className="font-mono text-emerald-700">
                ₹{cashFloat.expectedCashToReturnRupees.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: Digital Handover Confirmation (Task 7.5) --- */}
      {isHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-[440px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Yard Gate Evening Handover</h3>
                <p className="text-[11px] text-slate-500">Gate #2 Cashier Audit Desk</p>
              </div>
              <button
                type="button"
                onClick={() => setIsHandoverModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Handover Cash Return:</span>
                <span className="font-mono font-black text-base text-emerald-900">
                  ₹{cashFloat.expectedCashToReturnRupees.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Collected Scrap:</span>
                <span className="font-bold text-slate-900">340 kg</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pickups Completed:</span>
                <span className="font-bold text-slate-900">6 of 6 Stops</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Vehicle Status:</span>
                <span className="font-bold text-slate-900">Parked in Bay #4 • Charging</span>
              </div>
            </div>

            {/* Simulated Supervisor Digital Stamp */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-900 block">Gate Supervisor Verified</span>
                <span className="text-slate-500">M. Jagannath • Gate #2 Terminal</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirmHandover}
                className="w-full py-3.5 rounded-2xl bg-[#0A3D2B] hover:bg-[#0E4D36] text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/20 transition cursor-pointer active:scale-[0.99]"
              >
                Confirm Cash Deposit & Clock Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
