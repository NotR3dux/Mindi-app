import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { OrderCard } from '@/components/OrderCard';
import { Button, T } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { isActive } from '@/data/orders';
import { useStore } from '@/store/AppStore';
import { scheduleDate } from '@/utils/format';

export default function OrdersScreen() {
  const { orders, resetDraft } = useStore();
  const active = orders
    .filter((o) => isActive(o.status))
    .sort((a, b) => scheduleDate(a.date, a.time).getTime() - scheduleDate(b.date, b.time).getTime());

  const book = () => {
    resetDraft();
    router.push('/booking/services');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <T variant="h1">Pesanan Aktif</T>
        <T variant="body" style={{ marginBottom: spacing.lg }}>
          Pantau status pengingat yang sedang berjalan.
        </T>
        {active.length === 0 ? (
          <EmptyState
            title="Belum ada pesanan aktif"
            message="Pesan reminder dan partner kami akan mengingatkanmu tepat waktu."
            actionLabel="Pesan Reminder"
            onAction={book}
          />
        ) : (
          <>
            {active.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
            <View style={{ marginTop: spacing.sm }}>
              <Button title="Pesan Reminder Baru" icon="add" variant="outline" onPress={book} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.xl, paddingBottom: 40 },
});
