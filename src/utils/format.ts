const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID').replace(/,/g, '.');

/** yyyy-mm-dd (zona waktu lokal) */
export const toDateKey = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const fromDateKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/** "Selasa, 15 Apr 2025" */
export const formatDateLong = (key: string) => {
  const d = fromDateKey(key);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

/** "Rab, 15 Apr" */
export const formatDateShort = (key: string) => {
  const d = fromDateKey(key);
  return `${DAYS_SHORT[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

export const dayShort = (d: Date) => DAYS_SHORT[d.getDay()];
export const monthShort = (d: Date) => MONTHS[d.getMonth()];

/** "05:00" -> "05.00 WIB" */
export const formatTime = (t: string) => `${t.replace(':', '.')} WIB`;

export const relativeDayLabel = (key: string) => {
  const today = toDateKey(new Date());
  const tomorrow = toDateKey(addDays(new Date(), 1));
  if (key === today) return 'Hari ini';
  if (key === tomorrow) return 'Besok';
  return formatDateShort(key);
};

export const scheduleDate = (dateKey: string, time: string) => {
  const d = fromDateKey(dateKey);
  const [h, m] = time.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
};
