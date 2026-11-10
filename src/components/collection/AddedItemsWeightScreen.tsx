"use client";

import { Button } from '../ui';
import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  X,
  Plus,
  Scale,
  Coins,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useEmployee, CollectedScrapItem } from '../../context/EmployeeContext';
import { fieldOpsApi } from '../../services/api';

interface AddedItemsWeightScreenProps {
  onCheckoutOverview?: () => void;
  onAddMoreScrap?: () => void;
  onBack?: () => void;
}

export const AddedItemsWeightScreen: React.FC<AddedItemsWeightScreenProps> = ({
  onCheckoutOverview,
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
    activePickup,
    refreshCatalog,
  } = useEmployee();
  const [submitError, setSubmitError] = useState('');

  // Pull the latest enabled products and margin-inclusive rates when this screen
  // opens; the context drops disabled items and re-prices the rest.
  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!activePickup) {
      setSubmitError('No active pickup selected.');
      return;
    }
    if (collectedItems.some((item) => item.weightKg <= 0)) {
      setSubmitError('Enter a weight greater than zero for every item.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    const result = await fieldOpsApi.recordItems(
      activePickup.id,
      collectedItems.map((item) => ({ productId: item.id, weightKg: item.weightKg })),
    );
    setIsSubmitting(false);
    if (!result.success) {
      setSubmitError(result.message || 'Failed to record items.');
      return;
    }
    if (onCheckoutOverview) {
      onCheckoutOverview();
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
      setPickupStep('STEP_4_CATALOG');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-canvas text-slate-900 select-none pb-44">
      <div className="p-4 space-y-4">
        {/* 1. Header with back button & title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <Button aria-label="Previous"
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight">
            Added Items
          </h1>
          <div className="w-8" />
        </div>

        {/* 2. Added Items List with itemized inputs matching Image 4 */}
        <div className="space-y-3">
          {collectedItems.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
              <span className="text-3xl">🧺</span>
              <h3 className="font-bold text-lg text-slate-800">No items added yet</h3>
              <p className="text-xs text-slate-400">
                Tap '+ Add More Scrap' to select scrap items from the catalog.
              </p>
              <Button
                type="button"
                onClick={handleAddMore}
                className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold"
              >
                Open Catalog
              </Button>
            </div>
          ) : (
            collectedItems.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3"
              >
                {/* Item Header: Thumbnail, Name, Rate and Remove button */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                      {item.emoji || '♻️'}
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

                  <Button aria-label="Remove item"
                    type="button"
                    onClick={() => removeCollectedItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Weight Input Row */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Weight</span>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={item.weightKg}
                      onChange={(e) =>
                        updateCollectedItemWeight(item.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1.5 text-center font-sans font-bold text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition"
                    />
                    <span className="px-2 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600">
                      kg
                    </span>
                  </div>
                </div>

                {/* Subtotal Calculation Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-400 font-medium">Total Value</span>
                  <span className="data-value font-mono font-bold text-sm text-emerald-800">
                    ₹ {item.lineTotalRupees}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 3. Secondary Action: + Add More Scrap */}
        <div className="pt-1">
          <Button aria-label="Add"
            type="button"
            onClick={handleAddMore}
            className="w-full py-3 rounded-2xl bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 text-brand" />
            <span>Add More Scrap</span>
          </Button>
        </div>
      </div>

      {/* 4. Sticky Bottom Bar: Total Weight, Total Value & Checkout Overview Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto p-4 pb-safe bg-white/95  border-t border-slate-200 space-y-3 shadow-xl">
        {submitError && <p className="text-xs text-rose-600 font-semibold">{submitError}</p>}
        {/* Metrics Row matching Image 4 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-brand">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Total Weight</div>
              <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                {totalCollectedWeightKg} kg
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-semibold">Total Value</div>
              <div className="font-mono font-bold text-xs text-slate-900 mt-0.5">
                ₹ {totalCollectedValueRupees}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Button: Checkout Overview -> */}
        <Button
          type="button"
          onClick={handleCheckout}
          disabled={collectedItems.length === 0 || isSubmitting}
          className="w-full py-3.5 px-6 rounded-2xl bg-brand hover:bg-[var(--brand-hover)] disabled:bg-slate-300 text-white font-bold text-xs tracking-wide shadow-lg  flex items-center justify-center gap-2 cursor-pointer transition active:scale-[0.99]"
        >
          <span>{isSubmitting ? 'Saving Items…' : 'Checkout Overview'}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
