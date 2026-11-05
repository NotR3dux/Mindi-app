import { router, type Href } from 'expo-router';

/**
 * Kembali ke Beranda dengan aman.
 * dismissAll() hanya dipanggil jika memang ada layar yang bisa ditutup
 * (mencegah error "POP_TO_TOP was not handled by any navigator", mis. setelah reload di web).
 */
export function resetToHome() {
  if (router.canDismiss()) {
    router.dismissAll();
    router.navigate('/');
  } else {
    router.replace('/');
  }
}

/** Kembali ke Beranda lalu buka halaman tertentu (mis. detail pesanan atau Riwayat). */
export function resetTo(href: Href) {
  resetToHome();
  router.push(href);
}
