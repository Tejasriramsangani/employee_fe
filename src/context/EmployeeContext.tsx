"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fieldOpsApi } from '../services/api';

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
  employeeCode: string;
  name: string;
  role: 'FIELD_COLLECTOR' | 'DRIVER';
  phone: string;
  assignedDivision: string;
  vehicleReg: string;
  vehicleName: string;
  batteryPct: number;
  kycVerified: boolean;
  fixedDailyWageRupees: number;
  incentivePerKgRupees: number;
}

export interface CashFloatWallet {
  openingFloatRupees: number;
  customerPaidOutRupees: number;
  approvedRouteExpensesRupees: number;
  expectedCashToReturnRupees: number;
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
  category: 'All' | 'Paper' | 'Plastic' | 'Metal' | 'E-Waste' | 'Rubber' | 'Others' | string;
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
  // Authentication State
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isLoadingAuth: boolean;
  logout: () => void;
  refreshDashboardData: () => Promise<void>;

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

const DEFAULT_PROFILE: EmployeeProfile = {
  id: 'emp_001',
  employeeCode: 'EMP-001',
  name: 'Ramesh Kumar',
  role: 'FIELD_COLLECTOR',
  phone: '9848011111',
  assignedDivision: 'Vijayawada Central Yard',
  vehicleReg: 'AP 16 TX 4920',
  vehicleName: 'Tata Ace Gold (Diesel)',
  batteryPct: 92,
  kycVerified: true,
  fixedDailyWageRupees: 750,
  incentivePerKgRupees: 0.50,
};

const DEFAULT_WALLET: CashFloatWallet = {
  openingFloatRupees: 5000,
  customerPaidOutRupees: 0,
  approvedRouteExpensesRupees: 0,
  expectedCashToReturnRupees: 5000,
  isBalanced: true,
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  const [profile, setProfile] = useState<EmployeeProfile>(DEFAULT_PROFILE);
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('AVAILABLE');
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [activePickup, setActivePickup] = useState<RouteStop | null>(null);
  const [cashFloat, setCashFloat] = useState<CashFloatWallet>(DEFAULT_WALLET);
  const [routeExpenses, setRouteExpenses] = useState<RouteExpense[]>([]);
  const [isShiftClosed, setIsShiftClosed] = useState<boolean>(false);

  // App Update Sentinel State
  const [hasUpdateAvailable, setHasUpdateAvailable] = useState<boolean>(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState<boolean>(false);

  // Live Rapido Navigation & Dispatch Alert States
  const [isIncomingAlertOpen, setIsIncomingAlertOpen] = useState<boolean>(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);
  const [isLiveNavOpen, setIsLiveNavOpen] = useState<boolean>(false);
  const [activeNavStop, setActiveNavStop] = useState<RouteStop | null>(null);

  // Doorstep Collection Flow State (Step 1 -> Step 19)
  const [pickupStep, setPickupStep] = useState<PickupStep>('IDLE');
  const [isFlashlightOn, setIsFlashlightOn] = useState<boolean>(false);

  // Dynamic Scrap Catalog & Cart Management State
  const [catalogItems, setCatalogItems] = useState<ScrapCatalogItem[]>([]);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);
  const [collectedItems, setCollectedItems] = useState<CollectedScrapItem[]>([]);
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);

  const refreshDashboardData = useCallback(async () => {
    try {
      // 1. Fetch live employee profile
      const prof = await fieldOpsApi.fetchProfile();
      if (prof) {
        setProfile((prev) => ({
          ...prev,
          id: prof._id || prof.id || prev.id,
          employeeCode: prof.employeeCode || prev.employeeCode,
          name: prof.fullName || prev.name,
          vehicleReg: prof.vehicleNumber || prev.vehicleReg,
          vehicleName: prof.vehicleType || prev.vehicleName,
          kycVerified: prof.status === 'APPROVED',
        }));
      }

      // 2. Fetch assigned pickups for today
      const pickups = await fieldOpsApi.fetchAssignedPickups();
      if (Array.isArray(pickups)) {
        const stops: RouteStop[] = pickups.map((p: any, idx: number) => {
          let sStatus: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' = 'SCHEDULED';
          if (p.status === 'COMPLETED' || p.status === 'SETTLED') sStatus = 'COMPLETED';
          else if (
            p.status === 'ON_THE_WAY' ||
            p.status === 'ARRIVED' ||
            p.status === 'IN_PROGRESS' ||
            p.status === 'VERIFIED'
          ) {
            sStatus = 'IN_PROGRESS';
          }

          return {
            id: p._id || p.id || `stop_${idx}`,
            stopNumber: idx + 1,
            pickupCode: p.pickupCode || `AKP-${idx + 100}`,
            customerName: p.addressSnapshot?.name || 'Doorstep Customer',
            phone: p.addressSnapshot?.phone || '9848123001',
            timeSlot: p.timeSlotSnapshot?.displayLabel || 'Scheduled Slot',
            scheduledTime: p.timeSlotSnapshot?.startTime || '09:00 AM',
            address: p.addressSnapshot?.line1 || 'Vijayawada Central',
            locality: p.addressSnapshot?.city || 'Vijayawada',
            landmark: p.addressSnapshot?.landmark || '',
            estimatedWeightKg: p.estimatedWeightGrams ? Math.round(p.estimatedWeightGrams / 1000) : 25,
            itemsCategoryHint: Array.isArray(p.categories)
              ? p.categories.map((c: any) => c.name || c).join(', ')
              : 'Scrap Materials',
            status: sStatus,
            finalWeightKg: p.totalWeightGrams ? p.totalWeightGrams / 1000 : undefined,
            finalScrapValueRupees: p.finalScrapValuePaise ? p.finalScrapValuePaise / 100 : undefined,
          };
        });

        setRouteStops(stops);
        const inProgress = stops.find((s) => s.status === 'IN_PROGRESS');
        if (inProgress) {
          setActivePickup(inProgress);
          setShiftStatus('ON_PICKUP');
        } else if (stops.length > 0) {
          setActivePickup(stops[0]);
          setShiftStatus('AVAILABLE');
        } else {
          setActivePickup(null);
          setShiftStatus('AVAILABLE');
        }
      }

      // 3. Fetch live scrap catalog
      const catData = await fieldOpsApi.fetchCatalog();
      if (Array.isArray(catData) && catData.length > 0) {
        const mappedCatalog: ScrapCatalogItem[] = catData.map((c: any) => {
          const rateRupees = c.ratePerKgPaise
            ? c.ratePerKgPaise / 100
            : c.baseRatePaise
            ? c.baseRatePaise / 100
            : 20;

          const n = (c.name || '').toLowerCase();
          const iconType = n.includes('paper')
            ? 'newspaper'
            : n.includes('plastic') || n.includes('pet')
            ? 'pet_bottles'
            : n.includes('metal') || n.includes('iron')
            ? 'iron'
            : n.includes('copper')
            ? 'copper'
            : n.includes('brass')
            ? 'brass'
            : n.includes('waste')
            ? 'ewaste'
            : 'cardboard';

          return {
            id: c._id || c.id || c.code,
            name: c.name,
            category: c.parentCategory || 'All',
            ratePerKg: rateRupees,
            unit: 'kg',
            iconType,
          };
        });
        setCatalogItems(mappedCatalog);
      }
    } catch (err) {
      console.warn('[EmployeeContext] Refresh failed:', err);
    }
  }, []);

  // Check login state on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('aslikaata_emp_token');
    if (token) {
      setIsAuthenticated(true);
      refreshDashboardData().finally(() => setIsLoadingAuth(false));
    } else {
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
    }
  }, [refreshDashboardData]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aslikaata_emp_token');
      localStorage.removeItem('aslikaata_emp_user');
      localStorage.removeItem('aslikaata_employee_cart_cache');
    }
    setIsAuthenticated(false);
    setRouteStops([]);
    setActivePickup(null);
    setCollectedItems([]);
    setSelectedCatalogIds([]);
    setRouteExpenses([]);
  };

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

  // Offline Weight Caching
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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {}
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

  const simulateHomeState = (state: 'ON_PICKUP' | 'AVAILABLE' | 'COMPLETED') => {
    if (state === 'ON_PICKUP') {
      setShiftStatus('ON_PICKUP');
    } else if (state === 'AVAILABLE') {
      setShiftStatus('AVAILABLE');
    } else if (state === 'COMPLETED') {
      setShiftStatus('COMPLETED');
    }
  };

  const startActivePickupFlow = (pickupId: string) => {
    const target = routeStops.find((s) => s.pickupCode === pickupId) || routeStops[0] || null;
    setActivePickup(target);
    setShiftStatus('ON_PICKUP');
  };

  return (
    <EmployeeContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        isLoadingAuth,
        logout,
        refreshDashboardData,
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
