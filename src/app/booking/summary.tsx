import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { Avatar, Button, Card, DemoBadge, InfoRow, ScreenHeader, Steps, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import type { PaymentMethod } from '@/data/orders';
import { getPartner } from '@/data/partners';
import { getService, type IconName } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatDateLong, formatRupiah, formatTime } from '@/utils/format';

const PAYMENTS: { value: PaymentMethod; icon: IconName; desc: string }[] = [
  { value: 'E-Wallet', icon: 'wallet-outline', desc: 'GoPay, OVO, DANA (simulasi)' },
  { value: 'Transfer Bank', icon: 'business-outline', desc: 'Virtual account (simulasi)' },
  { value: 'Kartu Debit/Kredit', icon: 'card-outline', desc: 'Visa / Mastercard (simulasi)' },
];

export default function SummaryScreen() {
  const { draft, placeOrder } = useStore();
  const [payment, setPayment] = useState<PaymentMethod>('E-Wallet');
  const [agreed, setAgreed] = useState(false);
  const [showAgreeError, setShowAgreeError] = useState(false);
  const [paying, setPaying] = useState(false);

  if (!draft.serviceId || !draft.partnerId || !draft.date || !draft.time) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader title="Konfirmasi Pesanan" />
        <EmptyState title="Data pesanan belum lengkap" message="Silakan mulai pemesanan dari awal." actionLabel="Pesan Reminder" onAction={() => router.replace('/booking/services')} />
      </SafeAreaView>
    );
  }

  const service = getService(draft.serviceId);
  const partner = getPartner(draft.partnerId);
  const fee = partner.rate;
  const platformFee = 0;
  const total = fee + platformFee;

  const pay = () => {
    if (!agreed) {
      setShowAgreeError(true);
      return;
    }
    setPaying(true);
    // Simulasi proses pembayaran — tidak ada transaksi sungguhan
    setTimeout(() => {
      const order = placeOrder(payment);
      setPaying(false);
      router.replace({ pathname: '/booking/success', params: { id: order.id } });
    }, 1200);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title="Konfirmasi Pesanan" />
      <Steps current={4} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Partner */}
        <Card style={styles.partner}>
          <Avatar initials={partner.initials} color={partner.avatarColor} size={52} />
          <View style={{ flex: 1 }}>
            <T variant="caption">Reminder Partner</T>
            <T variant="h3">{partner.name}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Ionicons name="star" size={13} color={colors.star} />
              <T variant="small">
                {partner.rating.toFixed(1).replace('.', ',')} ({partner.completed} pesanan)
              </T>
            </View>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.link}>Ganti</Text>
          </Pressable>
        </Card>

        {/* Detail */}
        <Card style={{ marginTop: spacing.md }}>
          <T variant="h3" style={{ marginBottom: 4 }}>
            Detail Pengingat
          </T>
          <InfoRow icon={service.icon} label="Layanan" value={service.name} />
          <InfoRow icon="flag-outline" label="Aktivitas" value={draft.activity} />
          <InfoRow icon="calendar-outline" label="Tanggal" value={formatDateLong(draft.date)} />
          <InfoRow icon="time-outline" label="Waktu" value={formatTime(draft.time)} />
          <InfoRow icon={draft.method === 'Telepon' ? 'call-outline' : 'chatbubble-outline'} label="Metode" value={draft.method} />
          <InfoRow icon="repeat-outline" label="Pengulangan" value={draft.repeat} />
          {!!draft.note.trim() && <InfoRow icon="document-text-outline" label="Catatan" value={draft.note} />}
        </Card>

        {/* Pembayaran */}
        <View style={styles.payHeader}>
          <T variant="h3">Metode Pembayaran</T>
          <DemoBadge />
        </View>
        {PAYMENTS.map((p) => {
          const selected = payment === p.value;
          return (
            <Pressable
              key={p.value}
              style={[styles.payOption, selected && styles.payOptionSelected]}
              onPress={() => setPayment(p.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
            >
              <Ionicons name={p.icon} size={22} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <T variant="bodyBold">{p.value}</T>
                <T variant="caption">{p.desc}</T>
              </View>
              <Ionicons name={selected ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
            </Pressable>
          );
        })}

        {/* Rincian biaya */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.priceRow}>
            <T variant="small">Biaya layanan ({partner.name})</T>
            <T variant="bodyBold">{formatRupiah(fee)}</T>
          </View>
          <View style={styles.priceRow}>
            <T variant="small">Biaya platform</T>
            <T variant="bodyBold" style={{ color: colors.mintText }}>
              Gratis
            </T>
          </View>
          {draft.repeat !== 'Sekali' && (
            <T variant="caption">*Untuk pengulangan "{draft.repeat}", biaya dihitung per pengingat.</T>
          )}
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <T variant="h3">Total Pembayaran</T>
            <T variant="h2" style={{ color: colors.primary }}>
              {formatRupiah(total)}
            </T>
          </View>
        </Card>

        {/* Persetujuan */}
        <Pressable
          style={styles.agree}
          onPress={() => {
            setAgreed((v) => !v);
            setShowAgreeError(false);
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
        >
          <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={showAgreeError ? colors.redText : colors.primary} />
          <T variant="small" style={{ flex: 1 }}>
            Saya sudah memeriksa detail pesanan dan setuju partner menghubungi saya sesuai jadwal & metode di atas.
          </T>
        </Pressable>
        {showAgreeError && <Text style={styles.error}>Centang persetujuan terlebih dahulu.</Text>}

        <Button title={`Konfirmasi & Bayar ${formatRupiah(total)}`} onPress={pay} loading={paying} style={{ marginTop: spacing.lg }} />
        <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          Prototype: pembayaran hanya simulasi, tidak ada transaksi sungguhan.
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  partner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 13 },
  payHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  payOption: {
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
  payOptionSelected: { borderColor: colors.primary, backgroundColor: colors.lavender },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  agree: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'flex-start' },
  error: { fontFamily: fonts.medium, fontSize: 12, color: colors.redText, marginTop: 4, marginLeft: 30 },
});
