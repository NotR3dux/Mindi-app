import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { OrderCard } from '@/components/OrderCard';
import { Button, Chip, T } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { isActive, type Order } from '@/data/orders';
import { useStore } from '@/store/AppStore';
import { scheduleDate } from '@/utils/format';

const FILTERS = ['Semua', 'Selesai', 'Dibatalkan'] as const;

export default function HistoryScreen() {
  const { orders, resetDraft } = useStore();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Semua');

  const past = orders
    .filter((o) => !isActive(o.status))
    .filter((o) => filter === 'Semua' || o.status === filter)
    .sort((a, b) => scheduleDate(b.date, b.time).getTime() - scheduleDate(a.date, a.time).getTime());

  const reorder = (o: Order) => {
    resetDraft({
      serviceId: o.serviceId,
      activity: o.activity,
      method: o.method,
      note: o.note,
      repeat: o.repeat,
    });
    router.push('/booking/details');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <T variant="h1">Riwayat Pesanan</T>
        <T variant="body">Layanan yang pernah kamu gunakan.</T>
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </View>

        {past.length === 0 ? (
          <EmptyState
            title="Riwayat masih kosong"
            message="Pesanan yang sudah selesai atau dibatalkan akan muncul di sini."
          />
        ) : (
          past.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              showPrice
              footer={
                <View style={styles.actions}>
                  {o.status === 'Selesai' && !o.review && (
                    <Button
                      title="Beri Rating"
                      icon="star-outline"
                      small
                      variant="soft"
                      onPress={() => router.push(`/order/rate/${o.id}`)}
                      style={{ flex: 1 }}
                    />
                  )}
                  {o.review && (
                    <T variant="small" style={{ flex: 1, alignSelf: 'center' }}>
                      {'★'.repeat(o.review.rating)} Ulasan terkirim
                    </T>
                  )}
                  <Button title="Pesan Ulang" icon="refresh" small variant="outline" onPress={() => reorder(o)} style={{ flex: 1 }} />
                </View>
              }
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 40 },
  filters: { flexDirection: 'row', gap: spacing.sm, marginVertical: spacing.lg },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
