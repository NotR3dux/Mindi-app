// =====================================================
// REWARD, POIN & VOUCHER (simulasi)
// =====================================================
import type { IconName } from '@/data/services';

export type Voucher = {
  id: string;
  title: string;
  description: string;
  type: 'percent' | 'amount';
  value: number; // persen atau rupiah
  maxDiscount?: number;
  source: 'weekly' | 'points' | 'welcome';
  expiresAt: string; // ISO
  used: boolean;
};

/** Cara mendapat poin */
export const EARN_RULES: { icon: IconName; label: string; points: string }[] = [
  { icon: 'checkmark-circle-outline', label: 'Selesaikan 1 pengingat', points: '+10' },
  { icon: 'star-outline', label: 'Beri rating & ulasan', points: '+5' },
  { icon: 'ribbon-outline', label: 'Langganan paket (per minggu)', points: '+20' },
];

/** Katalog tukar poin */
export const REDEEM_CATALOG: { id: string; title: string; cost: number; voucher: Omit<Voucher, 'id' | 'expiresAt' | 'used' | 'source'> }[] = [
  {
    id: 'r-2000',
    title: 'Potongan Rp2.000',
    cost: 100,
    voucher: { title: 'Potongan Rp2.000', description: 'Hasil tukar 100 poin', type: 'amount', value: 2000 },
  },
  {
    id: 'r-free',
    title: 'Gratis 1x pengingat',
    cost: 250,
    voucher: { title: 'Gratis 1 pengingat', description: 'Potongan Rp5.000 (1 pengingat)', type: 'amount', value: 5000 },
  },
];

/** Voucher mingguan — bisa diklaim 1x per minggu */
export const WEEKLY_VOUCHER: Omit<Voucher, 'id' | 'expiresAt' | 'used' | 'source'> = {
  title: 'Voucher Mingguan 20%',
  description: 'Diskon 20% (maks. Rp3.000) untuk 1 pesanan',
  type: 'percent',
  value: 20,
  maxDiscount: 3000,
};

/** Level & keuntungannya */
export const TIERS: { name: string; minPoints: number; icon: IconName; color: string; benefit: string }[] = [
  { name: 'Pemula', minPoints: 0, icon: 'star', color: '#E5A50A', benefit: 'Voucher mingguan 20%' },
  { name: 'Disiplin', minPoints: 150, icon: 'ribbon', color: '#7656C8', benefit: 'Voucher mingguan + prioritas partner rating 4,8+' },
  { name: 'Juara', minPoints: 300, icon: 'trophy', color: '#E58A1F', benefit: 'Gratis 1 pengingat tiap bulan' },
  { name: 'Legenda', minPoints: 500, icon: 'shield-checkmark', color: '#2D7FD3', benefit: 'Diskon paket 10% + badge eksklusif' },
];

export const tierFor = (points: number) => [...TIERS].reverse().find((t) => points >= t.minPoints) ?? TIERS[0];
export const nextTier = (points: number) => TIERS.find((t) => t.minPoints > points);

/** ID minggu (mis. "2026-W48") untuk membatasi klaim 1x/minggu */
export const weekKey = (d = new Date()) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
};

export const voucherDiscount = (v: Voucher, amount: number) => {
  const raw = v.type === 'percent' ? Math.round((amount * v.value) / 100) : v.value;
  return Math.min(raw, v.maxDiscount ?? raw, amount);
};

export const isVoucherValid = (v: Voucher) => !v.used && new Date(v.expiresAt).getTime() > Date.now();
