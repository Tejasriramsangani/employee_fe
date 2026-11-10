"use client";

import { Button } from '../ui';
import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  Search,
  X,
  Check,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useEmployee } from '../../context/EmployeeContext';

interface AddScrapCatalogScreenProps {
  onDone?: () => void;
  onBack?: () => void;
}

export const AddScrapCatalogScreen: React.FC<AddScrapCatalogScreenProps> = ({
  onDone,
  onBack,
}) => {
  const {
    catalogItems,
    refreshCatalog,
    selectedCatalogIds,
    toggleCatalogItemSelection,
    confirmCatalogSelectionToCart,
    setPickupStep,
  } = useEmployee();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Always re-fetch when this screen opens so categories/products the admin
  // enabled, hidden or re-priced (margin included) since login show up live.
  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const categories = ['All', ...Array.from(new Set(catalogItems.map((item) => item.category)))];

  const filteredItems = catalogItems.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const handleDone = () => {
    confirmCatalogSelectionToCart();
    if (onDone) {
      onDone();
    } else {
      setPickupStep('STEP_6_WEIGHTS');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setPickupStep('STEP_2_VERIFIED');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-canvas text-slate-900 select-none pb-36">
      <div className="p-4 space-y-3">
        {/* 1. Header with back button, title, and selected count badge */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
          <Button aria-label="Previous"
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <h1 className="text-sm font-bold text-slate-900 tracking-tight">
            Add Scrap
          </h1>

          <div className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-brand font-bold text-xs">
            Selected ({selectedCatalogIds.length})
          </div>
        </div>

        {/* 2. Search Input Field */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input aria-label="Search scrap items..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scrap items..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition shadow-xs"
          />
          {searchQuery && (
            <Button aria-label="Close"
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* 3. Category Filter Carousel Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <Button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* 4. Popular Items List */}
        <div className="pt-2 space-y-2">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider">
            Popular Items
          </h2>

          <div className="space-y-2">
            {filteredItems.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                No catalog products are available for this category.
              </div>
            )}
            {filteredItems.map((item) => {
              const isSelected = selectedCatalogIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCatalogItemSelection(item.id)}
                  className={`p-3 rounded-2xl bg-white border transition-all flex items-center justify-between gap-3 cursor-pointer shadow-xs active:scale-[0.99] ${
                    isSelected
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                      {item.emoji || '♻️'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-800 mt-0.5">
                        ₹ {item.ratePerKg} / {item.unit}
                      </div>
                    </div>
                  </div>

                  {/* Checkbox indicator */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                      isSelected
                        ? 'bg-brand text-white shadow-xs'
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Bar: X Items Selected & Done -> (Yellow Button matching Image 3) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-[440px] mx-auto p-4 pb-safe bg-white/95  border-t border-slate-200 flex items-center justify-between gap-3 shadow-xl">
        <div className="text-xs font-bold text-slate-700">
          <span className="font-mono font-bold text-sm text-slate-900">
            {selectedCatalogIds.length}
          </span>{' '}
          items selected
        </div>

        <Button
          type="button"
          onClick={handleDone}
          className="py-3 px-6 rounded-2xl bg-gold hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg  flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <span>Done</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
