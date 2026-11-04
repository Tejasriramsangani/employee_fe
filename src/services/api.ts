const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const normalizeMobile = (mobile: string) => mobile.replace(/\D/g, '').slice(-10);

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  message?: string;
  /** Machine-readable error info from the backend, e.g. { code: 'EMPLOYEE_ACCOUNT_NOT_FOUND' }. */
  details?: { code?: string; [key: string]: any } | null;
  status?: number;
}

export interface PickerRequestPayload {
  fullName: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  address: {
    line1: string;
    area: string;
    landmark?: string;
    city: string;
    district?: string;
    state?: string;
    pincode: string;
  };
  workType: 'FIELD_COLLECTOR' | 'DRIVER';
  vehicleType: 'NONE' | 'BICYCLE' | 'BIKE' | 'E_RICKSHAW' | 'AUTO' | 'MINI_TRUCK';
  vehicleNumber?: string;
  experienceYears?: number;
  availability: 'FULL_TIME' | 'PART_TIME' | 'WEEKENDS';
  about?: string;
}

export interface PickerRequestStatusInfo {
  found: boolean;
  requestCode?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt?: string;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
}

export interface AppNotificationItem {
  id: string;
  type: 'PICKUP_ASSIGNED' | 'PICKUP_RESCHEDULED' | 'PICKUP_CANCELLED' | 'ACCOUNT_APPROVED' | 'GENERAL';
  title: string;
  body: string;
  data: Record<string, any>;
  readAt: string | null;
  createdAt: string;
}

type ServerStatusListener = (isDown: boolean, details?: string) => void;

class FieldOpsApiService {
  private statusListeners = new Set<ServerStatusListener>();
  public isServerDown = false;
  public lastErrorDetails = '';

  public onServerStatusChange(listener: ServerStatusListener) {
    this.statusListeners.add(listener);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatus(isDown: boolean, details?: string) {
    this.isServerDown = isDown;
    if (details) this.lastErrorDetails = details;
    this.statusListeners.forEach((listener) => listener(isDown, details));
  }

  private getHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('aslikaata_emp_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private clearAuth() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('aslikaata_emp_token');
    localStorage.removeItem('aslikaata_emp_refresh_token');
    localStorage.removeItem('aslikaata_emp_user');
  }

  private async parse<T>(
    response: Response,
  ): Promise<{ data?: T; message?: string; details?: ApiResult<T>['details'] }> {
    let json: any;
    try {
      json = await response.json();
    } catch {
      return { message: `Request failed with HTTP ${response.status}` };
    }
    return {
      data: (json && Object.prototype.hasOwnProperty.call(json, 'data') ? json.data : json) as T,
      message:
        json?.error?.message ||
        json?.message ||
        (typeof json?.error === 'string' ? json.error : undefined),
      details: json?.error?.details && typeof json.error.details === 'object' ? json.error.details : null,
    };
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    allowRefresh = true,
  ): Promise<ApiResult<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...init,
        headers: { ...this.getHeaders(), ...(init.headers || {}) },
        cache: init.cache || 'no-store',
      });
      if (response.status === 401 && allowRefresh) {
        const refreshed = await this.refreshToken();
        if (refreshed.success) return this.request<T>(path, init, false);
        this.clearAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('aslikaata:auth-expired'));
        }
      }
      const parsed = await this.parse<T>(response);
      if (!response.ok) {
        if (response.status >= 500) {
          this.notifyStatus(true, parsed.message || `HTTP ${response.status}`);
        }
        return {
          success: false,
          message: parsed.message || `Request failed with HTTP ${response.status}`,
          details: parsed.details,
          status: response.status,
        };
      }
      this.notifyStatus(false);
      return { success: true, data: parsed.data };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Server unreachable';
      this.notifyStatus(true, message);
      return { success: false, message };
    }
  }

  public async checkHealth(): Promise<boolean> {
    const rootUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    for (const url of [`${rootUrl}/health`, `${API_BASE_URL}/catalog`]) {
      try {
        const response = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (response.ok) {
          this.notifyStatus(false);
          return true;
        }
      } catch {
        // Continue to the catalog fallback.
      }
    }
    this.notifyStatus(true, 'Operations server unreachable');
    return false;
  }

  sendOtp(mobile: string) {
    // `devOtp` is only returned by the backend while SMS_PROVIDER=mock outside production.
    return this.request<{ message: string; cooldownSeconds: number; devOtp?: string }>(
      '/auth/otp/send',
      {
        method: 'POST',
        // loginRole: the backend refuses (404 EMPLOYEE_ACCOUNT_NOT_FOUND) when this number has no field account.
        body: JSON.stringify({ mobile: normalizeMobile(mobile), purpose: 'LOGIN', loginRole: 'EMPLOYEE' }),
      },
      false,
    );
  }

  verifyOtp(mobile: string, code: string) {
    return this.request<{ accessToken: string; refreshToken: string; user: any }>(
      '/auth/otp/verify',
      {
        method: 'POST',
        body: JSON.stringify({
          mobile: normalizeMobile(mobile),
          code,
          purpose: 'LOGIN',
          requestedRole: 'EMPLOYEE',
        }),
      },
      false,
    );
  }

  // --- "Become a freelance picker" (public: the applicant has no account yet) ---

  submitPickerRequest(payload: PickerRequestPayload) {
    return this.request<{ requestCode: string; status: string; message: string }>(
      '/picker-requests',
      { method: 'POST', body: JSON.stringify(payload) },
      false,
    );
  }

  pickerRequestStatus(mobile: string) {
    return this.request<PickerRequestStatusInfo>(
      `/picker-requests/status?mobile=${encodeURIComponent(normalizeMobile(mobile))}`,
      {},
      false,
    );
  }

  /** The Duty ON / OFF switch: only employees on duty are offered new pickups by the admin. */
  setDuty(onDuty: boolean) {
    return this.request<{ onDuty: boolean; dutyChangedAt: string }>('/employee/duty', {
      method: 'PUT',
      body: JSON.stringify({ onDuty }),
    });
  }

  /** Ends this login on the server (revokes the session) so admin no longer sees the picker as logged in. */
  logout() {
    return this.request<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' }, false);
  }

  // --- Push notification device registration ---

  registerDevice(token: string, platform: 'ANDROID' | 'IOS') {
    return this.request<{ registered: boolean }>('/devices', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    });
  }

  unregisterDevice(token: string) {
    return this.request<{ unregistered: boolean }>(
      '/devices',
      { method: 'DELETE', body: JSON.stringify({ token }) },
      false,
    );
  }

  // --- In-app notifications ---

  async fetchNotifications(limit = 40) {
    const result = await this.request<{ items: AppNotificationItem[]; unreadCount: number }>(
      `/employee/notifications?limit=${limit}`,
    );
    return result.success && result.data ? result.data : null;
  }

  markNotificationRead(id: string) {
    return this.request<{ unreadCount: number }>(`/employee/notifications/${id}/read`, { method: 'POST' });
  }

  markAllNotificationsRead() {
    return this.request<{ unreadCount: number }>('/employee/notifications/read-all', { method: 'POST' });
  }

  async refreshToken() {
    const refreshToken =
      typeof window !== 'undefined' ? localStorage.getItem('aslikaata_emp_refresh_token') : null;
    if (!refreshToken) return { success: false, message: 'No refresh token' } as ApiResult<any>;
    const result = await this.request<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refreshToken }) },
      false,
    );
    if (result.success && result.data && typeof window !== 'undefined') {
      localStorage.setItem('aslikaata_emp_token', result.data.accessToken);
      localStorage.setItem('aslikaata_emp_refresh_token', result.data.refreshToken);
    } else {
      this.clearAuth();
    }
    return result;
  }

  async fetchProfile() {
    const result = await this.request<any>('/employee/profile');
    return result.success ? result.data ?? null : null;
  }

  async fetchTodayRoute() {
    const result = await this.request<any>('/employee/route/today');
    return result.success ? result.data ?? null : null;
  }

  async fetchAssignedPickups() {
    const result = await this.request<any[]>('/employee/pickups');
    return result.success ? result.data ?? [] : [];
  }

  async fetchCatalog() {
    const result = await this.request<any[]>('/catalog');
    return result.success ? result.data ?? [] : [];
  }

  onTheWay(pickupId: string) {
    return this.request<any>(`/employee/pickups/${pickupId}/on-the-way`, { method: 'POST' });
  }

  arrived(pickupId: string) {
    return this.request<any>(`/employee/pickups/${pickupId}/arrived`, { method: 'POST' });
  }

  verifyQr(pickupId: string, qrToken: string) {
    return this.request<any>(`/employee/pickups/${pickupId}/verify-qr`, {
      method: 'POST',
      body: JSON.stringify({ qrToken }),
    });
  }

  startPickup(pickupId: string) {
    return this.request<any>(`/employee/pickups/${pickupId}/start`, { method: 'POST' });
  }

  recordItems(
    pickupId: string,
    items: Array<{
      productId: string;
      weightKg: number;
      wastageKg?: number;
      wastageReason?: string;
    }>,
  ) {
    return this.request<any>(`/employee/pickups/${pickupId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        items: items.map((item) => ({
          productId: item.productId,
          grossWeightGrams: Math.round(item.weightKg * 1000),
          wastageGrams: Math.round((item.wastageKg || 0) * 1000),
          ...(item.wastageReason ? { wastageReason: item.wastageReason } : {}),
        })),
      }),
    });
  }

  getPickup(pickupId: string) {
    return this.request<any>(`/pickups/${pickupId}`);
  }

  settlePickup(pickupId: string, type: 'CASH' | 'UPI') {
    return this.request<any>(`/employee/pickups/${pickupId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ type, idempotencyKey: crypto.randomUUID() }),
    });
  }

  /**
   * Completes the pickup with the code the customer reads out. The code is also the customer's confirmation
   * of the weighing summary, so the payment (cash or UPI) is recorded with it.
   */
  verifyClosingOtp(pickupId: string, code: string, paymentType: 'CASH' | 'UPI' = 'CASH') {
    return this.request<{ pickup: any; invoice: any }>(
      `/employee/pickups/${pickupId}/verify-closing-otp`,
      { method: 'POST', body: JSON.stringify({ code, paymentType }) },
    );
  }

  reportLocation(
    pickupId: string,
    location: {
      latitude: number;
      longitude: number;
      speed?: number | null;
      heading?: number | null;
    },
  ) {
    return this.request<any>(`/employee/pickups/${pickupId}/location`, {
      method: 'POST',
      body: JSON.stringify(location),
    });
  }
}

export const fieldOpsApi = new FieldOpsApiService();
