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
import { getPartner } from '@/data/partners';

// Penyimpanan lokal (prototype) — data hilang jika aplikasi di-uninstall.
const STORAGE_KEY = 'mindi:data:v1';
const POINTS_PER_ORDER = 10;
const POINTS_PER_REVIEW = 5;

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

type Persisted = { orders: Order[]; points: number; user: UserProfile };

type Store = {
  ready: boolean;
  orders: Order[];
  points: number;
  user: UserProfile;
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  resetDraft: (initial?: Partial<Draft>) => void;
  placeOrder: (payment: PaymentMethod) => Order;
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
        } else {
          setOrders(makeSampleOrders());
          setPoints(120);
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
    const data: Persisted = { orders, points, user };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [orders, points, user, ready]);

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
    (payment: PaymentMethod) => {
      const now = new Date().toISOString();
      const partner = getPartner(draft.partnerId!);
      const order: Order = {
        id: newId(),
        serviceId: draft.serviceId!,
        activity: draft.activity.trim(),
        date: draft.date!,
        time: draft.time!,
        method: draft.method,
        note: draft.note.trim(),
        repeat: draft.repeat,
        partnerId: partner.id,
        price: partner.rate,
        paymentMethod: payment,
        status: 'Menunggu Partner',
        createdAt: now,
        history: [{ status: 'Menunggu Partner', at: now }],
      };
      setOrders((list) => [order, ...list]);
      // Simulasi: partner menerima pesanan beberapa detik kemudian
      setTimeout(() => transition(order.id, 'Partner Ditugaskan', 'Menunggu Partner'), 3000);
      setTimeout(() => transition(order.id, 'Menunggu Waktu Pengingat', 'Partner Ditugaskan'), 6000);
      return order;
    },
    [draft, transition]
  );

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
  }, []);

  const clearAllData = useCallback(() => {
    setOrders([]);
    setPoints(0);
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
      placeOrder,
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
    [ready, orders, points, user, draft, updateDraft, resetDraft, placeOrder, setStatus, advanceStatus, cancelOrder, submitReview, updateUser, loadSampleData, clearAllData, toast, toastMessage]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore harus dipakai di dalam AppStoreProvider');
  return ctx;
}
