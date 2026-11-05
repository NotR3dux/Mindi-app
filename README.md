# Mindi — More than a reminder.

Prototype aplikasi mobile **Mindi**: platform pemesanan jasa pengingat yang menghubungkan pengguna dengan
_reminder partner_ (orang sungguhan). Dibangun dengan **Expo (React Native) + TypeScript + Expo Router**,
sehingga bisa diedit di VS Code, dicoba langsung di HP lewat Expo Go, dan diekspor menjadi **APK**.

> Semua pembayaran, telepon, chat, dan status partner adalah **simulasi** untuk keperluan demo.

---

## 1. Persiapan (sekali saja)

1. Install **Node.js LTS** (sudah terpasang: `node -v`).
2. Buka folder ini di VS Code: `File → Open Folder… → mindi-app`.
3. Install ekstensi yang direkomendasikan (VS Code akan menawarkan otomatis).
4. Di terminal VS Code (`Ctrl + ~`):

```bash
npm install
```

## 2. Menjalankan aplikasi

```bash
npx expo start
```

- **Di HP (paling cepat):** install aplikasi **Expo Go** dari Play Store, lalu scan QR code yang muncul di terminal.
  HP dan laptop harus berada di Wi-Fi yang sama. Setiap kali file disimpan, aplikasi di HP langsung ter-update.
- **Di browser:** tekan `w` di terminal (atau `npm run web`). Tampilan dibuat selebar HP.
- **Di emulator Android:** buka emulator dari Android Studio, lalu tekan `a`.

## 3. Struktur folder — apa yang diubah di mana

```
src/
├─ app/                      ← SETIAP FILE = 1 HALAMAN (Expo Router)
│  ├─ _layout.tsx            Root: font Poppins, penyimpanan data, toast
│  ├─ (tabs)/                Navigasi bawah
│  │  ├─ index.tsx           Beranda (Home)
│  │  ├─ orders.tsx          Pesanan aktif
│  │  ├─ history.tsx         Riwayat + Pesan Ulang + Beri Rating
│  │  └─ profile.tsx         Profil, poin & badge, pengaturan, alat demo
│  ├─ booking/
│  │  ├─ services.tsx        1. Pilih Layanan
│  │  ├─ details.tsx         2. Detail Pengingat (validasi form)
│  │  ├─ partners.tsx        3. Pilih Reminder Partner
│  │  ├─ summary.tsx         4. Ringkasan & Pembayaran (simulasi)
│  │  └─ success.tsx         Pesanan Berhasil!
│  ├─ order/[id].tsx         Pesanan Aktif: status, simulasi, konfirmasi "Ya, Sudah"
│  ├─ order/rate/[id].tsx    Rating & Review
│  ├─ call/[id].tsx          Layar telepon simulasi (panggilan masuk → sedang menelepon)
│  ├─ chat/[id].tsx          Layar chat simulasi (pesan partner + balasan cepat)
│  ├─ assistant.tsx          AI Assistant (konsep, rekomendasi kata kunci)
│  ├─ notifications.tsx      Notifikasi (dari riwayat status)
│  └─ help.tsx               Pusat Bantuan, Keamanan & Privasi
├─ components/               Komponen UI yang dipakai ulang (Button, Card, Chip, Mascot, dst.)
├─ constants/theme.ts        ★ WARNA, FONT, RADIUS — ubah di sini untuk mengganti tampilan
├─ data/
│  ├─ services.ts            ★ Daftar layanan & harga mulai
│  ├─ partners.ts            ★ Data partner fiktif (nama, rating, tarif, ketersediaan)
│  └─ orders.ts              Status pesanan, tipe data, data contoh awal
├─ store/AppStore.tsx        Logika: buat pesanan, ubah status, poin, simpan lokal
└─ utils/format.ts           Format Rupiah, tanggal, jam
assets/                      Ikon aplikasi & splash screen
app.json                     Nama aplikasi, package Android (com.mindi.app), ikon
```

Contoh perubahan cepat:

| Ingin mengubah…            | Buka file                    |
| -------------------------- | ---------------------------- |
| Warna utama / font         | `src/constants/theme.ts`     |
| Harga / nama layanan       | `src/data/services.ts`       |
| Partner (nama, tarif)      | `src/data/partners.ts`       |
| Nama pengguna contoh       | `src/store/AppStore.tsx` (`DEFAULT_USER`) |
| Teks di halaman tertentu   | file halaman di `src/app/…`  |
| Nama aplikasi / ikon       | `app.json` & folder `assets/`|

## 4. Alur demo (sesuai brief)

Beranda → **Pesan Reminder** → Pilih Layanan → Detail Pengingat → Pilih Partner → Ringkasan & Bayar →
Pesanan Berhasil → Pesanan Aktif → (panel **Lanjutkan Status (Demo)**) → partner "menghubungi" →
**Ya, Sudah** → Rating → Riwayat (Selesai).

Tips presentasi:
- Pesanan baru otomatis berubah _Menunggu Partner → Partner Ditugaskan → Menunggu Waktu Pengingat_ dalam ±6 detik.
- Tombol **Lanjutkan Status (Demo)** di halaman pesanan memajukan status berikutnya.
- Saat status menjadi **Sedang Menghubungi** (metode Telepon), layar panggilan masuk penuh muncul otomatis:
  **Terima** → layar sedang menelepon (timer, bisukan, speaker) → **Akhiri** → status _Menunggu Konfirmasi_.
  **Tolak** → kembali ke pesanan; tombol telepon hijau di kartu pesanan membuka layar panggilan lagi.
- Untuk metode **Chat**, layar chat penuh muncul: partner mengirim pesan pengingat, kamu bisa membalas
  (balasan cepat atau ketik sendiri), lalu **Selesai chat & konfirmasi aktivitas**.
- **Profil → Alat demo**: "Kosongkan data" untuk menunjukkan _empty state_, "Muat data contoh" untuk mengembalikan data.
- Data tersimpan di perangkat (AsyncStorage), jadi tetap ada saat aplikasi ditutup.

## 5. Export ke APK

### Opsi A — EAS Build (cloud, paling mudah, tidak perlu setting Android Studio)

1. Buat akun gratis di https://expo.dev
2. Jalankan:

```bash
npx eas-cli@latest login
```

```bash
npm run build:apk:eas
```

3. Tunggu ±10–15 menit; link download **.apk** akan muncul di terminal dan di dashboard expo.dev.
   Konfigurasi ada di `eas.json` (profil `preview` = APK).

### Opsi B — Build lokal di laptop (memakai Android Studio yang sudah terpasang)

Set environment variable (sekali saja) di PowerShell, lalu buka ulang VS Code:

```powershell
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk"
```

Pastikan **NDK versi 28.2.13676358** terpasang: Android Studio → _Settings → Languages & Frameworks →
Android SDK → SDK Tools_ → centang **Show Package Details** → **NDK (Side by side) 28.2.13676358** → Apply.
(Tanpa ini build gagal dengan pesan `NDK not configured`.)

**Batas panjang path Windows (penting):** build native butuh path pendek & CMake 4.1.2.
Yang sudah terbukti berhasil di laptop ini:

1. Salin project ke folder pendek (tanpa folder `android`), mis. `D:\mb`:
   `robocopy "D:\Collage\prototype sin\mindi-app" D:\mb /E /XD "D:\Collage\prototype sin\mindi-app\android"`
2. Di `D:\mb` jalankan `npx expo prebuild --platform android --clean`
3. Buat file `D:\mb\android\local.properties` berisi:
   ```
   sdk.dir=C:/Users/Lenovo/AppData/Local/Android/Sdk
   cmake.dir=C:/Users/Lenovo/AppData/Local/Android/Sdk/cmake/4.1.2
   ```
4. Di `D:\mb\android`: `gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a`

Tips: set `GRADLE_USER_HOME=D:\AndroidBuild\gradle-home` dan `TEMP=D:\AndroidBuild\tmp` agar cache tidak memenuhi drive C.

Hasil APK: `D:\mb\android\app\build\outputs\apk\release\app-release.apk` → kirim ke HP dan install
(izinkan "Install dari sumber tidak dikenal"). APK terbaru juga sudah disalin ke `D:\Collage\prototype sin\Mindi.apk`.

> Catatan: folder `android/` dibuat otomatis oleh `expo prebuild` — **jangan diedit manual**;
> ubah `app.json` lalu build ulang. APK lokal ini ditandatangani dengan _debug key_, cukup untuk demo
> dan instal langsung. Untuk upload ke Play Store, gunakan `eas build -p android --profile production`
> (menghasilkan .aab dengan keystore resmi).

## 6. Perintah berguna

```bash
npm run typecheck      # cek error TypeScript
npx expo-doctor        # cek konfigurasi & versi paket
npx expo install <paket>   # tambah library (otomatis versi yang cocok)
```

## 7. Versi iPhone (web app — "Add to Home Screen")

File `.apk` tidak bisa dipasang di iPhone. Untuk iPhone, Mindi dibagikan sebagai **web app**: satu link yang
dibuka di Safari lalu ditambahkan ke Home Screen sehingga tampil layar penuh dengan ikon Mindi.

**Build:**

```bash
npm run build:web
```

Hasilnya ada di folder `dist/` (sudah berisi ikon iPhone, `manifest.json`, `_redirects` untuk Netlify,
dan `vercel.json` di root untuk Vercel).

**Online-kan (pilih salah satu, gratis):**
- **Netlify Drop (paling mudah):** buka https://app.netlify.com/drop, login, lalu seret folder `dist` ke halaman itu.
- **Vercel:** `npx vercel` dari folder project (login di browser saat diminta), lalu `npx vercel --prod`.

**Cara pakai di iPhone (kirim ke teman):**
1. Buka link di **Safari** (bukan Chrome).
2. Tekan tombol **Share** (kotak dengan panah ke atas) → **Add to Home Screen** → **Add**.
3. Buka **Mindi** dari Home Screen — tampil layar penuh seperti aplikasi.

Catatan: data tersimpan di browser HP masing-masing. Setiap kali kode diubah, jalankan `npm run build:web`
lalu upload ulang folder `dist` (link tetap sama jika memakai project Netlify/Vercel yang sama).
