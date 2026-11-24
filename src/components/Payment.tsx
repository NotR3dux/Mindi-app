// Pilihan metode pembayaran + modal QRIS (SIMULASI — tidak ada transaksi sungguhan).
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { QRCode } from '@/components/QRCode';
import { Button, DemoBadge, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { PaymentMethod } from '@/data/orders';
import type { IconName } from '@/data/services';
import { formatRupiah } from '@/utils/format';

export const PAYMENTS: { value: PaymentMethod; icon: IconName; desc: string; badge?: string }[] = [
  { value: 'QRIS', icon: 'qr-code-outline', desc: 'Scan pakai e-wallet / m-banking apa saja', badge: 'Paling mudah' },
  { value: 'E-Wallet', icon: 'wallet-outline', desc: 'GoPay, OVO, DANA (simulasi)' },
  { value: 'Transfer Bank', icon: 'business-outline', desc: 'Virtual account (simulasi)' },
  { value: 'Kartu Debit/Kredit', icon: 'card-outline', desc: 'Visa / Mastercard (simulasi)' },
];

export function PaymentPicker({ value, onChange }: { value: PaymentMethod; onChange: (v: PaymentMethod) => void }) {
  return (
    <View>
      {PAYMENTS.map((p) => {
        const selected = value === p.value;
        return (
          <Pressable
            key={p.value}
            style={[styles.option, selected && styles.optionSelected]}
            onPress={() => onChange(p.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
          >
            <Ionicons name={p.icon} size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <T variant="bodyBold">{p.value}</T>
                {p.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{p.badge}</Text>
                  </View>
                )}
              </View>
              <T variant="caption">{p.desc}</T>
            </View>
            <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
          </Pressable>
        );
      })}
    </View>
  );
}

/** Modal QRIS: tampilkan QR + hitung mundur, lalu tombol "Saya sudah bayar" (simulasi) */
export function QrisModal({
  visible,
  amount,
  reference,
  onPaid,
  onClose,
}: {
  visible: boolean;
  amount: number;
  reference: string;
  onPaid: () => void;
  onClose: () => void;
}) {
  const [seconds, setSeconds] = useState(300);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSeconds(300);
    setChecking(false);
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [visible]);

  const paid = () => {
    setChecking(true);
    setTimeout(onPaid, 1200);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  // Isi QR hanya teks demo (bukan QRIS sungguhan)
  const payload = `MINDI-DEMO|${reference}|${amount}|BUKAN-QRIS-ASLI`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <T variant="h3">Bayar dengan QRIS</T>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Tutup">
              <Ionicons name="close" size={24} color={colors.deep} />
            </Pressable>
          </View>
          <DemoBadge text="Simulasi · QR tidak bisa dipakai bayar sungguhan" />

          <View style={styles.qrBox}>
            <Text style={styles.qrisLogo}>QRIS</Text>
            <QRCode value={payload} size={200} />
            <Text style={styles.merchant}>MINDI · Jasa Pengingat</Text>
          </View>

          <View style={styles.amountRow}>
            <T variant="small">Total bayar</T>
            <T variant="h2" style={{ color: colors.primary }}>
              {formatRupiah(amount)}
            </T>
          </View>
          <View style={styles.timer}>
            <Ionicons name="time-outline" size={15} color={colors.orangeText} />
            <Text style={styles.timerText}>
              Selesaikan dalam {mm}:{ss}
            </Text>
          </View>

          <View style={styles.steps}>
            {['Buka e-wallet / m-banking', 'Pilih menu Scan / QRIS', 'Scan kode di atas & konfirmasi'].map((s, i) => (
              <T key={s} variant="small">
                {i + 1}. {s}
              </T>
            ))}
          </View>

          <Button title="Saya sudah bayar" icon="checkmark-circle-outline" loading={checking} onPress={paid} disabled={seconds === 0} />
          {seconds === 0 && (
            <T variant="caption" style={{ textAlign: 'center', marginTop: 6, color: colors.redText }}>
              Waktu habis, tutup & coba lagi.
            </T>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.lavender },
  badge: { backgroundColor: colors.mint, borderRadius: radius.pill, paddingHorizontal: 7, paddingVertical: 1 },
  badgeText: { fontFamily: fonts.semibold, fontSize: 10, color: colors.mintText },
  backdrop: { flex: 1, backgroundColor: 'rgba(30,18,55,0.45)', justifyContent: 'flex-end', alignItems: 'center' },
  sheet: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.md,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qrBox: {
    alignSelf: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  qrisLogo: { fontFamily: fonts.bold, fontSize: 18, color: '#D7263D', letterSpacing: 2 },
  merchant: { fontFamily: fonts.semibold, fontSize: 12, color: colors.deep },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  timerText: { fontFamily: fonts.semibold, fontSize: 12.5, color: colors.orangeText },
  steps: { backgroundColor: colors.offWhite, borderRadius: radius.md, padding: spacing.md, gap: 2 },
});
