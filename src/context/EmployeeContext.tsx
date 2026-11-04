"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fieldOpsApi, AppNotificationItem } from '../services/api';
import { SHOW_LIVE_NAV } from '../lib/features';
import { openDirections } from '../lib/maps';
import { enablePush, disablePush, onPushOpen, PUSH_RECEIVED_EVENT } from '../lib/push';

const NAVIGATED_KEY = 'aslikaata_emp_navigated';

export type ShiftStatus = 'AVAILABLE' | 'ON_PICKUP' | 'COMPLETED';
export type AppTab = 'HOME' | 'MY_PICKUPS' | 'NOTIFICATIONS' | 'PROFILE';
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
  /** The customer's chosen range as booked, e.g. "10 – 20 kg". Shown instead of a computed midpoint. */
  estimatedWeightLabel: string;
  /** Customer's saved GPS pin, used for map directions. */
  latitude?: number;
  longitude?: number;
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
  /** Account status from the server: APPROVED, SUSPENDED, ... */
  status: string;
  memberSince: string | null;
  approvedAt: string | null;
  /** Home area from the picker request (area, city). */
  homeArea: string;
  /** The Duty switch: on = offered new pickups. Starts off. */
  onDuty: boolean;
  /** When the switch last changed (so "shift ended at ..." can be shown after going off duty). */
  dutyChangedAt: string | null;
  stats: {
    totalAssigned: number;
    completed: number;
    openJobs: number;
    todayJobs: number;
    totalWeightKg: number;
    totalPayoutRupees: number;
  };
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
  /** Admin-configured emoji (product → category fallback). */
  emoji: string;
}

export interface CollectedScrapItem {
  id: string;
  name: string;
  category: string;
  emoji?: string;
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
  /** Turn duty on or off (saved on the server). Resolves false if it could not be saved. */
  setOnDuty: (onDuty: boolean) => Promise<boolean>;
  /** The pickup to show first on Home: the open one the picker most recently tapped Navigate on. */
  nextPickup: RouteStop | null;
  /** Has the picker already started the journey to this pickup (tapped Navigate, or it is on the way)? */
  hasNavigated: (stop: RouteStop) => boolean;
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
  notifications: AppNotificationItem[];
  unreadNotificationCount: number;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  /** Newest notification that just arrived (shown as a banner until dismissed). */
  toastNotification: AppNotificationItem | null;
  dismissToastNotification: () => void;
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
  status: '',
  memberSince: null,
  approvedAt: null,
  homeArea: '',
  onDuty: false,
  dutyChangedAt: null,
  stats: { totalAssigned: 0, completed: 0, openJobs: 0, todayJobs: 0, totalWeightKg: 0, totalPayoutRupees: 0 },
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
  // SETTLED is still open: payment is recorded but the customer's completion code is yet to be entered.
  if (['COMPLETED', 'INVOICED', 'OTP_VERIFIED'].includes(status)) return 'COMPLETED';
  if (
    ['ON_THE_WAY', 'ARRIVED', 'QR_VERIFIED', 'VERIFIED', 'IN_PROGRESS', 'MEASURED', 'SUMMARY_READY', 'CUSTOMER_CONFIRMED', 'PAYMENT_PENDING', 'SETTLED', 'OTP_SENT'].includes(status)
  ) return 'IN_PROGRESS';
  return 'SCHEDULED';
};

/** Which screen of the pickup flow a pickup in this server status belongs on (so Continue resumes, not restarts). */
const stepForStatus = (status: string, hasItems: boolean): PickupStep => {
  switch (status) {
    case 'VERIFIED':
      return 'STEP_2_VERIFIED';
    case 'IN_PROGRESS':
      return 'STEP_4_CATALOG';
    case 'MEASURED':
    case 'SUMMARY_READY':
    case 'CUSTOMER_CONFIRMED':
    case 'PAYMENT_PENDING':
      return hasItems ? 'STEP_10_REVIEW' : 'STEP_4_CATALOG';
    case 'SETTLED':
    case 'OTP_VERIFIED':
    case 'INVOICED':
      return 'STEP_15_OTP';
    default:
      return 'STEP_1_SCAN_QR';
  }
};

const mapPickup = (pickup: any, sequence: number): RouteStop => {
  const address = pickup?.addressSnapshot || {};
  const estimate = pickup?.estimatedWeightSnapshot || {};
  const totals = pickup?.totals || {};
  const minKg = Number(estimate.minGrams || 0) / 1000;
  const maxKg = Number(estimate.maxGrams || 0) / 1000;
  // The top "50+ kg" range is stored with a huge maxGrams, so a midpoint would read ~5000 kg: only
  // average real, bounded ranges.
  const estimatedWeightKg = maxKg && maxKg <= 1000 ? Number(((minKg + maxKg) / 2).toFixed(1)) : minKg;
  const estimatedWeightLabel = estimate.displayLabel || (minKg ? `${minKg}+ kg` : '—');
  const coords = address.location?.coordinates;
  const longitude = Number(coords?.[0]);
  const latitude = Number(coords?.[1]);
  return {
    id: String(pickup?._id || pickup?.id || ''),
    stopNumber: sequence,
    pickupCode: pickup?.pickupCode || '—',
    customerId: String(pickup?.customerId || '—'),
    customerName: pickup?.customerName || address.name || address.customerName || 'Customer',
    phone: pickup?.customerPhone || address.phone || address.mobile || '—',
    timeSlot: pickup?.timeSlotSnapshot?.displayLabel || '—',
    scheduledTime: pickup?.timeSlotSnapshot?.startTime || '—',
    address: [address.houseNumber, address.line1, address.line2].filter(Boolean).join(', ') || '—',
    locality: [address.city, address.state, address.pincode].filter(Boolean).join(', ') || '—',
    landmark: address.landmark || '',
    estimatedWeightKg,
    estimatedWeightLabel,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
    // Category names only when the API sent them populated (otherwise these would be raw ids).
    itemsCategoryHint: Array.isArray(pickup?.categories)
      ? pickup.categories.map((item: any) => item?.name).filter(Boolean).join(', ')
      : '',
    status: mapStatus(pickup?.status),
    rawStatus: pickup?.status || '',
    completedAt: pickup?.timestamps?.completedAt,
    finalWeightKg: totals.netWeightGrams != null ? totals.netWeightGrams / 1000 : undefined,
    finalScrapValueRupees: totals.totalAmount != null ? totals.totalAmount / 100 : undefined,
  };
};

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [toastNotification, setToastNotification] = useState<AppNotificationItem | null>(null);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const notificationsPrimedRef = useRef(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [profile, setProfile] = useState<EmployeeProfile>(EMPTY_PROFILE);
  const profileRef = useRef<EmployeeProfile>(EMPTY_PROFILE);
  profileRef.current = profile;
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
  // When the picker last tapped Navigate on each pickup (id -> time). Kept on the phone so it survives a reload.
  const [navigatedAt, setNavigatedAt] = useState<Record<string, number>>({});
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NAVIGATED_KEY);
      if (raw) setNavigatedAt(JSON.parse(raw));
    } catch {
      /* start empty */
    }
  }, []);
  const [pickupStep, setPickupStep] = useState<PickupStep>('IDLE');
  const pickupStepRef = useRef<PickupStep>('IDLE');
  pickupStepRef.current = pickupStep;
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
          emoji: String(product.emoji || category.emoji || ''),
        })),
    );
    setCatalogItems(flattened);

    // Keep an in-progress collection in sync with admin changes: drop items whose
    // product was disabled and refresh rates (margin-inclusive) of the rest.
    // Once the weights are recorded and locked (review / completion-code screens) the amounts must
    // stay as recorded, so never re-price them from today's rates.
    const pricesLocked = pickupStepRef.current === 'STEP_10_REVIEW' || pickupStepRef.current === 'STEP_15_OTP';
    if (flattened.length > 0 && !pricesLocked) {
      const byId = new Map(flattened.map((item: ScrapCatalogItem) => [item.id, item]));
      setSelectedCatalogIds((previous) => previous.filter((id) => byId.has(id)));
      setCollectedItems((previous) =>
        previous
          .filter((item) => byId.has(item.id))
          .map((item) => {
            const live = byId.get(item.id)!;
            return {
              ...item,
              name: live.name,
              category: live.category,
              emoji: live.emoji,
              ratePerKg: live.ratePerKg,
              lineTotalRupees: Number((item.weightKg * live.ratePerKg).toFixed(2)),
            };
          }),
      );
    }
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
        status: serverProfile.status || '',
        memberSince: serverProfile.createdAt || null,
        approvedAt: serverProfile.approvedAt || null,
        homeArea: [serverProfile.address?.area, serverProfile.address?.city].filter(Boolean).join(', '),
        onDuty: Boolean(serverProfile.onDuty),
        dutyChangedAt: serverProfile.dutyChangedAt || null,
        stats: {
          totalAssigned: Number(serverProfile.stats?.totalAssigned || 0),
          completed: Number(serverProfile.stats?.completed || 0),
          openJobs: Number(serverProfile.stats?.openJobs || 0),
          todayJobs: Number(serverProfile.stats?.todayJobs || 0),
          totalWeightKg: Number(serverProfile.stats?.totalWeightKg || 0),
          totalPayoutRupees: Number(serverProfile.stats?.totalPayoutRupees || 0),
        },
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
    // Must run before the tokens are removed below: the request needs them.
    disablePush((token) => fieldOpsApi.unregisterDevice(token));
    void fieldOpsApi.setDuty(false);
    void fieldOpsApi.logout();
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
    setNavigatedAt({});
    try {
      localStorage.removeItem(NAVIGATED_KEY);
    } catch {
      /* ignore */
    }
    setNotifications([]);
    setToastNotification(null);
    seenNotificationIdsRef.current = new Set();
    notificationsPrimedRef.current = false;
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
          ? [{ id: product.id, name: product.name, category: product.category, emoji: product.emoji, ratePerKg: product.ratePerKg, weightKg: 0, lineTotalRupees: 0 }]
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

  const setOnDuty = useCallback(async (onDuty: boolean) => {
    // Show the change at once, then confirm with the server; put it back if the server says no.
    const previous = { onDuty: profileRef.current.onDuty, dutyChangedAt: profileRef.current.dutyChangedAt };
    setProfile((p) => ({ ...p, onDuty, dutyChangedAt: new Date().toISOString() }));
    const result = await fieldOpsApi.setDuty(onDuty);
    if (!result.success) {
      setProfile((p) => ({ ...p, ...previous }));
      return false;
    }
    setProfile((p) => ({ ...p, onDuty: result.data?.onDuty ?? onDuty, dutyChangedAt: result.data?.dutyChangedAt ?? p.dutyChangedAt }));
    return true;
  }, []);

  const markNavigated = useCallback((id: string) => {
    setNavigatedAt((previous) => {
      // keep only the most recent few: this is a convenience, not a record
      const newest = Object.entries({ ...previous, [id]: Date.now() })
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);
      const next = Object.fromEntries(newest);
      try {
        localStorage.setItem(NAVIGATED_KEY, JSON.stringify(next));
      } catch {
        /* storage is optional */
      }
      return next;
    });
  }, []);

  /** Starting the journey: an assigned pickup becomes "on the way" (the customer is told). */
  const markOnTheWay = async (stop: RouteStop) => {
    if (stop.rawStatus !== 'ASSIGNED') return;
    const result = await fieldOpsApi.onTheWay(stop.id);
    if (!result.success) return;
    const onTheWay = (s: RouteStop): RouteStop =>
      s.id === stop.id ? { ...s, rawStatus: 'ON_THE_WAY', status: 'IN_PROGRESS' } : s;
    setRouteStops((previous) => previous.map(onTheWay));
    setActivePickup((previous) => (previous && previous.id === stop.id ? onTheWay(previous) : previous));
  };

  const hasNavigated = useCallback(
    (stop: RouteStop) => Boolean(navigatedAt[stop.id]) || ['ON_THE_WAY', 'ARRIVED'].includes(stop.rawStatus),
    [navigatedAt],
  );

  // Next pickup = the open pickup the picker last tapped Navigate on. Finished and cancelled ones never
  // qualify. Before any Navigate: the one already under way, else the earliest in the route.
  const nextPickup = useMemo(() => {
    const open = routeStops.filter(
      (stop) => stop.status !== 'COMPLETED' && !['CANCELLED', 'FAILED'].includes(stop.rawStatus),
    );
    if (open.length === 0) return null;
    const navigated = open.filter((stop) => navigatedAt[stop.id]).sort((a, b) => navigatedAt[b.id] - navigatedAt[a.id]);
    if (navigated.length > 0) return navigated[0];
    const rank = (stop: RouteStop) => (stop.status === 'IN_PROGRESS' ? 0 : 1);
    return [...open].sort((a, b) => rank(a) - rank(b) || a.stopNumber - b.stopNumber)[0];
  }, [routeStops, navigatedAt]);

  const startLiveNavigation = (stop: RouteStop) => {
    // Tapping Navigate starts the journey: it becomes the next pickup, unlocks "Start Pickup" for when the
    // picker comes back, and the customer is told the picker is on the way.
    markNavigated(stop.id);
    void markOnTheWay(stop);
    if (!SHOW_LIVE_NAV) {
      // In-app navigation is off for now: "Navigate" opens Google Maps directions to the customer.
      setActivePickup(stop);
      openDirections(stop);
      return;
    }
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
    // Fresh flow: clear any selection carried over from a previous pickup.
    setSelectedCatalogIds([]);
    setCollectedItems([]);
    setPickupCategoryIds([]);
    catalogAutoAppliedRef.current = false;

    // Ask the server where this pickup really is (the list may be stale, and the app may have been
    // reopened mid-pickup) and continue from that screen instead of always starting at the QR scan.
    const detail = await fieldOpsApi.getPickup(updated.id);
    const data = detail.success ? detail.data : null;
    let status = String(data?.status || updated.rawStatus || '');
    if (status === 'COMPLETED' || status === 'CANCELLED' || status === 'FAILED') {
      void refreshDashboardData();
      return false;
    }
    if (data) {
      const categories = Array.isArray(data.categories) ? data.categories : [];
      setPickupCategoryIds(
        categories.map((category: any) => String(category?._id || category)).filter(Boolean),
      );
    }

    // Weights already recorded (locked on the server): bring them back for the review / code screens.
    const recorded: CollectedScrapItem[] = (Array.isArray(data?.items) ? data.items : []).map((item: any) => {
      const id = String(item.productId);
      const product = catalogItems.find((entry) => entry.id === id);
      const weightKg = Number(item.grossWeightGrams || 0) / 1000;
      return {
        id,
        name: item.productName || product?.name || '—',
        category: product?.category || '',
        emoji: product?.emoji,
        ratePerKg: Number(item.ratePerKgSnapshot || 0) / 100,
        weightKg,
        lineTotalRupees: Number(item.amount || 0) / 100,
      };
    });
    const lockedStatuses = ['MEASURED', 'SUMMARY_READY', 'CUSTOMER_CONFIRMED', 'PAYMENT_PENDING', 'SETTLED', 'OTP_VERIFIED', 'INVOICED'];
    const hasItems = recorded.length > 0 && lockedStatuses.includes(status);
    if (hasItems) {
      setCollectedItems(recorded);
      setSelectedCatalogIds(recorded.map((item) => item.id));
      catalogAutoAppliedRef.current = true;
    }

    // The QR was scanned but the job was never started (app closed in between): finish that step.
    if (status === 'VERIFIED') {
      const started = await fieldOpsApi.startPickup(updated.id);
      if (started.success) status = 'IN_PROGRESS';
    }

    // Start Pickup means the picker is at the door: mark the arrival. The customer is then told their
    // executive is nearby and to open the app and show their pickup QR; the picker scans it next.
    if (status === 'ON_THE_WAY') {
      const arrived = await fieldOpsApi.arrived(updated.id);
      if (arrived.success) status = 'ARRIVED';
    }

    updated = { ...updated, rawStatus: status };
    setRouteStops((previous) => previous.map((stop) => (stop.id === updated.id ? updated : stop)));
    setActivePickup(updated);
    setShiftStatus('ON_PICKUP');
    setPickupStep(stepForStatus(status, hasItems));
    return true;
  };

  // --- Notifications: poll while signed in, banner for new ones, refresh the route when a
  // pickup is assigned / moved / cancelled.
  const refreshNotifications = useCallback(async () => {
    const data = await fieldOpsApi.fetchNotifications();
    if (!data) return;
    setNotifications(data.items);

    const fresh = data.items.filter((n) => !seenNotificationIdsRef.current.has(n.id));
    data.items.forEach((n) => seenNotificationIdsRef.current.add(n.id));
    const newestUnread = fresh.find((n) => !n.readAt);

    // First load after login: banner only for something still unread (e.g. the welcome message).
    if (newestUnread) {
      setToastNotification(newestUnread);
      if (notificationsPrimedRef.current) {
        try {
          navigator.vibrate?.([200, 100, 200]);
        } catch {
          /* vibration is optional */
        }
        if (fresh.some((n) => n.type.startsWith('PICKUP_'))) void refreshDashboardData();
      }
    }
    notificationsPrimedRef.current = true;
  }, [refreshDashboardData]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshNotifications();
    const timer = setInterval(() => void refreshNotifications(), 15000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshNotifications();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated, refreshNotifications]);

  // Native push (Android app only; no-op in a browser): register this phone while signed in,
  // refresh when a push lands with the app open, and open the inbox when one is tapped.
  useEffect(() => {
    if (!isAuthenticated) return;
    void enablePush((token, platform) => fieldOpsApi.registerDevice(token, platform));
    const onReceived = () => {
      void refreshNotifications();
      void refreshDashboardData();
    };
    window.addEventListener(PUSH_RECEIVED_EVENT, onReceived);
    const offOpen = onPushOpen(() => setActiveTab('NOTIFICATIONS'));
    return () => {
      window.removeEventListener(PUSH_RECEIVED_EVENT, onReceived);
      offOpen();
    };
  }, [isAuthenticated, refreshNotifications, refreshDashboardData]);

  // Auto-hide the banner after a few seconds.
  useEffect(() => {
    if (!toastNotification) return;
    const t = setTimeout(() => setToastNotification(null), 7000);
    return () => clearTimeout(t);
  }, [toastNotification]);

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n)));
    await fieldOpsApi.markNotificationRead(id);
  };

  const markAllNotificationsRead = async () => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    await fieldOpsApi.markAllNotificationsRead();
  };

  const unreadNotificationCount = notifications.filter((n) => !n.readAt).length;

  return (
    <EmployeeContext.Provider value={{
      isAuthenticated, setIsAuthenticated, isLoadingAuth, logout, refreshDashboardData,
      profile, routeTitle, shiftStatus, setShiftStatus, activeTab, setActiveTab, routeStops,
      activePickup, setActivePickup, cashFloat, isIncomingAlertOpen, setIsIncomingAlertOpen,
      incomingOrder, triggerIncomingOrderAlert, isLiveNavOpen, setIsLiveNavOpen, activeNavStop,
      setActiveNavStop, startLiveNavigation, nextPickup, hasNavigated, setOnDuty, playAlertChime, triggerVibration,
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
      notifications, unreadNotificationCount, refreshNotifications, markNotificationRead,
      markAllNotificationsRead, toastNotification,
      dismissToastNotification: () => setToastNotification(null),
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
