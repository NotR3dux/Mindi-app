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
export type Repeat = 'Sekali' | 'Setiap hari' | 'Hari kerja';
export type PaymentMethod = 'E-Wallet' | 'Transfer Bank' | 'Kartu Debit/Kredit';

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
  partnerId: string;
  price: number;
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
  partnerId?: string;
};

export const EMPTY_DRAFT: Draft = {
  activity: '',
  method: 'Telepon',
  note: '',
  repeat: 'Sekali',
};

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
      activity: 'Bangunkan saya untuk kelas pagi',
      date: tomorrow,
      time: '05:00',
      method: 'Telepon',
      note: 'Tolong telepon dua kali jika belum dijawab',
      repeat: 'Sekali',
      partnerId: 'rani',
      price: 7000,
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
      activity: 'Mulai kerjakan laporan praktikum',
      date: toDateKey(addDays(now, -2)),
      time: '19:00',
      method: 'Chat',
      note: '',
      repeat: 'Sekali',
      partnerId: 'dika',
      price: 6000,
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
      activity: 'Konsultasi dengan dosen pembimbing',
      date: toDateKey(addDays(now, -5)),
      time: '10:00',
      method: 'Telepon',
      note: '',
      repeat: 'Sekali',
      partnerId: 'salsa',
      price: 7000,
      paymentMethod: 'E-Wallet',
      status: 'Dibatalkan',
      createdAt: iso(addDays(now, -6)),
      history: [{ status: 'Dibatalkan', at: iso(addDays(now, -6)) }],
    },
  ];
};
