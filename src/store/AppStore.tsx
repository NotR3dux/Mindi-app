import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  EMPTY_DRAFT,
  STATUS_FLOW,
  makeSampleOrders,
  newId,
  type Draft,
  type Order,
  type OrderStatus,
  type PaymentMethod,
  type Review,
} from '@/data/orders';
import { PERIOD_DAYS, getPlan, isSubActive, type PlanPeriod, type Subscription } from '@/data/plans';
import { REDEEM_CATALOG, WEEKLY_VOUCHER, isVoucherValid, weekKey, type Voucher } from '@/data/rewards';
import { quoteDraft } from '@/utils/pricing';

// Penyimpanan lokal (prototype) — data hilang jika aplikasi di-uninstall.
const STORAGE_KEY = 'mindi:data:v1';
const POINTS_PER_ORDER = 10;
const POINTS_PER_REVIEW = 5;
const POINTS_PER_SUB_WEEK = 20;

export type PartnerApplication = {
  name: string;
  city: string;
  slots: string[];
  services: string[];
  reason: string;
  submittedAt: string;
  status: 'Menunggu verifikasi' | 'Lolos verifikasi';
};

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  notifReminder: boolean;
  notifPromo: boolean;
};

const DEFAULT_USER: UserProfile = {
  name: 'Sabrina',
  email: 'sabrina@contoh.id',
  phone: '0812-xxxx-1234',
  notifReminder: true,
  notifPromo: false,
};

type Persisted = {
  orders: Order[];
  points: number;
  user: UserProfile;
  subscription?: Subscription | null;
  vouchers?: Voucher[];
  weeklyClaimKey?: string;
  onboarded?: boolean;
  partnerApplication?: PartnerApplication | null;
};

const makeVoucher = (
  base: Omit<Voucher, 'id' | 'expiresAt' | 'used' | 'source'>,
  source: Voucher['source'],
  days: number
): Voucher => ({
  ...base,
  id: 'V-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
  source,
  used: false,
  expiresAt: new Date(Date.now() + days * 86400000).toISOString(),
});

const sampleVouchers = (): Voucher[] => [
  makeVoucher(
    { title: 'Welcome 50%', description: 'Diskon 50% (maks. Rp3.500) pesanan pertama', type: 'percent', value: 50, maxDiscount: 3500 },
    'welcome',
    14
  ),
];

type Store = {
  ready: boolean;
  orders: Order[];
  points: number;
  user: UserProfile;
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  resetDraft: (initial?: Partial<Draft>) => void;
  subscription: Subscription | null;
  vouchers: Voucher[];
  weeklyClaimed: boolean;
  onboarded: boolean;
  partnerApplication: PartnerApplication | null;
  placeOrder: (payment: PaymentMethod, voucherId?: string) => Order;
  subscribe: (planId: string, period: PlanPeriod, payment: PaymentMethod) => void;
  cancelSubscription: () => void;
  claimWeeklyVoucher: () => boolean;
  redeemPoints: (rewardId: string) => boolean;
  setOnboarded: (v: boolean) => void;
  submitPartnerApplication: (app: Omit<PartnerApplication, 'submittedAt' | 'status'>) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  advanceStatus: (id: string) => void;
  cancelOrder: (id: string) => void;
  submitReview: (id: string, review: Omit<Review, 'createdAt'>) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  loadSampleData: () => void;
  clearAllData: () => void;
  toast: (message: string) => void;
  toastMessage: string | null;
};

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [points, setPoints] = useState(0);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [weeklyClaimKey, setWeeklyClaimKey] = useState<string | undefined>();
  const [onboarded, setOnboardedState] = useState(false);
  const [partnerApplication, setPartnerApplication] = useState<PartnerApplication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ordersRef = useRef<Order[]>(orders);
  ordersRef.current = orders;

  // Muat data saat aplikasi dibuka
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw) as Persisted;
          setOrders(data.orders ?? []);
          setPoints(data.points ?? 0);
          setUser({ ...DEFAULT_USER, ...data.user });
          setSubscription(data.subscription ?? null);
          setVouchers(data.vouchers ?? sampleVouchers());
          setWeeklyClaimKey(data.weeklyClaimKey);
          setOnboardedState(data.onboarded ?? true);
          setPartnerApplication(data.partnerApplication ?? null);
        } else {
          setOrders(makeSampleOrders());
          setPoints(120);
          setVouchers(sampleVouchers());
        }
      } catch {
        setOrders(makeSampleOrders());
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Simpan setiap ada perubahan
  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { orders, points, user, subscription, vouchers, weeklyClaimKey, onboarded, partnerApplication };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [orders, points, user, subscription, vouchers, weeklyClaimKey, onboarded, partnerApplication, ready]);

  const toast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = setTimeout(() => setToastMessage(null), 2600);
  }, []);

  const updateDraft = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const resetDraft = useCallback(
    (initial?: Partial<Draft>) => setDraft({ ...EMPTY_DRAFT, ...initial }),
    []
  );

  /** Ubah status. Jika `onlyFrom` diisi, status hanya berubah bila status saat ini cocok. */
  const transition = useCallback((id: string, status: OrderStatus, onlyFrom?: OrderStatus) => {
    const current = ordersRef.current.find((o) => o.id === id);
    if (!current || current.status === status) return;
    if (onlyFrom && current.status !== onlyFrom) return;
    if (status === 'Selesai') setPoints((p) => p + POINTS_PER_ORDER);
    const at = new Date().toISOString();
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, status, history: [...o.history, { status, at }] } : o))
    );
  }, []);

  const setStatus = useCallback((id: string, status: OrderStatus) => transition(id, status), [transition]);

  const placeOrder = useCallback(
    (payment: PaymentMethod, voucherId?: string) => {
      const now = new Date().toISOString();
      const voucher = vouchers.find((v) => v.id === voucherId && isVoucherValid(v));
      const q = quoteDraft(draft, subscription, voucher);
      const order: Order = {
        id: newId(),
        serviceId: draft.serviceId!,
        activity: draft.activity.trim(),
        date: draft.date!,
        time: draft.time!,
        method: draft.method,
        note: draft.note.trim(),
        repeat: draft.repeat,
        repeatDays: draft.repeat === 'Pilih hari' ? draft.repeatDays : undefined,
        occurrences: q.occurrences,
        partnerId: draft.partnerId!,
        price: q.total,
        priceDetail: {
          rate: q.rate,
          sessions: q.sessions,
          coveredByPlan: q.coveredByPlan,
          discount: q.discount,
          voucherTitle: q.voucherTitle,
        },
        paymentMethod: q.total === 0 && q.coveredByPlan > 0 ? 'Paket Langganan' : payment,
        status: 'Menunggu Partner',
        createdAt: now,
        history: [{ status: 'Menunggu Partner', at: now }],
      };
      setOrders((list) => [order, ...list]);
      if (voucher) setVouchers((list) => list.map((v) => (v.id === voucher.id ? { ...v, used: true } : v)));
      if (q.coveredByPlan > 0) setSubscription((sub) => (sub ? { ...sub, used: sub.used + q.coveredByPlan } : sub));
      // Simulasi: partner menerima pesanan beberapa detik kemudian
      setTimeout(() => transition(order.id, 'Partner Ditugaskan', 'Menunggu Partner'), 3000);
      setTimeout(() => transition(order.id, 'Menunggu Waktu Pengingat', 'Partner Ditugaskan'), 6000);
      return order;
    },
    [draft, transition, vouchers, subscription]
  );

  const subscribe = useCallback((planId: string, period: PlanPeriod, _payment: PaymentMethod) => {
    const plan = getPlan(planId);
    const now = new Date();
    setSubscription({
      planId,
      period,
      startedAt: now.toISOString(),
      endsAt: new Date(now.getTime() + PERIOD_DAYS[period] * 86400000).toISOString(),
      quota: plan.prices[period].quota,
      used: 0,
    });
    setPoints((p) => p + POINTS_PER_SUB_WEEK);
  }, []);

  const cancelSubscription = useCallback(() => setSubscription(null), []);

  const weeklyClaimed = weeklyClaimKey === weekKey();
  const claimWeeklyVoucher = useCallback(() => {
    if (weeklyClaimKey === weekKey()) return false;
    setWeeklyClaimKey(weekKey());
    setVouchers((list) => [makeVoucher(WEEKLY_VOUCHER, 'weekly', 7), ...list]);
    return true;
  }, [weeklyClaimKey]);

  const redeemPoints = useCallback(
    (rewardId: string) => {
      const r = REDEEM_CATALOG.find((x) => x.id === rewardId);
      if (!r || points < r.cost) return false;
      setPoints((p) => p - r.cost);
      setVouchers((list) => [makeVoucher(r.voucher, 'points', 30), ...list]);
      return true;
    },
    [points]
  );

  const setOnboarded = useCallback((v: boolean) => setOnboardedState(v), []);

  const submitPartnerApplication = useCallback((app: Omit<PartnerApplication, 'submittedAt' | 'status'>) => {
    setPartnerApplication({ ...app, submittedAt: new Date().toISOString(), status: 'Menunggu verifikasi' });
  }, []);

  const advanceStatus = useCallback(
    (id: string) => {
      const o = orders.find((x) => x.id === id);
      if (!o) return;
      const idx = STATUS_FLOW.indexOf(o.status);
      // Simulasi berhenti di "Menunggu Konfirmasi" — selesai hanya lewat konfirmasi pengguna
      if (idx >= 0 && idx < STATUS_FLOW.indexOf('Menunggu Konfirmasi')) {
        setStatus(id, STATUS_FLOW[idx + 1]);
      }
    },
    [orders, setStatus]
  );

  const cancelOrder = useCallback((id: string) => setStatus(id, 'Dibatalkan'), [setStatus]);

  const submitReview = useCallback((id: string, review: Omit<Review, 'createdAt'>) => {
    setOrders((list) =>
      list.map((o) => (o.id === id ? { ...o, review: { ...review, createdAt: new Date().toISOString() } } : o))
    );
    setPoints((p) => p + POINTS_PER_REVIEW);
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => setUser((u) => ({ ...u, ...patch })), []);

  const loadSampleData = useCallback(() => {
    setOrders(makeSampleOrders());
    setPoints(120);
    setVouchers(sampleVouchers());
    setWeeklyClaimKey(undefined);
  }, []);

  const clearAllData = useCallback(() => {
    setOrders([]);
    setPoints(0);
    setVouchers([]);
    setSubscription(null);
    setWeeklyClaimKey(undefined);
    setPartnerApplication(null);
  }, []);

  const value = useMemo<Store>(
    () => ({
      ready,
      orders,
      points,
      user,
      draft,
      updateDraft,
      resetDraft,
      subscription: isSubActive(subscription) ? subscription : null,
      vouchers,
      weeklyClaimed,
      onboarded,
      partnerApplication,
      placeOrder,
      subscribe,
      cancelSubscription,
      claimWeeklyVoucher,
      redeemPoints,
      setOnboarded,
      submitPartnerApplication,
      setStatus,
      advanceStatus,
      cancelOrder,
      submitReview,
      updateUser,
      loadSampleData,
      clearAllData,
      toast,
      toastMessage,
    }),
    [ready, orders, points, user, draft, updateDraft, resetDraft, subscription, vouchers, weeklyClaimed, onboarded, partnerApplication, subscribe, cancelSubscription, claimWeeklyVoucher, redeemPoints, setOnboarded, submitPartnerApplication, placeOrder, setStatus, advanceStatus, cancelOrder, submitReview, updateUser, loadSampleData, clearAllData, toast, toastMessage]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore harus dipakai di dalam AppStoreProvider');
  return ctx;
}
