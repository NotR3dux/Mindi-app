import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmModal } from '@/components/ConfirmModal';
import { EmptyState } from '@/components/EmptyState';
import { StatusBadge } from '@/components/StatusBadge';
import { Avatar, Button, Card, DemoBadge, InfoRow, ScreenHeader, T } from '@/components/ui';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { STATUS_FLOW, STATUS_INFO, canCancel, isActive } from '@/data/orders';
import { getPartner } from '@/data/partners';
import { getService } from '@/data/services';
import { useStore } from '@/store/AppStore';
import { formatDateLong, formatRupiah, formatTime } from '@/utils/format';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, advanceStatus, setStatus, cancelOrder, toast } = useStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const order = orders.find((o) => o.id === id);

  // Saat status berubah menjadi "Sedang Menghubungi", buka layar telepon / chat simulasi (full screen)
  const prevStatus = useRef(order?.status);
  useEffect(() => {
    if (!order) return;
    if (order.status === 'Sedang Menghubungi' && prevStatus.current !== order.status) {
      router.push(order.method === 'Telepon' ? `/call/${order.id}` : `/chat/${order.id}`);
    }
    prevStatus.current = order.status;
  }, [order]);

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader title="Detail Pesanan" />
        <EmptyState title="Pesanan tidak ditemukan" message="Mungkin data demo sudah dikosongkan." />
      </SafeAreaView>
    );
  }

  const service = getService(order.serviceId);
  const partner = getPartner(order.partnerId);
  const active = isActive(order.status);
  const currentIdx = STATUS_FLOW.indexOf(order.status);

  const contact = (via: 'Telepon' | 'Chat') =>
    toast(`Simulasi: ${via.toLowerCase()} ke ${partner.name} (tidak benar-benar ${via === 'Telepon' ? 'menelepon' : 'mengirim pesan'})`);

  const confirmDone = () => {
    setStatus(order.id, 'Selesai');
    router.replace(`/order/rate/${order.id}`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScreenHeader title={active ? 'Pesanan Aktif' : 'Detail Pesanan'} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Status utama */}
        <Card>
          <View style={styles.rowBetween}>
            <T variant="caption">#{order.id}</T>
            <StatusBadge status={order.status} />
          </View>
          <T variant="h2" style={{ marginTop: spacing.sm }}>
            {order.status}
          </T>
          <T variant="small">{STATUS_INFO[order.status]}</T>

          {/* Timeline status */}
          {order.status !== 'Dibatalkan' && (
            <View style={{ marginTop: spacing.lg }}>
              {STATUS_FLOW.map((s, i) => {
                const done = i < currentIdx || order.status === 'Selesai';
                const current = i === currentIdx && order.status !== 'Selesai';
                const last = i === STATUS_FLOW.length - 1;
                return (
                  <View key={s} style={styles.step}>
                    <View style={{ alignItems: 'center' }}>
                      <View
                        style={[
                          styles.stepDot,
                          done && { backgroundColor: colors.primary, borderColor: colors.primary },
                          current && { borderColor: colors.primary, backgroundColor: colors.lavender },
                        ]}
                      >
                        {done && <Ionicons name="checkmark" size={12} color={colors.white} />}
                        {current && <View style={styles.stepInner} />}
                      </View>
                      {!last && <View style={[styles.stepLine, done && { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.stepLabel, (done || current) && { color: colors.deep }, current && { fontFamily: fonts.semibold }]}>
                      {s}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Simulasi partner menghubungi */}
        {order.status === 'Sedang Menghubungi' && (
          <View style={styles.calling}>
            <Avatar initials={partner.initials} color={partner.avatarColor} size={54} />
            <View style={{ flex: 1 }}>
              <Text style={styles.callingTitle}>
                {partner.name} sedang {order.method === 'Telepon' ? 'menelepon' : 'mengirim chat'}…
              </Text>
              <Text style={styles.callingSub}>Simulasi — tidak ada panggilan sungguhan</Text>
            </View>
            <Pressable
              style={styles.answerBtn}
              onPress={() =>
                router.push(order.method === 'Telepon' ? `/call/${order.id}` : `/chat/${order.id}`)
              }
            >
              <Ionicons name={order.method === 'Telepon' ? 'call' : 'chatbubble'} size={22} color={colors.white} />
            </Pressable>
          </View>
        )}

        {/* Konfirmasi aktivitas */}
        {order.status === 'Menunggu Konfirmasi' && (
          <Card style={styles.confirm}>
            <T variant="h3" style={{ textAlign: 'center' }}>
              Apakah aktivitas sudah dilakukan?
            </T>
            <T variant="small" style={{ textAlign: 'center' }}>
              "{order.activity}"
            </T>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.md }}>
              <Button
                title="Belum"
                variant="outline"
                style={{ flex: 1 }}
                onPress={() => toast(`Oke! ${partner.name} akan mengingatkan sekali lagi (simulasi)`)}
              />
              <Button title="Ya, Sudah" icon="checkmark" style={{ flex: 1.4 }} onPress={confirmDone} />
            </View>
          </Card>
        )}

        {/* Ringkasan */}
        <Card style={{ marginTop: spacing.md }}>
          <T variant="h3" style={{ marginBottom: 4 }}>
            Ringkasan
          </T>
          <InfoRow icon={service.icon} label="Layanan" value={service.name} />
          <InfoRow icon="flag-outline" label="Aktivitas" value={order.activity} />
          <InfoRow icon="calendar-outline" label="Jadwal" value={`${formatDateLong(order.date)}, ${formatTime(order.time)}`} />
          <InfoRow icon={order.method === 'Telepon' ? 'call-outline' : 'chatbubble-outline'} label="Metode" value={order.method} />
          <InfoRow icon="repeat-outline" label="Pengulangan" value={order.repeat} />
          {!!order.note && <InfoRow icon="document-text-outline" label="Catatan" value={order.note} />}
          <InfoRow icon="wallet-outline" label={`Dibayar (${order.paymentMethod})`} value={formatRupiah(order.price)} />
        </Card>

        {/* Partner */}
        <Card style={{ marginTop: spacing.md }}>
          <View style={styles.row}>
            <Avatar initials={partner.initials} color={partner.avatarColor} size={52} />
            <View style={{ flex: 1 }}>
              <T variant="caption">Reminder Partner</T>
              <T variant="h3">{partner.name}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Ionicons name="star" size={13} color={colors.star} />
                <T variant="small">
                  {partner.rating.toFixed(1).replace('.', ',')} · {partner.completed} pesanan
                </T>
              </View>
            </View>
          </View>
          {active && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
              <Button title="Chat" icon="chatbubble-outline" variant="soft" small style={{ flex: 1 }} onPress={() => contact('Chat')} />
              <Button title="Telepon" icon="call-outline" variant="soft" small style={{ flex: 1 }} onPress={() => contact('Telepon')} />
            </View>
          )}
        </Card>

        {/* Review jika sudah selesai */}
        {order.status === 'Selesai' &&
          (order.review ? (
            <Card style={{ marginTop: spacing.md }}>
              <T variant="h3">Ulasan Kamu</T>
              <Text style={{ color: colors.star, fontSize: 20, marginTop: 4 }}>
                {'★'.repeat(order.review.rating)}
                <Text style={{ color: colors.gray }}>{'★'.repeat(5 - order.review.rating)}</Text>
              </Text>
              {order.review.tags.length > 0 && <T variant="small">{order.review.tags.join(' · ')}</T>}
              {!!order.review.comment && <T variant="body">"{order.review.comment}"</T>}
            </Card>
          ) : (
            <Button title="Beri Rating & Ulasan" icon="star-outline" style={{ marginTop: spacing.md }} onPress={() => router.push(`/order/rate/${order.id}`)} />
          ))}

        {/* Panel simulasi untuk demo */}
        {active && currentIdx >= 0 && currentIdx < STATUS_FLOW.indexOf('Menunggu Konfirmasi') && (
          <View style={styles.demoBox}>
            <DemoBadge text="Panel simulasi demo" />
            <T variant="small" style={{ marginTop: 6 }}>
              Status di prototype berubah lewat simulasi. Tekan tombol di bawah untuk melanjutkan ke status berikutnya:{' '}
              <T variant="bodyBold">{STATUS_FLOW[currentIdx + 1]}</T>.
            </T>
            <Button
              title="Lanjutkan Status (Demo)"
              icon="play-forward-outline"
              variant="outline"
              small
              style={{ marginTop: spacing.md }}
              onPress={() => advanceStatus(order.id)}
            />
          </View>
        )}

        {/* Bantuan & pembatalan */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          <Button title="Bantuan" icon="help-buoy-outline" variant="soft" small style={{ flex: 1 }} onPress={() => router.push('/help')} />
          {canCancel(order.status) && (
            <Button title="Batalkan" icon="close-circle-outline" variant="danger" small style={{ flex: 1 }} onPress={() => setConfirmCancel(true)} />
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={confirmCancel}
        title="Batalkan pesanan?"
        message="Pesanan yang dibatalkan sebelum partner menghubungi akan dikembalikan penuh (simulasi)."
        confirmLabel="Ya, Batalkan"
        cancelLabel="Tidak"
        danger
        onCancel={() => setConfirmCancel(false)}
        onConfirm={() => {
          cancelOrder(order.id);
          setConfirmCancel(false);
          toast('Pesanan dibatalkan. Dana dikembalikan (simulasi).');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { flexDirection: 'row', gap: spacing.md },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.lavenderMid,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  stepLine: { width: 2, height: 18, backgroundColor: colors.lavenderMid },
  stepLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.textLight, paddingTop: 1 },
  calling: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.deep,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  callingTitle: { fontFamily: fonts.semibold, color: colors.white, fontSize: 14 },
  callingSub: { fontFamily: fonts.regular, color: '#CFC3F2', fontSize: 11.5 },
  answerBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3CC59A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirm: { marginTop: spacing.md, borderWidth: 1.5, borderColor: colors.primary },
  demoBox: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#F0C48F',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: '#FFFBF5',
  },
});
