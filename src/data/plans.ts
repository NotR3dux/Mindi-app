// =====================================================
// PRICING, PAKET (BUNDLING) & LANGGANAN
// Semua harga = data simulasi. Ubah di sini sesuai hasil survei.
// =====================================================
import type { IconName } from '@/data/services';

/** Yang didapat di SETIAP 1x pengingat (berlaku untuk semua layanan) */
export const INCLUDED_PER_REMINDER: string[] = [
  'Partner menghubungi tepat di jam yang kamu pilih',
  'Maks. 3x percobaan telepon (jeda 5 menit) jika belum diangkat',
  'Follow-up chat otomatis kalau telepon tidak terjawab',
  'Percakapan interaktif sesuai SOP Mindi (bukan pesan otomatis)',
  'Konfirmasi aktivitas + ringkasan di aplikasi',
];

/** Penjelasan kenapa harga partner berbeda */
export const PRICE_NOTE =
  'Harga per pengingat Rp5.000–Rp7.000 tergantung pengalaman & rating partner. Pakai paket supaya jauh lebih hemat.';

export type PlanPeriod = 'weekly' | 'monthly';

export type Plan = {
  id: string;
  name: string;
  audience: string;
  icon: IconName;
  color: string;
  services: string[]; // id layanan yang termasuk
  prices: Record<PlanPeriod, { price: number; quota: number }>;
  perks: string[];
};

export const PLANS: Plan[] = [
  {
    id: 'student',
    name: 'Paket Pelajar',
    audience: 'Untuk mahasiswa & pelajar',
    icon: 'school-outline',
    color: '#E3F0FD',
    services: ['wakeup', 'task'],
    prices: {
      weekly: { price: 29000, quota: 10 },
      monthly: { price: 99000, quota: 45 },
    },
    perks: ['Wake-up Call + Reminder Tugas', 'Prioritas partner favorit', 'Bonus +20 poin tiap minggu'],
  },
  {
    id: 'employee',
    name: 'Paket Pekerja',
    audience: 'Untuk pekerja & fresh graduate',
    icon: 'briefcase-outline',
    color: '#FFF0DE',
    services: ['wakeup', 'deadline', 'appointment'],
    prices: {
      weekly: { price: 39000, quota: 10 },
      monthly: { price: 139000, quota: 45 },
    },
    perks: ['Wake-up Call + Deadline + Appointment', 'Bisa pilih partner bilingual', 'Bonus +20 poin tiap minggu'],
  },
];

export const PERIOD_LABEL: Record<PlanPeriod, string> = { weekly: 'Mingguan', monthly: 'Bulanan' };
export const PERIOD_DAYS: Record<PlanPeriod, number> = { weekly: 7, monthly: 30 };

export const getPlan = (id: string) => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Harga rata-rata per pengingat dalam paket (untuk label "hemat") */
export const perReminder = (plan: Plan, period: PlanPeriod) =>
  Math.round(plan.prices[period].price / plan.prices[period].quota);

/** Langganan aktif milik pengguna */
export type Subscription = {
  planId: string;
  period: PlanPeriod;
  startedAt: string; // ISO
  endsAt: string; // ISO
  quota: number;
  used: number;
};

export const isSubActive = (s: Subscription | null | undefined): s is Subscription =>
  !!s && new Date(s.endsAt).getTime() > Date.now();

export const subRemaining = (s: Subscription | null | undefined) => (isSubActive(s) ? Math.max(0, s.quota - s.used) : 0);
