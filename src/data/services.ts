import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export type Service = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  example: string;
  startPrice: number;
  icon: IconName;
  color: string; // warna latar ikon
  iconColor: string;
  category: 'Tidur' | 'Tugas' | 'Kegiatan' | 'Janji';
};

// Data layanan (simulasi). Ubah harga / deskripsi sesuai kebutuhan kelompok.
export const SERVICES: Service[] = [
  {
    id: 'wakeup',
    name: 'Wake-up Call',
    shortName: 'Wake-up',
    description: 'Partner menelepon untuk membangunkan kamu',
    example: 'Bangun pukul 05.00 untuk kelas pagi',
    startPrice: 7000,
    icon: 'alarm-outline',
    color: '#FFF0DE',
    iconColor: '#E58A1F',
    category: 'Tidur',
  },
  {
    id: 'task',
    name: 'Reminder Tugas',
    shortName: 'Tugas',
    description: 'Diingatkan untuk mulai/lanjut tugas',
    example: 'Mulai mengerjakan tugas pukul 19.00',
    startPrice: 5000,
    icon: 'document-text-outline',
    color: '#F1ECFC',
    iconColor: '#7656C8',
    category: 'Tugas',
  },
  {
    id: 'deadline',
    name: 'Deadline Reminder',
    shortName: 'Deadline',
    description: 'Diingatkan sebelum tenggat penting',
    example: 'Pengumpulan tugas sebelum pukul 23.59',
    startPrice: 5000,
    icon: 'hourglass-outline',
    color: '#FDE7E7',
    iconColor: '#D9534F',
    category: 'Tugas',
  },
  {
    id: 'daily',
    name: 'Daily Activity',
    shortName: 'Kegiatan',
    description: 'Diingatkan aktivitas rutin harian',
    example: 'Olahraga, rapat, atau belajar',
    startPrice: 5000,
    icon: 'walk-outline',
    color: '#DDF3EA',
    iconColor: '#1F9D6B',
    category: 'Kegiatan',
  },
  {
    id: 'appointment',
    name: 'Appointment Reminder',
    shortName: 'Janji Temu',
    description: 'Diingatkan janji temu atau agenda',
    example: 'Konsultasi, pertemuan, atau acara',
    startPrice: 5000,
    icon: 'calendar-outline',
    color: '#E3F0FD',
    iconColor: '#2D7FD3',
    category: 'Janji',
  },
];

export const SERVICE_FILTERS = ['Semua', 'Tidur', 'Tugas', 'Kegiatan', 'Janji'] as const;

export const getService = (id: string) => SERVICES.find((s) => s.id === id) ?? SERVICES[0];
