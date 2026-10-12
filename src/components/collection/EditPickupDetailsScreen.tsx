"use client";

import React from 'react';
import {
  ChevronLeft,
  Trash2,
  Plus,
  Scale,
  Coins,
  ArrowRight,
  Edit3,
  Check,
} from 'lucide-react';
import { useEmployee, CollectedScrapItem } from '../../context/EmployeeContext';

interface EditPickupDetailsScreenProps {
  onSaveChanges?: () => void;
  onAddMoreScrap?: () => void;
  onBack?: () => void;
}

export const EditPickupDetailsScreen: React.FC<EditPickupDetailsScreenProps> = ({
  onSaveChanges,
  onAddMoreScrap,
  onBack,
}) => {
  const {
    collectedItems,
    updateCollectedItemWeight,
    removeCollectedItem,
    totalCollectedWeightKg,
    totalCollectedValueRupees,
    setPickupStep,
  } = useEmployee();

  const handleSave = () => {
    if (onSaveChanges) {
      onSaveChanges();
    } else {
      setPickupStep('STEP_10_REVIEW');
    }
  };

  const handleAddMore = () => {
    if (onAddMoreScrap) {
      onAddMoreScrap();
    } else {
      setPickupStep('STEP_4_CATALOG');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setPickupStep('STEP_10_REVIEW');
    }
  };

  const getItemEmoji = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('cardboard')) return '📦';
    if (n.includes('bottle') || n.includes('pet')) return '🧴';
    if (n.includes('iron') || n.includes('metal')) return '🔩';
    if (n.includes('newspaper') || n.includes('paper')) return '📰';
    if (n.includes('aluminium')) return '🥫';
    if (n.includes('e-waste')) return '💻';
    if (n.includes('copper')) return '🪙';
    return '♻️';
  };

  return (
    <div className="relative min-h-[720px] flex flex-col justify-between bg-[#F8FAFC] text-slate-900 select-none pb-32">
      <div className="p-4 space-y-3">
        {/* 1. Header with Back button & title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-sm font-black text-slate-900 tracking-tight">
            Edit Pickup Details
          </h1>
          <div className="w-8" />
        </div>

        {/* 2. Notice Banner (Matches Image 6) */}
        <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200/80 flex items-center gap-2.5 text-xs text-sky-950">
          <div className="p-1.5 rounded-xl bg-sky-100 text-sky-700 shrink-0">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <p className="text-[11px] text-sky-900 font-medium leading-snug">
            You can modify weights, remove items or add more scrap items.
          </p>
        </div>

        {/* 3. Selected Items Section (Matches Image 6) */}
        <div className="space-y-2.5 pt-1">
          <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            Selected Items
          </h2>

          <div className="space-y-2.5">
            {collectedItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2.5"
              >
                {/* Header row: thumbnail, name, rate & Red Trash Can */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-xl shrink-0">
                      {getItemEmoji(item.name)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        ₹ {item.ratePerKg} / kg
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeCollectedItem(item.id)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>

                {/* Weight Input & Live Value Subtotal */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={item.weightKg}
                      onChange={(e) =>
                        updateCollectedItemWeight(item.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 text-center font-mono font-black text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
                    />
                    <span className="px-2 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                      kg
                    </span>
                  </div>

                  <div className="font-mono font-black text-sm text-emerald-800">
                    ₹ {item.lineTotalRupees}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Secondary Action: + Add More Scrap */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleAddMore}
              className="w-full py-3 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-[#0A3D2B]" />
              <span>Add More Scrap</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Sticky Bottom Bar: Total Weight & Total Scrap Value + Save Changes -> */}
      <div className="fixed sm:absolute bottom-0 inset-x-0 p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 space-y-3 shadow-xl">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-[#0A3D2B]">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Total Weight</div>
              <div className="font-mono font-black text-xs text-slate-900 mt-0.5">
                {totalCollectedWeightKg} kg
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold">Total Scrap Value</div>
              <div className="font-mono font-black text-xs text-slate-900 mt-0.5">
                ₹ {totalCollectedValueRupees}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#0A3D2B] hover:bg-[#0E4D36] text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
        >
          <span>Save Changes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
