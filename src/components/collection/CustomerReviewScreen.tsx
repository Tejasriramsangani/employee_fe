"use client";

import React, { useState } from 'react';
import {
  ChevronLeft,
  AlertCircle,
  Phone,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CreditCard,
  Edit3,
  Scale,
  Coins,
  ArrowRight,
  Handshake,
  CheckCircle2,
} from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';
import { fieldOpsApi } from '../../services/api';

interface CustomerReviewScreenProps {
  onCustomerConfirmed?: () => void;
  onEditDetails?: () => void;
  onBack?: () => void;
}

export const CustomerReviewScreen: React.FC<CustomerReviewScreenProps> = ({
  onCustomerConfirmed,
  onEditDetails,
  onBack,
}) => {
  const {
    activePickup,
    collectedItems,
    totalCollectedWeightKg,
    totalCollectedValueRupees,
    setPickupStep,
    paymentMethod,
    setPaymentMethod,
  } = useEmployee();
  const stop = activePickup;
  const [confirmError, setConfirmError] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    if (!stop) return;
    setIsConfirming(true);
    setConfirmError('');
    let currentPickup: any = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const result = await fieldOpsApi.getPickup(stop.id);
      if (!result.success) {
        setConfirmError(result.message || 'Could not check customer confirmation.');
        setIsConfirming(false);
        return;
      }
      currentPickup = result.data;
      if (['CUSTOMER_CONFIRMED', 'PAYMENT_PENDING'].includes(currentPickup?.status)) break;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    if (!['CUSTOMER_CONFIRMED', 'PAYMENT_PENDING'].includes(currentPickup?.status)) {
      setConfirmError('Waiting for the customer to confirm the pickup summary in their app.');
      setIsConfirming(false);
      return;
    }
    const settled = await fieldOpsApi.settlePickup(stop.id, paymentMethod);
    setIsConfirming(false);
    if (!settled.success) {
      setConfirmError(settled.message || 'Failed to start settlement.');
      return;
    }
    if (onCustomerConfirmed) {
      onCustomerConfirmed();
    } else {
      setPickupStep('STEP_15_OTP');
    }
  };

  if (!stop) {
    return <div className="min-h-[720px] flex items-center justify-center">No active pickup selected.</div>;
  }

  const handleEdit = () => {
    if (onEditDetails) {
      onEditDetails();
    } else {
      setPickupStep('STEP_11_EDIT');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setPickupStep('STEP_6_WEIGHTS');
    }
  };

  const getItemEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cardboard')) return '📦';
    if (n.includes('bottle') || n.includes('pet')) return '🧴';
    if (n.includes('iron') || n.includes('metal')) return '🔩';
    if (n.includes('newspaper') || n.includes('paper')) return '📰';
    if (n.includes('aluminium')) return '🥫';
    return '♻️';
  };

  return (
    <div className="relative min-h-[720px] flex flex-col justify-between bg-[#F8FAFC] text-slate-900 select-none pb-28">
      <div className="p-4 space-y-3">
        {/* 1. Header with back button & title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black text-slate-900 tracking-tight">
            Review Pickup Details
          </h1>
          <div className="w-8" />
        </div>

        {/* 2. Top Warning Banner (Matches Image 5) */}
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/90 flex items-center gap-2.5 text-xs text-amber-950">
          <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-amber-900 font-medium leading-snug">
            Ask the customer to review the collected items, weights, rates and final value.
          </p>
        </div>

        {/* 3. Customer Information Card (Matches Image 5) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-black text-sm text-slate-900">{stop.customerName}</h2>
              <span className="text-[11px] text-slate-400 font-mono">Customer ID: {stop.customerId}</span>
            </div>
            <a
              href={`tel:${stop.phone}`}
              className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center hover:bg-emerald-100 transition active:scale-95"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{stop.locality}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              <span className="text-slate-300">•</span>
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{stop.timeSlot}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono text-slate-500">Pickup ID: {stop.pickupCode}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Payment Method
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  paymentMethod === 'CASH'
                    ? 'bg-[#0A3D2B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('UPI')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  paymentMethod === 'UPI'
                    ? 'bg-[#0A3D2B] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                UPI
              </button>
            </div>
          </div>
        </div>

        {/* 4. Collected Items Table (Matches Image 5) */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs text-slate-900">
              Collected Items ({collectedItems.length})
            </h3>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-right">Weight</div>
            <div className="col-span-2 text-right">Rate/kg</div>
            <div className="col-span-3 text-right">Value</div>
          </div>

          {/* Table Rows */}
          <div className="space-y-2">
            {collectedItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center text-xs text-slate-800 py-1 border-b border-slate-50"
              >
                <div className="col-span-5 flex items-center gap-2 truncate font-semibold">
                  <span>{getItemEmoji(item.name)}</span>
                  <span className="truncate">{item.name}</span>
                </div>
                <div className="col-span-2 text-right font-mono font-medium text-slate-600">
                  {item.weightKg} kg
                </div>
                <div className="col-span-2 text-right font-mono font-medium text-slate-500">
                  ₹ {item.ratePerKg}
                </div>
                <div className="col-span-3 text-right font-mono font-black text-emerald-800">
                  ₹ {item.lineTotalRupees}
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total Metrics */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#0A3D2B]" />
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Total Weight</span>
                <span className="font-mono font-black text-xs text-slate-900">
                  {totalCollectedWeightKg} kg
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-700" />
              <div>
                <span className="text-[10px] text-slate-500 block font-semibold">Total Scrap Value</span>
                <span className="font-mono font-black text-xs text-slate-900">
                  ₹ {totalCollectedValueRupees}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Details Button */}
          <button
            type="button"
            onClick={handleEdit}
            className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Details</span>
          </button>
        </div>

        {/* 5. Customer Confirmation Agreement Banner (Matches Image 5) */}
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/90 flex items-center gap-2.5 text-xs text-emerald-950">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-[#0A3D2B] shrink-0">
            <Handshake className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#0A3D2B] block">Confirm with Customer</span>
            <span className="text-[10px] text-emerald-800">
              Once the customer has verified all the details, ask them to confirm.
            </span>
          </div>
        </div>
      </div>

      {/* 6. Sticky Bottom Action: Customer Confirmed -> (Yellow Button matching Image 5) */}
      <div className="fixed sm:absolute bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 shadow-xl">
        {confirmError && <p className="text-xs text-rose-600 font-semibold mb-2">{confirmError}</p>}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wide shadow-lg shadow-amber-950/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
        >
          <span>{isConfirming ? 'Checking Confirmation…' : 'Customer Confirmed'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
