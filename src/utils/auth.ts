// Helper akun untuk PROTOTYPE. Semua data akun hanya disimpan di perangkat.
// Aplikasi sungguhan harus memakai server + hashing password yang aman (mis. bcrypt/argon2).

export type Account = {
  id: string;
  name: string;
  email: string;
  phone: string;
  passHash: string;
  createdAt: string;
};

/** Hash sederhana (bukan kriptografi aman) — cukup agar password tidak tersimpan sebagai teks biasa di demo */
export function hashPassword(password: string, salt: string) {
  const input = `${salt}::${password}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x1b873593;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619);
    h2 = Math.imul(h2 ^ c, 2246822519);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

export const normalizeEmail = (e: string) => e.trim().toLowerCase();
export const normalizePhone = (p: string) => p.replace(/[^\d+]/g, '').replace(/^\+62/, '0').replace(/^62/, '0');

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export const isValidPhone = (p: string) => /^08\d{8,11}$/.test(normalizePhone(p));

/** Kekuatan password: 0 = lemah … 3 = kuat */
export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/** Akun demo untuk presentasi (data contoh Sabrina) */
export const DEMO_ACCOUNT_ID = 'demo-sabrina';
export const DEMO_EMAIL = 'sabrina@contoh.id';
export const DEMO_PASSWORD = 'demo1234';
