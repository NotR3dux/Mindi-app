// =====================================================
// PRICING & PAKET LANGGANAN (Level 01–03)
// Semua harga = data simulasi. Ubah di sini sesuai hasil survei.
// =====================================================
import type { IconName } from '@/data/services';

/** Harga 1x pengingat tanpa paket (semua partner sama) */
export const SINGLE_PRICE = 5000;

/** Yang didapat di SETIAP 1x pengingat (berlaku untuk semua layanan) */
export const INCLUDED_PER_REMINDER: string[] = [
  'Partner menghubungi tepat di jam yang kamu pilih',
  'Maks. 3x percobaan telepon (jeda 5 menit) jika belum diangkat',
  'Follow-up chat otomatis kalau telepon tidak terjawab',
  'Percakapan interaktif sesuai SOP Mindi (bukan pesan otomatis)',
  'Konfirmasi aktivitas + ringkasan di aplikasi',
];

export const PRICE_NOTE = 'Rp5.000 per pengingat untuk semua partner. Pakai paket langganan supaya jauh lebih hemat.';

export type Plan = {
  id: string;
  level: string; // "LEVEL 01"
  name: string; // "STARTER"
  tagline: string;
  icon: IconName;
  price: number;
  periodLabel: string; // "minggu" | "bulan" | "3 bulan"
  days: number; // masa aktif
  quota: number; // jumlah pengingat
  compareAt?: number; // harga coret (harga normal tanpa paket ini)
  compareNote?: string; // penjelasan hemat
  badge?: string; // mis. "Best Value"
  services: string[]; // id layanan yang termasuk
  perks: string[];
};

const ALL_SERVICES = ['wakeup', 'task', 'deadline', 'daily', 'appointment'];

export const PLANS: Plan[] = [
  {
    id: 'starter',
    level: 'LEVEL 01',
    name: 'STARTER',
    tagline: 'Mulai bangun kebiasaan disiplin.',
    icon: 'leaf-outline',
    price: 25000,
    periodLabel: 'minggu',
    days: 7,
    quota: 10,
    services: ALL_SERVICES,
    perks: ['Semua jenis layanan pengingat', '10 pengingat per minggu', 'Cocok untuk mencoba'],
  },
  {
    id: 'consistent',
    level: 'LEVEL 02',
    name: 'CONSISTENT',
    tagline: 'Jaga rutinitas dan konsistensi.',
    icon: 'repeat-outline',
    price: 89000,
    periodLabel: 'bulan',
    days: 30,
    quota: 45,
    compareAt: 100000, // 4 minggu x Starter
    compareNote: 'Lebih hemat Rp11.000 dibandingkan Starter selama 4 minggu.',
    services: ALL_SERVICES,
    perks: ['Semua jenis layanan pengingat', '45 pengingat per bulan', 'Prioritas partner favorit', 'Bonus 20 poin setiap minggu'],
  },
  {
    id: 'achiever',
    level: 'LEVEL 03',
    name: 'ACHIEVER',
    tagline: 'Bangun produktivitas jangka panjang.',
    icon: 'trophy-outline',
    price: 229000,
    periodLabel: '3 bulan',
    days: 90,
    quota: 135,
    compareAt: 267000, // 3 x Consistent
    compareNote: 'Lebih hemat Rp38.000 dibandingkan berlangganan bulanan selama 3 bulan.',
    badge: 'Best Value',
    services: ALL_SERVICES,
    perks: ['Semua jenis layanan pengingat', '135 pengingat (3 bulan)', 'Prioritas partner favorit', 'Bonus 20 poin setiap minggu'],
  },
];

export const getPlan = (id: string) => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Harga rata-rata per pengingat dalam paket */
export const perReminder = (plan: Plan) => Math.round(plan.price / plan.quota);

/** Persen hemat dibanding harga coret */
export const savePercent = (plan: Plan) => (plan.compareAt ? Math.round((1 - plan.price / plan.compareAt) * 100) : 0);

/** Langganan aktif milik pengguna */
export type Subscription = {
  planId: string;
  startedAt: string; // ISO
  endsAt: string; // ISO
  quota: number;
  used: number;
};

export const isSubActive = (s: Subscription | null | undefined): s is Subscription =>
  !!s && new Date(s.endsAt).getTime() > Date.now();

export const subRemaining = (s: Subscription | null | undefined) => (isSubActive(s) ? Math.max(0, s.quota - s.used) : 0);
