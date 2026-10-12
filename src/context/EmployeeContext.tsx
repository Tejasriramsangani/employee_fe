"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ShiftStatus = 'AVAILABLE' | 'ON_PICKUP' | 'COMPLETED';
export type AppTab = 'HOME' | 'MY_PICKUPS' | 'PROFILE';

export interface RouteStop {
  id: string;
  stopNumber: number;
  pickupCode: string; // e.g. AKP-10245
  customerName: string;
  phone: string;
  timeSlot: string; // e.g. "11:00 AM - 01:00 PM"
  scheduledTime: string; // e.g. "09:00 AM", "11:00 AM"
  address: string;
  locality: string;
  landmark: string;
  estimatedWeightKg: number;
  itemsCategoryHint: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
  finalWeightKg?: number;
  finalScrapValueRupees?: number;
}

export type PickupStep =
  | 'IDLE'
  | 'STEP_1_SCAN_QR'
  | 'STEP_2_VERIFIED'
  | 'STEP_4_CATALOG'
  | 'STEP_6_WEIGHTS'
  | 'STEP_10_REVIEW'
  | 'STEP_11_EDIT'
  | 'STEP_15_OTP'
  | 'STEP_19_COMPLETED';

export interface EmployeeProfile {
  id: string;
  employeeCode: string; // AKP-EMP-0247
  name: string; // Ravi Kumar
  role: 'FIELD_COLLECTOR' | 'DRIVER';
  phone: string;
  assignedDivision: string; // Vijayawada Central
  vehicleReg: string; // AP 16 TX 4021
  vehicleName: string; // Mahindra Treo Zor EV-01
  batteryPct: number;
  kycVerified: boolean;
  fixedDailyWageRupees: number; // 750
  incentivePerKgRupees: number; // 0.50
}

export interface CashFloatWallet {
  openingFloatRupees: number; // 15,000
  customerPaidOutRupees: number; // 11,450
  approvedRouteExpensesRupees: number; // 130.50
  expectedCashToReturnRupees: number; // 3,419.50
  isBalanced: boolean;
}

export interface RouteExpense {
  id: string;
  category: string;
  amount: number;
  notes: string;
  time: string;
  receiptAttached: boolean;
}

export interface ScrapCatalogItem {
  id: string;
  name: string;
  category: 'All' | 'Paper' | 'Plastic' | 'Metal' | 'E-Waste' | 'Rubber' | 'Others';
  ratePerKg: number;
  unit: string;
  iconType: string;
}

export interface CollectedScrapItem {
  id: string;
  name: string;
  category: string;
  ratePerKg: number;
  weightKg: number;
  lineTotalRupees: number;
}

interface EmployeeContextType {
  profile: EmployeeProfile;
  shiftStatus: ShiftStatus;
  setShiftStatus: (status: ShiftStatus) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  routeStops: RouteStop[];
  activePickup: RouteStop | null;
  setActivePickup: (stop: RouteStop | null) => void;
  cashFloat: CashFloatWallet;
  // Live Rapido Navigation & Dispatch Alert
  isIncomingAlertOpen: boolean;
  setIsIncomingAlertOpen: (open: boolean) => void;
  incomingOrder: any;
  triggerIncomingOrderAlert: (order?: any) => void;
  isLiveNavOpen: boolean;
  setIsLiveNavOpen: (open: boolean) => void;
  activeNavStop: RouteStop | null;
  setActiveNavStop: (stop: RouteStop | null) => void;
  startLiveNavigation: (stop: RouteStop) => void;
  playAlertChime: () => void;
  triggerVibration: (pattern?: number[]) => void;
  // App Versioning Sentinel
  hasUpdateAvailable: boolean;
  setHasUpdateAvailable: (avail: boolean) => void;
  isReleaseNotesOpen: boolean;
  setIsReleaseNotesOpen: (open: boolean) => void;
  // Doorstep Collection Flow Steps (Phase 3 through Phase 6)
  pickupStep: PickupStep;
  setPickupStep: (step: PickupStep) => void;
  isFlashlightOn: boolean;
  setIsFlashlightOn: (on: boolean) => void;
  // Scrap Catalog & Weighing Cart State (Phase 4)
  catalogItems: ScrapCatalogItem[];
  selectedCatalogIds: string[];
  toggleCatalogItemSelection: (id: string) => void;
  collectedItems: CollectedScrapItem[];
  updateCollectedItemWeight: (id: string, weightKg: number) => void;
  removeCollectedItem: (id: string) => void;
  confirmCatalogSelectionToCart: () => void;
  totalCollectedWeightKg: number;
  totalCollectedValueRupees: number;
  // Daily Float & Incidentals State (Phase 7)
  routeExpenses: RouteExpense[];
  addRouteExpense: (expense: { category: string; amount: number; notes: string; receiptAttached?: boolean }) => void;
  isShiftClosed: boolean;
  closeShiftAndHandover: () => void;
  // Offline Resilience & Backend Sync (Phase 8)
  isOfflineCached: boolean;
  // State simulation helpers
  simulateHomeState: (state: 'ON_PICKUP' | 'AVAILABLE' | 'COMPLETED') => void;
  // Active collection flow trigger
  startActivePickupFlow: (pickupId: string) => void;
}

// Initial Seed Route Stops matching Image 2
const INITIAL_STOPS: RouteStop[] = [
  {
    id: 'stop_01',
    stopNumber: 1,
    pickupCode: 'AKP-10231',
    customerName: 'Suresh Kumar',
    phone: '9848123001',
    timeSlot: '09:00 AM - 11:00 AM',
    scheduledTime: '09:00 AM',
    address: 'Flat 302, Sri Sai Residency, Benz Circle',
    locality: 'Benz Circle, Vijayawada',
    landmark: 'Opposite Sweet Magic',
    estimatedWeightKg: 25,
    itemsCategoryHint: 'Newspaper, Cardboard, Iron',
    status: 'COMPLETED',
    completedAt: '09:42 AM',
    finalWeightKg: 26.5,
    finalScrapValueRupees: 420,
  },
  {
    id: 'stop_02',
    stopNumber: 2,
    pickupCode: 'AKP-10245',
    customerName: 'Vinay Palakonda',
    phone: '9908123456',
    timeSlot: '11:00 AM - 01:00 PM',
    scheduledTime: '11:00 AM',
    address: 'Door 14-8-2, Behind Rythu Bazar, Madhura Nagar',
    locality: 'Madhura Nagar, Vijayawada',
    landmark: 'Near Water Tank',
    estimatedWeightKg: 28,
    itemsCategoryHint: 'Cardboard, PET Bottles, Iron',
    status: 'IN_PROGRESS',
  },
  {
    id: 'stop_03',
    stopNumber: 3,
    pickupCode: 'AKP-10238',
    customerName: 'Priya Sharma',
    phone: '9866234502',
    timeSlot: '01:00 PM - 03:00 PM',
    scheduledTime: '01:00 PM',
    address: 'House 5, Road 2, Suryaraopet',
    locality: 'Suryaraopet, Vijayawada',
    landmark: 'Near Sub-Collector Office',
    estimatedWeightKg: 18,
    itemsCategoryHint: 'Office White Paper, Plastic',
    status: 'SCHEDULED',
  },
  {
    id: 'stop_04',
    stopNumber: 4,
    pickupCode: 'AKP-10241',
    customerName: 'Lakshmi Devi',
    phone: '9701445566',
    timeSlot: '03:30 PM - 05:30 PM',
    scheduledTime: '03:30 PM',
    address: 'Shop 12, Main Bazaar, Governorpet',
    locality: 'Governorpet, Vijayawada',
    landmark: 'Near Apsara Theatre',
    estimatedWeightKg: 45,
    itemsCategoryHint: 'Copper Wire, Heavy Iron',
    status: 'SCHEDULED',
  },
  {
    id: 'stop_05',
    stopNumber: 5,
    pickupCode: 'AKP-10249',
    customerName: 'Krishna Murthy',
    phone: '9849112233',
    timeSlot: '04:45 PM - 06:00 PM',
    scheduledTime: '04:45 PM',
    address: 'Plot 48, Hill View Colony, Moghalrajpuram',
    locality: 'Moghalrajpuram, Vijayawada',
    landmark: 'Near Siddhartha College',
    estimatedWeightKg: 32,
    itemsCategoryHint: 'Old Books, Cardboard, Tin',
    status: 'SCHEDULED',
  },
  {
    id: 'stop_06',
    stopNumber: 6,
    pickupCode: 'AKP-10252',
    customerName: 'Srinivasa Rao',
    phone: '9988776655',
    timeSlot: '05:30 PM - 07:00 PM',
    scheduledTime: '05:30 PM',
    address: 'Building 8, MG Road, Labbipet',
    locality: 'Labbipet, Vijayawada',
    landmark: 'Near DV Manor Hotel',
    estimatedWeightKg: 50,
    itemsCategoryHint: 'E-Waste, Batteries, Metal',
    status: 'SCHEDULED',
  },
];

const INITIAL_PROFILE: EmployeeProfile = {
  id: 'emp_01',
  employeeCode: 'AKP-EMP-0247',
  name: 'Ravi Kumar',
  role: 'FIELD_COLLECTOR',
  phone: '9876543210',
  assignedDivision: 'Vijayawada Central Yard',
  vehicleReg: 'AP 16 TX 4021',
  vehicleName: 'Mahindra Treo Zor EV-01',
  batteryPct: 82,
  kycVerified: true,
  fixedDailyWageRupees: 750,
  incentivePerKgRupees: 0.50,
};

const INITIAL_WALLET: CashFloatWallet = {
  openingFloatRupees: 15000,
  customerPaidOutRupees: 11450,
  approvedRouteExpensesRupees: 130.50,
  expectedCashToReturnRupees: 3419.50,
  isBalanced: true,
};

const INITIAL_EXPENSES: RouteExpense[] = [
  {
    id: 'exp_01',
    category: 'Tyre Puncture & Air',
    amount: 50.0,
    notes: 'Rear left tyre puncture fixed at Benz Circle',
    time: '10:15 AM',
    receiptAttached: true,
  },
  {
    id: 'exp_02',
    category: 'Municipal Bridge Toll',
    amount: 80.5,
    notes: 'Municipal corridor commercial toll receipt',
    time: '11:45 AM',
    receiptAttached: true,
  },
];

const INITIAL_CATALOG: ScrapCatalogItem[] = [
  { id: 'item_newspaper', name: 'Newspaper', category: 'Paper', ratePerKg: 12, unit: 'kg', iconType: 'newspaper' },
  { id: 'item_cardboard', name: 'Cardboard', category: 'Paper', ratePerKg: 10, unit: 'kg', iconType: 'cardboard' },
  { id: 'item_pet_bottles', name: 'Plastic Bottles (PET)', category: 'Plastic', ratePerKg: 18, unit: 'kg', iconType: 'pet_bottles' },
  { id: 'item_mixed_plastic', name: 'Mixed Plastic', category: 'Plastic', ratePerKg: 12, unit: 'kg', iconType: 'mixed_plastic' },
  { id: 'item_iron', name: 'Iron', category: 'Metal', ratePerKg: 28, unit: 'kg', iconType: 'iron' },
  { id: 'item_aluminium', name: 'Aluminium', category: 'Metal', ratePerKg: 120, unit: 'kg', iconType: 'aluminium' },
  { id: 'item_ewaste', name: 'E-Waste (Mixed)', category: 'E-Waste', ratePerKg: 45, unit: 'kg', iconType: 'ewaste' },
  { id: 'item_copper', name: 'Copper Wire', category: 'Metal', ratePerKg: 420, unit: 'kg', iconType: 'copper' },
  { id: 'item_brass', name: 'Brass', category: 'Metal', ratePerKg: 310, unit: 'kg', iconType: 'brass' },
  { id: 'item_tyres', name: 'Old Tyres', category: 'Rubber', ratePerKg: 8, unit: 'kg', iconType: 'tyres' },
];

const INITIAL_COLLECTED: CollectedScrapItem[] = [
  { id: 'item_cardboard', name: 'Cardboard', category: 'Paper', ratePerKg: 10, weightKg: 15, lineTotalRupees: 150 },
  { id: 'item_pet_bottles', name: 'Plastic Bottles (PET)', category: 'Plastic', ratePerKg: 18, weightKg: 8, lineTotalRupees: 144 },
  { id: 'item_iron', name: 'Iron', category: 'Metal', ratePerKg: 28, weightKg: 5, lineTotalRupees: 140 },
];

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile] = useState<EmployeeProfile>(INITIAL_PROFILE);
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('ON_PICKUP'); // Default to State 1 from Image 2
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [routeStops, setRouteStops] = useState<RouteStop[]>(INITIAL_STOPS);
  const [activePickup, setActivePickup] = useState<RouteStop | null>(INITIAL_STOPS[1]); // AKP-10245
  const [cashFloat, setCashFloat] = useState<CashFloatWallet>(INITIAL_WALLET);
  const [routeExpenses, setRouteExpenses] = useState<RouteExpense[]>(INITIAL_EXPENSES);
  const [isShiftClosed, setIsShiftClosed] = useState<boolean>(false);

  const addRouteExpense = (item: { category: string; amount: number; notes: string; receiptAttached?: boolean }) => {
    const newExp: RouteExpense = {
      id: `exp_${Date.now()}`,
      category: item.category,
      amount: item.amount,
      notes: item.notes,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      receiptAttached: item.receiptAttached ?? true,
    };

    setRouteExpenses((prev) => [newExp, ...prev]);
    setCashFloat((prev) => {
      const newExpenses = Number((prev.approvedRouteExpensesRupees + item.amount).toFixed(2));
      const newReturn = Number((prev.openingFloatRupees - prev.customerPaidOutRupees - newExpenses).toFixed(2));
      return {
        ...prev,
        approvedRouteExpensesRupees: newExpenses,
        expectedCashToReturnRupees: newReturn,
      };
    });
  };

  const closeShiftAndHandover = () => {
    setIsShiftClosed(true);
    setShiftStatus('COMPLETED');
  };

  // App Update Sentinel State
  const [hasUpdateAvailable, setHasUpdateAvailable] = useState<boolean>(true);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState<boolean>(false);

  // Live Rapido Navigation & Dispatch Alert States
  const [isIncomingAlertOpen, setIsIncomingAlertOpen] = useState<boolean>(false);
  const [incomingOrder, setIncomingOrder] = useState<any>({
    pickupCode: 'AKP-10255',
    customerName: 'Balaji Fabrication Works',
    phone: '9848110022',
    address: 'Plot 42, Autonagar Industrial Area, Guntur',
    locality: 'Autonagar, Guntur',
    estimatedWeightKg: 180,
    categoriesHint: 'Heavy Scrap Iron & Aluminium Section',
    distanceKm: 3.2,
    etaMinutes: 12,
  });
  const [isLiveNavOpen, setIsLiveNavOpen] = useState<boolean>(false);
  const [activeNavStop, setActiveNavStop] = useState<RouteStop | null>(null);

  // Doorstep Collection Flow State (Step 1 -> Step 19)
  const [pickupStep, setPickupStep] = useState<PickupStep>('IDLE');
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);

  // Phase 4 Scrap Catalog & Cart Management State
  const [catalogItems] = useState<ScrapCatalogItem[]>(INITIAL_CATALOG);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([
    'item_cardboard',
    'item_pet_bottles',
    'item_iron',
  ]);
  const [collectedItems, setCollectedItems] = useState<CollectedScrapItem[]>(INITIAL_COLLECTED);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);

  // Task 8.2: Offline Weight Caching - Rehydrate on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem('aslikaata_employee_cart_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.collectedItems && parsed.collectedItems.length > 0) {
          setCollectedItems(parsed.collectedItems);
          setIsOfflineCached(true);
        }
      }
    } catch (e) {
      // safe fallback if storage unavailable
    }
  }, []);

  const toggleCatalogItemSelection = (id: string) => {
    setSelectedCatalogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const confirmCatalogSelectionToCart = () => {
    setCollectedItems((prev) => {
      const existingMap = new Map(prev.map((i) => [i.id, i]));
      const nextList: CollectedScrapItem[] = [];

      selectedCatalogIds.forEach((id) => {
        if (existingMap.has(id)) {
          nextList.push(existingMap.get(id)!);
        } else {
          const cat = catalogItems.find((c) => c.id === id);
          if (cat) {
            const defaultWeight = 5;
            nextList.push({
              id: cat.id,
              name: cat.name,
              category: cat.category,
              ratePerKg: cat.ratePerKg,
              weightKg: defaultWeight,
              lineTotalRupees: defaultWeight * cat.ratePerKg,
            });
          }
        }
      });
      return nextList;
    });
  };

  const updateCollectedItemWeight = (id: string, weightKg: number) => {
    setCollectedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const validWeight = Math.max(0, Number(weightKg) || 0);
          return {
            ...item,
            weightKg: validWeight,
            lineTotalRupees: Math.round(validWeight * item.ratePerKg),
          };
        }
        return item;
      })
    );
  };

  const removeCollectedItem = (id: string) => {
    setCollectedItems((prev) => prev.filter((i) => i.id !== id));
    setSelectedCatalogIds((prev) => prev.filter((i) => i !== id));
  };

  const totalCollectedWeightKg = Number(
    collectedItems.reduce((acc, curr) => acc + curr.weightKg, 0).toFixed(1)
  );

  const totalCollectedValueRupees = collectedItems.reduce(
    (acc, curr) => acc + curr.lineTotalRupees,
    0
  );

  // Task 8.2: Save cart items to localStorage on every change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'aslikaata_employee_cart_cache',
        JSON.stringify({
          collectedItems,
          totalCollectedWeightKg,
          totalCollectedValueRupees,
          timestamp: Date.now(),
        })
      );
      setIsOfflineCached(true);
    } catch (e) {}
  }, [collectedItems, totalCollectedWeightKg, totalCollectedValueRupees]);

  const playAlertChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  const triggerVibration = (pattern = [300, 150, 300, 150, 500]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  };

  const triggerIncomingOrderAlert = (order?: any) => {
    if (order) setIncomingOrder(order);
    setIsIncomingAlertOpen(true);
    playAlertChime();
    triggerVibration();
  };

  const startLiveNavigation = (stop: RouteStop) => {
    setActiveNavStop(stop);
    setActivePickup(stop);
    setIsLiveNavOpen(true);
    setShiftStatus('ON_PICKUP');
  };

  // Helper to test all 3 states shown in Image 2
  const simulateHomeState = (state: 'ON_PICKUP' | 'AVAILABLE' | 'COMPLETED') => {
    if (state === 'ON_PICKUP') {
      setShiftStatus('ON_PICKUP');
      setRouteStops((prev) =>
        prev.map((s, idx) => {
          if (idx < 3) return { ...s, status: 'COMPLETED' };
          if (idx === 3) return { ...s, status: 'IN_PROGRESS' };
          return { ...s, status: 'SCHEDULED' };
        })
      );
      setActivePickup(INITIAL_STOPS[1]);
    } else if (state === 'AVAILABLE') {
      setShiftStatus('AVAILABLE');
      setRouteStops((prev) =>
        prev.map((s, idx) => {
          if (idx < 3) return { ...s, status: 'COMPLETED' };
          return { ...s, status: 'SCHEDULED' };
        })
      );
      setActivePickup(null);
    } else if (state === 'COMPLETED') {
      setShiftStatus('COMPLETED');
      setRouteStops((prev) => prev.map((s) => ({ ...s, status: 'COMPLETED' })));
      setActivePickup(null);
    }
  };

  const startActivePickupFlow = (pickupId: string) => {
    const target = routeStops.find((s) => s.pickupCode === pickupId) || routeStops[1];
    setActivePickup(target);
    setShiftStatus('ON_PICKUP');
  };

  return (
    <EmployeeContext.Provider
      value={{
        profile,
        shiftStatus,
        setShiftStatus,
        activeTab,
        setActiveTab,
        routeStops,
        activePickup,
        setActivePickup,
        cashFloat,
        isIncomingAlertOpen,
        setIsIncomingAlertOpen,
        incomingOrder,
        triggerIncomingOrderAlert,
        isLiveNavOpen,
        setIsLiveNavOpen,
        activeNavStop,
        setActiveNavStop,
        startLiveNavigation,
        playAlertChime,
        triggerVibration,
        hasUpdateAvailable,
        setHasUpdateAvailable,
        isReleaseNotesOpen,
        setIsReleaseNotesOpen,
        simulateHomeState,
        startActivePickupFlow,
        pickupStep,
        setPickupStep,
        isFlashlightOn,
        setIsFlashlightOn,
        catalogItems,
        selectedCatalogIds,
        toggleCatalogItemSelection,
        collectedItems,
        updateCollectedItemWeight,
        removeCollectedItem,
        confirmCatalogSelectionToCart,
        totalCollectedWeightKg,
        totalCollectedValueRupees,
        routeExpenses,
        addRouteExpense,
        isShiftClosed,
        closeShiftAndHandover,
        isOfflineCached,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = (): EmployeeContextType => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider');
  }
  return context;
};
