"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fieldOpsApi } from '../services/api';

export type ShiftStatus = 'AVAILABLE' | 'ON_PICKUP' | 'COMPLETED';
export type AppTab = 'HOME' | 'MY_PICKUPS' | 'PROFILE';
export type PaymentMethod = 'CASH' | 'UPI';

export interface RouteStop {
  id: string;
  stopNumber: number;
  pickupCode: string;
  customerId: string;
  customerName: string;
  phone: string;
  timeSlot: string;
  scheduledTime: string;
  address: string;
  locality: string;
  landmark: string;
  estimatedWeightKg: number;
  itemsCategoryHint: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED';
  rawStatus: string;
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
  role: string;
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
  categoryId: string;
  category: string;
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

export interface CompletionState {
  pickup: any;
  invoice: any;
}

interface EmployeeContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  isLoadingAuth: boolean;
  logout: () => void;
  refreshDashboardData: () => Promise<void>;
  profile: EmployeeProfile;
  routeTitle: string;
  shiftStatus: ShiftStatus;
  setShiftStatus: (status: ShiftStatus) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  routeStops: RouteStop[];
  activePickup: RouteStop | null;
  setActivePickup: (stop: RouteStop | null) => void;
  cashFloat: CashFloatWallet;
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
  hasUpdateAvailable: boolean;
  setHasUpdateAvailable: (avail: boolean) => void;
  isReleaseNotesOpen: boolean;
  setIsReleaseNotesOpen: (open: boolean) => void;
  pickupStep: PickupStep;
  setPickupStep: (step: PickupStep) => void;
  isFlashlightOn: boolean;
  setIsFlashlightOn: (on: boolean) => void;
  catalogItems: ScrapCatalogItem[];
  refreshCatalog: () => Promise<void>;
  selectedCatalogIds: string[];
  toggleCatalogItemSelection: (id: string) => void;
  collectedItems: CollectedScrapItem[];
  updateCollectedItemWeight: (id: string, weightKg: number) => void;
  removeCollectedItem: (id: string) => void;
  confirmCatalogSelectionToCart: () => void;
  totalCollectedWeightKg: number;
  totalCollectedValueRupees: number;
  routeExpenses: RouteExpense[];
  addRouteExpense: (expense: { category: string; amount: number; notes: string; receiptAttached?: boolean }) => void;
  isShiftClosed: boolean;
  closeShiftAndHandover: () => void;
  isOfflineCached: boolean;
  simulateHomeState: (state: ShiftStatus) => void;
  startActivePickupFlow: (pickupId: string) => Promise<boolean>;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  lastCompletion: CompletionState | null;
  setLastCompletion: (completion: CompletionState | null) => void;
}

const EMPTY_PROFILE: EmployeeProfile = {
  id: '',
  employeeCode: '—',
  name: '—',
  role: '—',
  phone: '—',
  assignedDivision: '—',
  vehicleReg: '—',
  vehicleName: '—',
  batteryPct: 0,
  kycVerified: false,
  fixedDailyWageRupees: 0,
  incentivePerKgRupees: 0,
};

const EMPTY_WALLET: CashFloatWallet = {
  openingFloatRupees: 0,
  customerPaidOutRupees: 0,
  approvedRouteExpensesRupees: 0,
  expectedCashToReturnRupees: 0,
  isBalanced: false,
};

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

const mapStatus = (status = ''): RouteStop['status'] => {
  if (['COMPLETED', 'SETTLED', 'INVOICED'].includes(status)) return 'COMPLETED';
  if (
    ['ON_THE_WAY', 'ARRIVED', 'QR_VERIFIED', 'VERIFIED', 'IN_PROGRESS', 'MEASURED', 'CUSTOMER_CONFIRMED', 'PAYMENT_PENDING', 'OTP_SENT'].includes(status)
  ) return 'IN_PROGRESS';
  return 'SCHEDULED';
};

const mapPickup = (pickup: any, sequence: number): RouteStop => {
  const address = pickup?.addressSnapshot || {};
  const estimate = pickup?.estimatedWeightSnapshot || {};
  const totals = pickup?.totals || {};
  const minKg = Number(estimate.minGrams || 0) / 1000;
  const maxKg = Number(estimate.maxGrams || 0) / 1000;
  const estimatedWeightKg = maxKg ? Number(((minKg + maxKg) / 2).toFixed(1)) : minKg;
  return {
    id: String(pickup?._id || pickup?.id || ''),
    stopNumber: sequence,
    pickupCode: pickup?.pickupCode || '—',
    customerId: String(pickup?.customerId || '—'),
    customerName: address.name || address.customerName || '—',
    phone: address.phone || address.mobile || '—',
    timeSlot: pickup?.timeSlotSnapshot?.displayLabel || '—',
    scheduledTime: pickup?.timeSlotSnapshot?.startTime || '—',
    address: [address.line1, address.line2].filter(Boolean).join(', ') || '—',
    locality: [address.city, address.state, address.pincode].filter(Boolean).join(', ') || '—',
    landmark: address.landmark || '',
    estimatedWeightKg,
    itemsCategoryHint:
      pickup?.estimatedWeightSnapshot?.displayLabel ||
      (Array.isArray(pickup?.categories) ? pickup.categories.map((item: any) => item.name || item).join(', ') : '—'),
    status: mapStatus(pickup?.status),
    rawStatus: pickup?.status || '',
    completedAt: pickup?.timestamps?.completedAt,
    finalWeightKg: totals.netWeightGrams != null ? totals.netWeightGrams / 1000 : undefined,
    finalScrapValueRupees: totals.totalAmount != null ? totals.totalAmount / 100 : undefined,
  };
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfile>(EMPTY_PROFILE);
  const [routeTitle, setRouteTitle] = useState('Today’s route');
  const [shiftStatus, setShiftStatus] = useState<ShiftStatus>('AVAILABLE');
  const [activeTab, setActiveTab] = useState<AppTab>('HOME');
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [activePickup, setActivePickup] = useState<RouteStop | null>(null);
  const [cashFloat, setCashFloat] = useState<CashFloatWallet>(EMPTY_WALLET);
  const [routeExpenses, setRouteExpenses] = useState<RouteExpense[]>([]);
  const [isShiftClosed, setIsShiftClosed] = useState(false);
  const [hasUpdateAvailable, setHasUpdateAvailable] = useState(false);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [isIncomingAlertOpen, setIsIncomingAlertOpen] = useState(false);
  const [incomingOrder, setIncomingOrder] = useState<any>(null);
  const [isLiveNavOpen, setIsLiveNavOpen] = useState(false);
  const [activeNavStop, setActiveNavStop] = useState<RouteStop | null>(null);
  const [pickupStep, setPickupStep] = useState<PickupStep>('IDLE');
  const [isFlashlightOn, setIsFlashlightOn] = useState(false);
  const [catalogItems, setCatalogItems] = useState<ScrapCatalogItem[]>([]);
  const [selectedCatalogIds, setSelectedCatalogIds] = useState<string[]>([]);
  const [pickupCategoryIds, setPickupCategoryIds] = useState<string[]>([]);
  // Guards the one-time auto-selection of the customer's booked categories so a
  // late catalog fetch never overwrites choices the employee already made.
  const catalogAutoAppliedRef = useRef(false);
  const [collectedItems, setCollectedItems] = useState<CollectedScrapItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [lastCompletion, setLastCompletion] = useState<CompletionState | null>(null);

  const refreshCatalog = useCallback(async () => {
    const catalog = await fieldOpsApi.fetchCatalog();
    const flattened = (Array.isArray(catalog) ? catalog : []).flatMap((category: any) =>
      (Array.isArray(category.products) ? category.products : [])
        .filter((product: any) => product.activeRate)
        .map((product: any) => ({
          id: String(product.id || product._id),
          name: product.name || '—',
          categoryId: String(category.id || category._id || ''),
          category: category.name || 'Other',
          ratePerKg: Number(product.activeRate.ratePerKgRupees || 0),
          unit: 'kg',
          iconType: String(product.code || product.name || '').toLowerCase(),
        })),
    );
    setCatalogItems(flattened);
  }, []);

  const refreshDashboardData = useCallback(async () => {
    const [serverProfile, todayRoute, assignedPickups] = await Promise.all([
      fieldOpsApi.fetchProfile(),
      fieldOpsApi.fetchTodayRoute(),
      fieldOpsApi.fetchAssignedPickups(),
      refreshCatalog(),
    ]);

    if (serverProfile) {
      setProfile({
        id: String(serverProfile._id || serverProfile.id || ''),
        employeeCode: serverProfile.employeeCode || '—',
        name: serverProfile.fullName || serverProfile.name || '—',
        role: serverProfile.role || 'EMPLOYEE',
        phone: serverProfile.mobile || serverProfile.phone || '—',
        assignedDivision: serverProfile.assignedDivision?.name || serverProfile.assignedDivision || '—',
        vehicleReg: serverProfile.vehicleNumber || '—',
        vehicleName: serverProfile.vehicleType || '—',
        batteryPct: Number(serverProfile.batteryPct || 0),
        kycVerified: serverProfile.status === 'APPROVED',
        fixedDailyWageRupees: Number(serverProfile.fixedDailyWageRupees || 0),
        incentivePerKgRupees: Number(serverProfile.incentivePerKgRupees || 0),
      });
    }

    let stops: RouteStop[];
    if (todayRoute?.hasRouteToday && Array.isArray(todayRoute.stops)) {
      stops = [...todayRoute.stops]
        .sort((a, b) => Number(a.sequence || a.stopSequence || 0) - Number(b.sequence || b.stopSequence || 0))
        .map((stop, index) => mapPickup(stop.pickup || stop, Number(stop.sequence || stop.stopSequence || index + 1)));
      setRouteTitle(todayRoute.division?.name || todayRoute.division?.code || 'Today’s route');
    } else {
      stops = (Array.isArray(assignedPickups) ? assignedPickups : []).map((pickup, index) =>
        mapPickup(pickup, index + 1),
      );
      setRouteTitle('Today’s assigned pickups');
    }
    setRouteStops(stops);
    const current = stops.find((stop) => stop.status === 'IN_PROGRESS');
    setActivePickup((previous) => current || stops.find((stop) => stop.id === previous?.id) || null);
    setShiftStatus(current ? 'ON_PICKUP' : stops.length > 0 && stops.every((stop) => stop.status === 'COMPLETED') ? 'COMPLETED' : 'AVAILABLE');
  }, [refreshCatalog]);

  // Pre-select the catalog items of the categories the customer chose while
  // booking, once both the catalog and the pickup's categories are available.
  // Runs once per pickup flow; manual toggles set the ref to skip it.
  useEffect(() => {
    if (catalogAutoAppliedRef.current) return;
    if (catalogItems.length === 0 || pickupCategoryIds.length === 0) return;
    const preselected = catalogItems
      .filter((item) => pickupCategoryIds.includes(item.categoryId))
      .map((item) => item.id);
    if (preselected.length > 0) setSelectedCatalogIds(preselected);
    catalogAutoAppliedRef.current = true;
  }, [catalogItems, pickupCategoryIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('aslikaata_emp_token');
    setIsAuthenticated(Boolean(token));
    if (token) refreshDashboardData().finally(() => setIsLoadingAuth(false));
    else setIsLoadingAuth(false);
    const expire = () => {
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
    };
    window.addEventListener('aslikaata:auth-expired', expire);
    return () => window.removeEventListener('aslikaata:auth-expired', expire);
  }, [refreshDashboardData]);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aslikaata_emp_token');
      localStorage.removeItem('aslikaata_emp_refresh_token');
      localStorage.removeItem('aslikaata_emp_user');
    }
    setIsAuthenticated(false);
    setProfile(EMPTY_PROFILE);
    setRouteStops([]);
    setActivePickup(null);
    setCollectedItems([]);
    setSelectedCatalogIds([]);
    setLastCompletion(null);
  };

  const addRouteExpense = (item: { category: string; amount: number; notes: string; receiptAttached?: boolean }) => {
    const expense: RouteExpense = {
      id: `local-${Date.now()}`,
      category: item.category,
      amount: item.amount,
      notes: item.notes,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      receiptAttached: item.receiptAttached ?? false,
    };
    setRouteExpenses((previous) => [expense, ...previous]);
    setCashFloat((previous) => ({
      ...previous,
      approvedRouteExpensesRupees: previous.approvedRouteExpensesRupees + item.amount,
    }));
  };

  const toggleCatalogItemSelection = (id: string) => {
    catalogAutoAppliedRef.current = true;
    setSelectedCatalogIds((previous) =>
      previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id],
    );
  };

  const confirmCatalogSelectionToCart = () => {
    setCollectedItems((previous) =>
      selectedCatalogIds.flatMap((id) => {
        const existing = previous.find((item) => item.id === id);
        if (existing) return [existing];
        const product = catalogItems.find((item) => item.id === id);
        return product
          ? [{ id: product.id, name: product.name, category: product.category, ratePerKg: product.ratePerKg, weightKg: 0, lineTotalRupees: 0 }]
          : [];
      }),
    );
  };

  const updateCollectedItemWeight = (id: string, weightKg: number) => {
    setCollectedItems((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;
        const validWeight = Math.max(0, Number(weightKg) || 0);
        return { ...item, weightKg: validWeight, lineTotalRupees: Number((validWeight * item.ratePerKg).toFixed(2)) };
      }),
    );
  };

  const totalCollectedWeightKg = useMemo(
    () => Number(collectedItems.reduce((sum, item) => sum + item.weightKg, 0).toFixed(3)),
    [collectedItems],
  );
  const totalCollectedValueRupees = useMemo(
    () => Number(collectedItems.reduce((sum, item) => sum + item.lineTotalRupees, 0).toFixed(2)),
    [collectedItems],
  );

  const playAlertChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Audio is optional.
    }
  };

  const triggerVibration = (pattern = [300, 150, 300]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  };

  const triggerIncomingOrderAlert = (order?: any) => {
    if (!order) return;
    setIncomingOrder(order);
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

  const startActivePickupFlow = async (pickupId: string) => {
    const target = routeStops.find((stop) => stop.id === pickupId || stop.pickupCode === pickupId);
    if (!target) return false;
    // Bug 9 fix: never mutate the state object directly — build an immutable copy.
    let updated = target;
    if (target.rawStatus === 'ASSIGNED') {
      const result = await fieldOpsApi.onTheWay(target.id);
      if (!result.success) return false;
      updated = { ...target, rawStatus: 'ON_THE_WAY' };
      // Keep routeStops array in sync so list views also reflect the new status.
      setRouteStops((previous) =>
        previous.map((stop) => (stop.id === updated.id ? updated : stop)),
      );
    }
    // Fresh flow: clear any selection carried over from a previous pickup, then
    // load the customer's booked categories so the catalog pre-selects them.
    setSelectedCatalogIds([]);
    setCollectedItems([]);
    setPickupCategoryIds([]);
    catalogAutoAppliedRef.current = false;
    void (async () => {
      const detail = await fieldOpsApi.getPickup(updated.id);
      if (detail.success && detail.data) {
        const categories = Array.isArray(detail.data.categories) ? detail.data.categories : [];
        setPickupCategoryIds(
          categories.map((category: any) => String(category?._id || category)).filter(Boolean),
        );
      }
    })();
    setActivePickup(updated);
    setShiftStatus('ON_PICKUP');
    setPickupStep('STEP_1_SCAN_QR');
    return true;
  };

  return (
    <EmployeeContext.Provider value={{
      isAuthenticated, setIsAuthenticated, isLoadingAuth, logout, refreshDashboardData,
      profile, routeTitle, shiftStatus, setShiftStatus, activeTab, setActiveTab, routeStops,
      activePickup, setActivePickup, cashFloat, isIncomingAlertOpen, setIsIncomingAlertOpen,
      incomingOrder, triggerIncomingOrderAlert, isLiveNavOpen, setIsLiveNavOpen, activeNavStop,
      setActiveNavStop, startLiveNavigation, playAlertChime, triggerVibration,
      hasUpdateAvailable, setHasUpdateAvailable, isReleaseNotesOpen, setIsReleaseNotesOpen,
      pickupStep, setPickupStep, isFlashlightOn, setIsFlashlightOn, catalogItems, refreshCatalog,
      selectedCatalogIds, toggleCatalogItemSelection, collectedItems, updateCollectedItemWeight,
      removeCollectedItem: (id) => {
        setCollectedItems((previous) => previous.filter((item) => item.id !== id));
        setSelectedCatalogIds((previous) => previous.filter((item) => item !== id));
      },
      confirmCatalogSelectionToCart, totalCollectedWeightKg, totalCollectedValueRupees,
      routeExpenses, addRouteExpense, isShiftClosed,
      closeShiftAndHandover: () => {
        setIsShiftClosed(true);
        setShiftStatus('COMPLETED');
      },
      isOfflineCached: false, simulateHomeState: setShiftStatus, startActivePickupFlow,
      paymentMethod, setPaymentMethod, lastCompletion, setLastCompletion,
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployee must be used within an EmployeeProvider');
  return context;
};
