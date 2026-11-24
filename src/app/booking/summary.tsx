import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { PaymentPicker, QrisModal } from '@/components/Payment';
import { Avatar, Button, Card, DemoBadge, InfoRow, ScreenHeader, Steps, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { REPEAT_LABEL, type PaymentMethod } from '@/data/orders';
import { getPartner } from '@/data/partners';
import { INCLUDED_PER_REMINDER, getPlan } from '@/data/plans';
import { isVoucherValid, voucherDiscount } from '@/data/rewards';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatDateLong, formatDateShort, formatRupiah, formatTime } from '@/utils/format';
import { quoteDraft } from '@/utils/pricing';

export default function SummaryScreen() {
  const { draft, placeOrder, subscription, vouchers } = useStore();
  const [payment, setPayment] = useState<PaymentMethod>('QRIS');
  const [voucherId, setVoucherId] = useState<string | undefined>();
  const [agreed, setAgreed] = useState(false);
  const [showAgreeError, setShowAgreeError] = useState(false);
  const [paying, setPaying] = useState(false);
  const [qris, setQris] = useState(false);
  const [showIncludes, setShowIncludes] = useState(false);

  if (!draft.serviceId || !draft.partnerId || !draft.date || !draft.time) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader title="Konfirmasi Pesanan" />
        <EmptyState
          title="Data pesanan belum lengkap"
          message="Silakan mulai pemesanan dari awal."
          actionLabel="Pesan Reminder"
          onAction={() => router.replace('/booking/services')}
        />
      </SafeAreaView>
    );
  }

  const service = getService(draft.serviceId);
  const partner = getPartner(draft.partnerId);
  const myVouchers = vouchers.filter(isVoucherValid);
  const voucher = myVouchers.find((v) => v.id === voucherId);
  const q = quoteDraft(draft, subscription, voucher);
  const plan = subscription ? getPlan(subscription.planId) : null;
  const free = q.total === 0;

  const complete = () => {
    const order = placeOrder(payment, voucherId);
    setPaying(false);
    setQris(false);
    router.replace({ pathname: '/booking/success', params: { id: order.id } });
  };

  const pay = () => {
    if (!agreed) {
      setShowAgreeError(true);
      return;
    }
    if (!free && payment === 'QRIS') {
      setQris(true);
      return;
    }
    setPaying(true);
    // Simulasi proses pembayaran — tidak ada transaksi sungguhan
    setTimeout(complete, 1200);
  };

  const dates = q.occurrences;

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
          <InfoRow icon="calendar-outline" label="Mulai" value={formatDateLong(draft.date)} />
          <InfoRow icon="time-outline" label="Waktu" value={formatTime(draft.time)} />
          <InfoRow icon={draft.method === 'Telepon' ? 'call-outline' : 'chatbubble-outline'} label="Metode" value={draft.method} />
          <InfoRow icon="repeat-outline" label="Jadwal" value={`${REPEAT_LABEL[draft.repeat]} · ${q.sessions}x`} />
          {dates.length > 1 && (
            <T variant="caption" style={{ marginLeft: 26 }}>
              {dates.slice(0, 6).map(formatDateShort).join(' · ')}
              {dates.length > 6 ? ` · +${dates.length - 6} lagi` : ''}
            </T>
          )}
          {!!draft.note.trim() && <InfoRow icon="document-text-outline" label="Catatan" value={draft.note} />}

          <Pressable style={styles.includesRow} onPress={() => setShowIncludes((v) => !v)}>
            <Ionicons name="gift-outline" size={15} color={colors.primary} />
            <Text style={styles.includesText}>Yang kamu dapat untuk {formatRupiah(q.rate)}/pengingat</Text>
            <Ionicons name={showIncludes ? 'chevron-up' : 'chevron-down'} size={15} color={colors.primary} />
          </Pressable>
          {showIncludes &&
            [service.extra, ...INCLUDED_PER_REMINDER].map((k) => (
              <View key={k} style={styles.includeItem}>
                <Ionicons name="checkmark" size={14} color={colors.mintText} />
                <T variant="small" style={{ flex: 1 }}>
                  {k}
                </T>
              </View>
            ))}
        </Card>

        {/* Voucher */}
        <T variant="h3" style={styles.section}>
          Voucher
        </T>
        {myVouchers.length === 0 ? (
          <Pressable style={styles.voucherEmpty} onPress={() => router.push('/rewards')}>
            <Ionicons name="pricetag-outline" size={18} color={colors.primary} />
            <T variant="small" style={{ flex: 1 }}>
              Belum ada voucher. Klaim voucher mingguan di Reward →
            </T>
          </Pressable>
        ) : (
          myVouchers.map((v) => {
            const on = voucherId === v.id;
            const cut = voucherDiscount(v, q.payable);
            return (
              <Pressable key={v.id} style={[styles.voucher, on && styles.voucherOn]} onPress={() => setVoucherId(on ? undefined : v.id)}>
                <Ionicons name={on ? 'checkmark-circle' : 'pricetag-outline'} size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <T variant="bodyBold">{v.title}</T>
                  <T variant="caption">{v.description}</T>
                </View>
                {!free && <T variant="bodyBold" style={{ color: colors.mintText }}>-{formatRupiah(cut)}</T>}
              </Pressable>
            );
          })
        )}

        {/* Pembayaran */}
        {!free && (
          <>
            <View style={styles.payHeader}>
              <T variant="h3">Metode Pembayaran</T>
              <DemoBadge />
            </View>
            <PaymentPicker value={payment} onChange={setPayment} />
          </>
        )}

        {/* Rincian biaya */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.priceRow}>
            <T variant="small">
              {formatRupiah(q.rate)} × {q.sessions} pengingat
            </T>
            <T variant="bodyBold">{formatRupiah(q.rate * q.sessions)}</T>
          </View>
          {q.coveredByPlan > 0 && (
            <View style={styles.priceRow}>
              <T variant="small">
                Kuota {plan?.name} ({q.coveredByPlan}x)
              </T>
              <T variant="bodyBold" style={{ color: colors.mintText }}>
                -{formatRupiah(q.coveredByPlan * q.rate)}
              </T>
            </View>
          )}
          {q.discount > 0 && (
            <View style={styles.priceRow}>
              <T variant="small">{q.voucherTitle}</T>
              <T variant="bodyBold" style={{ color: colors.mintText }}>
                -{formatRupiah(q.discount)}
              </T>
            </View>
          )}
          <View style={styles.priceRow}>
            <T variant="small">Biaya platform</T>
            <T variant="bodyBold" style={{ color: colors.mintText }}>
              Gratis
            </T>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <T variant="h3">Total Pembayaran</T>
            <T variant="h2" style={{ color: colors.primary }}>
              {formatRupiah(q.total)}
            </T>
          </View>
          {!subscription && q.sessions > 1 && (
            <Pressable onPress={() => router.push('/plans')}>
              <T variant="caption" style={{ color: colors.primary, marginTop: 4 }}>
                Pesan rutin? Paket langganan bisa jauh lebih hemat →
              </T>
            </Pressable>
          )}
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

        <Button
          title={free ? 'Konfirmasi (pakai kuota paket)' : `Konfirmasi & Bayar ${formatRupiah(q.total)}`}
          onPress={pay}
          loading={paying}
          style={{ marginTop: spacing.lg }}
        />
        <T variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm }}>
          Prototype: pembayaran hanya simulasi, tidak ada transaksi sungguhan.
        </T>
      </ScrollView>

      <QrisModal visible={qris} amount={q.total} reference={`ORD-${draft.serviceId}`} onPaid={complete} onClose={() => setQris(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  partner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  link: { fontFamily: fonts.semibold, color: colors.primary, fontSize: 13 },
  section: { marginTop: spacing.xl, marginBottom: spacing.md },
  includesRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  includesText: { flex: 1, fontFamily: fonts.semibold, fontSize: 12.5, color: colors.primary },
  includeItem: { flexDirection: 'row', gap: 6, marginTop: 4, marginLeft: 4 },
  voucherEmpty: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.lavender, borderRadius: radius.md, padding: spacing.md },
  voucher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.lavenderMid,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  voucherOn: { borderStyle: 'solid', borderColor: colors.primary, backgroundColor: colors.lavender },
  payHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, gap: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  agree: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, alignItems: 'flex-start' },
  error: { fontFamily: fonts.medium, fontSize: 12.5, color: colors.redText, marginTop: 4, marginLeft: 30 },
});
