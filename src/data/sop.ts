// =====================================================
// SOP REMINDER PARTNER
// Panduan apa yang ditanyakan & disampaikan partner.
// Dipakai di halaman SOP, layar telepon & chat interaktif.
// =====================================================
import type { IconName } from '@/data/services';

export type SopStep = { title: string; icon: IconName; say: string; tip: string };

export const SOP_STEPS: SopStep[] = [
  {
    title: '1. Pembukaan',
    icon: 'hand-left-outline',
    say: '“Halo, selamat pagi! Saya Rani dari Mindi. Benar dengan Kak Sabrina?”',
    tip: 'Salam, perkenalan, verifikasi nama pelanggan.',
  },
  {
    title: '2. Sampaikan pengingat',
    icon: 'notifications-outline',
    say: '“Sesuai jadwal, sekarang waktunya: bangun untuk kelas pagi.”',
    tip: 'Sebutkan aktivitas, jam, dan catatan dari pelanggan.',
  },
  {
    title: '3. Cek kesiapan',
    icon: 'help-circle-outline',
    say: '“Sudah siap mulai? Atau butuh 5 menit lagi?”',
    tip: 'Tanya kondisi & kesiapan. Tawarkan snooze maks. 2x.',
  },
  {
    title: '4. Pertanyaan sesuai layanan',
    icon: 'chatbubbles-outline',
    say: '“Apa target kecil untuk 30 menit pertama?”',
    tip: 'Gunakan pertanyaan khusus layanan (lihat daftar di bawah).',
  },
  {
    title: '5. Dorongan & follow-up',
    icon: 'heart-outline',
    say: '“Semangat! Mau aku cek lagi 30 menit lagi?”',
    tip: 'Beri semangat singkat, tawarkan check-in lanjutan.',
  },
  {
    title: '6. Penutup',
    icon: 'checkmark-done-outline',
    say: '“Jangan lupa konfirmasi di aplikasi ya. Terima kasih!”',
    tip: 'Minta konfirmasi aktivitas di aplikasi, tutup dengan sopan.',
  },
];

export const SOP_RULES: string[] = [
  'Hubungi hanya di jadwal & lewat metode yang dipilih pelanggan.',
  'Telepon maks. 3x (jeda 5 menit). Tidak diangkat → kirim chat follow-up.',
  'Tidak meminta data pribadi, password, atau OTP.',
  'Tidak memberi saran medis (pengingat obat hanya menyampaikan jadwal).',
  'Bahasa sopan, singkat, dan menyemangati — durasi ideal 1–3 menit.',
];

/** Pertanyaan khusus per layanan (dipakai juga oleh chat interaktif) */
export const SERVICE_QUESTIONS: Record<string, { question: string; options: string[]; responses: Record<string, string> }> = {
  wakeup: {
    question: 'Sudah duduk dari kasur? Coba minum air putih dulu ya 💧',
    options: ['Sudah duduk ✅', 'Masih ngantuk 😴', 'Sudah cuci muka 🚿'],
    responses: {
      'Sudah duduk ✅': 'Mantap! Langkah berikutnya: buka jendela biar kena cahaya ☀️',
      'Masih ngantuk 😴': 'Wajar kok! Coba berdiri & stretching 30 detik, aku tunggu ya 🙆',
      'Sudah cuci muka 🚿': 'Keren, kamu udah selangkah lebih maju dari kebanyakan orang pagi ini 💪',
    },
  },
  task: {
    question: 'Apa target kecil untuk 30 menit pertama?',
    options: ['Kerjakan pendahuluan', 'Cari referensi', 'Selesaikan soal 1–3'],
    responses: {
      'Kerjakan pendahuluan': 'Oke! Fokus pendahuluan dulu, matikan notifikasi HP 30 menit ya 📵',
      'Cari referensi': 'Sip, batasi cari referensi 30 menit biar nggak kebablasan scrolling 😄',
      'Selesaikan soal 1–3': 'Target yang jelas! Kerjakan satu per satu ya ✍️',
    },
  },
  deadline: {
    question: 'Progres tugasnya sudah berapa persen?',
    options: ['Belum 50%', '50–80%', 'Hampir selesai'],
    responses: {
      'Belum 50%': 'Masih ada waktu! Kerjakan bagian terpenting dulu, rapikan belakangan 🎯',
      '50–80%': 'Sudah setengah jalan! Sisihkan 10 menit terakhir untuk cek ulang ✅',
      'Hampir selesai': 'Tinggal finishing! Jangan lupa submit sebelum tenggat ya ⏰',
    },
  },
  daily: {
    question: 'Siap mulai aktivitasnya sekarang?',
    options: ['Mulai sekarang', 'Siapkan alat dulu', 'Butuh motivasi'],
    responses: {
      'Mulai sekarang': 'Yeay! Konsisten kecil tiap hari itu kuncinya 🌱',
      'Siapkan alat dulu': 'Oke, 5 menit siap-siap ya, habis itu langsung mulai 👟',
      'Butuh motivasi': '“Mulai saja dulu, semangat akan menyusul.” Kamu pasti bisa 💜',
    },
  },
  appointment: {
    question: 'Berkas & perlengkapan sudah disiapkan?',
    options: ['Sudah siap', 'Belum, lagi siapin', 'Sudah berangkat'],
    responses: {
      'Sudah siap': 'Bagus! Cek lagi lokasi & estimasi perjalanan ya 🗺️',
      'Belum, lagi siapin': 'Siapkan yang penting dulu: identitas, berkas, HP terisi daya 🔋',
      'Sudah berangkat': 'Hati-hati di jalan, semoga lancar janjiannya! 🚗',
    },
  },
};
