import { addDays, toDateKey } from '@/utils/format';

export type OrderStatus =
  | 'Menunggu Partner'
  | 'Partner Ditugaskan'
  | 'Menunggu Waktu Pengingat'
  | 'Sedang Menghubungi'
  | 'Menunggu Konfirmasi'
  | 'Selesai'
  | 'Dibatalkan';

/** Urutan status aktif (untuk simulasi & progress tracker) */
export const STATUS_FLOW: OrderStatus[] = [
  'Menunggu Partner',
  'Partner Ditugaskan',
  'Menunggu Waktu Pengingat',
  'Sedang Menghubungi',
  'Menunggu Konfirmasi',
  'Selesai',
];

export const STATUS_INFO: Record<OrderStatus, string> = {
  'Menunggu Partner': 'Pesanan sudah dibuat dan menunggu partner ditugaskan.',
  'Partner Ditugaskan': 'Partner sudah menerima pesanan kamu.',
  'Menunggu Waktu Pengingat': 'Belum waktunya partner menghubungi kamu.',
  'Sedang Menghubungi': 'Partner sedang mencoba menghubungi kamu.',
  'Menunggu Konfirmasi': 'Partner sudah mengingatkan. Konfirmasi aktivitasmu ya!',
  Selesai: 'Aktivitas/pengingat sudah selesai.',
  Dibatalkan: 'Pesanan dibatalkan sesuai aturan layanan.',
};

export const isActive = (s: OrderStatus) => s !== 'Selesai' && s !== 'Dibatalkan';
/** Pesanan masih boleh dibatalkan sebelum partner mulai menghubungi */
export const canCancel = (s: OrderStatus) =>
  s === 'Menunggu Partner' || s === 'Partner Ditugaskan' || s === 'Menunggu Waktu Pengingat';

export type ContactMethod = 'Telepon' | 'Chat';
export type Repeat = 'Sekali' | 'Setiap hari' | 'Hari kerja' | 'Pilih hari';
export type PaymentMethod = 'QRIS' | 'E-Wallet' | 'Transfer Bank' | 'Kartu Debit/Kredit' | 'Paket Langganan';

/** Rincian harga yang tersimpan di pesanan */
export type PriceDetail = {
  rate: number; // tarif partner per pengingat
  sessions: number; // jumlah pengingat
  coveredByPlan: number; // jumlah pengingat yang dibayar kuota paket
  discount: number; // potongan voucher
  voucherTitle?: string;
};

export type Review = {
  rating: number;
  tags: string[];
  comment: string;
  createdAt: string;
};

export type Order = {
  id: string;
  serviceId: string;
  activity: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  method: ContactMethod;
  note: string;
  repeat: Repeat;
  repeatDays?: number[]; // 0=Min ... 6=Sab (untuk 'Pilih hari')
  occurrences?: string[]; // semua tanggal pengingat (yyyy-mm-dd)
  partnerId: string;
  price: number; // total yang dibayar
  priceDetail?: PriceDetail;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: string;
  history: { status: OrderStatus; at: string }[];
  review?: Review;
};

/** Draft pemesanan (diisi bertahap di alur booking) */
export type Draft = {
  serviceId?: string;
  activity: string;
  date?: string;
  time?: string;
  method: ContactMethod;
  note: string;
  repeat: Repeat;
  repeatDays: number[];
  repeatWeeks: number; // lama pengulangan (minggu)
  partnerId?: string;
};

export const EMPTY_DRAFT: Draft = {
  activity: '',
  method: 'Telepon',
  note: '',
  repeat: 'Sekali',
  repeatDays: [1, 3, 5],
  repeatWeeks: 1,
};

export const REPEAT_LABEL: Record<Repeat, string> = {
  Sekali: 'Sekali',
  'Setiap hari': 'Setiap hari',
  'Hari kerja': 'Hari kerja (Sen–Jum)',
  'Pilih hari': 'Pilih hari',
};

/**
 * Hitung semua tanggal pengingat dari jadwal berulang.
 * Mulai dari tanggal pertama, selama `weeks` minggu.
 */
export function computeOccurrences(startKey: string, repeat: Repeat, repeatDays: number[], weeks: number): string[] {
  if (repeat === 'Sekali') return [startKey];
  const [y, m, d] = startKey.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const out: string[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const dow = day.getDay();
    const match =
      repeat === 'Setiap hari' ||
      (repeat === 'Hari kerja' && dow >= 1 && dow <= 5) ||
      (repeat === 'Pilih hari' && repeatDays.includes(dow));
    if (match) out.push(toDateKey(day));
  }
  return out.length ? out : [startKey];
}

/** Semua tanggal pesanan (pesanan lama tanpa `occurrences` = 1 tanggal) */
export const orderDates = (o: Order) => o.occurrences ?? [o.date];

export const newId = () => 'MND-' + Math.random().toString(36).slice(2, 8).toUpperCase();

/** Data contoh yang dimuat saat aplikasi pertama kali dibuka */
export const makeSampleOrders = (): Order[] => {
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const tomorrow = toDateKey(addDays(now, 1));
  return [
    {
      id: 'MND-A1B2C3',
      serviceId: 'wakeup',
      activity: 'Bangun pagi untuk olahraga',
      date: tomorrow,
      time: '05:00',
      method: 'Telepon',
      note: 'Tolong telepon dua kali jika belum dijawab',
      repeat: 'Sekali',
      partnerId: 'rani',
      price: 5000,
      paymentMethod: 'E-Wallet',
      status: 'Menunggu Waktu Pengingat',
      createdAt: iso(now),
      history: [
        { status: 'Menunggu Partner', at: iso(now) },
        { status: 'Partner Ditugaskan', at: iso(now) },
        { status: 'Menunggu Waktu Pengingat', at: iso(now) },
      ],
    },
    {
      id: 'MND-H7K9P1',
      serviceId: 'task',
      activity: 'Mulai kerjakan laporan bulanan',
      date: toDateKey(addDays(now, -2)),
      time: '19:00',
      method: 'Chat',
      note: '',
      repeat: 'Sekali',
      partnerId: 'dika',
      price: 5000,
      paymentMethod: 'Transfer Bank',
      status: 'Selesai',
      createdAt: iso(addDays(now, -3)),
      history: [{ status: 'Selesai', at: iso(addDays(now, -2)) }],
      review: {
        rating: 5,
        tags: ['Tepat waktu', 'Komunikatif'],
        comment: 'Mantap, jadi nggak nunda lagi!',
        createdAt: iso(addDays(now, -2)),
      },
    },
    {
      id: 'MND-Q4W8E2',
      serviceId: 'appointment',
      activity: 'Janji temu konsultasi kesehatan',
      date: toDateKey(addDays(now, -5)),
      time: '10:00',
      method: 'Telepon',
      note: '',
      repeat: 'Sekali',
      partnerId: 'salsa',
      price: 5000,
      paymentMethod: 'E-Wallet',
      status: 'Dibatalkan',
      createdAt: iso(addDays(now, -6)),
      history: [{ status: 'Dibatalkan', at: iso(addDays(now, -6)) }],
    },
  ];
};
